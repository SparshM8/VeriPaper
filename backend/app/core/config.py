import os
from pathlib import Path
from typing import List


def _parse_csv(value: str) -> List[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    PROJECT_NAME = os.getenv("PROJECT_NAME", "VeriPaper API")
    VERSION = os.getenv("APP_VERSION", "1.0.0")
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

    ROOT_DIR = Path(__file__).resolve().parents[3]
    REPORTS_DIR = Path(os.getenv("REPORTS_DIR", str(ROOT_DIR / "reports"))).resolve()
    MODEL_PATH = Path(os.getenv("AI_MODEL_PATH", str(ROOT_DIR / "models" / "ai_detector.joblib"))).resolve()

    MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "15"))
    ALLOWED_FILE_EXTENSIONS = {".txt", ".pdf", ".docx"}

    _default_cors = "http://localhost:5173,http://127.0.0.1:5173"
    CORS_ORIGINS = _parse_csv(os.getenv("CORS_ORIGINS", _default_cors))

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"


settings = Settings()
