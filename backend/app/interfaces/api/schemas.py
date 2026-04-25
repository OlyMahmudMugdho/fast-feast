from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal
from app.domain.models import UserRole, OrderStatus, PaymentMethod

# Auth Schemas
class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole

# User Schemas
class BuyerRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    phone: Optional[str] = None

class UserResponseSchema(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None

class ShopRegisterSchema(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str # Owner name
    shop_name: str
    shop_address: str

class ShopResponseSchema(BaseModel):
    id: UUID
    owner_id: UUID
    name: str
    address: str
    status: str
    logo_url: Optional[str] = None
    stripe_onboarded: bool

    class Config:
        from_attributes = True

class VerificationSchema(BaseModel):
    is_approved: bool
    reason: Optional[str] = None

# Catalog Schemas
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    shop_id: UUID

    class Config:
        from_attributes = True

class FoodItemCreate(BaseModel):
    name: str
    description: str
    price: Decimal
    category_id: UUID
    is_available: bool = True

class FoodItemResponse(BaseModel):
    id: UUID
    name: str
    description: str
    price: Decimal
    image_url: Optional[str] = None
    is_available: bool
    category_id: UUID
    shop_id: UUID

    class Config:
        from_attributes = True

class ShopPublicResponse(BaseModel):
    id: UUID
    name: str
    address: str
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemCreate(BaseModel):
    food_item_id: UUID
    quantity: int

class OrderCreate(BaseModel):
    shop_id: UUID
    items: List[OrderItemCreate]
    delivery_address: str
    payment_method: PaymentMethod = PaymentMethod.STRIPE

class OrderItemResponse(BaseModel):
    food_item_id: UUID
    quantity: int
    price_at_purchase: Decimal
    food_item: FoodItemResponse

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: UUID
    buyer_id: UUID
    shop_id: UUID
    total_amount: Decimal
    platform_fee: Decimal
    status: OrderStatus
    payment_method: PaymentMethod
    delivery_address: str
    checkout_url: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class StripeOnboardResponse(BaseModel):
    account_link_url: str
