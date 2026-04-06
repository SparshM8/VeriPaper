"""
Database connection management and initialization.
Handles SQLAlchemy engine, sessions, and migrations.
"""
import os
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
import logging

from .database import Base

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
    engine = os.getenv("DB_ENGINE", "postgresql").lower()
    
    if engine == "sqlite":
        # Development: in-memory SQLite for quick testing
        db_path = os.getenv("DB_PATH", ":memory:")
        return f"sqlite:///{db_path}"
    
    # Production: PostgreSQL
    db_user = os.getenv("DB_USER", "veripaper")
    db_password = os.getenv("DB_PASSWORD", "")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "veripaper")
    
    if db_password:
        return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    return f"postgresql://{db_user}@{db_host}:{db_port}/{db_name}"


def init_db():
    """
    Initialize database engine and create all tables.
    Called on application startup.
    """
    db_url = get_database_url()
    logger.info(f"Initializing database: {db_url.split('@')[-1] if '@' in db_url else db_url}")
    
    # Create engine with connection pooling for production
    engine = create_engine(
        db_url,
        poolclass=QueuePool,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,  # Verify connections before use
        echo=os.getenv("SQL_ECHO", "false").lower() == "true"
    )
    
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
