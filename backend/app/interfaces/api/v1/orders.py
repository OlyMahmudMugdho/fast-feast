from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlalchemy.orm import selectinload
from app.infrastructure.db import get_session
from app.domain.models import Order, OrderItem, FoodItem, User, UserRole, Shop, OrderStatus
from app.interfaces.api.schemas import OrderCreate, OrderResponse, OrderStatusUpdate
from app.interfaces.api.deps import get_current_user, RoleChecker
from sqlmodel.ext.asyncio.session import AsyncSession
from decimal import Decimal
from uuid import UUID

router = APIRouter()

@router.post("", response_model=OrderResponse)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role != UserRole.BUYER:
        raise HTTPException(status_code=403, detail="Only buyers can place orders")

    # 1. Verify shop exists and is approved
    shop_result = await session.exec(select(Shop).where(Shop.id == data.shop_id))
    shop = shop_result.first()
    if not shop or shop.status != "APPROVED":
        raise HTTPException(status_code=400, detail="Shop not available")

    total_amount = Decimal(0)
    order_items_to_create = []

    # 2. Verify items and calculate total
    for item_data in data.items:
        item_result = await session.exec(select(FoodItem).where(FoodItem.id == item_data.food_item_id, FoodItem.shop_id == data.shop_id))
        food_item = item_result.first()
        if not food_item or not food_item.is_available:
            raise HTTPException(status_code=400, detail=f"Item {item_data.food_item_id} not available")
        
        line_total = food_item.price * item_data.quantity
        total_amount += line_total
        
        order_items_to_create.append(OrderItem(
            food_item_id=food_item.id,
            quantity=item_data.quantity,
            price_at_purchase=food_item.price
        ))

    # 3. Calculate platform fee (e.g., 10%)
    platform_fee = total_amount * Decimal("0.10")

    # 4. Create Order
    order = Order(
        buyer_id=current_user.id,
        shop_id=data.shop_id,
        total_amount=total_amount,
        platform_fee=platform_fee,
        delivery_address=data.delivery_address,
        status=OrderStatus.PENDING
    )
    session.add(order)
    await session.flush() # Get order ID

    # 5. Add Items
    for oi in order_items_to_create:
        oi.order_id = order.id
        session.add(oi)

    await session.commit()
    
    # Eager load items and food_item for response
    statement = (
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.items).selectinload(OrderItem.food_item))
    )
    result = await session.exec(statement)
    return result.first()

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

    # Permissions check
    can_update = False
    if current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        can_update = True
    elif current_user.role == UserRole.SHOP_OWNER:
        shop_result = await session.exec(select(Shop).where(Shop.owner_id == current_user.id))
        shop = shop_result.first()
        if shop and order.shop_id == shop.id:
            can_update = True
    elif current_user.role == UserRole.SHOP_EMPLOYEE:
        if order.shop_id == current_user.shop_id:
            can_update = True

    if not can_update:
        raise HTTPException(status_code=403, detail="Not authorized to update this order")

    order.status = data.status
    session.add(order)
    await session.commit()
    
    # Eager load for response
    statement = (
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items).selectinload(OrderItem.food_item))
    )
    result = await session.exec(statement)
    return result.first()
