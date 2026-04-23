from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import select
from app.infrastructure.db import get_session
from app.domain.models import Shop, User, UserRole, Category, FoodItem
from app.interfaces.api.schemas import (
    ShopResponseSchema, UserResponseSchema, BuyerRegisterSchema,
    CategoryCreate, CategoryResponse, FoodItemResponse
)
from app.interfaces.api.deps import get_current_user, RoleChecker
from app.infrastructure.media import upload_image
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.security import get_password_hash
from decimal import Decimal
from uuid import UUID

router = APIRouter()

# Only Shop Owners or Employees can manage catalog (checking for Shop Owner for now as requested)
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

@router.get("/me", response_model=ShopResponseSchema)
async def get_my_shop(
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    return await get_user_shop(current_user, session)

@router.post("/me/logo", response_model=ShopResponseSchema)
async def upload_shop_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(RoleChecker([UserRole.SHOP_OWNER])),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    logo_url = await upload_image(file.file, folder=f"shops/{shop.id}")
    shop.logo_url = logo_url
    session.add(shop)
    await session.commit()
    await session.refresh(shop)
    return shop

# --- Category Management ---

@router.post("/me/categories", response_model=CategoryResponse)
async def create_category(
    data: CategoryCreate,
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    category = Category(**data.model_dump(), shop_id=shop.id)
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category

@router.get("/me/categories", response_model=List[CategoryResponse])
async def get_my_categories(
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    result = await session.exec(select(Category).where(Category.shop_id == shop.id))
    return result.all()

# --- Food Item Management ---

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
    
    # Verify category belongs to shop
    cat_result = await session.exec(select(Category).where(Category.id == category_id, Category.shop_id == shop.id))
    if not cat_result.first():
        raise HTTPException(status_code=400, detail="Invalid category")

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

@router.get("/me/items", response_model=List[FoodItemResponse])
async def get_my_items(
    current_user: User = Depends(shop_access_check),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    result = await session.exec(select(FoodItem).where(FoodItem.shop_id == shop.id))
    return result.all()

# --- Employee Management ---

@router.get("/me/employees", response_model=List[UserResponseSchema])
async def get_shop_employees(
    current_user: User = Depends(RoleChecker([UserRole.SHOP_OWNER])),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    emp_result = await session.exec(select(User).where(User.shop_id == shop.id))
    return emp_result.all()

@router.post("/me/employees", response_model=UserResponseSchema)
async def add_shop_employee(
    data: BuyerRegisterSchema,
    current_user: User = Depends(RoleChecker([UserRole.SHOP_OWNER])),
    session: AsyncSession = Depends(get_session)
):
    shop = await get_user_shop(current_user, session)
    
    user_exists = await session.exec(select(User).where(User.email == data.email))
    if user_exists.first():
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    new_employee = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=get_password_hash(data.password),
        role=UserRole.SHOP_EMPLOYEE,
        shop_id=shop.id,
        phone=data.phone
    )
    session.add(new_employee)
    await session.commit()
    await session.refresh(new_employee)
    return new_employee
