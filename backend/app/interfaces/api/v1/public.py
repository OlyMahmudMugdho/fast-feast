from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from app.infrastructure.db import get_session
from app.domain.models import Shop, Category, FoodItem, ShopStatus
from app.interfaces.api.schemas import ShopPublicResponse, CategoryResponse, FoodItemResponse
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID

router = APIRouter()

@router.get("/shops", response_model=List[ShopPublicResponse])
async def list_shops(
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(Shop).where(Shop.status == ShopStatus.APPROVED))
    return result.all()

@router.get("/shops/{shop_id}/categories", response_model=List[CategoryResponse])
async def get_shop_categories(
    shop_id: UUID,
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(Category).where(Category.shop_id == shop_id))
    return result.all()

@router.get("/shops/{shop_id}/items", response_model=List[FoodItemResponse])
async def get_shop_items(
    shop_id: UUID,
    category_id: UUID = None,
    session: AsyncSession = Depends(get_session)
):
    statement = select(FoodItem).where(FoodItem.shop_id == shop_id, FoodItem.is_available == True)
    if category_id:
        statement = statement.where(FoodItem.category_id == category_id)
    
    result = await session.exec(statement)
    return result.all()
