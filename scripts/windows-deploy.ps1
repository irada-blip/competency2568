# Windows Production Deployment Script
# Run as Administrator
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\windows-deploy.ps1

param(
    [string]$Domain = "localhost",
    [string]$AppPath = "C:\competency",
    [string]$DBPassword = "P@ssw0rd123!",
    [string]$JWTSecret = "your-32-character-random-secret-key-here"
)

# Colors
$Success = @{ForegroundColor = "Green"}
$Error = @{ForegroundColor = "Red"}
$Warning = @{ForegroundColor = "Yellow"}
$Info = @{ForegroundColor = "Cyan"}

Write-Host "==========================================" @Info
Write-Host "Windows Production Deployment" @Info
Write-Host "Vocational Competency Evaluation System" @Info
Write-Host "==========================================" @Info
Write-Host ""

# Check if running as Administrator
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: This script must be run as Administrator" @Error
    exit 1
}

Write-Host "✓ Running as Administrator" @Success
Write-Host ""

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
Write-Host "1. Checking Prerequisites..."
Write-Host "================================"

if (Test-Command node) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js installed: $nodeVersion" @Success
} else {
    Write-Host "✗ Node.js not found" @Error
    Write-Host "  Install from: https://nodejs.org" @Warning
    exit 1
}

if (Test-Command npm) {
    $npmVersion = npm --version
    Write-Host "✓ npm installed: $npmVersion" @Success
} else {
    Write-Host "✗ npm not found" @Error
    exit 1
}

if (Test-Command mysql) {
    $mysqlVersion = mysql --version
    Write-Host "✓ MySQL installed: $mysqlVersion" @Success
} else {
    Write-Host "✗ MySQL not found" @Error
    Write-Host "  Install from: https://dev.mysql.com" @Warning
    exit 1
}

Write-Host ""

# Create application directory
Write-Host "2. Creating Application Directory..."
Write-Host "================================"

if (Test-Path $AppPath) {
    Write-Host "Directory exists: $AppPath" @Info
} else {
    New-Item -ItemType Directory -Path $AppPath -Force | Out-Null
    Write-Host "✓ Created directory: $AppPath" @Success
}

Write-Host ""

# Install dependencies
Write-Host "3. Installing Dependencies..."
Write-Host "================================"

Set-Location "$AppPath\backend"
Write-Host "Installing backend dependencies..." @Info
npm install --production
Write-Host "✓ Backend dependencies installed" @Success

Set-Location "$AppPath\frontend"
Write-Host "Installing frontend dependencies..." @Info
npm install --production
Write-Host "✓ Frontend dependencies installed" @Success

Write-Host "Building frontend..." @Info
npm run build
Write-Host "✓ Frontend built" @Success

Write-Host ""

# Create database
Write-Host "4. Setting Up Database..."
Write-Host "================================"

Write-Host "Creating database and user..." @Info

# Read database password
$securePassword = Read-Host "Enter MySQL root password" -AsSecureString
$rootPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicodePtr($securePassword))

# Create database
$mysqlCommand = @"
CREATE DATABASE IF NOT EXISTS skills_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'skills_user'@'localhost' IDENTIFIED BY '$DBPassword';
GRANT ALL PRIVILEGES ON skills_db.* TO 'skills_user'@'localhost';
FLUSH PRIVILEGES;
"@

mysql -u root -p$rootPassword -e $mysqlCommand

# Import schema
Write-Host "Importing database schema..." @Info
mysql -u root -p$rootPassword skills_db < "$AppPath\schema.sql"
Write-Host "✓ Database created and seeded" @Success

Write-Host ""

# Configure environment variables
Write-Host "5. Configuring Environment Variables..."
Write-Host "================================"

$backendEnv = @"
PORT=7000
CORS_ORIGIN=https://$Domain
DB_HOST=localhost
DB_PORT=3306
DB_USER=skills_user
DB_PASSWORD=$DBPassword
DB_NAME=skills_db
JWT_SECRET=$JWTSecret
JWT_EXPIRES=2h
NODE_ENV=production
"@

$backendEnv | Out-File -FilePath "$AppPath\backend\.env" -Encoding UTF8
Write-Host "✓ Backend .env configured" @Success

$frontendEnv = @"
VITE_API_URL=https://$Domain/api
"@

$frontendEnv | Out-File -FilePath "$AppPath\frontend\.env" -Encoding UTF8
Write-Host "✓ Frontend .env configured" @Success

Write-Host ""

# Create Windows Services batch files
Write-Host "6. Creating Service Startup Scripts..."
Write-Host "================================"

$backendBatch = @"
@echo off
cd /d "$AppPath\backend"
npm start
"@

$backendBatch | Out-File -FilePath "$AppPath\backend\start.bat" -Encoding UTF8
Write-Host "✓ Backend startup script created" @Success

$frontendBatch = @"
@echo off
cd /d "$AppPath\frontend"
npm run preview
"@

$frontendBatch | Out-File -FilePath "$AppPath\frontend\start.bat" -Encoding UTF8
Write-Host "✓ Frontend startup script created" @Success

Write-Host ""

# Instructions
Write-Host "==========================================" @Success
Write-Host "Deployment Configuration Complete!" @Success
Write-Host "==========================================" @Success
Write-Host ""

Write-Host "Your application files are located at:" @Info
Write-Host "  $AppPath" @Info
Write-Host ""

Write-Host "To start the services manually:" @Info
Write-Host "  Backend:  $AppPath\backend\start.bat" @Info
Write-Host "  Frontend: $AppPath\frontend\start.bat" @Info
Write-Host ""

Write-Host "Then access the application at:" @Info
Write-Host "  http://localhost:3000" @Info
Write-Host ""

Write-Host "Demo Credentials:" @Info
Write-Host "  Admin:      admin@ccollege.ac.th / admin123" @Info
Write-Host "  Evaluator:  eva.me@ccollege.ac.th / password123" @Info
Write-Host "  Evaluatee:  t.it01@ccollege.ac.th / demo123" @Info
Write-Host ""

Write-Host "For production deployment:" @Info
Write-Host "  1. Configure IIS reverse proxy (optional)" @Info
Write-Host "  2. Set up SSL certificate" @Info
Write-Host "  3. Use Task Scheduler to start services on reboot" @Info
Write-Host "  4. Monitor event logs for errors" @Info
Write-Host ""

Write-Host "Next steps:" @Warning
Write-Host "  1. Update environment variables if needed" @Warning
Write-Host "  2. Test the application" @Warning
Write-Host "  3. Configure Windows Firewall (ports 3000, 7000)" @Warning
Write-Host "  4. Set up scheduled backups" @Warning
Write-Host ""
