# 🚀 BRO PARTNER - Production Deployment Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  React + Vite + Nginx  (Port 5173 / Chainguard Alpine)     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API (JSON/REST)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                      API Layer (Axum)                        │
│  Rust/Tokio  (Port 8080 / Debian Bookworm)                 │
│  - JWT Authentication                                        │
│  - Database Connection Pooling (5-20 connections)           │
│  - CORS Protection                                           │
│  - Compression & Tracing                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL/TCP
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Data Layer                                │
│  PostgreSQL 15  (Port 5432 / Persistent Volume)            │
│  - Audit Trail Table                                         │
│  - Indexed Queries                                           │
│  - Auto Migrations                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Local Deployment

### Requirements
- Docker & Docker Compose
- 2GB+ RAM
- 2GB+ Disk Space

### Quick Start
```bash
# 1. Clone repository
git clone <repo>
cd bro-partner

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Start services
docker compose up -d --build

# 4. Verify
docker compose ps
curl http://localhost:8080/health

# 5. Access application
# Frontend: http://localhost:5173
# API: http://localhost:8080
```

### Troubleshooting
```bash
# View logs
docker compose logs -f backend

# Reset database
docker compose down -v
docker compose up -d

# Rebuild images
docker compose build --no-cache
docker compose up -d
```

---

## Cloud Deployment

### AWS ECS

```bash
# 1. Create ECR repositories
aws ecr create-repository --repository-name bro-partner-backend
aws ecr create-repository --repository-name bro-partner-frontend

# 2. Login to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

# 3. Build and push
docker build -t <account>.dkr.ecr.<region>.amazonaws.com/bro-partner-backend ./backend
docker push <account>.dkr.ecr.<region>.amazonaws.com/bro-partner-backend

docker build -t <account>.dkr.ecr.<region>.amazonaws.com/bro-partner-frontend ./frontend
docker push <account>.dkr.ecr.<region>.amazonaws.com/bro-partner-frontend

# 4. Use docker-compose.aws.yml
# Set environment variables and deploy to ECS
```

### DigitalOcean App Platform

```bash
# 1. Push to Docker Hub
docker tag fullstackgebernador-backend:latest yourusername/bro-partner-backend:latest
docker tag fullstackgebernador-frontend:latest yourusername/bro-partner-frontend:latest

docker push yourusername/bro-partner-backend:latest
docker push yourusername/bro-partner-frontend:latest

# 2. Create app.yaml for DigitalOcean
# 3. Deploy
doctl apps create --spec app.yaml
```

### Vercel (Frontend Only)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy frontend
cd frontend
vercel deploy --prod

# 3. Set environment variables
# VITE_API_URL=https://your-api.example.com
```

### Google Cloud Run

```bash
# 1. Enable services
gcloud services enable run.googleapis.com

# 2. Build and push backend
gcloud builds submit --tag gcr.io/PROJECT_ID/bro-partner-backend ./backend
gcloud run deploy bro-partner-backend \
  --image gcr.io/PROJECT_ID/bro-partner-backend \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars DATABASE_URL=<cloudsql-url>

# 3. Build and push frontend
gcloud builds submit --tag gcr.io/PROJECT_ID/bro-partner-frontend ./frontend
gcloud run deploy bro-partner-frontend \
  --image gcr.io/PROJECT_ID/bro-partner-frontend \
  --platform managed \
  --region us-central1 \
  --memory 256Mi \
  --cpu 1
```

---

## Performance Tuning

### Backend (Rust)

**Connection Pool Settings**
```rust
PgPoolOptions::new()
    .max_connections(20)      // Adjust based on load
    .min_connections(5)        // Keep connections warm
    .acquire_timeout(Duration::from_secs(30))
    .idle_timeout(Some(Duration::from_secs(600)))
    .max_lifetime(Some(Duration::from_secs(1800)))
```

**Build Optimization**
```toml
[profile.release]
opt-level = 3          # Maximum optimization
lto = true             # Link-time optimization
codegen-units = 1      # Single codegen unit
strip = true           # Strip debug symbols
panic = "abort"        # Small binary
```

### Frontend (React)

**Build Size: ~10MB**
- Gzip: ~4MB
- Built with Vite v6
- Tree-shaking enabled
- CSS/JS minified

**Nginx Caching**
```
- Static assets: 1 year (immutable)
- index.html: No cache (must-revalidate)
- API responses: No cache (always fresh)
```

### Database (PostgreSQL)

**Connection Management**
```sql
-- Check pool status
SELECT count(*) as connection_count FROM pg_stat_activity;

-- View long-running queries
SELECT pid, query_start, query FROM pg_stat_activity WHERE state = 'active';

-- Connection limits
ALTER SYSTEM SET max_connections = 100;
```

---

## Security

### Environment Secrets

**Never commit:**
- `.env` with real secrets
- Private keys
- API credentials

**Production secrets should be:**
- Stored in cloud provider's secret manager
- Rotated every 90 days
- Audited for access
- Never logged

### API Security

- ✅ JWT authentication (24h expiry)
- ✅ API key for webhooks
- ✅ CORS restricted to frontend domain
- ✅ Rate limiting (implement if needed)
- ✅ Input validation
- ✅ SQL injection protection (sqlx prepared statements)

### Container Security

- ✅ Non-root user (appuser:10001)
- ✅ Multi-stage builds (no build tools in production)
- ✅ Minimal base images (Debian slim, Chainguard)
- ✅ Security patches applied (RUN apt-get upgrade -y)
- ✅ No secrets in Dockerfile
- ✅ Health checks enabled

---

## Monitoring

### Health Checks

All services have built-in health checks:

```bash
# Backend
curl http://localhost:8080/health

# Frontend
curl http://localhost:5173/

# Database
docker exec gobernador-db pg_isready -U postgres
```

### Logging

**Structured logging to stdout**
```bash
# View combined logs
docker compose logs -f

# JSON formatted logs
docker compose logs -f --format='{{json .}}'

# Specific service
docker compose logs -f backend
```

### Metrics

Collect metrics using:
- Prometheus (metrics endpoint)
- Datadog (APM)
- New Relic (APM)
- CloudWatch (AWS)
- Cloud Logging (GCP)

---

## Backup & Disaster Recovery

### Database Backups

```bash
# Manual backup
docker exec gobernador-db pg_dump -U postgres gobernador_ia > backup.sql

# Automated backup (cron)
0 2 * * * docker exec gobernador-db pg_dump -U postgres gobernador_ia > backups/backup-$(date +\%Y\%m\%d).sql

# Restore from backup
docker exec -i gobernador-db psql -U postgres gobernador_ia < backup.sql
```

### Disaster Recovery Plan

1. **Data Loss**: Restore from latest backup
2. **Service Failure**: Health checks trigger auto-restart
3. **Complete Outage**: 
   - Rebuild images: `docker compose build`
   - Restart services: `docker compose up -d`
   - Verify: `docker compose ps`

---

## Maintenance

### Updates

**Docker Images**
```bash
# Pull latest base images
docker compose pull

# Rebuild with latest base images
docker compose build --pull

# Restart services
docker compose restart
```

**Dependencies**
```bash
# Update Rust dependencies
cargo update

# Rebuild backend
docker compose build backend
```

### Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove dangling images
docker image prune

# Remove unused volumes
docker volume prune

# Full cleanup (WARNING)
docker system prune -a --volumes
```

---

## Checklists

### Pre-Launch Checklist

- [ ] Environment variables configured
- [ ] Database credentials secure
- [ ] SSL certificates installed
- [ ] Health checks verified
- [ ] Logs being collected
- [ ] Backups configured
- [ ] Team trained
- [ ] Documentation complete
- [ ] Monitoring set up
- [ ] Rollback plan documented

### Daily Operations

- [ ] Check service health: `docker compose ps`
- [ ] Monitor logs: `docker compose logs`
- [ ] Check disk space: `docker system df`
- [ ] Verify backups completed
- [ ] Check error rates

### Weekly Maintenance

- [ ] Review logs for errors
- [ ] Test backup/restore
- [ ] Update dependencies (if needed)
- [ ] Review performance metrics
- [ ] Check security patches

### Monthly Maintenance

- [ ] Update base images
- [ ] Review and rotate secrets
- [ ] Full system backup
- [ ] Security audit
- [ ] Performance analysis

---

## Support & Debugging

### Common Issues

**Database connection refused**
```bash
# Check database container
docker compose ps db

# View database logs
docker compose logs db

# Restart database
docker compose restart db
```

**API not responding**
```bash
# Check backend container
docker compose ps backend

# View backend logs
docker compose logs backend

# Check health endpoint
curl http://localhost:8080/health
```

**Frontend not loading**
```bash
# Check frontend container
docker compose ps frontend

# View frontend logs
docker compose logs frontend

# Check browser console (F12)
# Check network tab for API calls
```

---

**Version**: 2.0.0  
**Last Updated**: 2026-07-08  
**Status**: Production Ready ✅
