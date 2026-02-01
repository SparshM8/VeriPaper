from pydantic import BaseModel, Field
from typing import List, Optional


class AnalysisResult(BaseModel):
    plagiarism_score: float = Field(..., ge=0, le=100)
    plagiarism_summary: str
    plagiarism_matches: List["PlagiarismMatch"]
    ai_probability: float = Field(..., ge=0, le=100)
    ai_confidence: str
    citation_validity_score: float = Field(..., ge=0, le=100)
    citation_summary: str
    citation_invalid_dois: List[str]
    citation_missing_dois: List[str]
    citation_year_mismatches: List[str]
    statistical_risk_score: float = Field(..., ge=0, le=100)
    statistical_summary: str
    overall_research_credibility: float = Field(..., ge=0, le=100)
    suspicious_paragraphs: List[str]
    explanations: List[str]
    report_path: str


class PlagiarismMatch(BaseModel):
    title: str
    similarity: float = Field(..., ge=0, le=100)
    source: str


class PlagiarismResult(BaseModel):
    score: float
    summary: str
    explanation: str
    matches: List[PlagiarismMatch]


class AIDetectionResult(BaseModel):
    ai_probability: float
    confidence: str
    explanation: str


class CitationResult(BaseModel):
    validity_score: float
    summary: str
    explanation: str
    invalid_dois: List[str]
    missing_dois: List[str]
    year_mismatches: List[str]


class StatisticalRiskResult(BaseModel):
    risk_score: float
    summary: str
    explanation: str


AnalysisResult.model_rebuild()
