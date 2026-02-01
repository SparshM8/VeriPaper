# VeriPaper Quick Start Guide

Get VeriPaper running in 5 minutes!

## Prerequisites

- Python 3.11+
- Node.js 16+
- Git

## Step 1: Clone & Navigate

```bash
cd "d:\New folder"
```

## Step 2: Backend Setup (2 minutes)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server (keep this terminal open)
python -m uvicorn app.main:app --reload --port 8000
```

✅ Backend ready at `http://localhost:8000`  
📖 API docs at `http://localhost:8000/docs`

## Step 3: Frontend Setup (2 minutes)

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (keep this terminal open)
npm run dev
```

✅ Frontend ready at `http://localhost:5173`

## Step 4: Test It Out! (1 minute)

1. Open `http://localhost:5173` in your browser
2. Click the file upload area
3. Select a PDF, DOCX, or TXT file (or use `backend/data/sample_paper.txt`)
4. Click "Run Analysis"
5. See results with:
   - Plagiarism, AI, Citation, and Statistical scores
   - Overall credibility percentage
   - Download PDF/CSV/JSON reports
   - Analysis history

## File Upload Options

### Sample File
```bash
# Included test file
backend/data/sample_paper.txt
```

### Test with API Script
```bash
cd backend
python scripts/test_api.py backend/data/sample_paper.txt
```

## What Each Score Means

| Score | Meaning |
|-------|---------|
| **Plagiarism** | % similarity to known papers (lower = better) |
| **AI-Generated** | % probability content is AI-written (lower = better) |
| **Citation Validity** | % of valid citations with proper DOIs (higher = better) |
| **Statistical** | % anomaly risk in statistical claims (lower = better) |
| **Overall Credibility** | Combined authenticity score (higher = better) |

## Export Options

After analysis, download:
- 📥 **PDF Report**: Full analysis with charts
- 📊 **CSV File**: Spreadsheet-compatible format
- 🔗 **JSON Data**: Raw data for processing

## View History

- Click **History** button (top right)
- See last 10 analyses with timestamps
- Click entry to reload previous analysis
- Clear all history with "Clear History" button

## Switch Themes

Toggle **Dark/Light** mode with theme button in header.

## Common Tasks

### Upload a Different File
Simply select a new file and click "Run Analysis" again.

### Re-analyze Previous Paper
Click **History** → select entry → results appear instantly.

### Share Results
- Download JSON for data sharing
- Download PDF for stakeholder reports
- Download CSV for analysis in Excel

## Troubleshooting

### "Backend not responding"
```bash
# Terminal 1 - Check backend is running
curl http://localhost:8000/health
# Should return: {"status":"ok","version":"0.1.0"}
```

### "Download doesn't work"
Verify backend is still running in Terminal 1.

### "File won't upload"
- Check file format (PDF, DOCX, or TXT only)
- File shouldn't be locked by another program
- Try a smaller test file first

### "History not showing"
- Check browser localStorage settings
- Try a different browser or non-incognito mode

## Next Steps

1. **Train Custom AI Model** (optional):
   ```bash
   cd backend
   python scripts/train_ai_detector.py
   ```

2. **Add Your Paper Corpus**:
   - Edit `backend/data/arxiv_abstracts.jsonl`
   - Format: `{"title": "...", "abstract": "...", "url": "..."}`

3. **Deploy to Cloud**:
   - See DEVELOPMENT.md for Docker & Vercel setup

4. **Customize Scoring**:
   - Edit `backend/app/api/routes.py` line 46-50
   - Adjust weights: `0.4 * plagiarism + 0.4 * ai + 0.2 * citation`

## API Quick Reference

### Health Check
```bash
curl http://localhost:8000/health
```

### Analyze a File
```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -F "file=@/path/to/paper.pdf"
```

### API Docs
Visit `http://localhost:8000/docs` for interactive Swagger UI

## Performance Hints

- First analysis may take 10-15s (embedding generation)
- Subsequent analyses cache embeddings
- Large files (>50MB) may timeout
- Restart backend if memory usage spikes

## Need Help?

1. Check **DEVELOPMENT.md** for detailed architecture
2. Review **README.md** in frontend/ and backend/
3. Check terminal logs for error messages
4. Try with sample file: `backend/data/sample_paper.txt`

## What's Included

✅ Full-stack application (backend + frontend)
✅ 4 analysis modules (plagiarism, AI detection, citations, statistics)
✅ PDF report generation
✅ Multi-format export (PDF, CSV, JSON)
✅ Analysis history with localStorage
✅ Dark/light theme support
✅ Responsive mobile-friendly UI
✅ Pre-trained AI detector model

## Want to Modify?

- **Backend logic**: Edit `backend/app/services/*.py`
- **Frontend UI**: Edit `frontend/src/*.jsx`
- **Scoring formula**: Edit `backend/app/api/routes.py`
- **Styles**: Edit `frontend/src/index.css`

---

**Ready to analyze?** Go to `http://localhost:5173`! 🚀
