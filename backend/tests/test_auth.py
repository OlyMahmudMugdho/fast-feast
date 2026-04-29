import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "Fast-Feast API is running"}

@pytest.mark.asyncio
async def test_register_buyer(client: AsyncClient):
    payload = {
        "email": "test@example.com",
        "password": "password123",
        "full_name": "Test User",
        "phone": "1234567890"
    }
    response = await client.post("/api/v1/auth/register/buyer", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["full_name"] == payload["full_name"]
    assert "id" in data

@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    # First register
    payload = {
        "email": "login@example.com",
        "password": "password123",
        "full_name": "Login User"
    }
    await client.post("/api/v1/auth/register/buyer", json=payload)
    
    # Then login
    login_payload = {
        "email": "login@example.com",
        "password": "password123"
    }
    response = await client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["role"] == "BUYER"

@pytest.mark.asyncio
async def test_register_buyer_existing_email(client: AsyncClient):
    payload = {
        "email": "duplicate@example.com",
        "password": "password123",
        "full_name": "Test User"
    }
    # First time
    await client.post("/api/v1/auth/register/buyer", json=payload)
    # Second time
    response = await client.post("/api/v1/auth/register/buyer", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "User with this email already exists"

@pytest.mark.asyncio
async def test_login_incorrect_password(client: AsyncClient):
    payload = {
        "email": "wrongpass@example.com",
        "password": "correctpassword",
        "full_name": "Test User"
    }
    await client.post("/api/v1/auth/register/buyer", json=payload)
    
    response = await client.post("/api/v1/auth/login", json={
        "email": "wrongpass@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

@pytest.mark.asyncio
async def test_login_non_existent_user(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "password123"
    })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_register_shop_existing_email(client: AsyncClient):
    payload = {
        "email": "shop_duplicate@example.com",
        "password": "password123",
        "full_name": "Owner Name",
        "shop_name": "Test Shop",
        "shop_address": "123 Test St"
    }
    await client.post("/api/v1/auth/register/shop", json=payload)
    response = await client.post("/api/v1/auth/register/shop", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "User with this email already exists"
