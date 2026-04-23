from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from app.infrastructure.db import get_session
from app.domain.models import Shop, ShopStatus, UserRole, User
from app.interfaces.api.schemas import ShopResponseSchema, VerificationSchema, UserResponseSchema
from app.interfaces.api.deps import RoleChecker, get_current_user
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID

router = APIRouter()

# Only SUPER_ADMIN and ADMIN can access these
admin_check = RoleChecker([UserRole.ADMIN, UserRole.SUPER_ADMIN])

@router.get("/shops/pending", response_model=List[ShopResponseSchema])
async def get_pending_shops(
    session: AsyncSession = Depends(get_session),
    _ = Depends(admin_check)
):
    result = await session.exec(select(Shop).where(Shop.status == ShopStatus.PENDING))
    return result.all()

@router.post("/shops/{shop_id}/verify", response_model=ShopResponseSchema)
async def verify_shop(
    shop_id: UUID,
    data: VerificationSchema,
    session: AsyncSession = Depends(get_session),
    _ = Depends(admin_check)
):
    result = await session.exec(select(Shop).where(Shop.id == shop_id))
    shop = result.first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    
    shop.status = ShopStatus.APPROVED if data.is_approved else ShopStatus.REJECTED
    session.add(shop)
    await session.commit()
    await session.refresh(shop)
    return shop

@router.post("/employees", response_model=UserResponseSchema)
async def create_admin_employee(
    email: str,
    full_name: str,
    password: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN]))
):
    # Only Super Admin can create other Admins
    from app.core.security import get_password_hash
    
    result = await session.exec(select(User).where(User.email == email))
    if result.first():
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_admin = User(
        email=email,
        full_name=full_name,
        hashed_password=get_password_hash(password),
        role=UserRole.ADMIN
    )
    session.add(new_admin)
    await session.commit()
    await session.refresh(new_admin)
    return new_admin
