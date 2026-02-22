# 🚀 Deployment Guide - Vocational Personnel Competency Evaluation System

**Version**: 1.0.0  
**Date**: February 2026  
**Status**: Production Ready

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Local Development Setup](#local-development-setup)
3. [Production Server Setup](#production-server-setup)
4. [Docker Deployment](#docker-deployment)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Code Quality
- [ ] All backend routes registered in `app.js`
- [ ] All frontend pages created in `pages/` directory
- [ ] No TypeScript errors: `npm run build`
- [ ] No linting errors: `npm run lint` (if configured)
- [ ] API endpoints tested with Postman/curl

### Database
- [ ] User accounts created (admin, evaluators, evaluatees)
- [ ] Demo data seeded (topics, indicators, periods)
- [ ] Database backups configured
- [ ] Character set is UTF-8MB4

### Security
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] CORS_ORIGIN set correctly
- [ ] HTTPS certificates obtained
- [ ] Password hashing verified (bcrypt)
- [ ] File upload restrictions configured

### Performance
- [ ] Frontend build optimized (`npm run build`)
- [ ] Backend can handle expected load
- [ ] Database indexes created
- [ ] Caching strategy planned

---

## 🔧 Local Development Setup

### Prerequisites
```bash
# Verify Node.js v18+
node --version

# Verify npm v9+
npm --version

# Verify MySQL v8.0+
mysql --version
```

### Installation Steps

**1. Clone Repository**
```bash
git clone <repository-url>
cd competency2568
```

**2. Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**3. Setup Database**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE skills_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p skills_db < ../schema.sql
```

**4. Configure Environment**

**backend/.env:**
```env
PORT=7000
CORS_ORIGIN=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=skills_db

JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES=2h

NODE_ENV=development
```

**frontend/.env:**
```env
VITE_API_URL=http://localhost:7000/api
```

**5. Start Services**

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Backend running at http://localhost:7000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend running at http://localhost:3000
```

**6. Test Login**
- URL: http://localhost:3000
- Admin: admin@ccollege.ac.th / admin123
- Evaluator: eva.me@ccollege.ac.th / password123
- Evaluatee: t.it01@ccollege.ac.th / demo123

---

## 🏢 Production Server Setup

### Ubuntu 20.04 LTS Setup

**1. Update System**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

**2. Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify v18.x
npm --version   # Verify v9.x
```

**3. Install MySQL**
```bash
sudo apt install -y mysql-server mysql-client
sudo mysql_secure_installation
```

**4. Install Nginx (as reverse proxy)**
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

**5. Install PM2 (process manager)**
```bash
sudo npm install -g pm2
sudo pm2 startup
sudo pm2 save
```

**6. Clone Application**
```bash
cd /opt
sudo git clone <repository-url> competency
sudo chown -R $USER:$USER competency
cd competency
```

**7. Install Dependencies**
```bash
cd backend && npm install --production
cd ../frontend && npm install --production
```

**8. Build Frontend**
```bash
cd ../frontend
npm run build
# Creates .nuxt and .output directories
```

**9. Configure Environment**

**backend/.env:**
```env
PORT=7000
CORS_ORIGIN=https://yourdomain.com

DB_HOST=localhost
DB_PORT=3306
DB_USER=skills_user
DB_PASSWORD=strong-password-here
DB_NAME=skills_db

JWT_SECRET=generate-random-string-32-chars
JWT_EXPIRES=2h

NODE_ENV=production
```

**10. Setup Database**
```bash
mysql -u root -p < schema.sql
```

**11. Start Services with PM2**
```bash
cd backend
pm2 start app.js --name "competency-api"

cd ../frontend
pm2 start "npm run preview" --name "competency-web"

# Save PM2 config
pm2 save
```

**12. Configure Nginx**

Create `/etc/nginx/sites-available/competency`:
```nginx
upstream api {
    server localhost:7000;
}

upstream web {
    server localhost:3000;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Frontend
    location / {
        proxy_pass http://web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://api/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    location /uploads/ {
        alias /opt/competency/backend/uploads/;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/competency /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**13. Setup SSL Certificate (Let's Encrypt)**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

---

## 🐳 Docker Deployment

### Prerequisites
- Docker v20.10+
- Docker Compose v2.0+

### Quick Start
```bash
cd competency2568
docker-compose up -d
```

Services:
- MySQL: localhost:3306
- phpMyAdmin: localhost:8080
- Backend API: localhost:7000
- Frontend: localhost:3000

### Production Docker

**Update docker-compose.yml for production:**
```yaml
version: '3.8'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: strong-root-password
      MYSQL_DATABASE: skills_db
    volumes:
      - db_data:/var/lib/mysql
      - ./schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: always

  api:
    build: ./backend
    environment:
      NODE_ENV: production
      PORT: 7000
      CORS_ORIGIN: https://yourdomain.com
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: strong-root-password
      DB_NAME: skills_db
      JWT_SECRET: strong-random-string
    depends_on:
      - db
    restart: always

  web:
    build: ./frontend
    environment:
      VITE_API_URL: https://yourdomain.com/api
    restart: always

volumes:
  db_data:
```

Deploy:
```bash
docker-compose -f docker-compose.yml up -d
```

---

## 💾 Database Setup

### Manual Setup
```bash
# Create database
CREATE DATABASE skills_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import schema
mysql -u root -p skills_db < schema.sql
```

### Create Dedicated User
```sql
CREATE USER 'skills_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON skills_db.* TO 'skills_user'@'localhost';
FLUSH PRIVILEGES;
```

### Backup & Restore
```bash
# Backup
mysqldump -u root -p skills_db > backup_$(date +\%Y\%m\%d).sql

# Restore
mysql -u root -p skills_db < backup_20260222.sql
```

### Database Maintenance
```bash
# Optimize tables
OPTIMIZE TABLE skills_db.*;

# Check table integrity
CHECK TABLE skills_db.*;

# Repair if needed
REPAIR TABLE table_name;
```

---

## 🔑 Environment Configuration

### Backend Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| PORT | 7000 | API server port |
| CORS_ORIGIN | https://yourdomain.com | Frontend origin for CORS |
| DB_HOST | localhost | Database server |
| DB_PORT | 3306 | Database port |
| DB_USER | skills_user | Database user |
| DB_PASSWORD | strong_pwd | Database password |
| DB_NAME | skills_db | Database name |
| JWT_SECRET | random-32-char-string | JWT signing secret |
| JWT_EXPIRES | 2h | Token expiration |
| NODE_ENV | production | Environment mode |

### Frontend Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| VITE_API_URL | https://yourdomain.com/api | API base URL |

---

## 🔒 Security Considerations

### Authentication & Passwords
- [ ] Change all demo user passwords
- [ ] Use bcrypt hash for passwords
- [ ] JWT secret is 32+ random characters
- [ ] Two-factor authentication (future enhancement)

### Network Security
- [ ] HTTPS/SSL certificates installed
- [ ] CORS origin restricted to your domain
- [ ] Firewall rules configured (ports 80, 443 only)
- [ ] SSH key authentication enabled

### Database Security
- [ ] Strong MySQL root password
- [ ] Dedicated read/write user created
- [ ] Regular backups with encryption
- [ ] Database access restricted to localhost

### File Upload Security
- [ ] File size limits enforced
- [ ] Allowed file types restricted
- [ ] Uploads outside web root
- [ ] Virus scanning (optional)

### API Security
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Knex.js)
- [ ] XSS prevention (Vue sanitization)

---

## 🔧 Troubleshooting

### Backend Won't Start
```bash
# Check port availability
netstat -tuln | grep 7000

# Check environment variables
cat backend/.env

# Check database connection
mysql -h localhost -u skills_user -p skills_db -e "SELECT 1;"

# View logs
pm2 logs competency-api
```

### Frontend Not Connecting
```bash
# Check API URL in browser console
# Should show: http://localhost:7000/api

# Test API connectivity
curl -H "Authorization: Bearer TOKEN" http://localhost:7000/api/topics

# Check Nginx configuration
sudo nginx -t
```

### Database Connection Error
```bash
# Verify MySQL is running
sudo systemctl status mysql

# Check credentials
mysql -u skills_user -p -h localhost

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### File Upload Issues
```bash
# Check upload directory exists
ls -la backend/uploads/

# Check permissions
chmod -R 755 backend/uploads/

# Check disk space
df -h
```

### SSL Certificate Issues
```bash
# Renew certificate before expiration
sudo certbot renew --dry-run

# Check certificate expiration
openssl x509 -enddate -noout -in /etc/letsencrypt/live/yourdomain.com/cert.pem

# Set automatic renewal
sudo systemctl enable certbot.timer
```

---

## 📞 Support

For issues or questions:
1. Check system logs: `sudo journalctl -u nginx -f`
2. Check PM2 logs: `pm2 logs competency-api`
3. Check application errors: `backend/logs/` (if configured)

---

**Last Updated**: February 2026  
**Status**: Production Ready v1.0.0
