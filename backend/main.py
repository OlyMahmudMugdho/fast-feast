from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.infrastructure.db import init_db
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

from app.interfaces.api.v1.router import api_router

app = FastAPI(title="Fast-Feast API", lifespan=lifespan)

# CORS Configuration
# Essential for Flutter Web and Mobile Apps connecting to local backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:8000",
        "http://localhost:3000",
        "http://127.0.0.1",
        "http://127.0.0.1:8000",
        "*", # Allow all for development flexibility
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Fast-Feast API is running"}

# Serve Frontend
frontend_path = os.path.join(os.path.dirname(__file__), "frontend")

if os.path.exists(frontend_path):
    @app.middleware("http")
    async def serve_static_html(request: Request, call_next):
        response = await call_next(request)
        
        # If 404 and NOT an API request, serve HTML
        if response.status_code == 404 and not request.url.path.startswith("/api"):
            path = request.url.path.lstrip("/")
            if not path:
                path = "index"
            
            html_file = os.path.join(frontend_path, f"{path}.html")
            if os.path.exists(html_file):
                return FileResponse(html_file)
            
            # SPA Fallback
            return FileResponse(os.path.join(frontend_path, "index.html"))
            
        return response

    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    print(f"Warning: Frontend build not found at {frontend_path}")
