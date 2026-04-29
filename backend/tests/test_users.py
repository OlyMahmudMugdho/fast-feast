import pytest
from httpx import AsyncClient
from app.domain.models import User
from sqlmodel.ext.asyncio.session import AsyncSession

@pytest.fixture
async def buyer_token(client: AsyncClient):
    payload = {
        "email": "user@test.com",
        "password": "password123",
        "full_name": "User"
    }
    await client.post("/api/v1/auth/register/buyer", json=payload)
    resp = await client.post("/api/v1/auth/login", json={"email": "user@test.com", "password": "password123"})
    return resp.json()["access_token"]

@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, buyer_token: str):
    response = await client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "user@test.com"

@pytest.mark.asyncio
async def test_update_profile(client: AsyncClient, buyer_token: str):
    response = await client.patch(
        "/api/v1/users/me",
        json={"full_name": "New Name", "phone": "9999999999"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "New Name"
    assert response.json()["phone"] == "9999999999"

@pytest.mark.asyncio
async def test_update_profile_password(client: AsyncClient, buyer_token: str):
    response = await client.patch(
        "/api/v1/users/me",
        json={"password": "newpassword123"},
        headers={"Authorization": f"Bearer {buyer_token}"}
    )
    assert response.status_code == 200
    
    # Try login with new password
    login_resp = await client.post("/api/v1/auth/login", json={"email": "user@test.com", "password": "newpassword123"})
    assert login_resp.status_code == 200
