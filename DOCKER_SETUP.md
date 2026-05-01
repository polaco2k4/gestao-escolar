# Docker Setup Guide

This guide explains how to run the School Management System using Docker and Docker Compose.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### 1. Configure Environment Variables

Copy the Docker environment file and configure it:

```bash
cp .env.docker .env
```

Edit `.env` with your actual values:
- Change `DB_PASSWORD` to a secure password
- Set `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random strings
- Configure SMTP settings for email
- Configure SMS and payment gateway API keys if needed

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### 3. Run Database Migrations

Once PostgreSQL is ready, run migrations:

```bash
# Access the backend container
docker-compose exec backend sh

# Run migrations
npm run migrate

# (Optional) Run seeds
npm run seed

# Exit container
exit
```

## Services

The Docker Compose setup includes:

- **Backend**: Node.js + TypeScript API (port 3000)
- **Frontend**: React + Vite + nginx (port 80)
- **PostgreSQL**: Database (port 5432)
- **Redis**: Cache and queue manager (port 6379)

## Accessing the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Useful Commands

### Start/Stop Services

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Restart specific service
docker-compose restart backend
```

### View Logs

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
docker-compose logs redis
```

### Rebuild Services

```bash
# Rebuild all services
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build backend

# Rebuild without cache
docker-compose build --no-cache backend
```

### Execute Commands in Containers

```bash
# Access backend shell
docker-compose exec backend sh

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d gestao_escolar

# Access Redis CLI
docker-compose exec redis redis-cli
```

### Manage Volumes

```bash
# List volumes
docker volume ls

# Remove specific volume (WARNING: deletes data)
docker volume rm gestao_escolar_postgres_data
docker volume rm gestao_escolar_redis_data
```

## Health Checks

All services have health checks configured:

- **PostgreSQL**: Checks if database is ready to accept connections
- **Redis**: Checks if Redis is responding to ping
- **Backend**: Checks if API is responding on /health endpoint
- **Frontend**: Checks if nginx is serving files

View health status:
```bash
docker-compose ps
```

## Troubleshooting

### Services Not Starting

Check if ports are already in use:
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Check if port 80 is in use
netstat -ano | findstr :80

# Check if port 5432 is in use
netstat -ano | findstr :5432

# Check if port 6379 is in use
netstat -ano | findstr :6379
```

If ports are in use, either:
- Stop the conflicting service
- Change the port mappings in `docker-compose.yml`

### Database Connection Issues

1. Ensure PostgreSQL is healthy:
```bash
docker-compose ps postgres
```

2. Check PostgreSQL logs:
```bash
docker-compose logs postgres
```

3. Verify environment variables in `.env` match docker-compose.yml

### Redis Connection Issues

1. Ensure Redis is healthy:
```bash
docker-compose ps redis
```

2. Check Redis logs:
```bash
docker-compose logs redis
```

### Build Errors

If you encounter build errors:

1. Clean build cache:
```bash
docker-compose build --no-cache
```

2. Remove all containers and volumes:
```bash
docker-compose down -v
docker-compose up -d --build
```

3. Check Docker disk space:
```bash
docker system df
```

### Permission Issues

If you encounter permission issues with uploads/logs:

1. Ensure the directories exist:
```bash
mkdir -p uploads logs
```

2. Check directory permissions on host system

## Production Considerations

### Security

- Change all default passwords and secrets in `.env`
- Use strong, random JWT secrets
- Configure proper SMTP with SSL/TLS
- Restrict database access in production
- Use HTTPS with a reverse proxy (e.g., nginx, traefik)

### Backups

Since volumes are persistent, you should backup regularly:

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U postgres gestao_escolar > backup.sql

# Backup volumes
docker run --rm -v gestao_escolar_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
docker run --rm -v gestao_escolar_redis_data:/data -v $(pwd):/backup alpine tar czf /backup/redis_backup.tar.gz /data
```

### Monitoring

Consider adding:
- Container monitoring (Prometheus, Grafana)
- Log aggregation (ELK stack, Loki)
- Application performance monitoring (APM)

### Scaling

To scale services:

```bash
# Scale backend (requires load balancer)
docker-compose up -d --scale backend=3

# Scale frontend (requires load balancer)
docker-compose up -d --scale frontend=2
```

Note: Scaling requires additional configuration for load balancing and shared sessions.

## Development Mode

For development with hot reload, modify docker-compose.yml to mount source directories as volumes instead of using production builds.

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Verify service health: `docker-compose ps`
- Review this troubleshooting section
