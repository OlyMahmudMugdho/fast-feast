from fastapi import APIRouter, Depends
from app.interfaces.api.deps import get_current_user
from app.domain.models import User
from app.interfaces.api.schemas import UserResponseSchema

router = APIRouter()

@router.get("/me", response_model=UserResponseSchema)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
