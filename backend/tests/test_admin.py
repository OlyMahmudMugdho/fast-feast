import pytest
from httpx import AsyncClient
from app.domain.models import User, UserRole, Shop, ShopStatus
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.security import get_password_hash
from uuid import uuid4

@pytest.fixture
async def admin_token(client: AsyncClient, session: AsyncSession):
    email = f"admin_{uuid4()}@test.com"
    admin = User(
        email=email,
        hashed_password=get_password_hash("admin123"),
        full_name="Admin",
        role=UserRole.SUPER_ADMIN
    )
    session.add(admin)
    await session.commit()
    
    resp = await client.post("/api/v1/auth/login", json={"email": email, "password": "admin123"})
    return resp.json()["access_token"]

@pytest.mark.asyncio
async def test_get_admin_stats(client: AsyncClient, admin_token: str):
    response = await client.get(
        "/api/v1/admin/stats",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "total_shops" in data
    assert "total_users" in data

@pytest.mark.asyncio
async def test_list_shops_and_verify(client: AsyncClient, admin_token: str, session: AsyncSession):
    # Create a pending shop
    shop = Shop(name="Verify Me", address="123", owner_id=uuid4(), status=ShopStatus.PENDING)
    session.add(shop)
    await session.commit()
    await session.refresh(shop)

    # List pending
    response = await client.get("/api/v1/admin/shops/pending", headers={"Authorization": f"Bearer {admin_token}"})
    assert any(s["id"] == str(shop.id) for s in response.json())

    # Verify
    response = await client.post(
        f"/api/v1/admin/shops/{shop.id}/verify",
        json={"is_approved": True},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "APPROVED"

@pytest.mark.asyncio
async def test_get_admin_employees(client: AsyncClient, admin_token: str):
    response = await client.get(
        "/api/v1/admin/employees",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_admin_shops(client: AsyncClient, admin_token: str):
    response = await client.get(
        "/api/v1/admin/shops",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_reject_shop(client: AsyncClient, admin_token: str, session: AsyncSession):
    shop = Shop(name="Reject Me", address="123", owner_id=uuid4(), status=ShopStatus.PENDING)
    session.add(shop)
    await session.commit()
    await session.refresh(shop)

    response = await client.post(
        f"/api/v1/admin/shops/{shop.id}/verify",
        json={"is_approved": False, "reason": "Too many typos"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["status"] == "REJECTED"

@pytest.mark.asyncio
async def test_get_admin_orders(client: AsyncClient, admin_token: str):
    response = await client.get(
        "/api/v1/admin/orders",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_admin_employee(client: AsyncClient, admin_token: str):
    response = await client.post(
        "/api/v1/admin/employees",
        params={
            "email": f"new_admin_{uuid4()}@test.com",
            "full_name": "New Admin",
            "password": "password123"
        },
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert "email" in response.json()
    assert response.json()["role"] == "ADMIN"

