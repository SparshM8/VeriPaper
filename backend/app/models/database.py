"""
Database models for storing analysis results and history.
Uses SQLAlchemy ORM for PostgreSQL persistence.
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

Base = declarative_base()


class AnalysisResult(Base):
    """Store complete paper analysis results with metadata."""
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    
    # File metadata
    filename = Column(String(255), nullable=False, index=True)
    file_size = Column(Integer, nullable=False)  # bytes
    file_hash = Column(String(64), unique=True, index=True)  # SHA256
    
    # Analysis scores
    plagiarism_score = Column(Integer, nullable=False)  # 0-100
    plagiarism_summary = Column(String(255), nullable=False)
    plagiarism_matches = Column(JSON, nullable=True)  # JSON array
    
    ai_probability = Column(Float, nullable=False)  # 0.0-1.0 or 0-100
    ai_confidence = Column(String(50), nullable=False)  # "High"/"Low"/"Uncertain"
    
    citation_validity_score = Column(Integer, nullable=False)  # 0-100
    citation_summary = Column(String(255), nullable=False)
    citation_details = Column(JSON, nullable=True)  # DOIs, invalid citations
    
    statistical_risk_score = Column(Integer, nullable=False)  # 0-100 (higher = riskier)
    statistical_summary = Column(String(255), nullable=False)
    
    # Overall credibility
    overall_research_credibility = Column(Integer, nullable=False)  # 0-100
    
    # Explanations for each analysis
    explanations = Column(JSON, nullable=False)  # Array of 4 strings
    
    # Report generation
    report_path = Column(String(255), nullable=True)  # Path to PDF report
    report_generated = Column(Boolean, default=False)
    
    # Timestamps
    analyzed_at = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {
            "id": self.id,
            "filename": self.filename,
            "file_size": self.file_size,
            "plagiarism_score": self.plagiarism_score,
            "plagiarism_summary": self.plagiarism_summary,
            "plagiarism_matches": self.plagiarism_matches or [],
            "ai_probability": self.ai_probability,
            "ai_confidence": self.ai_confidence,
            "citation_validity_score": self.citation_validity_score,
            "citation_summary": self.citation_summary,
            "statistical_risk_score": self.statistical_risk_score,
            "statistical_summary": self.statistical_summary,
            "overall_research_credibility": self.overall_research_credibility,
            "explanations": self.explanations,
            "report_path": self.report_path,
            "timestamp": self.analyzed_at.isoformat() if self.analyzed_at else None,
        }


class AnalysisHistory(Base):
    """Track analysis trends and user behavior."""
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    result_id = Column(Integer, nullable=False, index=True)  # FK to AnalysisResult
    filename = Column(String(255), nullable=False)
    credibility_score = Column(Integer, nullable=False)
    analyzed_at = Column(DateTime, default=datetime.utcnow, index=True)


class SystemMetrics(Base):
    """Track system performance and API usage."""
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True, index=True)
    metric_type = Column(String(50), nullable=False)  # "api_call", "error", "performance"
    value = Column(Float, nullable=False)
    details = Column(JSON, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
