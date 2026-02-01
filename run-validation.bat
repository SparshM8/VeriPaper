@echo off
REM VeriPaper Complete Validation & Deployment Pipeline
REM Windows Batch Version

setlocal enabledelayedexpansion

echo ==================================
echo VeriPaper: Option D - Complete Pipeline
echo ==================================
echo.

REM Check Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python and add to PATH.
    pause
    exit /b 1
)

REM Check Node is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js and add to PATH.
    pause
    exit /b 1
)

echo.
echo Step 1: Starting Backend Server...
echo ==================================
cd backend
start "VeriPaper Backend" cmd /k "python -m uvicorn app.main:app --port 8000"

REM Wait for backend to start
timeout /t 3 /nobreak

echo.
echo Step 2: Running AI Detector Validation Tests
echo ============================================
echo.

echo Running Step 1-5 Validation Framework...
python scripts/validate_ai_detector.py

echo.
echo Running Threshold Optimization...
python scripts/tune_ai_detector.py

echo.
echo ==================================
echo Step 3: Starting Frontend Server
echo ==================================
echo.

cd ..\frontend
call npm run dev

echo.
echo ==================================
echo ✅ VeriPaper Complete!
echo ==================================
echo.
echo Backend: http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5173
echo API Docs: http://127.0.0.1:8000/docs
echo.
pause
