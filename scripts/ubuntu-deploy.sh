#!/bin/bash
# Ubuntu Production Deployment Script
# Automated setup for Ubuntu 20.04 LTS
# Usage: sudo bash ubuntu-deploy.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if running as root
if [ "$EUID" -ne 0 ]; then
   echo -e "${RED}This script must be run as root (use: sudo bash ubuntu-deploy.sh)${NC}"
   exit 1
fi

echo -e "${GREEN}=========================================="
echo "Ubuntu 20.04 Production Deployment"
echo "Vocational Competency Evaluation System"
echo "==========================================${NC}"
echo ""

# Variables
DOMAIN="yourdomain.com"  # CHANGE THIS
APP_DIR="/opt/competency"
APP_USER="competency"
DB_NAME="skills_db"
DB_USER="skills_user"

echo "1. System Update..."
apt update
apt upgrade -y
apt install -y curl wget git build-essential

echo -e "${GREEN}✓ System updated${NC}"
echo ""

echo "2. Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version
npm --version
echo -e "${GREEN}✓ Node.js installed${NC}"
echo ""

echo "3. Installing MySQL..."
apt install -y mysql-server mysql-client
systemctl enable mysql
systemctl start mysql
echo -e "${GREEN}✓ MySQL installed${NC}"
echo ""

echo "4. Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
echo -e "${GREEN}✓ Nginx installed${NC}"
echo ""

echo "5. Installing PM2..."
npm install -g pm2
pm2 startup
pm2 save
echo -e "${GREEN}✓ PM2 installed${NC}"
echo ""

echo "6. Creating application user..."
useradd -m -s /bin/bash $APP_USER 2>/dev/null || true
echo -e "${GREEN}✓ Application user created${NC}"
echo ""

echo "7. Cloning application..."
if [ -d "$APP_DIR" ]; then
    rm -rf "$APP_DIR"
fi
mkdir -p "$APP_DIR"
cd "$APP_DIR"

# You should clone your repository here
echo "Please clone your repository to $APP_DIR"
echo "Then run this script again"
exit 0

echo -e "${GREEN}✓ Application cloned${NC}"
echo ""

echo "8. Setting permissions..."
chown -R $APP_USER:$APP_USER "$APP_DIR"
echo -e "${GREEN}✓ Permissions set${NC}"
echo ""

echo "9. Installing dependencies..."
cd "$APP_DIR/backend"
sudo -u $APP_USER npm install --production
cd "$APP_DIR/frontend"
sudo -u $APP_USER npm install --production
sudo -u $APP_USER npm run build
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo "10. Setting up database..."
mysql -u root << EOF
CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

mysql -u root $DB_NAME < "$APP_DIR/schema.sql"
echo -e "${GREEN}✓ Database created and seeded${NC}"
echo ""

echo "11. Configuring environment variables..."
cat > "$APP_DIR/backend/.env" << EOF
PORT=7000
CORS_ORIGIN=https://$DOMAIN
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=CHANGE_THIS_PASSWORD
DB_NAME=$DB_NAME
JWT_SECRET=$(head -c 32 /dev/urandom | base64)
JWT_EXPIRES=2h
NODE_ENV=production
EOF

cat > "$APP_DIR/frontend/.env" << EOF
VITE_API_URL=https://$DOMAIN/api
EOF

echo -e "${GREEN}✓ Environment configured${NC}"
echo ""

echo "12. Starting services with PM2..."
cd "$APP_DIR/backend"
sudo -u $APP_USER pm2 start app.js --name "competency-api"

cd "$APP_DIR/frontend"
sudo -u $APP_USER pm2 start "npm run preview" --name "competency-web"

pm2 save
echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo "13. Configuring Nginx..."
cat > /etc/nginx/sites-available/competency << 'NGINX_CONFIG'
upstream api {
    server localhost:7000;
}

upstream web {
    server localhost:3000;
}

server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;

    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    client_max_body_size 50M;

    # Frontend
    location / {
        proxy_pass http://web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
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
        expires 30d;
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
NGINX_CONFIG

sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/competency
ln -sf /etc/nginx/sites-available/competency /etc/nginx/sites-enabled/competency
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx
echo -e "${GREEN}✓ Nginx configured${NC}"
echo ""

echo "14. Setting up SSL certificate..."
apt install -y certbot python3-certbot-nginx
certbot certonly --nginx -d "$DOMAIN" -n --agree-tos -m admin@example.com
echo -e "${GREEN}✓ SSL certificate installed${NC}"
echo ""

echo -e "${GREEN}=========================================="
echo "Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo "Your application is now running at:"
echo "  https://$DOMAIN"
echo ""
echo "Demo Credentials:"
echo "  Admin:      admin@ccollege.ac.th / admin123"
echo "  Evaluator:  eva.me@ccollege.ac.th / password123"
echo "  Evaluatee:  t.it01@ccollege.ac.th / demo123"
echo ""
echo "Useful commands:"
echo "  View logs:      pm2 logs competency-api"
echo "  Monitor:        pm2 monit"
echo "  Stop services:  pm2 stop all"
echo "  Restart:        pm2 restart all"
echo ""
echo "Important: Review and customize:"
echo "  - Database password in $APP_DIR/backend/.env"
echo "  - JWT_SECRET in $APP_DIR/backend/.env"
echo "  - SSL certificate renewal (certbot renew --dry-run)"
echo ""
