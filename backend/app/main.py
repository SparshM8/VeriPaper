import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .api.routes import router as api_router
from .core.config import settings
from .core.logging_config import configure_logging

configure_logging(settings.LOG_LEVEL)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    """Initialize database and verify connectivity."""
    try:
        from .core.database import init_db
        init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        # Don't crash the app - allow degraded mode

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown."""
    try:
        from .core.database import close_db
        close_db()
        logger.info("✅ Database connections closed")
    except Exception as e:
        logger.error(f"⚠️ Error closing database: {e}")

# Add CORS middleware BEFORE other routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for PDF reports
reports_dir = settings.REPORTS_DIR
reports_dir.mkdir(exist_ok=True)
app.mount("/files", StaticFiles(directory=str(reports_dir)), name="static")

# Mount frontend static files under /static to avoid shadowing API routes
frontend_dir = settings.ROOT_DIR / "frontend" / "dist"
if frontend_dir.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")

app.include_router(api_router)


@app.get("/")
def root():
    """Serve the frontend index if available, otherwise return API info."""
    index_path = frontend_dir / "index.html"
    if index_path.exists():
        from fastapi.responses import FileResponse
        return FileResponse(str(index_path), media_type="text/html")

    return {
        "message": "VeriPaper AI Research Authenticity Platform API",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "version": settings.VERSION, "environment": settings.ENVIRONMENT}


@app.get("/ready")
def readiness_check() -> dict:
    checks = {
        "reports_dir_exists": reports_dir.exists(),
        "model_available": settings.MODEL_PATH.exists(),
    }
    ready = all(checks.values())
    return {"status": "ready" if ready else "degraded", "checks": checks}


@app.get("/api/test")
def test_endpoint() -> dict:
    return {"message": "Backend is working!"}


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    logger.exception("Unhandled server exception", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

