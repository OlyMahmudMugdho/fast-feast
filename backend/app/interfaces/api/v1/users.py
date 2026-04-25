from fastapi import APIRouter, Depends, HTTPException
from app.interfaces.api.deps import get_current_user
from app.domain.models import User
from app.interfaces.api.schemas import UserResponseSchema, UserUpdate
from app.infrastructure.db import get_session
from app.core.security import get_password_hash
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponseSchema)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserResponseSchema)
async def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    if data.password is not None:
        current_user.hashed_password = get_password_hash(data.password)
    
    session.add(current_user)
    await session.commit()
    await session.refresh(current_user)
    return current_user
