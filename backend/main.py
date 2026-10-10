from contextlib import asynccontextmanager
from typing import AsyncGenerator
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routers import classify, guidance, leaderboard, scans


# ---------------------------------------------------------------------------
# Lifespan — load EfficientNetB0 model once at startup
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # --- Startup ---
    from models import model_loader
    model_loader.load_model(settings.model_path)
    print(f"[EcoSort] Model ready (custom_weights={model_loader._is_custom_10class})")
    yield
    # --- Shutdown ---
    print("[EcoSort] Shutting down.")


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="EcoSort AI API",
    description="AI-powered waste classification and disposal guidance service.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow frontend dev servers on any local port
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(classify.router)
app.include_router(guidance.router)
app.include_router(scans.router)
app.include_router(leaderboard.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def health_check() -> dict:
    """Root health-check endpoint."""
    from models import model_loader
    if not model_loader.is_loaded():
        model_loader.load_model(settings.model_path)
    return {
        "status": "ok",
        "service": "EcoSort AI API",
        "model_loaded": model_loader.is_loaded(),
    }
