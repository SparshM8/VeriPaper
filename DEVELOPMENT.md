# Development Guide

## Architecture Overview

VeriPaper is a full-stack application consisting of:

- **Backend**: Python FastAPI application with machine learning models
- **Frontend**: React/Vite application with modern UI
- **Data**: Training data and pre-trained models
- **Deployment**: Docker for backend, Vercel for frontend

## Backend Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI application entry point
│   ├── api/
│   │   └── routes.py    # API endpoints
│   ├── core/
│   │   └── config.py    # Configuration settings
│   └── models/
│       └── schemas.py   # Pydantic models
├── data/                # Training data
├── models/              # Pre-trained ML models
├── scripts/             # Training and validation scripts
└── requirements.txt     # Python dependencies
```

## Frontend Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main React component
│   ├── api.js           # API client
│   ├── ScoreGauge.jsx   # Score visualization
│   ├── utils.js         # Utility functions
│   └── index.css        # Styles
├── package.json         # Node dependencies
└── vite.config.js       # Vite configuration
```

## Development Setup

1. Clone the repository
2. Follow the Quick Start guide in README.md
3. For backend development, activate virtual environment and run with reload
4. For frontend development, use `npm run dev` for hot reload

## API Endpoints

- `POST /api/analyze`: Analyze uploaded paper file
  - Input: multipart/form-data with 'file' field
  - Output: JSON with analysis results

## Model Training

Use scripts in `backend/scripts/`:
- `train_ai_detector.py`: Train the AI detection model
- `validate_ai_detector.py`: Validate model performance
- `tune_ai_detector.py`: Hyperparameter tuning

## Deployment

- Backend: Deploy to Render using Dockerfile
- Frontend: Deploy to Vercel with vercel.json configuration

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Create pull requests for changes