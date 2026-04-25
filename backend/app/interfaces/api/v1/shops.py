from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import select
from app.infrastructure.db import get_session
from app.domain.models import Shop, Category, FoodItem, User, UserRole
from app.interfaces.api.schemas import (
    ShopResponseSchema, CategoryCreate, CategoryResponse, 
    FoodItemCreate, FoodItemResponse, VerificationSchema, UserResponseSchema
)
from app.interfaces.api.deps import get_current_user, RoleChecker
from app.infrastructure.media import upload_image
from app.infrastructure.stripe_client import stripeClient
from sqlmodel.ext.asyncio.session import AsyncSession
from decimal import Decimal
from uuid import UUID
import logging

router = APIRouter(prefix="/shops", tags=["shops"])

shop_access_check = RoleChecker([UserRole.SHOP_OWNER, UserRole.SHOP_EMPLOYEE])

async def get_user_shop(user: User, session: AsyncSession) -> Shop:
    if user.role == UserRole.SHOP_OWNER:
        result = await session.exec(select(Shop).where(Shop.owner_id == user.id))
    else:
        result = await session.exec(select(Shop).where(Shop.id == user.shop_id))
    
    shop = result.first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return shop

@router.post("/me/items", response_model=FoodItemResponse)
async def create_food_item(
    name: str = Form(...),
    description: str = Form(...),
    price: Decimal = Form(...),
    category_id: UUID = Form(...),
    is_available: bool = Form(True),
    image: UploadFile = File(...),
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    image_url = await upload_image(image.file, folder=f"shops/{shop.id}/items")
    
    item = FoodItem(
        name=name,
        description=description,
        price=price,
        category_id=category_id,
        is_available=is_available,
        image_url=image_url,
        shop_id=shop.id
    )
    
    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item

@router.patch("/me/items/{item_id}", response_model=FoodItemResponse)
async def update_food_item(
    item_id: UUID,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[Decimal] = Form(None),
    category_id: Optional[UUID] = Form(None),
    is_available: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    result = await session.exec(select(FoodItem).where(FoodItem.id == item_id, FoodItem.shop_id == shop.id))
    item = result.first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if name is not None: item.name = name
    if description is not None: item.description = description
    if price is not None: item.price = price
    if is_available is not None: item.is_available = is_available
    if category_id is not None: item.category_id = category_id

    if image is not None:
        item.image_url = await upload_image(image.file, folder=f"shops/{shop.id}/items")

    session.add(item)
    await session.commit()
    await session.refresh(item)
    return item

@router.get("/me/employees", response_model=List[UserResponseSchema])
async def get_shop_employees(
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    result = await session.exec(select(User).where(User.shop_id == shop.id))
    return result.all()

@router.get("/me/categories", response_model=List[CategoryResponse])
async def get_my_categories(
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    result = await session.exec(select(Category).where(Category.shop_id == shop.id))
    return result.all()

@router.post("/me/categories", response_model=CategoryResponse)
async def create_category(
    category_in: CategoryCreate,
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    category = Category(
        **category_in.dict(),
        shop_id=shop.id
    )
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category

@router.get("/me/items", response_model=List[FoodItemResponse])
async def get_my_items(
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    result = await session.exec(select(FoodItem).where(FoodItem.shop_id == shop.id))
    return result.all()

@router.get("/me", response_model=ShopResponseSchema)
async def get_my_shop(
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    return await get_user_shop(current_user, session)
