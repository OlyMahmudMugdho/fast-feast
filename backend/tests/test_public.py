import pytest
from httpx import AsyncClient
from app.domain.models import Shop, ShopStatus, Category, FoodItem
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import uuid4

@pytest.mark.asyncio
async def test_get_public_shops(client: AsyncClient, session: AsyncSession):
    # Create an approved shop
    shop = Shop(
        name="Approved Shop",
        address="123 Street",
        status=ShopStatus.APPROVED,
        owner_id=uuid4()
    )
    session.add(shop)
    
    # Create a pending shop
    pending_shop = Shop(
        name="Pending Shop",
        address="456 Street",
        status=ShopStatus.PENDING,
        owner_id=uuid4()
    )
    session.add(pending_shop)
    await session.commit()
    
    response = await client.get("/api/v1/public/shops")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(s["name"] == "Approved Shop" for s in data)
    assert not any(s["name"] == "Pending Shop" for s in data)

@pytest.mark.asyncio
async def test_get_public_categories(client: AsyncClient, session: AsyncSession):
    shop = Shop(name="Shop", address="Addr", owner_id=uuid4())
    session.add(shop)
    await session.flush()
    
    cat = Category(name="Test Category", shop_id=shop.id)
    session.add(cat)
    await session.commit()
    
    response = await client.get("/api/v1/public/categories")
    assert response.status_code == 200
    data = response.json()
    assert any(c["name"] == "Test Category" for c in data)

@pytest.mark.asyncio
async def test_get_shop_categories_and_items(client: AsyncClient, session: AsyncSession):
    shop = Shop(name="Shop", address="Addr", owner_id=uuid4(), status=ShopStatus.APPROVED)
    session.add(shop)
    await session.flush()
    
    cat = Category(name="Shop Cat", shop_id=shop.id)
    session.add(cat)
    await session.flush()
    
    item = FoodItem(
        name="Shop Item",
        description="Desc",
        price=10.0,
        shop_id=shop.id,
        category_id=cat.id,
        is_available=True
    )
    session.add(item)
    await session.commit()
    
    # Test categories
    response = await client.get(f"/api/v1/public/shops/{shop.id}/categories")
    assert response.status_code == 200
    assert any(c["name"] == "Shop Cat" for c in response.json())
    
    # Test items
    response = await client.get(f"/api/v1/public/shops/{shop.id}/items")
    assert response.status_code == 200
    assert any(i["name"] == "Shop Item" for i in response.json())
    
    # Test all items discovery
    response = await client.get("/api/v1/public/items")
    assert response.status_code == 200
    assert any(i["name"] == "Shop Item" for i in response.json())
