# Deployment Configuration Guide

This guide helps you configure your system for different deployment scenarios.

---

## Quick Deployment Decision Tree

```
START
  │
  ├─ Want to test locally? → Use Docker (easiest)
  │  └─ Run: docker-compose up -d
  │
  ├─ Want development on your machine? → Local Setup
  │  └─ Run: Follow QUICK_START.md
  │
  └─ Want production deployment? → Choose your platform:
     │
     ├─ Using Docker? → See "Docker Production"
     │  └─ Run: docker-compose -f docker-compose.yml up -d
     │
     ├─ Using Ubuntu/Linux? → See "Ubuntu Production"
     │  └─ Run: sudo bash scripts/ubuntu-deploy.sh
     │
     ├─ Using Windows Server? → See "Windows Production"
     │  └─ Run: powershell -ExecutionPolicy Bypass -File .\scripts\windows-deploy.ps1
     │
     └─ Using Cloud (AWS/Azure/DigitalOcean)? → See "Cloud Deployment"
        └─ Install Node.js + MySQL, then run local deployment script
```

---

## 1. Docker Deployment (Easiest)

### Prerequisites
- Docker installed
- Docker Compose installed
- 4GB RAM available
- Port 3000, 7000, 3306, 8080 available

### Steps
```bash
# 1. Navigate to project directory
cd competency2568

# 2. Start services
docker-compose up -d

# 3. Access application
# Frontend: http://localhost:3000
# Backend:  http://localhost:7000
# MySQL:    localhost:3306
# phpMyAdmin: http://localhost:8080

# 4. Login with demo credentials
# Email:    admin@ccollege.ac.th
# Password: admin123

# 5. Stop services
docker-compose down
```

### Customization
Edit `docker-compose.yml`:
- Change MySQL root password (DB_ROOT_PASSWORD)
- Change application database password
- Map different ports if needed
- Adjust environment variables

---

## 2. Ubuntu 20.04 Production

### Prerequisites
- Ubuntu 20.04 LTS server
- Root or sudo access
- Domain name pointed to server
- 2GB+ RAM, 20GB+ storage

### Automated Setup
```bash
# 1. Download deployment script
sudo bash scripts/ubuntu-deploy.sh

# Script will:
# - Install Node.js v18
# - Install MySQL 8.0
# - Install Nginx
# - Install PM2
# - Configure SSL with Let's Encrypt
# - Start services automatically
```

### Manual Setup (if script doesn't work)
Follow [DEPLOYMENT.md](../DEPLOYMENT.md) "Production Server Setup" section step-by-step.

### Post-Deployment
```bash
# Check services
pm2 status

# View logs
pm2 logs

# Restart services
pm2 restart all

# Monitor resources
pm2 monit
```

---

## 3. Windows Server Deployment

### Prerequisites
- Windows Server 2016 or later
- Node.js v18+ installed
- MySQL 8.0+ installed
- IIS or Nginx reverse proxy configured (optional)

### Using PowerShell Script
```powershell
# Run as Administrator
powershell -ExecutionPolicy Bypass -File scripts\windows-deploy.ps1
```

### Manual Steps
1. Install Node.js and npm
2. Install MySQL Server
3. Import database: `mysql -u root -p < schema.sql`
4. Install dependencies:
   ```
   cd backend && npm install --production
   cd ..\frontend && npm install --production && npm run build
   ```
5. Configure environment variables in `.env` files
6. Start backend: `npm start` in `/backend`
7. Start frontend: `npm run preview` in `/frontend`

---

## 4. Cloud Deployment (AWS/Azure/DigitalOcean)

### 1. AWS EC2 Setup

**Instance Type**: t3.medium (2GB RAM)  
**OS**: Ubuntu 20.04 LTS  
**Storage**: 30GB SSD

**Steps**:
1. Launch EC2 instance
2. SSH into instance
3. Follow "Ubuntu Production" section above
4. Configure security groups (allow ports 80, 443, 22)
5. Update domain DNS to point to instance IP

### 2. DigitalOcean Droplet Setup

**Plan**: 2GB/2CPU  
**OS**: Ubuntu 20.04  
**Region**: Choose closest to users

**Steps**:
1. Create droplet
2. SSH into droplet
3. Follow "Ubuntu Production" section above
4. Point domain to droplet IP in DigitalOcean DNS

### 3. Azure VM Setup

**VM Size**: Standard B2s  
**Image**: Ubuntu 20.04  
**Region**: Choose closest

**Steps**:
1. Create VM
2. RDP/SSH into VM
3. Follow "Ubuntu Production" section above
4. Configure NSG rules to allow ports 80, 443

### 4. Heroku Deployment

Heroku requires Procfile. Create:
```
web: cd backend && npm start
release: npm run db:migrate
```

Then:
```bash
heroku login
heroku create your-app-name
git push heroku main
```

---

## 5. Docker Production Deployment

### Using docker-compose.yml for Production

Update `docker-compose.yml` for production security:

```yaml
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: strong-random-password-here
      MYSQL_DATABASE: skills_db
    volumes:
      - db_data:/var/lib/mysql
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: always
    networks:
      - internal

  api:
    build: ./backend
    environment:
      PORT: 7000
      NODE_ENV: production
      CORS_ORIGIN: https://yourdomain.com
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: strong-random-password-here
      JWT_SECRET: generate-32-char-random-string
    depends_on:
      - db
    restart: always
    networks:
      - internal
      - web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`yourdomain.com`) && PathPrefix(`/api`)"
      - "traefik.http.services.api.loadbalancer.server.port=7000"

  web:
    build: ./frontend
    environment:
      VITE_API_URL: https://yourdomain.com/api
    restart: always
    networks:
      - web
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`yourdomain.com`)"
      - "traefik.http.services.web.loadbalancer.server.port=3000"

  traefik:
    image: traefik:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yml:/traefik.yml
    restart: always
    networks:
      - web

volumes:
  db_data:

networks:
  internal:
    driver: bridge
  web:
    driver: bridge
```

Deploy:
```bash
docker-compose up -d
```

---

## Environment Variables Reference

### Backend (.env)

```env
# Server Configuration
PORT=7000
NODE_ENV=production

# CORS Settings (MUST MATCH YOUR DOMAIN)
CORS_ORIGIN=https://yourdomain.com

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=skills_user
DB_PASSWORD=strong-password-here
DB_NAME=skills_db

# JWT Authentication
JWT_SECRET=generate-32-character-random-string-here
JWT_EXPIRES=2h

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=https://yourdomain.com/api

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=false
```

---

## Security Checklist

Before going to production:

- [ ] Change all demo user passwords
- [ ] Generate strong JWT_SECRET (32+ random characters)
- [ ] Configure CORS_ORIGIN to your domain only
- [ ] Set NODE_ENV=production
- [ ] Obtain SSL/TLS certificate (Let's Encrypt)
- [ ] Enable HTTPS only (redirect HTTP → HTTPS)
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Enable rate limiting (optional)
- [ ] Enable request logging (Morgan)
- [ ] Configure database user permissions
- [ ] Set up health checks
- [ ] Plan disaster recovery

---

## Monitoring & Maintenance

### Ubuntu/PM2
```bash
# View service status
pm2 status

# View real-time logs
pm2 logs

# Monitor CPU/Memory
pm2 monit

# Restart services
pm2 restart all

# View error logs
pm2 logs --err

# Check startup on reboot
pm2 startup
pm2 save
```

### Docker
```bash
# View running containers
docker ps

# View container logs
docker logs -f container_name

# View resource usage
docker stats

# Restart services
docker-compose restart

# View detailed info
docker-compose ps
```

### Database
```bash
# Backup database
mysqldump -u root -p skills_db > backup_$(date +%Y%m%d).sql

# View database size
mysql -u root -e "SELECT table_schema AS Database, SUM(data_length + index_length) / 1024 / 1024 / 1024 AS Size_GB FROM information_schema.tables GROUP BY table_schema;"

# Check table integrity
REPAIR TABLE table_name;
OPTIMIZE TABLE table_name;
```

---

## Troubleshooting Deployment

### Services won't start
```bash
# Check logs
docker-compose logs
# or
pm2 logs

# Check port availability
netstat -tuln | grep 7000

# Check firewall
sudo ufw status
```

### Connection refused to database
```bash
# Check MySQL is running
systemctl status mysql
# or
docker ps | grep mysql

# Check credentials
mysql -h localhost -u skills_user -p
```

### CORS errors
- Check CORS_ORIGIN in backend/.env
- Should match your frontend domain exactly
- Include https:// but NOT trailing slash

### SSL certificate errors
```bash
# Check certificate validity
openssl x509 -enddate -noout -in /etc/letsencrypt/live/domain.com/cert.pem

# Renew certificate
certbot renew --dry-run

# Force renewal
certbot certonly --force-renewal -d yourdomain.com
```

---

## Performance Tuning

### Database Optimization
```sql
-- Add indexes if not present
ALTER TABLE evaluation_results ADD INDEX idx_period (period_id);
ALTER TABLE evaluation_results ADD INDEX idx_evaluatee (evaluatee_id);
ALTER TABLE evaluation_results ADD INDEX idx_evaluator (evaluator_id);

-- Check table sizes
SHOW TABLE STATUS FROM skills_db;

-- Optimize tables
OPTIMIZE TABLE assignment;
OPTIMIZE TABLE evaluation_results;
```

### Backend Optimization
- Enable gzip compression in Nginx
- Use connection pooling
- Enable query caching
- Monitor slow queries (MySQL slow log)

### Frontend Optimization
- Enable browser caching
- Minify assets (npm run build)
- Use CDN for static assets (optional)
- Enable service worker (optional)

---

## Backup & Disaster Recovery

### Database Backup Strategy
```bash
# Daily backup
0 2 * * * mysqldump -u root -p'password' skills_db > /backups/backup_$(date +\%Y\%m\%d).sql

# Weekly full backup
0 3 0 * * tar -czf /backups/full_backup_$(date +\%Y\%m\%d).tar.gz /opt/competency

# Upload to cloud storage
# Use AWS S3, Google Cloud Storage, or Azure Blob
```

### Restore from Backup
```bash
# Restore database
mysql -u root -p skills_db < backup_20260222.sql

# Restore full system
tar -xzf full_backup_20260222.tar.gz -C /
```

---

## Next Steps

1. **Choose your deployment method** from the decision tree above
2. **Follow the specific guide** for your platform
3. **Run the pre-deployment checks**: `bash scripts/pre-deployment-check.sh`
4. **Monitor the logs** after deployment
5. **Test all functionality** with demo users
6. **Set up backups** using procedures above
7. **Configure monitoring** (alerts, logs, metrics)

---

**Last Updated**: February 2026  
**Status**: Production Ready
