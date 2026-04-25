from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import select
from app.infrastructure.db import get_session
from app.domain.models import Shop, User, UserRole, FoodItem
from app.core.config import settings
from app.infrastructure.stripe_client import stripeClient
from app.interfaces.api.deps import get_current_user, RoleChecker
from app.interfaces.api.schemas import StripeAccountStatusResponse, StripeOnboardResponse
from sqlmodel.ext.asyncio.session import AsyncSession
import os
import logging
import json
import stripe

router = APIRouter(prefix="/payments/v2", tags=["stripe-v2"])
logger = logging.getLogger("fastapi")

async def get_or_create_visibility_price():
    """Helper for demo: creates a subscription price if not configured."""
    price_id = os.getenv("STRIPE_SUBSCRIPTION_PRICE_ID")
    if price_id and price_id != "price_...":
        return price_id
    
    try:
        products = stripeClient.products.list(params={"limit": 1})
        if products.data:
            prod = products.data[0]
            prices = stripeClient.prices.list(params={"product": prod.id, "limit": 1})
            if prices.data:
                return prices.data[0].id
        
        product = stripeClient.products.create(params={
            "name": "Fast-Feast Premium Visibility",
            "description": "Boost your shop's visibility on the platform"
        })
        price = stripeClient.prices.create(params={
            "product": product.id,
            "unit_amount": 2900, # $29.00
            "currency": "usd",
            "recurring": {"interval": "month"}
        })
        return price.id
    except Exception as e:
        logger.error(f"Failed to auto-create price: {e}")
        return None

@router.post("/accounts")
async def create_connected_account(
    current_user: User = Depends(RoleChecker([UserRole.SHOP_OWNER])),
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(Shop).where(Shop.owner_id == current_user.id))
    shop = result.first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    if shop.stripe_account_id:
        return {"account_id": shop.stripe_account_id}

    try:
        account = stripeClient.v2.core.accounts.create(
            params={
                "display_name": shop.name,
                "contact_email": current_user.email,
                "identity": {"country": "us"},
                "dashboard": "full",
                "defaults": {
                    "responsibilities": {
                        "fees_collector": "stripe",
                        "losses_collector": "stripe",
                    },
                },
                "configuration": {
                    "customer": {},
                    "merchant": {
                        "capabilities": {"card_payments": {"requested": True}},
                    },
                },
            }
        )
        
        shop.stripe_account_id = account.id
        session.add(shop)
        await session.commit()
        return {"account_id": account.id}
    except Exception as e:
        logger.error(f"Failed to create Stripe V2 account: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/accounts/status", response_model=StripeAccountStatusResponse)
async def get_account_status(
    current_user: User = Depends(RoleChecker([UserRole.SHOP_OWNER, UserRole.SHOP_EMPLOYEE])),
    session: AsyncSession = Depends(get_session)
):
    if current_user.role == UserRole.SHOP_OWNER:
        result = await session.exec(select(Shop).where(Shop.owner_id == current_user.id))
    else:
        result = await session.exec(select(Shop).where(Shop.id == current_user.shop_id))
        
    shop = result.first()
    if not shop or not shop.stripe_account_id:
        return {"onboarding_complete": False, "ready_to_pay": False}

    try:
        account = stripeClient.v2.core.accounts.retrieve(
            shop.stripe_account_id,
            params={"include": ["configuration.merchant", "requirements"]}
        )

        ready = False
        capability_status = "inactive"
        if (hasattr(account, 'configuration') and 
            account.configuration and 
            hasattr(account.configuration, 'merchant') and 
            account.configuration.merchant and 
            hasattr(account.configuration.merchant, 'capabilities') and 
            account.configuration.merchant.capabilities and 
            hasattr(account.configuration.merchant.capabilities, 'card_payments')):
            
            capability_status = account.configuration.merchant.capabilities.card_payments.status
            # In Test Mode, 'active' or 'pending' might both be acceptable for demoing
            ready = capability_status in ["active", "pending"]

        complete = False
        details_data = {
            "capability_status": capability_status,
            "minimum_deadline": None
        }
        
        if hasattr(account, 'requirements') and account.requirements:
            sum_obj = account.requirements.summary
            details_data["minimum_deadline"] = sum_obj.minimum_deadline.status if sum_obj and sum_obj.minimum_deadline else None
            
            if sum_obj and sum_obj.minimum_deadline:
                req_status = sum_obj.minimum_deadline.status
                # If requirements are not past_due, we consider onboarding "complete" for now
                complete = req_status not in ["currently_due", "past_due"]
            else:
                complete = True

        if shop.stripe_onboarded != ready:
            shop.stripe_onboarded = ready
            session.add(shop)
            await session.commit()

        return {
            "onboarding_complete": complete,
            "ready_to_pay": ready,
            "details": details_data
        }
    except Exception as e:
        logger.error(f"Error retrieving account status: {e}")
        return {"onboarding_complete": False, "ready_to_pay": False, "error": str(e)}

@router.post("/onboard-link")
async def create_onboarding_link(
    current_user: User = Depends(RoleChecker([UserRole.SHOP_OWNER])),
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(Shop).where(Shop.owner_id == current_user.id))
    shop = result.first()
    if not shop or not shop.stripe_account_id:
        raise HTTPException(status_code=400, detail="Create account first")

    link = stripeClient.v2.core.account_links.create(
        params={
            "account": shop.stripe_account_id,
            "use_case": {
                "type": "account_onboarding",
                "account_onboarding": {
                    "configurations": ["merchant", "customer"],
                    "refresh_url": f"{settings.FRONTEND_URL}/shop/dashboard?onboard=refresh",
                    "return_url": f"{settings.FRONTEND_URL}/shop/dashboard?accountId={shop.stripe_account_id}",
                },
            },
        }
    )
    return {"url": link.url}

@router.post("/subscribe")
async def create_subscription_session(
    current_user: User = Depends(RoleChecker([UserRole.SHOP_OWNER])),
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(Shop).where(Shop.owner_id == current_user.id))
    shop = result.first()
    if not shop or not shop.stripe_account_id:
        raise HTTPException(status_code=400, detail="Stripe account required")

    price_id = await get_or_create_visibility_price()
    if not price_id:
        raise HTTPException(status_code=400, detail="Stripe price not configured and could not be auto-created.")
    
    try:
        checkout_session = stripeClient.checkout.sessions.create(
            params={
                "customer_account": shop.stripe_account_id,
                "mode": 'subscription',
                "line_items": [
                    {'price': price_id, 'quantity': 1},
                ],
                "success_url": settings.STRIPE_SUCCESS_URL or f"{settings.FRONTEND_URL}/shop/dashboard?subscription=success",
                "cancel_url": settings.STRIPE_CANCEL_URL or f"{settings.FRONTEND_URL}/shop/dashboard?subscription=cancel",
            }
        )
        return {"url": checkout_session.url}
    except Exception as e:
        logger.error(f"Subscription creation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/portal")
async def create_portal_session(
    current_user: User = Depends(RoleChecker([UserRole.SHOP_OWNER])),
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(Shop).where(Shop.owner_id == current_user.id))
    shop = result.first()
    if not shop or not shop.stripe_account_id:
        raise HTTPException(status_code=400, detail="Stripe account required")

    try:
        portal_session = stripeClient.billing_portal.sessions.create(
            params={
                "customer_account": shop.stripe_account_id,
                "return_url": f"{settings.FRONTEND_URL}/shop/dashboard",
            }
        )
        return {"url": portal_session.url}
    except Exception as e:
        logger.error(f"Portal session failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
