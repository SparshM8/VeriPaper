# VeriPaper Deployment Guide

## Overview

VeriPaper is now production-ready with Docker Compose orchestration. This guide covers deploying locally with PostgreSQL for persistent data storage.

## Quick Start (Docker Compose)

### Prerequisites

- Docker & Docker Compose installed
- Git
- 4GB+ RAM available

### 1. Clone and Navigate

```bash
git clone d:\craveo\VeriPaper
cd VeriPaper
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` to set production credentials:

```env
# Compose/Service configuration
ENVIRONMENT=production
APP_VERSION=1.0.0
LOG_LEVEL=INFO

# PostgreSQL (auto-created by docker compose)
POSTGRES_USER=veripaper
POSTGRES_PASSWORD=your_strong_password_here_min_20_chars
POSTGRES_DB=veripaper
POSTGRES_PORT=5432

# Exposed service ports
BACKEND_PORT=8000
FRONTEND_PORT=3000

# API Configuration
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
MAX_UPLOAD_SIZE_MB=50

# Frontend build-time API endpoint
VITE_API_BASE_URL=http://localhost:8000/api
```

Use this command prefix for all compose commands in this guide:

```bash
docker compose --env-file .env.docker
```

### 3. Launch Stack

```bash
# Start all services (PostgreSQL + Backend + Frontend)
docker compose --env-file .env.docker up -d

# Start in production reverse-proxy mode (single public entrypoint via Nginx)
docker compose --env-file .env.docker -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker compose --env-file .env.docker logs -f

# Check service status
docker compose --env-file .env.docker ps
```

### 4. Verify Deployment

```bash
# Backend health check
curl http://localhost:8000/health

# Readiness probe
curl http://localhost:8000/ready

# Frontend
open http://localhost:3000
```

### 5. Stop Services

```bash
# Stop without removing volumes
docker compose --env-file .env.docker stop

# Stop and remove (keeps database data in named volume)
docker compose --env-file .env.docker down

# Stop and remove everything including data
docker compose --env-file .env.docker down -v
```

---

## Architecture

### Services

**PostgreSQL (postgres:16-alpine)**
- Port: 5432 (internal) or mapped to host
- Volume: `postgres_data` (persistent storage)
- Credentials: Sets from .env DB_USER/DB_PASSWORD
- Health Check: `pg_isready` probe every 10s

**Backend API (FastAPI)**
- Port: 8000
- Base URL: `http://localhost:8000`
- Health: `/health` endpoint
- Readiness: `/ready` endpoint for k8s probes
- Database: Auto-initializes tables on startup
- Depends On: PostgreSQL (waits for health check)
- Mounts: `./reports` (analysis PDFs), `./models` (AI detector)

**Frontend (React + Vite)**
- Port: 3000
- Base URL: `http://localhost:3000`
- API Backend: Configured via `VITE_API_BASE_URL` env var
- Build: Multi-stage Docker build (builder + serve)
- Depends On: Backend

**Nginx (Production Overlay)**
- Port: 80 (public)
- Routes `/` to frontend and `/api`, `/files` to backend
- Keeps backend/frontend bound to localhost and private network

### Network

- Network: `veripaper-network` (bridge)
- Services communicate via service names (e.g., `postgres`, `backend`)
- If running locally, access via `localhost:PORT`

---

## Database Management

### Initialize Database

```bash
# Automatic on first startup
# Tables created by SQLAlchemy ORM models

# View database
docker-compose exec postgres psql -U veripaper -d veripaper

# List tables
\dt
\q  # Exit
```

### Backup Database

```bash
# Export database dump
docker-compose exec postgres pg_dump -U veripaper veripaper > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from dump
docker-compose exec -T postgres psql -U veripaper veripaper < backup_20240406_120000.sql
```

### View Logs

```bash
# Combined logs
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs postgres
docker-compose logs frontend

# Follow logs (tail -f)
docker-compose logs -f backend

# Last N lines
docker-compose logs --tail=50 backend
```

---

## Performance Tuning

### Database Connection Pooling

- **Pool Size:** 5 (in-flight connections)
- **Max Overflow:** 10 (queue before dropping)
- **Pre-Ping:** Verifies stale connections before use

Adjust in `backend/app/core/database.py`:

```python
engine = create_engine(
    db_url,
    poolclass=QueuePool,
    pool_size=10,      # Increase for high concurrency
    max_overflow=20,   # Increase for peak loads
    pool_pre_ping=True
)
```

### Memory Limits

Add to `docker-compose.yml` for each service:

```yaml
services:
  postgres:
    # ...
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

### Scaling

For multiple backend instances:

```yaml
services:
  backend:
    deploy:
      replicas: 3  # 3 backend instances behind load balancer
    # ...
```

---

## Troubleshooting

### PostgreSQL Won't Start

```bash
# Check logs
docker-compose logs postgres

# If stuck, reset volume
docker-compose down -v
docker-compose up postgres
```

### Backend Can't Connect to Database

```bash
# Verify connectivity
docker-compose exec backend python -c "
from app.core.database import init_db
init_db()
"

# Check env vars in running container
docker-compose exec backend env | grep DB_
```

### Frontend Shows API Errors

```bash
# Check backend is running
curl http://localhost:8000/health

# Verify frontend API URL
docker-compose exec frontend env | grep VITE_API

# Check browser console for CORS errors
```

### Port Already in Use

```bash
# Change ports in docker-compose.yml
ports:
  - "8001:8000"  # Backend on 8001 instead

# Or kill the process
lsof -i :8000
kill -9 <PID>
```

---

## Production Considerations

### 1. Security

- [ ] Change default DB password in `.env`
- [ ] Use strong CORS_ORIGINS (whitelist your domain)
- [ ] Enable HTTPS/SSL with reverse proxy (Nginx/Traefik)
- [ ] Use secrets management (Docker Secrets, Vault)
- [ ] Rotate API keys monthly
- [ ] Enable audit logging

### 2. Monitoring

Add monitoring stack (optional):

```yaml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
```

### 3. Backups

```bash
# Daily backup script
#!/bin/bash
docker-compose exec -T postgres pg_dump -U veripaper veripaper | \
  gzip > /backups/veripaper_$(date +\%Y\%m\%d).sql.gz
```

### 4. Updates

```bash
# Update base images
docker-compose pull

# Rebuild backend
docker-compose build --no-cache backend

# Restart services
docker-compose up -d
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | development | Set to "production" for prod |
| `APP_VERSION` | 1.0.0 | API version string |
| `LOG_LEVEL` | INFO | DEBUG, INFO, WARNING, ERROR |
| `DB_ENGINE` | postgresql | postgresql or sqlite |
| `DB_USER` | veripaper | Database user |
| `DB_PASSWORD` | (empty) | Database password (set in prod!) |
| `DB_HOST` | localhost | Database host |
| `DB_PORT` | 5432 | Database port |
| `DB_NAME` | veripaper | Database name |
| `CORS_ORIGINS` | localhost:5173 | Comma-separated allowed origins |
| `MAX_UPLOAD_SIZE_MB` | 15 | Max file upload size |
| `AI_MODEL_PATH` | /app/models | AI detector model path |
| `REPORTS_DIR` | /app/reports | PDF reports output directory |

---

## Support

For issues or questions:

1. Check logs: `docker-compose logs -f`
2. Review this guide's Troubleshooting section
3. Verify all containers are running: `docker-compose ps`
4. Test connectivity: `curl http://localhost:8000/health`

---

**Last Updated:** April 6, 2026  
**Status:** Production Ready ✅
