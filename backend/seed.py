import asyncio
from sqlmodel import select
from app.infrastructure.db import engine
from app.domain.models import User, UserRole
from app.core.security import get_password_hash
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

async def seed_data():
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        # Check if superadmin exists
        result = await session.exec(select(User).where(User.email == "admin@fastfeast.com"))
        admin = result.first()
        
        if not admin:
            print("Creating superadmin...")
            admin = User(
                email="admin@fastfeast.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Platform Admin",
                role=UserRole.SUPER_ADMIN,
                is_active=True
            )
            session.add(admin)
            await session.commit()
            print("Superadmin created successfully.")
        else:
            print("Superadmin already exists.")

if __name__ == "__main__":
    asyncio.run(seed_data())
