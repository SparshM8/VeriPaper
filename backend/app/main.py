from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.routes import router as api_router

app = FastAPI(title="VeriPaper API", version="0.1.0")

# Add CORS middleware BEFORE other routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "https://veripaper.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for PDF reports
reports_dir = Path(__file__).parent.parent.parent / "backend" / "reports"
reports_dir.mkdir(exist_ok=True)
app.mount("/files", StaticFiles(directory=str(reports_dir)), name="static")

# Mount frontend static files under /static to avoid shadowing API routes
frontend_dir = Path(__file__).parent.parent.parent / "frontend" / "dist"
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
    return {"status": "ok", "version": "0.1.0"}


@app.get("/api/test")
def test_endpoint() -> dict:
    return {"message": "Backend is working!"}

