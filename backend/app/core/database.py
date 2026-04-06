"""
Database connection management and initialization.
Handles SQLAlchemy engine, sessions, and migrations.
"""
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import logging

from .config import settings
from ..models.database import Base

logger = logging.getLogger(__name__)


def get_database_url() -> str:
    """
    Build database URL from environment variables.
    Supports both development and production configurations.
    
    Environment variables:
    - DB_ENGINE: "postgresql" (default) or "sqlite"
    - DB_USER: Database user
    - DB_PASSWORD: Database password
    - DB_HOST: Database host (localhost for dev)
    - DB_PORT: Database port (5432 for PostgreSQL)
    - DB_NAME: Database name
    
    Development (in-memory SQLite):
    - DB_ENGINE=sqlite -> uses sqlite:///:memory:
    
    Production (PostgreSQL):
    - Uses postgresql://user:pass@host:port/dbname
    """
    return settings.database_url


def init_db():
    """
    Initialize database engine and create all tables.
    Called on application startup.
    """
    db_url = get_database_url()
    logger.info(f"Initializing database: {db_url.split('@')[-1] if '@' in db_url else db_url}")
    
    # Create engine with connection pooling for production
    engine_kwargs = {
        "pool_pre_ping": True,
        "echo": False,
    }
    if db_url.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    else:
        engine_kwargs.update(
            {
                "poolclass": QueuePool,
                "pool_size": 5,
                "max_overflow": 10,
                "echo": settings.LOG_LEVEL == "DEBUG",
            }
        )

    engine = create_engine(db_url, **engine_kwargs)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Verify connection
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection verified")
    except Exception as e:
        logger.error(f"❌ Database connection failed: {e}")
        raise
    
    return engine


# Global engine instance (initialized once)
engine = None
SessionLocal = None


def get_session_factory():
    """Get or initialize the SessionLocal factory."""
    global engine, SessionLocal
    if SessionLocal is None:
        engine = init_db()
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal


def get_db() -> Generator[Session, None, None]:
    """
    Dependency injection for FastAPI route handlers.
    Provides a database session for each request.
    
    Usage:
    - @app.get("/results")
    - def get_results(db: Session = Depends(get_db)):
    """
    SessionLocal = get_session_factory()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def close_db():
    """Close database connections. Called on shutdown."""
    global engine
    if engine:
        engine.dispose()
        logger.info("Database connections closed")
