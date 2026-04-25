from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlmodel import select
from app.core.config import settings
from app.infrastructure.db import get_session
from app.domain.models import User, UserRole
from sqlmodel.ext.asyncio.session import AsyncSession
from uuid import UUID
import logging

logger = logging.getLogger("fastapi")

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)

async def get_current_user(
    session: AsyncSession = Depends(get_session),
    token: str = Depends(reusable_oauth2)
) -> User:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    result = await session.exec(select(User).where(User.id == UUID(user_id)))
    user = result.first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

class RoleChecker:
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        # Extract string value of the role for comparison
        user_role_str = str(user.role.value if hasattr(user.role, 'value') else user.role).strip().upper()
        allowed_roles_str = [str(r.value if hasattr(r, 'value') else r).strip().upper() for r in self.allowed_roles]
        
        logger.info(f"RBAC Attempt: User '{user.email}' (Role: '{user_role_str}') accessing endpoint requiring {allowed_roles_str}")
        
        if user_role_str not in allowed_roles_str:
            logger.warning(f"RBAC DENIED: User '{user.email}' lacks permission.")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": "You don't have enough permissions",
                    "required": allowed_roles_str,
                    "actual": user_role_str
                }
            )
        return user
