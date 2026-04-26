from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str
    STRIPE_API_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    FRONTEND_URL: str = "https://fast-feast.onrender.com"
    STRIPE_SUCCESS_URL: Optional[str] = None
    STRIPE_CANCEL_URL: Optional[str] = None
    CLOUDINARY_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Stripe Connect
    PLATFORM_FEE_PERCENT: float = 0.10 # 10%

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
