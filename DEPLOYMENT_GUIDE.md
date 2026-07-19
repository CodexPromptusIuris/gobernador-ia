# Gobernador IA - Complete Deployment Guide

## 🚀 Quick Start

### For Non-Technical Users (Easiest)

**Windows:**
1. Double-click `gobernador.bat`
2. Wait for services to start (~2 minutes on first run)
3. Open http://localhost:5173 in your browser

**macOS/Linux:**
1. Open Terminal in the project folder
2. Run: `./gobernador.sh`
3. Open http://localhost:5173 in your browser

### What Gets Deployed

- **Frontend**: React app with 3D visualization (port 5173)
- **Backend**: Rust/Axum API server (port 8080)
- **Database**: PostgreSQL with auto-migrations (port 5432)

---

## 🔧 Configuration

### Before First Run

1. **Edit `.env` file** (located in project root)
   - Change all passwords to secure values
   - Keep at least 12+ characters
   - Avoid special characters that break shells

Example `.env`:
```
POSTGRES_PASSWORD=MySecure#Pass2024
ADMIN_PASSWORD=Admin@SecurePass123
JWT_SECRET=your-jwt-secret-min-32-chars-2024
WEBHOOK_API_KEY=webhook-secure-key-2024
```

2. **Security Checklist**
   - ✅ Change `POSTGRES_PASSWORD`
   - ✅ Change `ADMIN_PASSWORD`
   - ✅ Change `JWT_SECRET` (minimum 32 characters)
   - ✅ Change `WEBHOOK_API_KEY`
   - ✅ Never commit `.env` to git (it's in .gitignore)

---

## 📋 Available Commands

### Windows (gobernador.bat)
```bash
gobernador.bat              # Start all services
gobernador.bat start        # Start services
gobernador.bat stop         # Stop all services
gobernador.bat restart      # Restart services
gobernador.bat logs         # View live logs
gobernador.bat status       # Show container status
gobernador.bat cleanup      # Delete all data (WARNING)
```

### macOS/Linux (gobernador.sh)
```bash
./gobernador.sh            # Start all services
./gobernador.sh start      # Start services
./gobernador.sh stop       # Stop all services
./gobernador.sh restart    # Restart services
./gobernador.sh logs       # View live logs
./gobernador.sh status     # Show container status
./gobernador.sh cleanup    # Delete all data (WARNING)
```

---

## 🌐 Service URLs

Once running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Database**: `localhost:5432` (PostgreSQL)

---

## 📊 Service Status

To check if everything is working:
```bash
# Windows
gobernador.bat status

# macOS/Linux
./gobernador.sh status
```

All services should show `healthy` or `running`.

---

## 🐛 Troubleshooting

### Port Already in Use
If you see "port 5173 already in use":
```bash
# Windows: Find process on port 5173
netstat -ano | findstr :5173

# macOS/Linux: Kill process
lsof -ti:5173 | xargs kill -9
```

### Services Not Starting
```bash
# View logs for errors
# Windows
gobernador.bat logs

# macOS/Linux
./gobernador.sh logs
```

### Database Connection Failed
1. Stop all services: `gobernador stop`
2. Wait 5 seconds
3. Start again: `gobernador start`
4. Wait 30 seconds for database to initialize

### Database Disk Space Issues
```bash
# Clean up all data (WARNING - deletes everything)
# Windows
gobernador.bat cleanup

# macOS/Linux
./gobernador.sh cleanup
```

---

## 📁 Project Structure

```
.
├── gobernador.sh              # macOS/Linux launcher
├── gobernador.bat             # Windows launcher
├── docker-compose.yml         # Service orchestration
├── .env                        # Configuration (KEEP SECRET!)
├── .env.example               # Configuration template
├── backend/
│   ├── Dockerfile             # Rust service build
│   ├── Cargo.toml             # Rust dependencies
│   ├── src/
│   │   └── main.rs            # Backend entry point
│   └── migrations/            # Database migrations
├── frontend/
│   ├── Dockerfile             # React service build
│   ├── package.json           # Node dependencies
│   ├── nginx.conf             # Nginx configuration
│   ├── src/                   # React source code
│   └── index.html             # Entry HTML
```

---

## 🔐 Security Notes

### Secrets Management
- `.env` file contains all secrets and is excluded from git
- Never add `.env` to version control
- Use `gobernador.bat` or `gobernador.sh` to ensure env files are loaded

### Production Deployment
For production use:
1. Use a secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)
2. Update `FRONTEND_URL` to your production domain
3. Use HTTPS (set up reverse proxy with SSL)
4. Use strong passwords (20+ characters)
5. Rotate secrets every 90 days

---

## 📝 Logs and Monitoring

### View Real-Time Logs
```bash
# Windows
gobernador.bat logs

# macOS/Linux
./gobernador.sh logs
```

### View Specific Service Logs
```bash
# Backend
docker compose logs -f backend

# Frontend
docker compose logs -f frontend

# Database
docker compose logs -f db
```

---

## 🔄 Updating Your Application

### After Code Changes
```bash
# Windows/macOS/Linux
gobernador restart
# OR
gobernador.bat restart

# This rebuilds images and restarts services
```

### Database Migrations
Migrations run automatically on backend startup. Add new migrations in `backend/migrations/`.

---

## ⚙️ Advanced Configuration

### Change Ports
Edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "YOUR_PORT:8080"  # Change first number
```

Then restart: `gobernador restart`

### Disable Healthchecks
Remove or comment out `healthcheck:` blocks in `docker-compose.yml`.

### Increase Database Connections
Edit `backend/src/main.rs`:
```rust
.max_connections(10)  // Change from 5 to 10
```

Then restart: `gobernador restart`

---

## ✅ Checklist Before Going Live

- [ ] Changed all passwords in `.env`
- [ ] Set `FRONTEND_URL` to correct domain
- [ ] Backed up database
- [ ] Tested all endpoints
- [ ] Verified healthchecks pass
- [ ] Reviewed security settings
- [ ] Set up monitoring/logging
- [ ] Created deployment documentation

---

## 📞 Support

### Common Issues
1. **Docker not found** → Install Docker Desktop
2. **Port conflicts** → Change ports in docker-compose.yml
3. **Database won't start** → Check disk space with `docker system df`
4. **Can't reach frontend** → Check firewall settings

### Docker Cleanup
```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Full cleanup (⚠️ removes all data)
docker system prune -a --volumes
```

---

## 📦 What's Included

### Backend (Rust/Axum)
- ✅ JWT Authentication
- ✅ PostgreSQL Integration with SQLx
- ✅ CORS Configuration
- ✅ Error Handling
- ✅ Logging with Tracing
- ✅ Database Migrations
- ✅ Health Checks
- ✅ Webhook Support

### Frontend (React)
- ✅ React Router for navigation
- ✅ Vite for fast builds
- ✅ Tailwind CSS for styling
- ✅ React Three Fiber for 3D
- ✅ Context API for state
- ✅ 3D visualization components

### Docker Deployment
- ✅ Multi-stage builds for optimization
- ✅ Security best practices (non-root user, minimal images)
- ✅ Health checks for all services
- ✅ Volume persistence
- ✅ Automatic network isolation
- ✅ Restart policies

---

Last updated: 2024
Version: 1.0
