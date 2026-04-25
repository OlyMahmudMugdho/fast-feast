from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, func
from app.infrastructure.db import get_session
from app.domain.models import Shop, ShopStatus, UserRole, User, Order
from app.interfaces.api.schemas import ShopResponseSchema, VerificationSchema, UserResponseSchema
from app.interfaces.api.deps import RoleChecker, get_current_user
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["admin"])

admin_check = RoleChecker([UserRole.ADMIN, UserRole.SUPER_ADMIN])

class AdminStats(BaseModel):
    total_shops: int
    total_users: int
    total_orders: int
    total_revenue: float
    total_platform_fees: float

@router.get("/stats", response_model=AdminStats)
async def get_global_stats(
    session: AsyncSession = Depends(get_session),
    _ = Depends(admin_check)
):
    # This is a heavy query, in a real app we'd use a view or cache
    shops_count = await session.exec(select(func.count(Shop.id)))
    users_count = await session.exec(select(func.count(User.id)))
    orders_count = await session.exec(select(func.count(Order.id)))
    
    revenue_res = await session.exec(select(func.sum(Order.total_amount)))
    fees_res = await session.exec(select(func.sum(Order.platform_fee)))
    
    return {
        "total_shops": shops_count.one(),
        "total_users": users_count.one(),
        "total_orders": orders_count.one(),
        "total_revenue": float(revenue_res.one() or 0),
        "total_platform_fees": float(fees_res.one() or 0)
    }

@router.get("/shops", response_model=List[ShopResponseSchema])
async def list_all_shops(
    session: AsyncSession = Depends(get_session),
    _ = Depends(admin_check)
):
    result = await session.exec(select(Shop))
    return result.all()

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

@router.get("/employees", response_model=List[UserResponseSchema])
async def list_admin_employees(
    session: AsyncSession = Depends(get_session),
    _ = Depends(RoleChecker([UserRole.SUPER_ADMIN, UserRole.ADMIN]))
):
    result = await session.exec(select(User).where(User.role.in_([UserRole.ADMIN, UserRole.SUPER_ADMIN])))
    return result.all()

@router.post("/employees", response_model=UserResponseSchema)
async def create_admin_employee(
    email: str,
    full_name: str,
    password: str,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(RoleChecker([UserRole.SUPER_ADMIN]))
):
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
