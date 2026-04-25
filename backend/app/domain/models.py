from enum import Enum
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from decimal import Decimal

class UserRole(str, Enum):
    BUYER = "BUYER"
    SHOP_OWNER = "SHOP_OWNER"
    SHOP_EMPLOYEE = "SHOP_EMPLOYEE"
    ADMIN = "ADMIN"
    SUPER_ADMIN = "SUPER_ADMIN"

class ShopStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SUSPENDED = "SUSPENDED"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    CONFIRMED = "CONFIRMED"
    PREPARING = "PREPARING"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class PaymentMethod(str, Enum):
    STRIPE = "STRIPE"
    COD = "COD"

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    full_name: str
    role: UserRole = Field(default=UserRole.BUYER)
    phone: Optional[str] = None
    is_active: bool = Field(default=True)

class User(UserBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    shop_id: Optional[UUID] = Field(default=None, foreign_key="shop.id")

    # Relationships
    owned_shops: List["Shop"] = Relationship(back_populates="owner", sa_relationship_kwargs={"foreign_keys": "[Shop.owner_id]"})
    works_at: Optional["Shop"] = Relationship(back_populates="employees", sa_relationship_kwargs={"foreign_keys": "[User.shop_id]"})
    orders: List["Order"] = Relationship(back_populates="buyer")

class ShopBase(SQLModel):
    name: str
    address: str
    status: ShopStatus = Field(default=ShopStatus.PENDING)
    logo_url: Optional[str] = Field(default="https://picsum.photos/seed/shop/200/200")
    stripe_account_id: Optional[str] = Field(default=None, unique=True)
    stripe_onboarded: bool = Field(default=False)

class Shop(ShopBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    owner_id: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    owner: "User" = Relationship(back_populates="owned_shops", sa_relationship_kwargs={"foreign_keys": "[Shop.owner_id]"})
    employees: List["User"] = Relationship(back_populates="works_at", sa_relationship_kwargs={"foreign_keys": "[User.shop_id]"})
    categories: List["Category"] = Relationship(back_populates="shop")
    food_items: List["FoodItem"] = Relationship(back_populates="shop")
    orders: List["Order"] = Relationship(back_populates="shop")

class Category(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    shop_id: UUID = Field(foreign_key="shop.id")
    
    shop: Shop = Relationship(back_populates="categories")
    food_items: List["FoodItem"] = Relationship(back_populates="category")

class FoodItem(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str
    description: str
    price: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    image_url: Optional[str] = Field(default="https://picsum.photos/seed/food/400/300")
    is_available: bool = Field(default=True)
    shop_id: UUID = Field(foreign_key="shop.id")
    category_id: UUID = Field(foreign_key="category.id")

    shop: Shop = Relationship(back_populates="food_items")
    category: Category = Relationship(back_populates="food_items")

class Order(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    buyer_id: UUID = Field(foreign_key="user.id")
    shop_id: UUID = Field(foreign_key="shop.id")
    total_amount: Decimal = Field(max_digits=10, decimal_places=2)
    platform_fee: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    payment_method: PaymentMethod = Field(default=PaymentMethod.STRIPE)
    delivery_address: str
    stripe_session_id: Optional[str] = Field(default=None, unique=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    buyer: User = Relationship(back_populates="orders")
    shop: Shop = Relationship(back_populates="orders")
    items: List["OrderItem"] = Relationship(back_populates="order")

class OrderItem(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    order_id: UUID = Field(foreign_key="order.id")
    food_item_id: UUID = Field(foreign_key="fooditem.id")
    quantity: int
    price_at_purchase: Decimal = Field(max_digits=10, decimal_places=2)

    order: Order = Relationship(back_populates="items")
    food_item: FoodItem = Relationship()
