from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel import select
from app.infrastructure.db import get_session
from app.domain.models import Order, OrderStatus, Shop
from app.core.config import settings
from sqlmodel.ext.asyncio.session import AsyncSession
import stripe

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, session: AsyncSession = Depends(get_session)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session_obj = event['data']['object']
        stripe_session_id = session_obj.get("id")
        
        # Update order status to PAID
        result = await session.exec(select(Order).where(Order.stripe_session_id == stripe_session_id))
        order = result.first()
        if order:
            order.status = OrderStatus.PAID
            session.add(order)
            await session.commit()

    # Handle account.updated (when shop completes onboarding)
    elif event['type'] == 'account.updated':
        account = event['data']['object']
        if account.get("details_submitted"):
            result = await session.exec(select(Shop).where(Shop.stripe_account_id == account.get("id")))
            shop = result.first()
            if shop:
                shop.stripe_onboarded = True
                session.add(shop)
                await session.commit()

    return {"status": "success"}
