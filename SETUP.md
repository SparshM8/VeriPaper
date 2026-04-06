# VeriPaper Complete Setup Guide

## Project Status: ✅ Production Ready

VeriPaper is now a **fully production-hardened, professionally-designed platform** with persistent PostgreSQL storage, Docker orchestration, and enterprise-grade deployment infrastructure.

---

## Phase Summary

### ✅ Phase 1: Production Hardening (Backend)
- Config-driven settings with environment variables
- Deterministic analysis functions (no randomness)
- Health & readiness endpoints (Kubernetes-ready)
- Error handling middleware with logging
- File upload validation (size, extension, empty checks)
- PDF report generation with ReportLab
- Automated test suite (5/5 tests passing)
- GitHub Actions CI/CD pipeline

### ✅ Phase 2: Professional UI/UX
- Modern gradient theme (purple-to-violet)
- Glassmorphism cards with backdrop-blur
- Smooth animations (fadeIn, slideUp, pulseSoft)
- Responsive design with dark mode support
- Interactive components with hover effects
- Premium typography (Plus Jakarta Sans)
- Improved visual hierarchy and spacing

### ✅ Phase 3: Deployment Infrastructure
- PostgreSQL database integration
- SQLAlchemy ORM with proper schemas
- Docker Compose orchestration
- Database initialization on app startup
- Connection pooling and health checks
- Persistent storage with volumes
- Docker Compose test suite
- Comprehensive deployment documentation

---

## Quick Start (5 Minutes)

### Prerequisites

- **Docker Desktop** (includes Docker & Docker Compose)
- **Git**
- **4GB+ RAM** available

### Steps

#### 1. Clone the repository

```bash
cd d:\craveo
git clone <repo-url>  # Or use existing repository
cd VeriPaper
```

#### 2. Configure environment

```bash
# Copy example configuration
cp .env.docker.example .env.docker

# Edit .env.docker and set these for production:
# POSTGRES_PASSWORD=your_strong_password_here_min_20_chars
# CORS_ORIGINS=https://yourdomain.com
```

#### 3. Start the stack

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker compose --env-file .env.docker up -d

# Watch logs
docker compose --env-file .env.docker logs -f backend
```

#### 4. Test deployment

**Windows:**
```bash
.\test-docker.bat
```

**Linux/Mac:**
```bash
bash test-docker.sh
```

#### 5. Access the application

- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Database:** localhost:5432 (user: veripaper)

---

## Project Structure

```
VeriPaper/
├── docker-compose.yml           # 🐳 Orchestration with PostgreSQL
├── docker-compose.prod.yml      # 🐳 Production overlay with Nginx
├── docker-compose.tls.yml       # 🔐 TLS overlay for HTTPS (Nginx + cert mounts)
├── .env.docker.example          # ⚙️ Compose env template
├── render.yaml                  # ☁️ Render blueprint
├── test-docker.bat              # 🧪 Windows test script
├── test-docker.sh               # 🧪 Linux/Mac test script
├── DEPLOYMENT.md                # 📖 Complete deployment guide
├── DEVELOPMENT.md               # 📖 Development guide
├── QUICKSTART.md                # 🚀 Quick reference
│
├── backend/
│   ├── Dockerfile               # 🐳 Backend container image
│   ├── requirements.txt          # 📦 Python dependencies
│   ├── .env.example              # ⚙️ Config template
│   └── app/
│       ├── main.py              # ✨ FastAPI app with DB init
│       ├── core/
│       │   ├── config.py         # ⚙️ Settings + database URL
│       │   ├── database.py       # 🗄️ SQLAlchemy setup
│       │   ├── logging_config.py # 📋 Logging setup
│       ├── models/
│       │   ├── database.py       # 🗄️ ORM models (AnalysisResult)
│       │   └── schemas.py        # 📝 Pydantic schemas
│       ├── api/
│       │   └── routes.py         # 🔌 Analysis endpoint
│       └── tests/
│           └── test_api.py       # ✅ Integration tests (5/5 pass)
│
├── frontend/
│   ├── Dockerfile               # 🐳 Frontend container image
│   ├── package.json             # 📦 npm dependencies
│   ├── src/
│   │   ├── index.css            # 🎨 Professional styling
│   │   ├── App.jsx              # ✨ Main UI component
│   │   ├── ScoreGauge.jsx        # 📊 Chart component
│   │   ├── api.js               # 🔌 HTTP client
│   │   └── utils.js             # 🛠️ Helper functions
│   └── dist/                    # 📦 Production build
│
├── models/
│   └── ai_detector.joblib       # 🤖 AI detection model
│
├── data/
│   ├── ai_train.csv             # 📊 Training data
│   ├── arxiv_abstracts.jsonl    # 📚 Reference dataset
│   └── sample_paper.txt         # 📄 Test file
│
└── reports/                     # 📄 Generated analysis PDFs
```

---

## Key Features

### Backend Features
- ✅ **FastAPI** REST API with automatic OpenAPI documentation
- ✅ **PostgreSQL** with connection pooling and migrations
- ✅ **SQLAlchemy ORM** for type-safe database operations
- ✅ **Deterministic Analysis** functions (no randomness)
- ✅ **PDF Reports** with ReportLab generation
- ✅ **Error Handling** middleware with structured logging
- ✅ **CORS** configuration for secure cross-origin requests
- ✅ **Health Checks** for Kubernetes orchestration
- ✅ **File Upload** validation (size, type, content)

### Frontend Features
- ✅ **React 18** with Vite for fast builds
- ✅ **Professional UI** with gradients and animations
- ✅ **Dark/Light Mode** support
- ✅ **Responsive Design** for all devices
- ✅ **Real-time Analysis Display** with score gauges
- ✅ **Export Functionality** (PDF, CSV, JSON)
- ✅ **Analysis History** with localStorage
- ✅ **Tailwind CSS** for utility-first styling

### Deployment Features
- ✅ **Docker** containers for reproducible builds
- ✅ **Docker Compose** for local orchestration
- ✅ **PostgreSQL** for persistent data
- ✅ **Environment-Driven** configuration
- ✅ **Health Checks** for service readiness
- ✅ **Connection Pooling** for performance
- ✅ **Named Volumes** for persistent storage
- ✅ **Multi-stage Builds** for smaller images

---

## Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | development | Set to `production` for prod |
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_USER` | veripaper | Database user |
| `DB_PASSWORD` | *(empty)* | Database password ⚠️ change in prod |
| `DB_NAME` | veripaper | Database name |
| `CORS_ORIGINS` | localhost:5173 | Comma-separated allowed origins |
| `MAX_UPLOAD_SIZE_MB` | 15 | Max file upload size |
| `LOG_LEVEL` | INFO | DEBUG, INFO, WARNING, ERROR |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | http://localhost:8000/api | Backend API endpoint |

---

## Common Tasks

### View Logs
```bash
# All services
docker compose --env-file .env.docker logs

# Specific service
docker compose --env-file .env.docker logs -f backend
docker compose --env-file .env.docker logs -f postgres
docker compose --env-file .env.docker logs -f frontend
```

### Database Operations
```bash
# Connect to database
docker compose --env-file .env.docker exec postgres psql -U veripaper -d veripaper

# List tables
\dt

# View schema
\d analysis_results

# Exit
\q
```

### Backup Database
```bash
docker compose --env-file .env.docker exec -T postgres pg_dump -U veripaper veripaper > backup.sql
```

### Restore Database
```bash
docker compose --env-file .env.docker exec -T postgres psql -U veripaper veripaper < backup.sql
```

### Stop Services
```bash
# Stop without removing containers
docker compose --env-file .env.docker stop

# Stop and remove containers
docker compose --env-file .env.docker down

# Stop and remove everything (including data)
docker compose --env-file .env.docker down -v
```

### Restart Services
```bash
# Restart all
docker compose --env-file .env.docker restart

# Restart specific service
docker compose --env-file .env.docker restart backend
```

### View Service Status
```bash
docker compose --env-file .env.docker ps
```

### Run with HTTPS (TLS Overlay)
```bash
# 1) Configure TLS in .env.docker
# NGINX_CONF_FILE=./deploy/nginx/default-ssl.conf
# TLS_CERT_PATH=./deploy/certs/fullchain.pem
# TLS_KEY_PATH=./deploy/certs/privkey.pem

# 2) Start stack with TLS overlay
docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.tls.yml up -d

# 3) Check HTTPS health endpoint
curl -k https://localhost/health
```

---

## Testing

### Run Backend Tests
```bash
cd backend
python -m pytest -v
```

**Expected Results:**
```
test_health_endpoint PASSED              [20%]
test_readiness_endpoint PASSED           [40%]
test_analyze_text_file_success PASSED    [60%]
test_analyze_rejects_unsupported_extension PASSED [80%]
test_analyze_rejects_empty_file PASSED   [100%]

====== 5 passed in 0.81s ======
```

### Run Frontend Build
```bash
cd frontend
npm run build
```

**Expected Output:**
```
vite v5.4.21 building for production...
✓ 882 modules transformed
✓ built in 2.30s
```

### Test Docker Compose Stack
```bash
# Windows
.\test-docker.bat

# Linux/Mac
bash test-docker.sh
```

---

## Production Deployment

For deploying to production, refer to [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Security hardening (passwords, CORS, SSL/TLS)
- Database backups and recovery
- Monitoring and logging setup
- Scaling configuration
- CI/CD integration
- Cloud platform deployment

---

## Troubleshooting

### Docker daemon not running
```bash
# Windows: Start Docker Desktop from Start menu
# macOS: Open Docker.app from Applications
# Linux: sudo systemctl start docker
```

### Port already in use
```bash
# Change port in docker-compose.yml
ports:
  - "8001:8000"  # Use 8001 instead
```

### Database connection error
```bash
# Wait for PostgreSQL to start
docker compose --env-file .env.docker logs postgres

# Restart PostgreSQL
docker compose --env-file .env.docker restart postgres
```

### Frontend API errors
```bash
# Verify backend is running
curl http://localhost:8000/health

# Check browser console for CORS errors
# Verify CORS_ORIGINS in backend/.env
```

---

## Git Commit History

Key commits in this session:

1. **708c6a0** - Production hardening: config-driven backend, deterministic analysis, health checks, CI/CD
2. **baf23d7** - Professional UI/UX: Gradients, animations, glassmorphism, modern typography
3. **e971be5** - Deployment infrastructure: PostgreSQL models, Docker Compose stack, deployment guide

---

## Next Steps

1. **Deploy to Production** - Use Docker to cloud platform (AWS, DigitalOcean, Render, Railway)
2. **Set up Monitoring** - Add Prometheus/Grafana for metrics
3. **Enable CI/CD** - GitHub Actions already configured
4. **Add Authentication** - JWT tokens for API security
5. **Implement Caching** - Redis for performance optimization
6. **Add Analytics** - Track user usage and API metrics

---

## Support

For issues or questions:

1. Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment info
2. Review logs: `docker compose --env-file .env.docker logs -f`
3. Verify services: `docker compose --env-file .env.docker ps`
4. Test health: `curl http://localhost:8000/health`
5. Check database: `docker compose --env-file .env.docker exec postgres psql -U veripaper -d veripaper -c "\dt"`

---

**VeriPaper is ready for production deployment! 🚀**

**Status:** ✅ All phases complete  
**Backend Tests:** 5/5 passing  
**Frontend Build:** Successful  
**Docker Compose:** Ready for local & cloud deployment  
**Last Updated:** April 6, 2026
