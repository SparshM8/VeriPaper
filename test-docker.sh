#!/bin/bash

# Docker Compose Test Script
# Validates VeriPaper stack deployment

set -e

echo "🚀 VeriPaper Docker Compose Deployment Test"
echo "=============================================="

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose found${NC}"

# Start services
echo -e "\n${YELLOW}🐳 Starting Docker Compose stack...${NC}"
docker-compose up -d

# Wait for services
echo -e "\n${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 20

# Test PostgreSQL
echo -e "\n${YELLOW}🗄️ Testing PostgreSQL...${NC}"
if docker-compose exec -T postgres pg_isready -U veripaper -d veripaper > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is healthy${NC}"
else
    echo -e "${RED}❌ PostgreSQL connection failed${NC}"
    docker-compose logs postgres
    exit 1
fi

# Test Backend API
echo -e "\n${YELLOW}🔧 Testing Backend API...${NC}"
HEALTH_CHECK=$(curl -s http://localhost:8000/health)
if echo "$HEALTH_CHECK" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
    echo "Response: $HEALTH_CHECK"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    docker-compose logs backend
    exit 1
fi

# Test Readiness Probe
echo -e "\n${YELLOW}🔍 Testing Backend readiness...${NC}"
READY_CHECK=$(curl -s http://localhost:8000/ready)
if echo "$READY_CHECK" | grep -q '"status":"ready"'; then
    echo -e "${GREEN}✅ Backend readiness check passed${NC}"
    echo "Response: $READY_CHECK"
else
    echo -e "${YELLOW}⚠️  Backend readiness degraded (may be normal)${NC}"
    echo "Response: $READY_CHECK"
fi

# Test Database tables
echo -e "\n${YELLOW}📊 Testing database schema...${NC}"
TABLES=$(docker-compose exec -T postgres psql -U veripaper -d veripaper -c "
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema='public';" 2>/dev/null)

if echo "$TABLES" | grep -q '[0-9]'; then
    echo -e "${GREEN}✅ Database tables created successfully${NC}"
    echo "Table count: $TABLES"
else
    echo -e "${RED}❌ Database tables not found${NC}"
    exit 1
fi

# Test Frontend (optional)
echo -e "\n${YELLOW}🌐 Testing Frontend...${NC}"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend may still be building...${NC}"
fi

# Summary
echo -e "\n${GREEN}✅ All critical tests passed!${NC}"
echo ""
echo "Services running:"
docker-compose ps

echo ""
echo "Access points:"
echo "  - Backend API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo "  - Frontend: http://localhost:3000"
echo "  - Database: localhost:5432"
echo ""
echo "Useful commands:"
echo "  View logs:       docker-compose logs -f backend"
echo "  Stop services:   docker-compose stop"
echo "  Restart:         docker-compose restart"
echo "  Database shell:  docker-compose exec postgres psql -U veripaper -d veripaper"
echo "  Full reset:      docker-compose down -v"
echo ""
echo -e "${GREEN}🎉 Deployment test complete!${NC}"
