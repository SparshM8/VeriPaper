# VeriPaper - AI Research Authenticity Platform

A full-stack machine learning application for analyzing research papers to detect plagiarism, AI-generated content, citation validity issues, and statistical anomalies.

## 🎯 Key Features

### Core Analysis Modules
- **📚 Plagiarism Detection**: Semantic similarity search using SBERT embeddings + FAISS vector database
- **🤖 AI Generation Detection**: Hybrid approach combining perplexity analysis + machine learning features
- **🔗 Citation Validation**: DOI extraction and CrossRef API verification
- **📊 Statistical Risk Assessment**: Anomaly detection in statistical claims and p-values

### User Interface
- 🎨 **Modern Dashboard**: Real-time analysis with visual score gauges
- 📥 **Multi-Format Export**: PDF reports, CSV tables, JSON data
- 📋 **Analysis History**: Automatic tracking with browser localStorage
- 🌓 **Dark/Light Theme**: Customizable appearance
- 📱 **Responsive Design**: Mobile-friendly interface

## 🚀 Quick Start

### One-Command Setup (Windows)
```bash
start-dev.bat
```

### Manual Setup

**Terminal 1 - Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` and start analyzing!

## 🏭 Production Setup

### Backend Environment

Use `backend/.env.example` as baseline and set:

- `ENVIRONMENT=production`
- `CORS_ORIGINS=https://your-frontend-domain.com`
- `MAX_UPLOAD_SIZE_MB=15` (or your preferred limit)
- `REPORTS_DIR=reports`
- `AI_MODEL_PATH=models/ai_detector.joblib`

### Frontend Environment

Use `frontend/.env.example` and set:

- `VITE_API_BASE_URL=https://your-api-domain.com/api` (only needed when frontend and backend are on different origins)

### Container Run

```bash
docker build -t veripaper .
docker run -p 8000:8000 --env-file backend/.env veripaper
```

The production container serves API at `/api/*`, reports at `/files/*`, and frontend static files at `/static/*` when built.

## 📖 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide (start here!)
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Detailed architecture and development guide
- **[backend/](backend/)** - Backend API documentation
- **[frontend/](frontend/)** - Frontend component guide

## 💻 System Requirements

- Python 3.11+
- Node.js 16+
- Modern web browser
- 2GB RAM minimum
- 500MB disk space

## 📊 Analysis Results

Each analysis returns:

| Metric | Range | Interpretation |
|--------|-------|-----------------|
| **Plagiarism Score** | 0-100% | % similarity to known papers (lower = better) |
| **AI Probability** | 0-100% | % likelihood content is AI-written (lower = better) |
| **Citation Validity** | 0-100% | % of valid citations (higher = better) |
| **Statistical Risk** | 0-100% | Risk level in statistical claims (lower = better) |
| **Overall Credibility** | 0-100% | Combined authenticity score (higher = better) |

## 🔌 API Quick Reference

### Health Check
```bash
GET /health
→ {"status": "ok", "version": "0.1.0"}
```

### Analyze Paper
```bash
POST /api/analyze
Content-Type: multipart/form-data
Body: file=<PDF/DOCX/TXT>

Response: {
  "plagiarism_score": 35.2,
  "ai_probability": 42.1,
  "citation_validity_score": 90.0,
  "statistical_risk_score": 15.0,
  "overall_research_credibility": 58.4,
  "plagiarism_matches": [...],
  "citation_invalid_dois": [...],
  "report_path": "reports/..."
}
```

### API Documentation
Interactive Swagger UI at `http://localhost:8000/docs`

## 🧪 Testing

### Test Integration
```bash
cd backend
python scripts/test_api.py data/sample_paper.txt
```

### Test Frontend
Visit `http://localhost:5173` and upload a file

### Automated Tests
```bash
pytest -q
```

CI is configured in `.github/workflows/ci.yml` to run backend tests and frontend build on push and pull requests.

## 🏗️ Project Structure

```
VeriPaper/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── main.py      # FastAPI setup
│   │   ├── api/routes.py # Analysis endpoint
│   │   └── services/    # Plagiarism, AI, citation, stats modules
│   ├── scripts/         # Training and testing scripts
│   ├── data/            # Sample datasets
│   └── requirements.txt # Python dependencies
├── frontend/            # React + Vite application
│   ├── src/
│   │   ├── App.jsx      # Dashboard component
│   │   ├── ScoreGauge.jsx # Visualization
│   │   └── api.js       # HTTP client
│   └── package.json     # npm dependencies
├── QUICKSTART.md        # 5-minute setup guide
├── DEVELOPMENT.md       # Detailed documentation
└── README.md           # This file
```

## 🌟 Features Included

✅ Multi-factor analysis (plagiarism, AI detection, citations, statistics)
✅ SBERT embeddings + FAISS vector search
✅ Logistic regression AI classifier
✅ CrossRef API integration for citations
✅ PDF report generation
✅ React dashboard with real-time visualization
✅ Multi-format export (PDF, CSV, JSON)
✅ Analysis history with localStorage
✅ Dark/light theme support
✅ Responsive mobile design
✅ Pre-trained AI detector model
✅ Test scripts included
✅ API documentation with Swagger UI

## 📚 Technology Stack

### Backend
- FastAPI 0.115.0
- Python 3.11
- SBERT 3.0.1 (Sentence embeddings)
- FAISS 1.8.0 (Vector similarity)
- scikit-learn (Logistic regression)
- ReportLab (PDF generation)
- Requests (CrossRef API)

### Frontend
- React 18.3.1
- Vite 5.4.3
- Tailwind CSS 3.4.10
- Recharts 2.10.3
- Axios 1.7.7

## 🚢 Deployment

### Docker
```bash
docker build -t veripaper-backend backend/
docker run -p 8000:8000 veripaper-backend

docker build -t veripaper-frontend frontend/
docker run -p 3000:3000 veripaper-frontend
```

### Cloud Platforms
- **Render**: Deploy backend with native Python support
- **Vercel**: Deploy frontend with automatic builds
- **AWS/GCP/Azure**: Use Docker containers

## 🛠️ Configuration

Create `backend/.env`:
```
CROSSREF_DISABLE=0
REPORTS_DIR=backend/reports
```

## 📝 License

MIT License - Free for academic and commercial use

## 🤝 Contributing

Contributions welcome! Please see DEVELOPMENT.md for setup and architecture details.

## 📧 Support

- 📖 Check QUICKSTART.md or DEVELOPMENT.md
- 🐛 Review troubleshooting section
- 💬 Open an issue on GitHub

---

**Ready to analyze?** Start with [QUICKSTART.md](QUICKSTART.md)  
**Want details?** Read [DEVELOPMENT.md](DEVELOPMENT.md)

**Version**: 0.1.0 (Beta) | **Status**: Under Active Development

### Setup
1. Install dependencies from frontend/package.json.
2. Run the dev server on port 5173.

### Notes
The frontend expects the backend at http://localhost:8000.

## Outputs
The analysis response includes scores, explanations, suspicious paragraph samples, and a report path for the generated PDF.

## AI Detector Training
Train the logistic regression model with a CSV that has columns text,label where label is 0 for human and 1 for AI.
Use backend/scripts/train_ai_detector.py and pass --data and --output. The default output path matches AI_MODEL_PATH.

## Launch Summary
Backend runs on http://localhost:8000 (API at /api/analyze) and frontend runs on http://localhost:5173.

## Testing
Run the test script to verify the end-to-end pipeline:
```bash
python backend/scripts/test_api.py backend/data/sample_paper.txt
```

## Architecture
- **Text Extraction**: PyMuPDF for PDFs, python-docx for DOCX, plain UTF-8 for TXT
- **Plagiarism Detection**: SBERT (all-MiniLM-L6-v2) embeddings + FAISS IndexFlatIP for semantic search
- **AI Detection**: Perplexity, lexical diversity, stopword frequency, repetition, punctuation entropy + optional trained logistic regression
- **Citation Validation**: Regex extraction + CrossRef API validation + year mismatch detection
- **Statistical Risk**: Repeated decimal patterns, unrealistic p-values
- **Scoring Formula**: 0.4 × (100 - plagiarism) + 0.4 × (100 - AI probability) + 0.2 × citation_validity
