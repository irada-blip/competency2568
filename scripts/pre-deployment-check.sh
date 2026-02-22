#!/bin/bash
# Pre-Deployment Validation Checklist
# Run this script to verify system is ready for production

set -e

echo "=========================================="
echo "Pre-Deployment Validation Checklist"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        FAILED=$((FAILED + 1))
    fi
}

FAILED=0

echo "1. Checking Prerequisites..."
echo "================================"

# Check Node.js
node --version > /dev/null 2>&1
check_result $? "Node.js installed"

# Check npm
npm --version > /dev/null 2>&1
check_result $? "npm installed"

# Check MySQL
mysql --version > /dev/null 2>&1
check_result $? "MySQL installed"

# Check Docker (optional)
docker --version > /dev/null 2>&1
check_result $? "Docker installed (optional)"

echo ""
echo "2. Checking Project Files..."
echo "================================"

# Check backend exists
[ -d "backend" ]
check_result $? "Backend directory exists"

# Check frontend exists
[ -d "frontend" ]
check_result $? "Frontend directory exists"

# Check backend package.json
[ -f "backend/package.json" ]
check_result $? "Backend package.json exists"

# Check frontend package.json
[ -f "frontend/package.json" ]
check_result $? "Frontend package.json exists"

# Check schema.sql
[ -f "schema.sql" ]
check_result $? "schema.sql exists"

echo ""
echo "3. Checking Documentation..."
echo "================================"

[ -f "README.md" ]
check_result $? "README.md exists"

[ -f "DEPLOYMENT.md" ]
check_result $? "DEPLOYMENT.md exists"

[ -f "API_TESTING_GUIDE.md" ]
check_result $? "API_TESTING_GUIDE.md exists"

echo ""
echo "4. Checking Environment Files..."
echo "================================"

[ -f "backend/.env" ] || [ -f "backend/.env.example" ]
check_result $? "Backend .env or .env.example exists"

[ -f "frontend/.env" ] || [ -f "frontend/.env.example" ]
check_result $? "Frontend .env or .env.example exists"

echo ""
echo "5. Checking Database..."
echo "================================"

# Check if MySQL is running
mysql -u root -e "SELECT 1" > /dev/null 2>&1
check_result $? "MySQL server is running"

# Check if database exists
mysql -u root -e "USE skills_db" > /dev/null 2>&1
check_result $? "skills_db database exists"

echo ""
echo "6. Checking API Services..."
echo "================================"

# Check if backend port is available
! netstat -tuln 2>/dev/null | grep -q ":7000 " && check_result $? "Port 7000 available" || check_result 1 "Port 7000 available"

# Check if frontend port is available
! netstat -tuln 2>/dev/null | grep -q ":3000 " && check_result $? "Port 3000 available" || check_result 1 "Port 3000 available"

echo ""
echo "=========================================="
echo "Validation Summary"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review DEPLOYMENT.md for your target environment"
    echo "2. Configure environment variables"
    echo "3. Run startup scripts (docker-compose or manual)"
    echo "4. Test the system at http://localhost:3000"
    exit 0
else
    echo -e "${RED}✗ $FAILED check(s) failed${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
    exit 1
fi
