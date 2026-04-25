from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import select
from sqlalchemy.orm import selectinload
from app.infrastructure.db import get_session
from app.domain.models import Order, OrderItem, FoodItem, User, UserRole, Shop, OrderStatus, PaymentMethod
from app.interfaces.api.schemas import OrderCreate, OrderResponse, OrderStatusUpdate, StripeOnboardResponse
from app.interfaces.api.deps import get_current_user, RoleChecker
from app.core.config import settings
from app.infrastructure.stripe_client import stripeClient
from sqlmodel.ext.asyncio.session import AsyncSession
from decimal import Decimal
from uuid import UUID
import stripe
import logging

# Ensure logging is configured
logger = logging.getLogger("orders")
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/onboard", response_model=StripeOnboardResponse)
async def onboard_shop(
    current_user: User = Depends(RoleChecker([UserRole.SHOP_OWNER])),
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(Shop).where(Shop.owner_id == current_user.id))
    shop = result.first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")

    try:
        # Use V1 API for Express onboarding as per original design
        if not shop.stripe_account_id:
            account = stripe.Account.create(api_key=settings.STRIPE_API_KEY, type="express")
            shop.stripe_account_id = account.id
            session.add(shop)
            await session.commit()
        
        account_link = stripe.AccountLink.create(
            api_key=settings.STRIPE_API_KEY,
            account=shop.stripe_account_id,
            refresh_url=f"{settings.FRONTEND_URL}/shop/dashboard?onboard=fail",
            return_url=f"{settings.FRONTEND_URL}/shop/dashboard?onboard=success",
            type="account_onboarding",
        )
        
        return {"account_link_url": account_link.url}
    except stripe.error.InvalidRequestError as e:
        logger.error(f"Stripe Connect Error: {e}")
        raise HTTPException(
            status_code=400, 
            detail="Stripe Connect is not enabled for this platform. Please enable it in the Stripe Dashboard."
        )
    except Exception as e:
        logger.error(f"Onboarding failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to start Stripe onboarding")

@router.post("", response_model=OrderResponse)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role != UserRole.BUYER:
        logger.warning(f"Order Denied: User {current_user.id} has role {current_user.role}, not BUYER")
        raise HTTPException(status_code=403, detail="Only buyers can place orders")

    shop_result = await session.exec(select(Shop).where(Shop.id == data.shop_id))
    shop = shop_result.first()
    if not shop:
        logger.error(f"Order Failure: Shop {data.shop_id} not found")
        raise HTTPException(status_code=400, detail="Shop not found")
        
    if shop.status != "APPROVED":
        logger.error(f"Order Failure: Shop {shop.name} is in status {shop.status}, not APPROVED")
        raise HTTPException(status_code=400, detail="Shop is not currently accepting orders")

    total_amount = Decimal(0)
    line_items = []
    order_items_to_create = []

    for item_data in data.items:
        item_result = await session.exec(select(FoodItem).where(FoodItem.id == item_data.food_item_id, FoodItem.shop_id == data.shop_id))
        food_item = item_result.first()
        if not food_item or not food_item.is_available:
            logger.error(f"Order Failure: Item {item_data.food_item_id} is unavailable or not in shop {data.shop_id}")
            raise HTTPException(status_code=400, detail=f"Item {item_data.food_item_id} not available")
        
        line_total = food_item.price * item_data.quantity
        total_amount += line_total
        
        if data.payment_method == PaymentMethod.STRIPE:
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {'name': food_item.name},
                    'unit_amount': int(food_item.price * 100),
                },
                'quantity': item_data.quantity,
            })

        order_items_to_create.append(OrderItem(
            food_item_id=food_item.id,
            quantity=item_data.quantity,
            price_at_purchase=food_item.price
        ))

    platform_fee = total_amount * Decimal(str(settings.PLATFORM_FEE_PERCENT))
    
    checkout_url = None
    stripe_session_id = None
    order_status = OrderStatus.PENDING

    if data.payment_method == PaymentMethod.STRIPE:
        try:
            # Modern Direct Charge with Application Fee
            checkout_params = {
                'payment_method_types': ['card'],
                'line_items': line_items,
                'mode': 'payment',
                'success_url': f"{settings.FRONTEND_URL}/buyer/orders?success=true",
                'cancel_url': f"{settings.FRONTEND_URL}/buyer/dashboard?canceled=true",
            }
            
            request_options = {}
            # If shop has Connect set up, use Direct Charge on their account
            if shop.stripe_account_id and shop.stripe_onboarded:
                checkout_params['payment_intent_data'] = {
                    'application_fee_amount': int(platform_fee * 100),
                }
                request_options = {"stripe_account": shop.stripe_account_id}
                logger.info(f"Creating Direct Charge for shop {shop.stripe_account_id}")

            # Use the StripeClient instance with the account header
            checkout_session = stripeClient.checkout.sessions.create(
                params=checkout_params,
                options=request_options
            )
            checkout_url = checkout_session.url
            stripe_session_id = checkout_session.id
        except Exception as e:
            logger.error(f"STRIPE ORDER ERROR: {e}")
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    else:
        order_status = OrderStatus.CONFIRMED

    order = Order(
        buyer_id=current_user.id,
        shop_id=data.shop_id,
        total_amount=total_amount,
        platform_fee=platform_fee,
        delivery_address=data.delivery_address,
        status=order_status,
        payment_method=data.payment_method,
        stripe_session_id=stripe_session_id
    )
    session.add(order)
    await session.flush()

    for oi in order_items_to_create:
        oi.order_id = order.id
        session.add(oi)

    await session.commit()
    
    statement = (
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.items).selectinload(OrderItem.food_item))
    )
    result = await session.exec(statement)
    order_data = result.first()
    
    response_obj = OrderResponse.model_validate(order_data)
    response_obj.checkout_url = checkout_url
    
    return response_obj

@router.get("/my-orders", response_model=List[OrderResponse])
async def get_my_orders(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role == UserRole.BUYER:
        statement = select(Order).where(Order.buyer_id == current_user.id)
    elif current_user.role == UserRole.SHOP_OWNER:
        shop_result = await session.exec(select(Shop).where(Shop.owner_id == current_user.id))
        shop = shop_result.first()
        if not shop: return []
        statement = select(Order).where(Order.shop_id == shop.id)
    elif current_user.role == UserRole.SHOP_EMPLOYEE:
        statement = select(Order).where(Order.shop_id == current_user.shop_id)
    else:
        statement = select(Order)
        
    statement = (
        statement
        .options(selectinload(Order.items).selectinload(OrderItem.food_item))
        .order_by(Order.created_at.desc())
    )
    result = await session.exec(statement)
    return result.all()

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: UUID,
    data: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(Order).where(Order.id == order_id))
    order = result.first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = data.status
    session.add(order)
    await session.commit()
    
    statement = (
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items).selectinload(OrderItem.food_item))
    )
    result = await session.exec(statement)
    return result.first()
