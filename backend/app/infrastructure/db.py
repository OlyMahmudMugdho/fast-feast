from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel, create_engine
from app.core.config import settings
from sqlmodel.ext.asyncio.session import AsyncSession

# Configure engine with SSL if needed (required for Neon)
db_url = settings.DATABASE_URL
connect_args = {}

if "sslmode=" in db_url or "ssl=" in db_url:
    connect_args["ssl"] = True
    
    # Properly parse and strip problematic query parameters
    from urllib.parse import urlparse, urlunparse
    
    parsed = urlparse(db_url)
    # Reconstruct the URL without ANY query parameters to be safe with asyncpg
    # as it often chokes on extra params like channel_binding or sslmode
    db_url = urlunparse(parsed._replace(query=""))

engine = create_async_engine(
    db_url, 
    echo=True, 
    future=True,
    connect_args=connect_args
)

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
