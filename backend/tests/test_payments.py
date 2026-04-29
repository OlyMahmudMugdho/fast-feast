import pytest
from httpx import AsyncClient
from app.domain.models import User, UserRole, Shop, ShopStatus, Order, OrderStatus
from sqlmodel.ext.asyncio.session import AsyncSession
from unittest.mock import patch, MagicMock
from uuid import uuid4

from sqlmodel import select

@pytest.fixture
async def shop_owner_data(client: AsyncClient):
    email = f"owner_{uuid4()}@test.com"
    payload = {
        "email": email,
        "password": "password123",
        "full_name": "Owner",
        "shop_name": "Payment Shop",
        "shop_address": "Addr"
    }
    await client.post("/api/v1/auth/register/shop", json=payload)
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "password123"})
    return {"token": resp.json()["access_token"], "email": email}

@pytest.mark.asyncio
async def test_create_connected_account(client: AsyncClient, shop_owner_data: dict):
    token = shop_owner_data["token"]
    mock_account = MagicMock()
    mock_account.id = "acct_test_123"
    
    with patch("app.interfaces.api.v1.payments_v2.stripeClient") as mock_stripe:
        mock_stripe.v2.core.accounts.create.return_value = mock_account
        
        response = await client.post(
            "/api/v1/payments/v2/accounts",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["account_id"] == "acct_test_123"

@pytest.mark.asyncio
async def test_get_account_status(client: AsyncClient, shop_owner_data: dict, session: AsyncSession):
    token = shop_owner_data["token"]
    email = shop_owner_data["email"]
    
    # Setup account ID manually for the shop
    result = await session.exec(select(User).where(User.email == email))
    user = result.first()
    shop_res = await session.exec(select(Shop).where(Shop.owner_id == user.id))
    shop = shop_res.first()
    shop.stripe_account_id = "acct_test_123"
    session.add(shop)
    await session.commit()
    
    mock_account = MagicMock()
    mock_account.configuration.merchant.capabilities.card_payments.status = "active"
    mock_account.requirements.summary.minimum_deadline.status = "completed"
    
    with patch("app.interfaces.api.v1.payments_v2.stripeClient") as mock_stripe:
        mock_stripe.v2.core.accounts.retrieve.return_value = mock_account
        
        response = await client.get(
            "/api/v1/payments/v2/accounts/status",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["ready_to_pay"] == True
        assert response.json()["onboarding_complete"] == True

@pytest.mark.asyncio
async def test_onboard_link(client: AsyncClient, shop_owner_data: dict, session: AsyncSession):
    token = shop_owner_data["token"]
    email = shop_owner_data["email"]
    
    # Setup account ID
    result = await session.exec(select(User).where(User.email == email))
    user = result.first()
    shop_res = await session.exec(select(Shop).where(Shop.owner_id == user.id))
    shop = shop_res.first()
    shop.stripe_account_id = "acct_test_123"
    session.add(shop)
    await session.commit()
    
    mock_link = MagicMock()
    mock_link.url = "http://stripe.onboard/link"
    
    with patch("app.interfaces.api.v1.payments_v2.stripeClient") as mock_stripe:
        mock_stripe.v2.core.account_links.create.return_value = mock_link
        
        response = await client.post(
            "/api/v1/payments/v2/onboard-link",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["url"] == "http://stripe.onboard/link"

@pytest.mark.asyncio
async def test_stripe_webhook_checkout_completed(client: AsyncClient, session: AsyncSession):
    # Setup order
    order = Order(
        buyer_id=uuid4(),
        shop_id=uuid4(),
        total_amount=50.0,
        delivery_address="Addr",
        payment_method="STRIPE",
        stripe_session_id="cs_test_webhook",
        status=OrderStatus.PENDING
    )
    session.add(order)
    await session.commit()
    
    mock_event = MagicMock()
    mock_event.type = "checkout.session.completed"
    mock_event.data.object.id = "cs_test_webhook"
    
    with patch("app.interfaces.api.v1.payments.stripe.Webhook.construct_event", return_value=mock_event):
        response = await client.post(
            "/api/v1/payments/stripe/webhook",
            headers={"stripe-signature": "fake_sig"},
            content=b"fake_payload"
        )
        assert response.status_code == 200
        assert response.json() == {"status": "success"}
        
        # Verify order status
        await session.refresh(order)
        assert order.status == OrderStatus.PAID

@pytest.mark.asyncio
async def test_create_subscription_session(client: AsyncClient, shop_owner_data: dict, session: AsyncSession):
    token = shop_owner_data["token"]
    email = shop_owner_data["email"]
    
    # Setup shop
    result = await session.exec(select(User).where(User.email == email))
    user = result.first()
    shop_res = await session.exec(select(Shop).where(Shop.owner_id == user.id))
    shop = shop_res.first()
    shop.stripe_account_id = "acct_test_sub"
    session.add(shop)
    await session.commit()
    
    mock_session = MagicMock()
    mock_session.url = "http://stripe.subscription/url"
    
    with patch("app.interfaces.api.v1.payments_v2.stripeClient") as mock_stripe, \
         patch("app.interfaces.api.v1.payments_v2.get_or_create_visibility_price", return_value="price_123"):
        mock_stripe.checkout.sessions.create.return_value = mock_session
        
        response = await client.post(
            "/api/v1/payments/v2/subscribe",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["url"] == "http://stripe.subscription/url"

@pytest.mark.asyncio
async def test_create_portal_session(client: AsyncClient, shop_owner_data: dict, session: AsyncSession):
    token = shop_owner_data["token"]
    email = shop_owner_data["email"]
    
    # Setup shop
    result = await session.exec(select(User).where(User.email == email))
    user = result.first()
    shop_res = await session.exec(select(Shop).where(Shop.owner_id == user.id))
    shop = shop_res.first()
    shop.stripe_account_id = "acct_test_portal"
    session.add(shop)
    await session.commit()
    
    mock_portal = MagicMock()
    mock_portal.url = "http://stripe.portal/url"
    
    with patch("app.interfaces.api.v1.payments_v2.stripeClient") as mock_stripe:
        mock_stripe.billing_portal.sessions.create.return_value = mock_portal
        
        response = await client.post(
            "/api/v1/payments/v2/portal",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["url"] == "http://stripe.portal/url"

