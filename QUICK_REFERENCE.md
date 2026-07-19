# 🎯 QUICK REFERENCE - All Dev Tools & Commands

## ONE-LINER COMMANDS

```bash
# ┌─────────────────────────────────────────────────────────┐
# │ DEPLOYMENT & LAUNCH                                     │
# └─────────────────────────────────────────────────────────┘
gobernador-mcp.bat                          # Windows interactive menu
./gobernador-mcp.sh                         # macOS/Linux interactive menu

# ┌─────────────────────────────────────────────────────────┐
# │ DEVELOPMENT TOOLS                                       │
# └─────────────────────────────────────────────────────────┘
node gobernador-dev.js watch                # Live reload dev environment
node gobernador-dev.js code-audit           # Security & quality scan
node gobernador-dev.js api-docs             # Generate OpenAPI + Postman
node gobernador-dev.js perf-profile         # CPU/memory/query analysis
node gobernador-dev.js db-migrate create X  # Create new migration
node gobernador-dev.js db-migrate list      # List migrations
node gobernador-dev.js db-migrate apply     # Apply migrations
node gobernador-dev.js deploy-pipeline      # Generate CI/CD configs
node code-analyzer.js                       # AI-powered code analysis

# ┌─────────────────────────────────────────────────────────┐
# │ TESTING                                                 │
# └─────────────────────────────────────────────────────────┘
bash test-runner.sh                         # Interactive test menu
cd backend && cargo test                    # Run Rust tests
cd frontend && npm test                     # Run React tests

# ┌─────────────────────────────────────────────────────────┐
# │ DEPLOYMENT                                              │
# └─────────────────────────────────────────────────────────┘
bash cloud-deploy.sh                        # Cloud deployment wizard
docker compose up -d                        # Start all services
docker compose down                         # Stop all services
docker compose logs -f                      # View live logs

# ┌─────────────────────────────────────────────────────────┐
# │ SERVICE MANAGEMENT                                      │
# └─────────────────────────────────────────────────────────┘
docker ps -a                                # List all containers
docker stats                                # View resource usage
docker exec -it gobernador-db bash          # Access database
docker volumes prune                        # Clean up volumes
docker system prune -a                      # Full cleanup
```

---

## KEYBOARD SHORTCUTS IN INTERACTIVE MENUS

### Windows (gobernador-mcp.bat)
| Key | Action |
|-----|--------|
| 1-9 | Select option |
| 0 | Help |
| Ctrl+C | Exit |

### macOS/Linux (gobernador-mcp.sh)
| Key | Action |
|-----|--------|
| 1-10 | Select option |
| 0 | Exit |
| Ctrl+C | Cancel/Exit |

---

## DEVELOPMENT WORKFLOW CHEAT SHEET

### Morning: Start Development
```bash
# 1. Pull latest
git pull origin develop

# 2. Start watch mode (auto-reload)
node gobernador-dev.js watch

# 3. Work on code (frontend/src/ and backend/src/)
# Changes auto-rebuild and reload

# 4. Open browser
# Frontend: http://localhost:5173
# Backend: http://localhost:8080
```

### Mid-Day: Test & Verify
```bash
# 1. Run tests
bash test-runner.sh
# Select: 8 (all tests)

# 2. Code quality check
node gobernador-dev.js code-audit

# 3. Performance check
node gobernador-dev.js perf-profile

# 4. AI code analysis
node code-analyzer.js
```

### End-of-Day: Commit & Push
```bash
# 1. Check git status
git status

# 2. Stage changes
git add .

# 3. Commit with message
git commit -m "feat: add new feature"

# 4. Push
git push origin develop

# (GitHub Actions/GitLab CI runs automatically)
```

### Production Release
```bash
# 1. Test everything
bash test-runner.sh 8

# 2. Code audit
node gobernador-dev.js code-audit

# 3. Create release PR
git checkout -b release/v2.1.0
git push origin release/v2.1.0

# 4. Deploy
bash cloud-deploy.sh
# Select your cloud provider
```

---

## ENVIRONMENT SETUP

### First-Time Setup (5 minutes)
```bash
# 1. Install prerequisites
# - Docker Desktop: https://docker.com/products/docker-desktop
# - Git: https://git-scm.com
# - Node.js 18+: https://nodejs.org

# 2. Clone & setup
git clone <your-repo>
cd gobernador
cp .env.mcp .env

# 3. Configure API keys in .env
# OpenAI: https://platform.openai.com/api-keys
# Claude: https://console.anthropic.com/
# etc...

# 4. Start
./gobernador-mcp.sh (option 2: Hybrid)
# or
gobernador-mcp.bat (option 2: Hybrid)

# 5. Open browser
# http://localhost:5173
```

---

## SERVICE ENDPOINTS & HEALTH CHECKS

```bash
# ┌──────────────────────────────────────────┐
# │ Frontend (React)                         │
# └──────────────────────────────────────────┘
http://localhost:5173              Main app
http://localhost:5173/admin        Admin panel (if exists)

# ┌──────────────────────────────────────────┐
# │ Backend API (Rust)                       │
# └──────────────────────────────────────────┘
http://localhost:8080/health       Health check
http://localhost:8080/api/stats    Statistics
http://localhost:8080/api/auth/login  Authentication

# ┌──────────────────────────────────────────┐
# │ AI & LLM Services                        │
# └──────────────────────────────────────────┘
http://localhost:3001/health       MCP Server
http://localhost:3001/models       List available models
http://localhost:8888/health       Docker Agent
http://localhost:11434/api/tags    Ollama models

# ┌──────────────────────────────────────────┐
# │ Vector Database & Storage                │
# └──────────────────────────────────────────┘
http://localhost:6333/health       Qdrant vector DB
localhost:5432                     PostgreSQL database

# Health Check All Services
curl http://localhost:5173
curl http://localhost:8080/health
curl http://localhost:3001/health
curl http://localhost:11434/api/tags
curl http://localhost:6333/health
```

---

## DOCKER COMMANDS REFERENCE

```bash
# ┌──────────────────────────────────────────┐
# │ Container Management                     │
# └──────────────────────────────────────────┘
docker ps                          List running containers
docker ps -a                       List all containers
docker inspect <container>         View container details
docker logs <container>            View container logs
docker logs -f <container>         Stream live logs
docker exec -it <container> bash   SSH into container
docker restart <container>         Restart container
docker stop $(docker ps -q)        Stop all containers
docker rm <container>              Remove container
docker kill <container>            Force stop container

# ┌──────────────────────────────────────────┐
# │ Image Management                         │
# └──────────────────────────────────────────┘
docker images                      List images
docker build -t name .             Build image
docker push name                   Push to registry
docker pull name                   Pull from registry
docker rmi <image>                 Remove image
docker system prune -a             Clean up all unused

# ┌──────────────────────────────────────────┐
# │ Volume & Data Management                 │
# └──────────────────────────────────────────┘
docker volume ls                   List volumes
docker volume inspect <vol>        Volume details
docker volume rm <vol>             Remove volume
docker exec gobernador-db pg_dump -U postgres gobernador_ia > backup.sql
cat backup.sql | docker exec -i gobernador-db psql -U postgres gobernador_ia

# ┌──────────────────────────────────────────┐
# │ Network & Monitoring                     │
# └──────────────────────────────────────────┘
docker network ls                  List networks
docker network inspect <net>       Network details
docker stats                       Resource usage
docker stats --no-stream           One-time snapshot
docker events                      Stream docker events
docker system df                   Disk usage
```

---

## GIT COMMANDS FOR DEVELOPMENT

```bash
# ┌──────────────────────────────────────────┐
# │ Branching                                │
# └──────────────────────────────────────────┘
git checkout -b feature/new-feature  Create new branch
git checkout develop                 Switch to develop
git push origin feature/new-feature  Push feature branch
git pull origin develop              Get latest

# ┌──────────────────────────────────────────┐
# │ Commits                                  │
# └──────────────────────────────────────────┘
git status                          Check status
git add .                           Stage all changes
git add <file>                      Stage specific file
git commit -m "message"             Commit with message
git log --oneline                   View commit history
git diff                            Show changes
git revert <commit>                 Undo commit

# ┌──────────────────────────────────────────┐
# │ Merging & Pull Requests                  │
# └──────────────────────────────────────────┘
git merge develop                   Merge branch
git merge --abort                   Cancel merge
# Then create PR on GitHub/GitLab for review

# ┌──────────────────────────────────────────┐
# │ Cleanup                                  │
# └──────────────────────────────────────────┘
git branch -d <branch>              Delete branch
git remote prune origin             Clean stale branches
git clean -fd                       Remove untracked files
```

---

## DATABASE OPERATIONS

```bash
# Access PostgreSQL
docker exec -it gobernador-db psql -U postgres -d gobernador_ia

# ┌──────────────────────────────────────────┐
# │ Inside psql                              │
# └──────────────────────────────────────────┘
\dt                                List tables
\d <table>                         Show table structure
\l                                 List databases
SELECT * FROM <table> LIMIT 5;     Query data
CREATE TABLE ...;                  Create table
\q                                 Exit psql

# Backup database
docker exec gobernador-db pg_dump -U postgres gobernador_ia > backup.sql

# Restore database
cat backup.sql | docker exec -i gobernador-db psql -U postgres gobernador_ia

# Clear database (WARNING: deletes all data!)
docker exec gobernador-db psql -U postgres -d gobernador_ia -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

---

## API TESTING WITH CURL

```bash
# ┌──────────────────────────────────────────┐
# │ GET Request                              │
# └──────────────────────────────────────────┘
curl http://localhost:8080/health

# ┌──────────────────────────────────────────┐
# │ POST Request with JSON                   │
# └──────────────────────────────────────────┘
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# ┌──────────────────────────────────────────┐
# │ POST with Authentication                 │
# └──────────────────────────────────────────┘
curl -X POST http://localhost:8080/api/audit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"data": "value"}'

# ┌──────────────────────────────────────────┐
# │ File Upload                              │
# └──────────────────────────────────────────┘
curl -X POST http://localhost:8080/api/documents/upload \
  -F "file=@document.pdf"

# ┌──────────────────────────────────────────┐
# │ Save Response to File                    │
# └──────────────────────────────────────────┘
curl http://localhost:8080/api/stats > stats.json

# ┌──────────────────────────────────────────┐
# │ Measure Response Time                    │
# └──────────────────────────────────────────┘
curl -w "\n%{time_total}s\n" http://localhost:8080/health
```

---

## ENVIRONMENT VARIABLES QUICK REFERENCE

```bash
# ┌──────────────────────────────────────────┐
# │ Required (must set in .env)              │
# └──────────────────────────────────────────┘
DATABASE_URL              PostgreSQL connection string
PORT                      Backend port (default: 8080)
JWT_SECRET                Secret key for JWT (32+ chars)
FRONTEND_URL              Frontend URL (http://localhost:5173)

# ┌──────────────────────────────────────────┐
# │ Cloud LLM API Keys (optional)            │
# └──────────────────────────────────────────┘
OPENAI_API_KEY            OpenAI/ChatGPT
ANTHROPIC_API_KEY         Claude
GOOGLE_API_KEY            Gemini
COHERE_API_KEY            Cohere
MISTRAL_API_KEY           Mistral

# ┌──────────────────────────────────────────┐
# │ Deployment Settings                      │
# └──────────────────────────────────────────┘
DEPLOYMENT_MODE           local|hybrid|cloud
AGENT_MODE                local|remote
LOG_LEVEL                 debug|info|warn|error
DEBUG                     true|false
```

---

## COMMON ERROR SOLUTIONS

| Error | Solution |
|-------|----------|
| "Port 5173 already in use" | `lsof -ti:5173 \| xargs kill -9` |
| "Docker daemon not running" | Start Docker Desktop |
| "Permission denied" | `chmod +x *.sh` |
| "Cannot connect to PostgreSQL" | Wait 30s for db to start, check `.env` |
| "Node modules not found" | `npm install` in frontend/ |
| "API returns 401" | Check JWT token, add Authorization header |
| "Out of memory" | `docker stats`, reduce services or increase Docker resources |
| "Too many open files" | `ulimit -n 65536` |

---

## PERFORMANCE OPTIMIZATION TIPS

```bash
# Reduce image sizes
docker buildx build --compress ...

# Increase cache hits
docker builder prune --filter type=build-cache

# Monitor resource usage
docker stats --no-stream

# Optimize database queries
EXPLAIN ANALYZE SELECT ...;

# Clear Docker system
docker system prune -a --volumes

# Build without cache
docker compose build --no-cache
```

---

## USEFUL ALIASES (Add to .bashrc or .zshrc)

```bash
alias gstart='./gobernador-mcp.sh'
alias gwatch='node gobernador-dev.js watch'
alias gtest='bash test-runner.sh'
alias gaudti='node gobernador-dev.js code-audit'
alias gdeploy='bash cloud-deploy.sh'
alias dlogs='docker compose logs -f'
alias dstats='docker stats --no-stream'
```

---

**Save this for quick reference! 🚀**
