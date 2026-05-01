# VPS Deployment Guide

This guide explains how to deploy the School Management System on a VPS using Docker.

## Prerequisites

- VPS with at least:
  - 2 CPU cores
  - 4GB RAM
  - 40GB storage
  - Ubuntu 22.04 LTS or 24.04 LTS (recommended)
- Root access or sudo privileges
- Domain name (optional but recommended for production)

## Step 1: Prepare VPS

### Update System

```bash
# Connect to your VPS
ssh root@your-vps-ip

# Update system packages
apt update && apt upgrade -y

# Install basic tools
apt install -y curl wget git nano ufw
```

### Configure Firewall

```bash
# Allow SSH
ufw allow 22/tcp

# Allow HTTP
ufw allow 80/tcp

# Allow HTTPS (if using SSL)
ufw allow 443/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## Step 2: Install Docker

### Install Docker

```bash
# Add Docker's official GPG key
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

# Add repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update and install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable and start Docker
systemctl enable docker
systemctl start docker

# Verify installation
docker --version
docker compose version
```

### Add User to Docker Group (Optional)

```bash
# Create user if not exists
adduser deploy

# Add to docker group
usermod -aG docker deploy

# Switch to deploy user
su - deploy
```

## Step 3: Transfer Files to VPS

### Option A: Using Git (Recommended)

```bash
# On your local machine, commit changes
git add .
git commit -m "Add Docker configuration"

# Push to remote repository
git push origin main

# On VPS, clone repository
cd /opt
git clone https://your-repo-url.git gestao-escolar
cd gestao-escolar
```

### Option B: Using SCP

```bash
# On your local machine, transfer files
scp -r "c:\Users\SDBD\Downloads\PROJECTOS\GESTÃO ESCOLAR" root@your-vps-ip:/opt/gestao-escolar

# Or using rsync (better for large files)
rsync -avz --progress "c:\Users\SDBD\Downloads\PROJECTOS\GESTÃO ESCOLAR/" root@your-vps-ip:/opt/gestao-escolar/
```

### Option C: Using SFTP

```bash
# Using FileZilla or WinSCP
# Connect to your VPS
# Upload files to /opt/gestao-escolar
```

## Step 4: Configure Environment

```bash
# Navigate to project directory
cd /opt/gestao-escolar

# Copy environment file
cp .env.docker .env

# Edit environment file
nano .env
```

**Important changes for production:**
```bash
# Change these values:
DB_PASSWORD=your_strong_random_password_here
JWT_SECRET=your_very_long_random_jwt_secret_here
JWT_REFRESH_SECRET=your_very_long_random_refresh_secret_here

# Configure your actual values:
SMTP_HOST=your-smtp-server.com
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-smtp-password

# Payment gateways (if using):
MULTICAIXA_API_KEY=your_actual_key
PAYWAY_API_KEY=your_actual_key
```

**Generate strong secrets:**
```bash
# Generate random passwords
openssl rand -base64 32

# Or use:
head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32
```

## Step 5: Build and Start Services

```bash
# Build and start all services
docker compose up -d --build

# View logs to ensure everything starts correctly
docker compose logs -f

# Check service status
docker compose ps
```

Expected output should show all services as "healthy" or "running".

## Step 6: Run Database Migrations

```bash
# Wait for PostgreSQL to be fully ready (check logs)
docker compose logs postgres

# Run migrations
docker compose exec backend npm run migrate

# (Optional) Run seed data
docker compose exec backend npm run seed

# Verify database
docker compose exec postgres psql -U postgres -d gestao_escolar -c "\dt"
```

## Step 7: Configure Domain (Optional but Recommended)

### Point Domain to VPS

1. Go to your domain registrar (e.g., GoDaddy, Namecheap)
2. Add A record pointing to your VPS IP:
   - Type: A
   - Name: @ (or your subdomain, e.g., app)
   - Value: your-vps-ip
   - TTL: 3600

### Wait for DNS Propagation

```bash
# Check if domain is pointing correctly
ping yourdomain.com
# or
nslookup yourdomain.com
```

## Step 8: Configure SSL with Let's Encrypt (Recommended)

### Install Certbot

```bash
# Install certbot
apt install -y certbot python3-certbot-nginx

# Stop nginx container temporarily
docker compose stop frontend

# Obtain SSL certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificate location:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

### Update docker-compose.yml for SSL

```bash
# Edit docker-compose.yml
nano docker-compose.yml
```

Add SSL configuration to frontend service:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
  depends_on:
    - backend
  networks:
    - app-network
  restart: unless-stopped
```

### Update nginx.conf for SSL

```bash
# Edit frontend/nginx.conf
nano frontend/nginx.conf
```

Add SSL configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /usr/share/nginx/html;
    index index.html;

    # ... rest of your configuration
}
```

### Restart Services

```bash
docker compose up -d --build frontend
```

### Auto-renew SSL Certificates

```bash
# Test renewal
certbot renew --dry-run

# Add to crontab for auto-renewal
crontab -e

# Add this line (runs daily at 3 AM):
0 3 * * * certbot renew --quiet --post-hook "cd /opt/gestao-escolar && docker compose restart frontend"
```

## Step 9: Security Hardening

### Disable Root SSH Access

```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Change:
PermitRootLogin no
PasswordAuthentication no

# Restart SSH
systemctl restart sshd
```

### Use SSH Keys Only

```bash
# On your local machine, generate SSH key if not exists
ssh-keygen -t ed25519

# Copy public key to VPS
ssh-copy-id deploy@your-vps-ip

# Now you can login without password
ssh deploy@your-vps-ip
```

### Install Fail2Ban

```bash
# Install fail2ban
apt install -y fail2ban

# Enable and start
systemctl enable fail2ban
systemctl start fail2ban

# Check status
fail2ban-client status
```

## Step 10: Monitoring and Maintenance

### Set up Log Rotation

```bash
# Create logrotate config
nano /etc/logrotate.d/gestao-escolar

# Add:
/opt/gestao-escolar/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 deploy deploy
}
```

### Monitor Disk Space

```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df

# Clean up unused Docker resources
docker system prune -a --volumes -f
```

### Automated Backups

Create backup script:

```bash
nano /opt/backup-gestao-escolar.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/gestao-escolar"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker compose exec -T postgres pg_dump -U postgres gestao_escolar > $BACKUP_DIR/db_$DATE.sql

# Backup volumes
docker run --rm -v gestao_escolar_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_$DATE.tar.gz /data
docker run --rm -v gestao_escolar_redis_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/redis_$DATE.tar.gz /data

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /opt/backup-gestao-escolar.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add:
0 2 * * * /opt/backup-gestao-escolar.sh
```

## Step 11: Access Your Application

- **Without domain**: http://your-vps-ip
- **With domain**: http://yourdomain.com
- **With SSL**: https://yourdomain.com

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker compose logs

# Check specific service
docker compose logs backend
docker compose logs postgres

# Restart services
docker compose restart
```

### Port Conflicts

```bash
# Check what's using ports
netstat -tulpn | grep :80
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Kill process if needed
kill -9 <PID>
```

### Memory Issues

```bash
# Check memory usage
free -h

# Check container memory usage
docker stats

# Add swap if needed
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec backend npm run migrate
```

## Update and Maintenance

### Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose up -d --build

# Run migrations if needed
docker compose exec backend npm run migrate
```

### Update Docker

```bash
# Update Docker packages
apt update
apt upgrade -y docker-ce docker-ce-cli containerd.io

# Restart Docker
systemctl restart docker
```

## Support

For issues:
- Check logs: `docker compose logs -f`
- Verify service health: `docker compose ps`
- Review this troubleshooting section
- Check Docker documentation: https://docs.docker.com/
