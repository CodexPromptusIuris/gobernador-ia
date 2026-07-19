# BRO PARTNER - Complete Fullstack Deployment Guide

## 🚀 Quick Deploy

### Local Deployment (Windows/Mac/Linux)
```bash
# 1. Start everything
docker compose up -d --build

# 2. Access application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8080
# Database: localhost:5432

# 3. Login with password
# Password: Admin@123Secure
```

### Cloud Deployment

#### Option 1: Vercel + AWS (Recommended)
```bash
# Frontend on Vercel
cd frontend
vercel deploy

# Backend on AWS ECS
cd backend
# Follow AWS ECR push documentation
```

#### Option 2: Docker Hub + DigitalOcean
```bash
# Push images
docker tag fullstackgebernador-frontend:latest yourusername/bro-partner-frontend:latest
docker tag fullstackgebernador-backend:latest yourusername/bro-partner-backend:latest

docker push yourusername/bro-partner-frontend:latest
docker push yourusername/bro-partner-backend:latest

# Deploy on DigitalOcean App Platform using docker-compose.yml
```

#### Option 3: Google Cloud Run
```bash
# Build and push to Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/bro-partner-backend
gcloud builds submit --tag gcr.io/PROJECT_ID/bro-partner-frontend

# Deploy
gcloud run deploy bro-partner-backend --image gcr.io/PROJECT_ID/bro-partner-backend
gcloud run deploy bro-partner-frontend --image gcr.io/PROJECT_ID/bro-partner-frontend
```

---

## 📋 Environment Variables

### Local (.env)
```
POSTGRES_PASSWORD=gobernador-secure-password-2024
ADMIN_PASSWORD=Admin@123Secure
JWT_SECRET=gobernador-jwt-secret-change-in-production-2024
WEBHOOK_API_KEY=webhook-key-secure-change-2024
FRONTEND_URL=http://localhost:5173
PORT=8080
LOG_LEVEL=info
```

### Production (.env.production)
```
POSTGRES_PASSWORD=<STRONG-RANDOM-PASSWORD>
ADMIN_PASSWORD=<STRONG-RANDOM-PASSWORD>
JWT_SECRET=<STRONG-RANDOM-SECRET-MIN-32-CHARS>
WEBHOOK_API_KEY=<STRONG-RANDOM-KEY>
FRONTEND_URL=https://yourdomain.com
PORT=8080
LOG_LEVEL=warn
DATABASE_URL=postgresql://user:pass@cloud-db:5432/bro_partner
```

---

## 🐳 Docker Images

### Frontend Image
- Base: `cgr.dev/chainguard/nginx:latest` (5MB)
- Size: ~10MB
- Build time: ~7 seconds
- Includes: React SPA + Nginx

### Backend Image
- Base: `debian:bookworm-slim` (30MB)
- Size: ~150MB
- Build time: ~5 minutes (first time)
- Includes: Rust binary + SSL libs

### Database
- Image: `postgres:15-alpine` (80MB)
- Persistent volume: `pgdata`

---

## 🔒 Security Checklist

- [x] Non-root container users
- [x] Environment-based secrets (no hardcoding)
- [x] JWT token validation
- [x] CORS properly configured
- [x] Health checks on all services
- [x] SSL/TLS ready (reverse proxy)
- [x] Database connection pooling
- [x] API key authentication for webhooks

---

## 📊 Monitoring & Logs

### Local
```bash
# View all logs
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# Container stats
docker stats
```

### Cloud
- **Vercel**: Vercel Dashboard logs
- **AWS ECS**: CloudWatch logs
- **Google Cloud Run**: Cloud Logging
- **DigitalOcean**: App Platform dashboard

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy BRO PARTNER

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and Push Images
        run: |
          docker login -u ${{ secrets.DOCKER_USER }} -p ${{ secrets.DOCKER_PASS }}
          docker build -t yourusername/bro-partner-backend:latest ./backend
          docker build -t yourusername/bro-partner-frontend:latest ./frontend
          docker push yourusername/bro-partner-backend:latest
          docker push yourusername/bro-partner-frontend:latest
      
      - name: Deploy to Production
        run: |
          # Your deployment script here
          docker compose pull
          docker compose up -d
```

---

## 🚨 Troubleshooting

### Port conflicts
```bash
# Find process on port
netstat -ano | findstr :5173  # Windows
lsof -ti:5173                 # Mac/Linux

# Kill it
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux
```

### Database issues
```bash
# Reset database
docker compose down -v
docker compose up -d

# Connect to database
docker exec -it gobernador-db psql -U postgres -d gobernador_ia
```

### Memory issues
```bash
# Check usage
docker stats

# Increase Docker memory limit (Docker Desktop settings)
# Or in docker-compose.yml:
# services:
#   backend:
#     mem_limit: 2g
```

---

## 📦 Deployment Checklist

- [ ] `.env` configured with production secrets
- [ ] Database backups configured
- [ ] SSL/TLS certificates installed
- [ ] Health checks verified
- [ ] Monitoring/logging set up
- [ ] Backup/restore procedure tested
- [ ] Team trained on deployment
- [ ] Rollback procedure documented
- [ ] Performance baseline established
- [ ] Security audit completed

---

## 🎯 Performance Targets

- Frontend load: < 2s
- Backend response: < 200ms
- Database query: < 100ms
- Uptime: > 99.9%
- Image size: Frontend 10MB, Backend 150MB

---

## 📞 Support

**Local**: Run `gobernador logs` for diagnostics
**Cloud**: Check respective platform dashboard logs
**Database**: Use `psql` or DB management tool
**API**: Test with `curl http://localhost:8080/health`

---

**Version**: 2.0.0-fullstack  
**Last Updated**: 2026-07-08  
**Status**: Production Ready ✅
