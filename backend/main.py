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
    if os.path.exists(settings.model_path):
        from models import model_loader
        model_loader.load_model(settings.model_path)
        print(f"[EcoSort] Model loaded from {settings.model_path}")
    else:
        print(
            f"[EcoSort] WARNING: Model file not found at {settings.model_path}. "
            "Run training/train.py or scripts/download_model.py first."
        )
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
# CORS — allow the Vite dev server
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
    return {
        "status": "ok",
        "service": "EcoSort AI API",
        "model_loaded": model_loader.is_loaded(),
    }
