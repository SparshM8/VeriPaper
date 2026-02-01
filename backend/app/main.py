from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.api.routes import router as api_router

app = FastAPI(title="VeriPaper API", version="0.1.0")

# Add CORS middleware BEFORE other routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for PDF reports
reports_dir = Path(__file__).parent.parent.parent / "backend" / "reports"
reports_dir.mkdir(exist_ok=True)
app.mount("/files", StaticFiles(directory=str(reports_dir)), name="static")

app.include_router(api_router)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "version": "0.1.0"}


@app.get("/api/test")
def test_endpoint() -> dict:
    return {"message": "Backend is working!"}

