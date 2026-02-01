@echo off
REM VeriPaper Startup Script for Windows
REM This script starts both backend and frontend development servers

echo.
echo ====================================
echo   VeriPaper Development Server
echo ====================================
echo.

REM Check if running as admin (optional for this script)
REM Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.11+
    pause
    exit /b 1
)

REM Check Node.js installation
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 16+
    pause
    exit /b 1
)

echo [✓] Python and Node.js found
echo.

REM Start Backend
echo [STEP 1] Starting Backend Server...
echo --------------------------------
cd /d "%~dp0backend"

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

call venv\Scripts\activate.bat
echo Backend environment activated
echo.

REM Check if requirements are installed
python -c "import fastapi" >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing backend dependencies...
    pip install -r requirements.txt --quiet
    echo.
)

echo Starting FastAPI server on http://localhost:8000
echo API Docs available at: http://localhost:8000/docs
echo.
start cmd /k "cd /d %CD% && venv\Scripts\activate && python -m uvicorn app.main:app --reload --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak

REM Start Frontend
echo [STEP 2] Starting Frontend Server...
echo --------------------------------
cd /d "%~dp0frontend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install --quiet
    echo.
)

echo Starting Vite dev server on http://localhost:5173
echo.
start cmd /k "cd /d %CD% && npm run dev"

REM Final instructions
echo.
echo ====================================
echo   Development Servers Starting...
echo ====================================
echo.
echo [✓] Backend: http://localhost:8000
echo     - API Docs: http://localhost:8000/docs
echo     - Health: http://localhost:8000/health
echo.
echo [✓] Frontend: http://localhost:5173
echo     - Dashboard: Open browser to this URL
echo.
echo [ℹ] Two new terminal windows should appear.
echo     Keep both running while developing.
echo.
echo [✓] Ready to analyze! Visit http://localhost:5173
echo.
pause
