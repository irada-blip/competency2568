# Deployment Scripts Directory

Quick deployment automation scripts for different platforms.

---

## 📋 Available Scripts

### 1. Pre-Deployment Validation
**File**: `pre-deployment-check.sh`  
**Platform**: Linux/Mac  
**Purpose**: Verify system is ready for deployment

**Usage**:
```bash
bash scripts/pre-deployment-check.sh
```

**Checks**:
- Node.js installed
- npm installed
- MySQL installed & running
- Docker installed (optional)
- Project files present
- Documentation complete
- Database accessible
- Ports available

---

### 2. Docker Deployment
**File**: `docker-deploy.sh`  
**Platform**: Linux/Mac/Windows (with Docker)  
**Purpose**: Start entire system using Docker Compose

**Usage**:
```bash
bash scripts/docker-deploy.sh
```

**What it does**:
1. Checks Docker & Docker Compose installed
2. Verifies docker-compose.yml exists
3. Starts all services (`docker-compose up -d`)
4. Waits for services to be ready
5. Displays access URLs and credentials

**Services started**:
- MySQL database (port 3306)
- Backend API (port 7000)
- Frontend (port 3000)
- phpMyAdmin (port 8080)

---

### 3. Ubuntu/Linux Production Deployment
**File**: `ubuntu-deploy.sh`  
**Platform**: Ubuntu 20.04 LTS / Linux  
**Purpose**: Automated production server setup

**Usage**:
```bash
sudo bash scripts/ubuntu-deploy.sh
```

**Prerequisites**:
- Ubuntu 20.04 LTS server
- Root or sudo access
- 2GB+ RAM, 20GB+ storage
- Domain name configured

**What it does**:
1. Updates system packages
2. Installs Node.js v18
3. Installs MySQL 8.0
4. Installs Nginx reverse proxy
5. Installs PM2 process manager
6. Clones application code
7. Installs dependencies
8. Creates database & user
9. Configures environment
10. Starts services with PM2
11. Configures Nginx with SSL
12. Sets up Let's Encrypt certificate

**Output**:
- Services running behind Nginx reverse proxy
- HTTPS enabled with Let's Encrypt
- PM2 managing Node.js processes
- Database configured and seeded

---

### 4. Windows Production Deployment
**File**: `windows-deploy.ps1`  
**Platform**: Windows Server 2016+  
**Purpose**: Deploy to Windows servers

**Usage** (as Administrator):
```powershell
powershell -ExecutionPolicy Bypass -File scripts\windows-deploy.ps1
```

**Parameters**:
```powershell
-Domain "yourdomain.com"
-AppPath "C:\competency"
-DBPassword "SecurePassword123!"
-JWTSecret "32-character-random-string-here"
```

**What it does**:
1. Checks prerequisites (Node.js, npm, MySQL)
2. Creates application directory
3. Installs dependencies
4. Builds frontend
5. Creates database
6. Configures environment variables
7. Creates startup batch files

**Output**:
- Application ready at `C:\competency`
- Startup scripts created
- Database configured
- Environment variables set

---

## 🚀 Quick Start by Platform

### For Local Development (All Platforms)
```bash
# Using Docker (recommended)
cd competency2568
docker-compose up -d
# Access: http://localhost:3000
```

### For Production on Ubuntu/Linux
```bash
# Automated setup
sudo bash scripts/ubuntu-deploy.sh

# Manual setup
# Follow DEPLOYMENT_CONFIG.md "Ubuntu Production" section
```

### For Production on Windows
```powershell
# Run as Administrator
powershell -ExecutionPolicy Bypass -File scripts\windows-deploy.ps1
```

### For Docker Production
```bash
bash scripts/docker-deploy.sh
# or
docker-compose up -d
```

---

## 📊 Compatibility Matrix

| Script | Ubuntu | Debian | CentOS | Windows | macOS | Docker |
|--------|--------|--------|--------|---------|-------|--------|
| pre-deployment-check.sh | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| docker-deploy.sh | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ubuntu-deploy.sh | ✅ | ✅ | ❓ | ❌ | ❌ | ❌ |
| windows-deploy.ps1 | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

Legend: ✅ Fully Supported, ❓ Partially Supported, ❌ Not Supported

---

## 🔧 Advanced Usage

### Docker with Custom Configuration

Edit `docker-compose.yml` before running:

```bash
# Edit composition
nano docker-compose.yml

# Start with custom settings
docker-compose up -d --scale backend=2 # Multiple backend instances
```

### Ubuntu with Custom Install Path

Modify the script:
```bash
# Edit ubuntu-deploy.sh
nano scripts/ubuntu-deploy.sh

# Change:
APP_DIR="/path/to/your/directory"
DOMAIN="yourdomain.com"
DB_USER="custom_db_user"

# Run
sudo bash scripts/ubuntu-deploy.sh
```

### Ubuntu with Existing MySQL

If MySQL already installed and running:

```bash
# Comment out MySQL installation in ubuntu-deploy.sh
# Edit the script and remove or comment MySQL section
# Then run only the parts you need
```

### Windows with IIS Reverse Proxy

After running windows-deploy.ps1:

1. Install IIS Application Request Routing (ARR)
2. Create reverse proxy rules:
   - `http://localhost:3000` → frontend
   - `http://localhost:7000` → backend
3. Configure SSL bindings

---

## 🆘 Troubleshooting

### Script Won't Run

**Linux/Mac Permission Error**:
```bash
chmod +x scripts/*.sh
bash scripts/docker-deploy.sh
```

**Windows PowerShell Error**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
powershell -File scripts\windows-deploy.ps1
```

### Port Already in Use

**Ubuntu**:
```bash
# Find process using port
netstat -tuln | grep :3000
kill -9 {PID}
```

**Docker**:
```bash
# Stop containers
docker-compose down

# Or use different ports in docker-compose.yml
```

**Windows**:
```powershell
# Find process using port
Get-NetTCPConnection -LocalPort 3000 | Select-Object -Property OwningProcess
Stop-Process -Id {PID}
```

### Database Connection Failed

**Check MySQL is running**:
```bash
# Ubuntu/Linux
sudo systemctl status mysql

# macOS
brew services list

# Windows
Get-Service MySQL80 | Start-Service
```

**Check credentials**:
```bash
mysql -u root -p
# Enter password from deployment script

# If using different user:
mysql -u skills_user -p
```

### Services Not Starting

**Docker**:
```bash
docker-compose logs
docker-compose logs backend
docker-compose logs frontend
```

**Ubuntu/PM2**:
```bash
pm2 logs
pm2 logs competency-api
pm2 logs competency-web
```

**Windows**:
```powershell
# Check event logs
Get-EventLog -LogName Application -Newest 50
```

---

## 📝 Environment Variables

### Docker
Edit `docker-compose.yml` environment section:
```yaml
environment:
  PORT: 7000
  DB_HOST: db
  JWT_SECRET: your-secret-here
```

### Ubuntu (after deployment)
Edit `/opt/competency/backend/.env`:
```bash
sudo nano /opt/competency/backend/.env
```

### Windows
Edit `C:\competency\backend\.env`:
```powershell
notepad C:\competency\backend\.env
```

Then restart services.

---

## 🔐 Security Considerations

Before using in production:

1. **Change Default Passwords**
   - Admin account password
   - Database passwords
   - JWT secret (32+ random characters)

2. **Configure CORS**
   - Set CORS_ORIGIN to your domain only
   - Not `*` or `localhost` in production

3. **Set NODE_ENV=production**
   - Disables debug logging
   - Enables security headers

4. **Enable HTTPS/SSL**
   - Use Let's Encrypt (automatic in ubuntu-deploy.sh)
   - Or import your own certificate

5. **Configure Firewall**
   - Only open ports 80, 443, 22 (for SSH)
   - Use VPN for database access when possible

6. **Set Up Backups**
   - Database daily backups
   - Full system weekly backups
   - Test restore procedures

---

## 📊 Performance Tuning

### Docker Performance

Edit `docker-compose.yml`:
```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Ubuntu Performance

- Increase Node.js memory: `export NODE_OPTIONS=--max-old-space-size=2048`
- MySQL buffer pool: Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`
- Nginx caching: Enable in `/etc/nginx/conf.d/`

---

## 🆔 Deployment Validation

After running any deployment script:

```bash
# 1. Check services running
docker ps                    # Docker
pm2 status                   # Ubuntu/PM2
Get-Process node             # Windows

# 2. Test frontend access
curl http://localhost:3000

# 3. Test backend
curl http://localhost:7000/api/topics \
  -H "Authorization: Bearer {token}"

# 4. Test database
mysql -h localhost -u skills_user -p skills_db

# 5. Login to application
# Open http://localhost:3000
# Use admin@ccollege.ac.th / admin123
```

---

## 📞 Support

**Issues with scripts?**

1. Check error messages in output
2. Run `scripts/pre-deployment-check.sh` to diagnose
3. Review logs:
   - Docker: `docker-compose logs`
   - Ubuntu: `pm2 logs`
   - Windows: Event Viewer
4. See [DEPLOYMENT_CONFIG.md](../DEPLOYMENT_CONFIG.md) for detailed guides
5. See [DEPLOYMENT.md](../DEPLOYMENT.md) troubleshooting section

---

**Last Updated**: February 2026  
**Status**: Production Ready  
**Version**: 1.0.0
