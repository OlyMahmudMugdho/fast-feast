from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from app.infrastructure.db import get_session
from app.domain.models import Shop, Category, FoodItem, ShopStatus
from app.interfaces.api.schemas import ShopPublicResponse, CategoryResponse, FoodItemResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID

router = APIRouter(prefix="/public", tags=["public"])

@router.get("/shops", response_model=List[ShopPublicResponse])
async def get_public_shops(session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(Shop).where(Shop.status == ShopStatus.APPROVED))
    return result.all()

@router.get("/categories", response_model=List[CategoryResponse])
async def get_public_categories(session: AsyncSession = Depends(get_session)):
    """Fetch all categories globally."""
    result = await session.exec(select(Category))
    return result.all()

@router.get("/shops/{shop_id}/categories", response_model=List[CategoryResponse])
async def get_shop_categories(shop_id: UUID, session: AsyncSession = Depends(get_session)):
    """Fetch categories for a specific shop (Public)."""
    result = await session.exec(select(Category).where(Category.shop_id == shop_id))
    return result.all()

@router.get("/shops/{shop_id}/items", response_model=List[FoodItemResponse])
async def get_shop_items(shop_id: UUID, session: AsyncSession = Depends(get_session)):
    result = await session.exec(select(FoodItem).where(FoodItem.shop_id == shop_id, FoodItem.is_available == True))
    return result.all()

@router.get("/items", response_model=List[FoodItemResponse])
async def get_all_items(session: AsyncSession = Depends(get_session)):
    """Fetch all available items from all approved shops for discovery."""
    statement = (
        select(FoodItem)
        .join(Shop)
        .where(Shop.status == ShopStatus.APPROVED, FoodItem.is_available == True)
        .limit(20)
    )
    result = await session.exec(statement)
    return result.all()
