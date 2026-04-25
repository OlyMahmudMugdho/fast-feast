from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel import select
from app.infrastructure.db import get_session
from app.domain.models import Order, OrderStatus, Shop
from app.core.config import settings
from app.infrastructure.stripe_client import stripeClient
from sqlmodel.ext.asyncio.session import AsyncSession
import stripe
import logging

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, session: AsyncSession = Depends(get_session)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        # Standard V1 Parsing for Subscriptions and Checkout
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception:
        # Fallback to Thin Event Parsing for V2
        try:
            thin_event = stripeClient.parse_thin_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
            # Fetch the full event data for V2
            event = stripeClient.v2.core.events.retrieve(thin_event.id)
        except Exception as e:
            logging.error(f"Webhook parsing failed: {e}")
            raise HTTPException(status_code=400, detail="Invalid signature or payload")

    # Handle standard V1 events
    if event.type == 'checkout.session.completed':
        session_obj = event.data.object
        stripe_session_id = session_obj.id
        result = await session.exec(select(Order).where(Order.stripe_session_id == stripe_session_id))
        order = result.first()
        if order:
            order.status = OrderStatus.PAID
            session.add(order)
            await session.commit()

    # Handle V2 Account Events (using the specific V2 event types)
    elif event.type in [
        'v2.core.account[requirements].updated',
        'v2.core.account[configuration.merchant].capability_status_updated'
    ]:
        # Retrieve the updated account status directly
        account_id = event.context # For thin events, context usually contains the account ID
        # Or fetch from the event data if expanded
        account = stripeClient.v2.core.accounts.retrieve(account_id, params={"include": ["configuration.merchant", "requirements"]})
        
        ready = (
            account.configuration.merchant.capabilities.card_payments.status == "active"
            if account.configuration and account.configuration.merchant else False
        )
        
        result = await session.exec(select(Shop).where(Shop.stripe_account_id == account_id))
        shop = result.first()
        if shop:
            shop.stripe_onboarded = ready
            session.add(shop)
            await session.commit()

    return {"status": "success"}
