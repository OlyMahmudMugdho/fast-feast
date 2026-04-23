from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.infrastructure.db import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model
    await init_db()
    yield
    # Clean up the ML models and release the resources

from app.interfaces.api.v1.router import api_router

app = FastAPI(title="Fast-Feast API", lifespan=lifespan)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Fast-Feast API is running"}

app.include_router(api_router, prefix="/api/v1")
