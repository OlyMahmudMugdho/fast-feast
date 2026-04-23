from fastapi import APIRouter
from app.interfaces.api.v1 import auth, users, admin, shops, public, orders

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(shops.router, prefix="/shops", tags=["shops"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(public.router, tags=["public"])
