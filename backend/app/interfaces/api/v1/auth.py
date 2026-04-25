from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from app.infrastructure.db import get_session
from app.domain.models import User, UserRole, Shop, ShopStatus
from app.interfaces.api.schemas import (
    BuyerRegisterSchema, 
    LoginSchema, 
    TokenSchema, 
    UserResponseSchema, 
    ShopRegisterSchema, 
    ShopResponseSchema
)
from app.core.security import get_password_hash, verify_password, create_access_token
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register/buyer", response_model=UserResponseSchema)
async def register_buyer(
    data: BuyerRegisterSchema,
    session: AsyncSession = Depends(get_session)
):
    # Check if user exists
    result = await session.exec(select(User).where(User.email == data.email))
    if result.first():
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        phone=data.phone,
        role=UserRole.BUYER
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

@router.post("/login", response_model=TokenSchema)
async def login(
    data: LoginSchema,
    session: AsyncSession = Depends(get_session)
):
    result = await session.exec(select(User).where(User.email == data.email))
    user = result.first()
    
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role
    }

@router.post("/register/shop", response_model=ShopResponseSchema)
async def register_shop(
    data: ShopRegisterSchema,
    session: AsyncSession = Depends(get_session)
):
    # Check if user exists
    result = await session.exec(select(User).where(User.email == data.email))
    if result.first():
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    
    # Create user
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role=UserRole.SHOP_OWNER
    )
    session.add(user)
    await session.flush() # Get user id
    
    # Create shop
    shop = Shop(
        name=data.shop_name,
        address=data.shop_address,
        owner_id=user.id,
        status=ShopStatus.PENDING
    )
    session.add(shop)
    
    await session.commit()
    await session.refresh(shop)
    return shop
