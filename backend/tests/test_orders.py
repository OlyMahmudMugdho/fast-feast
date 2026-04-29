import pytest
from httpx import AsyncClient
from app.domain.models import User, UserRole, Shop, ShopStatus, FoodItem, Category, OrderStatus
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from unittest.mock import patch, MagicMock
from uuid import uuid4

from app.core.security import get_password_hash

@pytest.fixture
async def approved_shop(session: AsyncSession):
    owner = User(
        email=f"owner_{uuid4()}@test.com", 
        hashed_password=get_password_hash("password123"), 
        full_name="Owner", 
        role=UserRole.SHOP_OWNER
    )
    session.add(owner)
    await session.flush()
    
    shop = Shop(
        name="Approved Shop", 
        address="123", 
        owner_id=owner.id, 
        status=ShopStatus.APPROVED, 
        stripe_onboarded=True, 
        stripe_account_id=f"acct_{uuid4().hex[:6]}"
    )
    session.add(shop)
    await session.flush()
    
    cat = Category(name="Cat", shop_id=shop.id)
    session.add(cat)
    await session.flush()
    
    item = FoodItem(name="Pizza", description="Yum", price=15.0, shop_id=shop.id, category_id=cat.id)
    session.add(item)
    await session.commit()
    return shop, item

@pytest.fixture
async def buyer_token(client: AsyncClient):
    email = f"buyer_{uuid4()}@test.com"
    await client.post("/api/v1/auth/register/buyer", json={"email": email, "password": "password123", "full_name": "Buyer"})
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "password123"})
    return resp.json()["access_token"]

@pytest.mark.asyncio
async def test_create_order_cod(client: AsyncClient, buyer_token: str, approved_shop):
    shop, item = approved_shop
    payload = {
        "shop_id": str(shop.id),
        "items": [{"food_item_id": str(item.id), "quantity": 2}],
        "delivery_address": "My Home",
        "payment_method": "COD"
    }
    response = await client.post(
        "/api/v1/orders",
        json=payload,
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert float(data["total_amount"]) == 30.0
    assert data["status"] == "CONFIRMED"
    assert data["payment_method"] == "COD"

@pytest.mark.asyncio
async def test_create_order_stripe(client: AsyncClient, buyer_token: str, approved_shop):
    shop, item = approved_shop
    payload = {
        "shop_id": str(shop.id),
        "items": [{"food_item_id": str(item.id), "quantity": 1}],
        "delivery_address": "My Home",
        "payment_method": "STRIPE"
    }
    
    mock_session = MagicMock()
    mock_session.url = "http://stripe.checkout/url"
    mock_session.id = "cs_test_123"
    
    with patch("app.interfaces.api.v1.orders.stripeClient") as mock_stripe:
        mock_stripe.checkout.sessions.create.return_value = mock_session
        
        response = await client.post(
            "/api/v1/orders",
            json=payload,
            headers={"Authorization": f"Bearer {buyer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["checkout_url"] == "http://stripe.checkout/url"
        assert data["status"] == "PENDING"

@pytest.mark.asyncio
async def test_get_my_orders(client: AsyncClient, buyer_token: str, approved_shop):
    shop, item = approved_shop
    # Create an order first
    await client.post(
        "/api/v1/orders",
        json={
            "shop_id": str(shop.id),
            "items": [{"food_item_id": str(item.id), "quantity": 1}],
            "delivery_address": "Addr",
            "payment_method": "COD"
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    
    response = await client.get(
        "/api/v1/orders/my-orders",
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1

@pytest.mark.asyncio
async def test_onboard_shop(client: AsyncClient, approved_shop, session: AsyncSession):
    shop, _ = approved_shop
    # Get owner token
    owner_email = (await session.exec(select(User).where(User.id == shop.owner_id))).first().email
    resp = await client.post("/api/v1/auth/login", json={"email": owner_email, "password": "password123"})
    token = resp.json()["access_token"]
    
    with patch("app.interfaces.api.v1.orders.stripe.AccountLink.create") as mock_link:
        mock_link.return_value = MagicMock(url="http://stripe.onboard/link")
        
        response = await client.post(
            "/api/v1/orders/onboard",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        assert response.json()["account_link_url"] == "http://stripe.onboard/link"

@pytest.mark.asyncio
async def test_create_order_non_buyer(client: AsyncClient, approved_shop, session: AsyncSession):
    shop, item = approved_shop
    owner_email = (await session.exec(select(User).where(User.id == shop.owner_id))).first().email
    resp = await client.post("/api/v1/auth/login", json={"email": owner_email, "password": "password123"})
    token = resp.json()["access_token"]
    
    response = await client.post(
        "/api/v1/orders",
        json={
            "shop_id": str(shop.id),
            "items": [{"food_item_id": str(item.id), "quantity": 1}],
            "delivery_address": "Addr",
            "payment_method": "COD"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_create_order_shop_not_approved(client: AsyncClient, buyer_token: str, session: AsyncSession):
    owner = User(
        email=f"owner_{uuid4()}@test.com", 
        hashed_password=get_password_hash("password123"), 
        full_name="O", 
        role=UserRole.SHOP_OWNER
    )
    session.add(owner)
    await session.flush()
    shop = Shop(name="Pending", address="A", owner_id=owner.id, status=ShopStatus.PENDING)
    session.add(shop)
    await session.commit()
    
    response = await client.post(
        "/api/v1/orders",
        json={
            "shop_id": str(shop.id),
            "items": [],
            "delivery_address": "Addr",
            "payment_method": "COD"
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert response.status_code == 400
    assert "not currently accepting orders" in response.json()["detail"]

@pytest.mark.asyncio
async def test_update_order_status(client: AsyncClient, buyer_token: str, approved_shop, session: AsyncSession):
    shop, item = approved_shop
    # Create order
    resp = await client.post(
        "/api/v1/orders",
        json={
            "shop_id": str(shop.id),
            "items": [{"food_item_id": str(item.id), "quantity": 1}],
            "delivery_address": "Addr",
            "payment_method": "COD"
        },
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    order_id = resp.json()["id"]
    
    response = await client.patch(
        f"/api/v1/orders/{order_id}/status",
        json={"status": "DELIVERED"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "DELIVERED"

@pytest.mark.asyncio
async def test_get_shop_orders(client: AsyncClient, session: AsyncSession, approved_shop):
    shop, item = approved_shop
    owner = (await session.exec(select(User).where(User.id == shop.owner_id))).first()
    resp = await client.post("/api/v1/auth/login", json={"email": owner.email, "password": "password123"})
    token = resp.json()["access_token"]
    
    response = await client.get(
        "/api/v1/orders/my-orders",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_employee_orders(client: AsyncClient, session: AsyncSession, approved_shop):
    shop, _ = approved_shop
    emp_email = f"emp_{uuid4()}@test.com"
    emp = User(email=emp_email, hashed_password=get_password_hash("pass"), full_name="Emp", role=UserRole.SHOP_EMPLOYEE, shop_id=shop.id)
    session.add(emp)
    await session.commit()
    
    resp = await client.post("/api/v1/auth/login", json={"email": emp_email, "password": "pass"})
    token = resp.json()["access_token"]
    
    response = await client.get(
        "/api/v1/orders/my-orders",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

