import pytest
from httpx import AsyncClient
from app.domain.models import User, UserRole, Shop, Category, FoodItem
from sqlmodel.ext.asyncio.session import AsyncSession
from unittest.mock import patch, MagicMock

@pytest.fixture
async def shop_owner_token(client: AsyncClient):
    payload = {
        "email": "owner@test.com",
        "password": "password123",
        "full_name": "Owner",
        "shop_name": "My Shop",
        "shop_address": "Addr"
    }
    await client.post("/api/v1/auth/register/shop", json=payload)
    resp = await client.post("/api/v1/auth/login", json={"email": "owner@test.com", "password": "password123"})
    return resp.json()["access_token"]

@pytest.mark.asyncio
async def test_get_my_shop(client: AsyncClient, shop_owner_token: str):
    response = await client.get(
        "/api/v1/shops/me",
        headers={"Authorization": f"Bearer {shop_owner_token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "My Shop"

@pytest.mark.asyncio
async def test_create_category(client: AsyncClient, shop_owner_token: str):
    response = await client.post(
        "/api/v1/shops/me/categories",
        json={"name": "New Category", "description": "Desc"},
        headers={"Authorization": f"Bearer {shop_owner_token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "New Category"

@pytest.mark.asyncio
async def test_create_food_item(client: AsyncClient, shop_owner_token: str, session: AsyncSession):
    # Need a category first
    cat_resp = await client.post(
        "/api/v1/shops/me/categories",
        json={"name": "Food Cat"},
        headers={"Authorization": f"Bearer {shop_owner_token}"}
    )
    cat_id = cat_resp.json()["id"]

    with patch("app.interfaces.api.v1.shops.upload_image", return_value="http://image.url"):
        response = await client.post(
            "/api/v1/shops/me/items",
            data={
                "name": "Burger",
                "description": "Tasty",
                "price": "10.50",
                "category_id": cat_id,
                "is_available": "true"
            },
            files={"image": ("test.jpg", b"fake-image-content", "image/jpeg")},
            headers={"Authorization": f"Bearer {shop_owner_token}"}
        )
        assert response.status_code == 200
        assert response.json()["name"] == "Burger"
        assert response.json()["image_url"] == "http://image.url"

@pytest.mark.asyncio
async def test_update_food_item(client: AsyncClient, shop_owner_token: str, session: AsyncSession):
    # Setup
    cat_resp = await client.post("/api/v1/shops/me/categories", json={"name": "Cat"}, headers={"Authorization": f"Bearer {shop_owner_token}"})
    cat_id = cat_resp.json()["id"]
    
    with patch("app.interfaces.api.v1.shops.upload_image", return_value="http://old.url"):
        item_resp = await client.post("/api/v1/shops/me/items", data={"name": "Old", "description": "D", "price": "5.0", "category_id": cat_id}, files={"image": ("t.jpg", b"c")}, headers={"Authorization": f"Bearer {shop_owner_token}"})
        item_id = item_resp.json()["id"]

    # Update
    with patch("app.interfaces.api.v1.shops.upload_image", return_value="http://new.url"):
        response = await client.patch(
            f"/api/v1/shops/me/items/{item_id}",
            data={"name": "New Name", "price": "7.50"},
            headers={"Authorization": f"Bearer {shop_owner_token}"}
        )
        assert response.status_code == 200
        assert response.json()["name"] == "New Name"
        assert float(response.json()["price"]) == 7.50

@pytest.mark.asyncio
async def test_get_shop_employees(client: AsyncClient, shop_owner_token: str):
    response = await client.get(
        "/api/v1/shops/me/employees",
        headers={"Authorization": f"Bearer {shop_owner_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_my_categories(client: AsyncClient, shop_owner_token: str):
    await client.post("/api/v1/shops/me/categories", json={"name": "Cat 1"}, headers={"Authorization": f"Bearer {shop_owner_token}"})
    
    response = await client.get(
        "/api/v1/shops/me/categories",
        headers={"Authorization": f"Bearer {shop_owner_token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1

@pytest.mark.asyncio
async def test_get_my_items(client: AsyncClient, shop_owner_token: str):
    response = await client.get(
        "/api/v1/shops/me/items",
        headers={"Authorization": f"Bearer {shop_owner_token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
