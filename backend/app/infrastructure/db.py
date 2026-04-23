from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, create_engine
from app.core.config import settings
from sqlmodel.ext.asyncio.session import AsyncSession

engine = create_async_engine(settings.DATABASE_URL, echo=True, future=True)

async def init_db():
    async with engine.begin() as conn:
        # We'll use Alembic for migrations in production, 
        # but this is useful for quick setup/testing
        # await conn.run_sync(SQLModel.metadata.create_all)
        pass

async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
