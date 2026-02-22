#!/bin/bash
# Quick Docker Deployment Script
# Starts the entire system using Docker Compose

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=========================================="
echo "Vocational Competency Evaluation System"
echo "Docker Quick Start Deployment"
echo "==========================================${NC}"
echo ""

# Check Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗ Docker is not installed${NC}"
    echo "Please install Docker from https://docker.com"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}✗ Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docker.com"
    exit 1
fi

echo -e "${GREEN}✓ Docker and Docker Compose detected${NC}"
echo ""

# Check docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}✗ docker-compose.yml not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "Starting services..."
echo ""

# Start services in detached mode
docker-compose up -d

echo ""
echo -e "${GREEN}=========================================="
echo "Services Starting..."
echo "==========================================${NC}"
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Services are running${NC}"
    echo ""
    echo "Service Details:"
    docker-compose ps
    echo ""
    echo -e "${GREEN}=========================================="
    echo "Deployment Complete!"
    echo "==========================================${NC}"
    echo ""
    echo "Access the application:"
    echo "  Frontend:   http://localhost:3000"
    echo "  Backend:    http://localhost:7000"
    echo "  phpMyAdmin: http://localhost:8080"
    echo ""
    echo "Demo Credentials:"
    echo "  Admin:      admin@ccollege.ac.th / admin123"
    echo "  Evaluator:  eva.me@ccollege.ac.th / password123"
    echo "  Evaluatee:  t.it01@ccollege.ac.th / demo123"
    echo ""
    echo "Useful Commands:"
    echo "  View logs:    docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart:      docker-compose restart"
    echo ""
else
    echo -e "${RED}✗ Services failed to start${NC}"
    echo ""
    echo "Check logs with:"
    echo "  docker-compose logs"
    exit 1
fi
