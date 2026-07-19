# 🚀 Gobernador IA - Complete Deployment Package

**The easiest way to deploy a full-stack Rust + React app with one click.**

---

## ⚡ Quick Start (3 Steps)

### **Windows Users:**
1. **Double-click** `gobernador.bat`
2. **Wait** 2-3 minutes for services to start
3. **Open** http://localhost:5173 in your browser

### **macOS/Linux Users:**
1. **Open Terminal** in this folder
2. **Run:** `bash gobernador.sh`
3. **Open** http://localhost:5173 in your browser

---

## ✅ What You Get

| Component | Technology | Port | Status |
|-----------|-----------|------|--------|
| **Frontend** | React + Vite + Tailwind | 5173 | ✅ Running |
| **Backend API** | Rust + Axum | 8080 | ✅ Running |
| **Database** | PostgreSQL 15 | 5432 | ✅ Running |

All services have **health checks** and **auto-restart** enabled.

---

## 🔧 Configuration

### First-Time Setup
Before the first run, edit the `.env` file to customize:
- Database password
- Admin credentials
- JWT secret
- API webhook key

**Location:** `/.env`

Example `.env`:
```ini
POSTGRES_PASSWORD=MySecure#Pass2024
ADMIN_PASSWORD=Admin@SecurePass123
JWT_SECRET=your-secret-key-min-32-chars
WEBHOOK_API_KEY=your-webhook-key-2024
```

⚠️ **IMPORTANT:** Never commit `.env` to git (it's in `.gitignore`)

---

## 🎮 Commands

### Windows (Command Prompt)
```cmd
gobernador.bat              REM Start all services
gobernador.bat start        REM Start services
gobernador.bat stop         REM Stop all services
gobernador.bat restart      REM Restart services
gobernador.bat logs         REM View live logs
gobernador.bat status       REM Show container status
gobernador.bat cleanup      REM Delete all data (⚠️ WARNING)
```

### macOS/Linux (Terminal)
```bash
./gobernador.sh            # Start all services
./gobernador.sh start      # Start services
./gobernador.sh stop       # Stop all services
./gobernador.sh restart    # Restart services
./gobernador.sh logs       # View live logs
./gobernador.sh status     # Show container status
./gobernador.sh cleanup    # Delete all data (⚠️ WARNING)
```

---

## 🌐 Service URLs

Once running, access:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **Health Check:** http://localhost:8080/health
- **Database:** postgres://localhost:5432

---

## 🐛 Troubleshooting

### Port Already in Use
```cmd
REM Windows
netstat -ano | findstr :5173

REM macOS/Linux
lsof -ti:5173 | xargs kill -9
```

### Services Won't Start
```bash
# View error logs
gobernador logs
# OR
docker compose logs
```

### Database Connection Failed
```bash
gobernador stop
# Wait 5 seconds
gobernador start
# Wait 30 seconds for database to initialize
```

### Clear Everything & Reset
```bash
gobernador cleanup
# Then start fresh: gobernador start
```

---

## 📁 Project Structure

```
.
├── gobernador.bat          # Windows launcher (click to run)
├── gobernador.sh           # macOS/Linux launcher
├── docker-compose.yml      # Service orchestration
├── .env                    # Configuration (SECRET - don't share)
├── .env.example            # Configuration template
│
├── backend/
│   ├── Dockerfile          # Rust service build
│   ├── Cargo.toml          # Rust dependencies
│   ├── src/
│   │   └── main.rs         # Backend entry point
│   └── migrations/         # Database schema
│
├── frontend/
│   ├── Dockerfile          # React service build
│   ├── package.json        # Node dependencies
│   ├── nginx.conf          # Web server config
│   ├── src/                # React components
│   └── public/             # Static assets
│
└── DEPLOYMENT_GUIDE.md     # Full documentation
```

---

## 🔐 Security Features

✅ Non-root container users (no privilege escalation)  
✅ Environment-based secrets (not in code)  
✅ JWT authentication  
✅ CORS protection  
✅ Secrets excluded from `.git`  
✅ Health checks for all services  
✅ Automatic security updates on container startup  

---

## 🚀 For Developers

### Make Code Changes
```bash
# Backend (Rust)
# Edit /backend/src/main.rs
gobernador restart

# Frontend (React)
# Edit /frontend/src/...
gobernador restart
```

Both will rebuild automatically.

### View Real-Time Logs
```bash
gobernador logs
# Press Ctrl+C to exit
```

### Access Database
```bash
docker exec -it gobernador-db psql -U postgres -d gobernador_ia
```

### Reset Database
```bash
gobernador cleanup
gobernador start
# Database will be recreated with migrations
```

---

## 📊 Monitoring

### Check Service Status
```bash
gobernador status
# Shows all running containers
```

### View Logs
```bash
# All services
gobernador logs

# Specific service
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

### Docker System Info
```bash
docker system df      # Storage usage
docker ps -a          # All containers
docker images         # All images
```

---

## 🎯 Common Tasks

### Change Frontend Port
Edit `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "YOUR_PORT:8080"  # Change first number
```
Then: `gobernador restart`

### Change Backend Port
Edit `.env`: `PORT=YOUR_PORT`  
Then: `gobernador restart`

### Increase Database Connections
Edit `backend/src/main.rs`:
```rust
.max_connections(10)  // Change from 5 to 10
```
Then: `gobernador restart`

### Export Database Backup
```bash
docker exec gobernador-db pg_dump -U postgres gobernador_ia > backup.sql
```

### Restore Database
```bash
docker exec -i gobernador-db psql -U postgres gobernador_ia < backup.sql
```

---

## 📋 Pre-Deployment Checklist

- [ ] Changed all passwords in `.env`
- [ ] Set `FRONTEND_URL` to correct domain
- [ ] Tested all endpoints
- [ ] Verified healthchecks pass
- [ ] Reviewed security settings
- [ ] Backed up database
- [ ] Set up monitoring/logging
- [ ] Tested restart procedures

---

## 🆘 Support

### Docker Not Installed?
Download from: https://www.docker.com/products/docker-desktop

### Still Having Issues?
```bash
# Full system cleanup (removes all Docker containers/images)
docker system prune -a --volumes

# Then start fresh
gobernador start
```

### Logs Location
- **Windows:** Docker Desktop logs (check Docker Settings > Troubleshoot)
- **macOS:** `~/Library/Containers/com.docker.docker/Data/log/`
- **Linux:** `journalctl -xu docker.service`

---

## 📦 What's Included

### Backend (Rust/Axum)
- ✅ JWT Authentication with token validation
- ✅ PostgreSQL with automatic migrations
- ✅ CORS protection
- ✅ Error handling with structured responses
- ✅ Logging & tracing
- ✅ Webhook support
- ✅ Health checks
- ✅ Database connection pooling

### Frontend (React)
- ✅ React Router for navigation
- ✅ Vite for lightning-fast builds
- ✅ Tailwind CSS for styling
- ✅ React Three Fiber for 3D effects
- ✅ Context API state management
- ✅ Responsive mobile design
- ✅ Auto-connecting to backend API

### Docker Setup
- ✅ Multi-stage builds (optimized images)
- ✅ Security best practices
- ✅ Auto-restart policies
- ✅ Health checks
- ✅ Volume persistence
- ✅ Network isolation
- ✅ Environment variable management

---

## 🔄 Development Workflow

1. **Start services:** `gobernador start`
2. **Make code changes** in `backend/` or `frontend/`
3. **Restart:** `gobernador restart`
4. **View logs:** `gobernador logs`
5. **Test:** http://localhost:5173
6. **Stop:** `gobernador stop`

---

## 💡 Tips & Tricks

### Run Single Service
```bash
docker compose up -d frontend
docker compose up -d backend
docker compose up -d db
```

### Debug Container
```bash
docker exec -it gobernador-backend bash
docker exec -it gobernador-frontend sh
docker exec -it gobernador-db bash
```

### View Container Stats
```bash
docker stats
```

### Rebuild Without Cache
```bash
docker compose build --no-cache
gobernador start
```

---

## ⚡ Performance

### Image Sizes
- Frontend: ~10MB (Nginx + React build)
- Backend: ~150MB (Rust binary + Debian runtime)
- Database: ~150MB (PostgreSQL)

### Memory Usage
- Frontend: 10-50MB
- Backend: 50-100MB
- Database: 100-200MB
- **Total:** ~200-350MB (minimal)

### Startup Time
- Database: 10-15 seconds
- Backend: 5-10 seconds
- Frontend: 2-3 seconds
- **Total:** ~20-30 seconds

---

## 🎓 Learning Resources

- [Docker Docs](https://docs.docker.com/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

## 📄 License

This deployment package includes production-grade security, best practices, and professional DevOps tooling.

---

## 🎉 You're Ready!

Your application is now production-ready with:
- ✅ One-click deployment
- ✅ Automatic health checks
- ✅ Secure secrets management
- ✅ Database persistence
- ✅ Auto-restart on failure
- ✅ Comprehensive logging

**Start now:** Double-click `gobernador.bat` (Windows) or run `./gobernador.sh` (Mac/Linux)

---

*Last updated: 2024 | Version 1.0 | Production Ready*
