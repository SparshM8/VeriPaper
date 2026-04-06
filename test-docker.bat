@echo off
REM Docker Compose Test Script (Windows)
REM Validates VeriPaper stack deployment

setlocal enabledelayedexpansion

set COMPOSE_CMD=docker compose --env-file .env.docker

echo.
echo ============================================================
echo ^<test^> VeriPaper Docker Compose Deployment Test
echo ============================================================
echo.

REM Check prerequisites
echo [*] Checking prerequisites...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [-] Docker not installed
    exit /b 1
)
echo [+] Docker found

docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [-] Docker Compose plugin not installed
    exit /b 1
)
echo [+] Docker Compose found

if not exist .env.docker (
    if exist .env.docker.example (
        copy /Y .env.docker.example .env.docker >nul
        echo [!] .env.docker created from .env.docker.example - please update credentials
    ) else (
        echo [-] Missing .env.docker and .env.docker.example
        exit /b 1
    )
)

for /f "tokens=2 delims==" %%A in ('findstr /B "POSTGRES_USER=" .env.docker') do set POSTGRES_USER=%%A
for /f "tokens=2 delims==" %%A in ('findstr /B "POSTGRES_DB=" .env.docker') do set POSTGRES_DB=%%A
if "%POSTGRES_USER%"=="" set POSTGRES_USER=veripaper
if "%POSTGRES_DB%"=="" set POSTGRES_DB=veripaper

REM Start services
echo.
echo [*] Starting Docker Compose stack...
%COMPOSE_CMD% up -d
if %errorlevel% neq 0 (
    echo [-] Failed to start services
    exit /b 1
)

REM Wait for services
echo.
echo [*] Waiting for services to be ready (30s)...
timeout /t 30 /nobreak

REM Test PostgreSQL
echo.
echo [*] Testing PostgreSQL...
%COMPOSE_CMD% exec -T postgres pg_isready -U %POSTGRES_USER% -d %POSTGRES_DB% >nul 2>&1
if %errorlevel% eq 0 (
    echo [+] PostgreSQL is healthy
) else (
    echo [-] PostgreSQL connection failed
    %COMPOSE_CMD% logs postgres
    exit /b 1
)

REM Test Backend API
echo.
echo [*] Testing Backend API (http://localhost:8000/health)...
for /f "usebackq" %%A in (`powershell -Command "try { (Invoke-WebRequest -Uri 'http://localhost:8000/health' -UseBasicParsing).StatusCode } catch { '000' }"`) do set HTTP_CODE=%%A

if "%HTTP_CODE%"=="200" (
    echo [+] Backend health check passed (HTTP %HTTP_CODE%)
) else (
    echo [-] Backend health check failed (HTTP %HTTP_CODE%)
    %COMPOSE_CMD% logs backend
    exit /b 1
)

REM Test Readiness Probe
echo.
echo [*] Testing Backend readiness...
for /f "usebackq" %%A in (`powershell -Command "try { (Invoke-WebRequest -Uri 'http://localhost:8000/ready' -UseBasicParsing).StatusCode } catch { '000' }"`) do set READY_CODE=%%A

if "%READY_CODE%"=="200" (
    echo [+] Backend readiness check passed (HTTP %READY_CODE%)
) else (
    echo [!] Backend readiness degraded (HTTP %READY_CODE%, may be normal)
)

REM List running services
echo.
echo [*] Running services:
%COMPOSE_CMD% ps

REM Summary
echo.
echo ============================================================
echo [+] All critical tests passed!
echo ============================================================
echo.
echo Access points:
echo   - Backend API:  http://localhost:8000
echo   - API Docs:     http://localhost:8000/docs
echo   - Frontend:     http://localhost:3000
echo   - Database:     localhost:5432 (user: veripaper)
echo.
echo Useful commands:
echo   View logs:        %COMPOSE_CMD% logs -f backend
echo   View all logs:    %COMPOSE_CMD% logs -f
echo   Stop services:    %COMPOSE_CMD% stop
echo   Restart:          %COMPOSE_CMD% restart
echo   Full reset:       %COMPOSE_CMD% down -v
echo.
echo Test database schema:
echo   %COMPOSE_CMD% exec postgres psql -U %POSTGRES_USER% -d %POSTGRES_DB% -c "\dt"
echo.
echo [+] Deployment test complete!
echo.

endlocal
