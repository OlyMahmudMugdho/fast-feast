from fastapi import APIRouter
from app.interfaces.api.v1 import auth, users, admin, shops, public, orders, payments

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(admin.router)
api_router.include_router(shops.router)
api_router.include_router(orders.router)
api_router.include_router(payments.router)
api_router.include_router(public.router)
