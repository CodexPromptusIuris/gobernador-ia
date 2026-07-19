# 🛠️ Developer Toolkit - Complete Guide

Your Gobernador IA stack now includes **6 powerful integrated dev tools**. Here's how to use them all.

---

## 📋 Quick Reference

| Tool | Command | Purpose |
|------|---------|---------|
| **Code Audit** | `node gobernador-dev.js code-audit` | Find bugs & security issues |
| **DB Migrations** | `node gobernador-dev.js db-migrate` | Manage database schema |
| **API Docs** | `node gobernador-dev.js api-docs` | Auto-generate Postman/OpenAPI |
| **Performance** | `node gobernador-dev.js perf-profile` | Profile CPU, memory, queries |
| **CI/CD Pipeline** | `node gobernador-dev.js deploy-pipeline` | Generate GitHub/GitLab configs |
| **Dev Watch** | `node gobernador-dev.js watch` | Live reload with Docker |
| **Code Analyzer** | `node code-analyzer.js` | AI-powered code analysis |
| **Test Runner** | `bash test-runner.sh` | Complete testing suite |
| **Cloud Deploy** | `bash cloud-deploy.sh` | Deploy to AWS/Azure/GCP/etc |

---

## 🔍 TOOL 1: CODE AUDIT

Automatically scan your code for bugs, security issues, and performance problems.

### Usage
```bash
node gobernador-dev.js code-audit
```

### What It Does
✅ Scans Rust backend for:
- Unsafe code blocks
- Unwrap() calls without error handling
- TODO/FIXME comments
- Dangerous functions (eval, exec)

✅ Scans React frontend for:
- XSS vulnerabilities (dangerouslySetInnerHTML)
- eval() usage
- State management issues
- Performance issues

✅ Runs `cargo clippy` for detailed Rust analysis

### Output
```
🔍 CODE QUALITY & SECURITY AUDIT

❌ CRITICAL ISSUES: 2
  ⚠️  UNSAFE CODE: backend/src/crypto.rs
  ⚠️  DANGEROUS EXEC: backend/src/agent.rs

⚠️  WARNINGS: 3
  ⚠️  unwrap() without error handling: backend/src/main.rs

ℹ️  INFO: 5
  ℹ️  TODO/FIXME: backend/src/handlers.rs
```

---

## 📦 TOOL 2: DATABASE MIGRATIONS

Manage your PostgreSQL schema with version control.

### Usage

**Create a new migration:**
```bash
node gobernador-dev.js db-migrate create add_users_table
```

**List all migrations:**
```bash
node gobernador-dev.js db-migrate list
```

**Apply migrations:**
```bash
node gobernador-dev.js db-migrate apply
```

### Example

```bash
# 1. Create migration
node gobernador-dev.js db-migrate create create_audit_table

# 2. Edit backend/migrations/1705123456_create_audit_table.sql
# Add your SQL:
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# 3. Apply to database
node gobernador-dev.js db-migrate apply
```

### Migration Files Location
```
backend/migrations/
├── 1705123456_create_users_table.sql
├── 1705123457_add_email_column.sql
└── 1705123458_create_audit_table.sql
```

---

## 📚 TOOL 3: API DOCUMENTATION

Auto-generate OpenAPI spec and Postman collection from your API routes.

### Usage
```bash
node gobernador-dev.js api-docs
```

### Output Files
- `API_OPENAPI.json` - OpenAPI 3.0 specification
- `Gobernador_API_Postman.json` - Postman collection

### Viewing Documentation

**Option 1: Swagger UI (online)**
```
https://editor.swagger.io/?url=file:///path/to/API_OPENAPI.json
```

**Option 2: Import to Postman**
1. Open Postman
2. Click "Import"
3. Select `Gobernador_API_Postman.json`
4. Click "Import"

**Option 3: Local Swagger UI**
```bash
docker run -p 8081:8080 \
  -v $(pwd)/API_OPENAPI.json:/openapi.json \
  -e SWAGGER_JSON=/openapi.json \
  swaggerapi/swagger-ui
# Open http://localhost:8081
```

### API Endpoints (Auto-documented)
```
POST /api/auth/login
  Login with username/password → returns JWT token

GET /api/stats
  Get application statistics

GET /api/audit/:trace_id
  Get specific audit record

POST /api/review/:trace_id
  Submit review for audit

POST /api/agent/execute
  Execute AI agent task
```

---

## ⚡ TOOL 4: PERFORMANCE PROFILER

Track CPU, memory, response times, and database performance.

### Usage
```bash
node gobernador-dev.js perf-profile
```

### What It Measures

**Container Stats:**
```
CONTAINER              CPU     MEM
gobernador-backend     2.5%    120MB
gobernador-frontend    0.8%    50MB
gobernador-db          1.2%    200MB
```

**Response Times:**
```
Health check: 12ms ✅
Stats endpoint: 45ms ✅
Login endpoint: 120ms ✅
```

**Database Performance:**
- Query timeout: 30s
- Connection pool: 5-20 connections
- Idle timeout: 600s

**Disk Usage:**
```
TYPE        SIZE      RECLAIMABLE
Images      520MB     150MB
Containers  80MB      60MB
Volumes     2GB       0MB
```

### Optimization Tips

If **CPU > 50%:**
```bash
# Increase resources in docker-compose.yml
docker compose down
docker compose up -d
```

If **Memory > 500MB:**
```bash
# Reduce connection pool in backend/src/main.rs
.max_connections(10)  # was 20
```

If **Response times > 200ms:**
```bash
# Check database slow queries
docker exec gobernador-db psql -U postgres -d gobernador_ia \
  -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

---

## 🚀 TOOL 5: CI/CD PIPELINE GENERATOR

Auto-generate GitHub Actions and GitLab CI configurations.

### Usage
```bash
node gobernador-dev.js deploy-pipeline
```

### Generated Files
- `.github/workflows/deploy.yml` - GitHub Actions
- `.gitlab-ci.yml` - GitLab CI

### GitHub Actions Setup

**1. Push to main branch:**
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions CI/CD"
git push origin main
```

**2. Add secrets in GitHub:**
- Go to Settings → Secrets → New repository secret
- Add `DEPLOY_HOST` (your server IP)
- Add `DEPLOY_KEY` (SSH private key)

**3. Automatic deployment:**
- Every push to `main` triggers the pipeline
- Tests run automatically
- Deploys to production on success

### GitLab CI Setup

**1. Push to main branch:**
```bash
git add .gitlab-ci.yml
git commit -m "Add GitLab CI/CD"
git push origin main
```

**2. Add variables in GitLab:**
- Go to CI/CD → Variables
- Add `DEPLOY_HOST` (your server IP)
- Add `DEPLOY_KEY` (SSH private key)

**3. Automatic deployment:**
- Pipeline runs on every push
- Builds Docker images
- Pushes to registry
- Deploys on success

---

## 👀 TOOL 6: DEV WATCH MODE

Start development environment with automatic live reload.

### Usage
```bash
node gobernador-dev.js watch
```

### What Happens
1. Starts all Docker services
2. Watches backend/src for changes
3. Watches frontend/src for changes
4. Auto-rebuilds and restarts services

### Service URLs
```
Frontend:  http://localhost:5173 (auto-reload on save)
Backend:   http://localhost:8080 (restart on changes)
MCP:       http://localhost:3001
Ollama:    http://localhost:11434
```

### Workflow

**Edit frontend/src/App.jsx:**
```
File saved → Vite detects change → Browser auto-refreshes
```

**Edit backend/src/handlers.rs:**
```
File saved → Watch detects change → Cargo rebuilds → Container restarts
```

### Development Tips
- Use VS Code with Live Server for faster reload
- Open DevTools console (F12) to see errors
- Check logs with `docker compose logs -f`

---

## 🔥 TOOL 7: CODE ANALYZER (AI-POWERED)

Get AI suggestions for code improvements using LLM integration.

### Usage
```bash
node code-analyzer.js
```

### Features

**Detects:**
- Inefficient patterns
- Memory leaks
- Security issues
- Performance bottlenecks

**Suggests:**
- Refactoring improvements
- Best practices
- Performance optimizations
- Security hardening

### Example Output

```
🔥 CODE ANALYZER & AUTO-FIXER

🔍 Scanning codebase...

⚠️  WARNINGS:
  backend/src/handlers.rs: unwrap() without error handling
  backend/src/handlers.rs: Multiple .clone() calls detected

🤖 AI SUGGESTIONS:

💡 For unwrap() issues:
  Replace unwrap() with expect() or use ? operator for error propagation
  Example: value.expect("descriptive error message")

💡 For clone() issues:
  Consider using Arc<T> for shared ownership
  Or use references: &data instead of data.clone()
```

---

## 🧪 TOOL 8: TEST RUNNER

Comprehensive testing suite with coverage reports.

### Usage
```bash
bash test-runner.sh
```

### Test Options

**1. Unit Tests (Rust):**
```bash
cd backend
cargo test --verbose
```

**2. Unit Tests (React):**
```bash
cd frontend
npm test -- --watch=false --coverage
```

**3. Integration Tests:**
```bash
# Tests: Backend + Database + Frontend
docker exec gobernador-backend curl -f http://localhost:8080/health
```

**4. E2E Tests:**
```bash
# Tests all API endpoints
curl http://localhost:8080/api/stats
curl http://localhost:5173
```

**5. Coverage Reports:**
```bash
# Generate HTML coverage reports in:
# /backend/coverage
# /frontend/coverage
```

**6. Benchmarks:**
```bash
# Performance benchmarks
# Response times
# Container stats
# Database queries
```

**7. Security Audit:**
```bash
# Check dependencies for vulnerabilities
cargo audit
npm audit
docker scan
```

### Coverage Targets
- Backend: Aim for >80% coverage
- Frontend: Aim for >70% coverage
- Critical paths: 100% coverage required

---

## 🚀 TOOL 9: CLOUD DEPLOYMENT

One-click deployment to any major cloud provider.

### Usage
```bash
bash cloud-deploy.sh
```

### Supported Platforms

**1. AWS (Most popular)**
```bash
# Options:
# - ECS (containers)
# - EC2 (virtual machines)
# - Lightsail (simple, affordable)
# - EKS (Kubernetes)

# Prerequisites:
AWS CLI + credentials configured
```

**2. DigitalOcean (Fastest setup)**
```bash
# Uses App Platform for one-click deployment
# Prerequisites:
doctl CLI + token configured
```

**3. Azure (Enterprise)**
```bash
# Options:
# - Container Instances
# - App Service
# - Kubernetes

# Prerequisites:
Azure CLI + account login
```

**4. Google Cloud (Best for scale)**
```bash
# Uses Cloud Run for serverless deployment
# Auto-scaling, pay-as-you-go

# Prerequisites:
gcloud CLI + account login
```

**5. Heroku (Easiest for beginners)**
```bash
# One-command deployment
# Built-in PostgreSQL support

# Prerequisites:
Heroku CLI + account login
```

**6. Self-hosted (Full control)**
```bash
# Deploy to your own VPS or server
# Full control over infrastructure

# Prerequisites:
Linux VPS with SSH access + Docker installed
```

### Deployment Flow

```
1. Choose provider
   ↓
2. Configure credentials
   ↓
3. Run deployment script
   ↓
4. Services start automatically
   ↓
5. App accessible at public URL
```

### Post-Deployment

**Set environment variables:**
```bash
DEPLOYMENT_MODE=production
PORT=8080
OPENAI_API_KEY=your-key
# etc...
```

**Monitor deployment:**
```bash
# View logs
docker compose logs -f

# Check status
docker ps

# Performance metrics
docker stats
```

---

## 📊 Full Development Workflow

### Day 1: Initial Setup
```bash
1. Clone repo & cd into project
2. cp .env.mcp .env
3. Edit .env with your API keys
4. node gobernador-dev.js watch
5. Open http://localhost:5173
```

### Daily Development
```bash
1. Start watch mode:
   node gobernador-dev.js watch

2. Make code changes

3. Auto-reload happens (saves manual restart)

4. Run tests:
   bash test-runner.sh

5. Check code quality:
   node gobernador-dev.js code-audit

6. Performance profile:
   node gobernador-dev.js perf-profile
```

### Before Production
```bash
1. Run all tests:
   bash test-runner.sh 8  # Option 8: all tests

2. Code audit:
   node gobernador-dev.js code-audit

3. Generate CI/CD:
   node gobernador-dev.js deploy-pipeline

4. Push to GitHub/GitLab

5. Deploy:
   bash cloud-deploy.sh
```

---

## 🆘 Troubleshooting

### "Services won't start"
```bash
docker compose -f docker-compose-mcp.yml logs
docker ps -a
```

### "Watch mode isn't working"
```bash
# Install chokidar if missing
npm install chokidar

# Check file watcher limits (Linux)
cat /proc/sys/fs/inotify/max_user_watches
# Should be > 8000, increase if needed:
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
```

### "API docs won't generate"
```bash
# Make sure you have read permissions on source files
chmod +r backend/src/*.rs
chmod +r frontend/src/*.jsx
```

### "Cloud deployment fails"
```bash
# Check cloud credentials
aws configure  (for AWS)
doctl auth list  (for DigitalOcean)
az account show  (for Azure)
```

---

## 📚 Learning Resources

- **Docker:** https://docs.docker.com
- **Rust:** https://doc.rust-lang.org/book/
- **React:** https://react.dev
- **PostgreSQL:** https://postgresql.org/docs
- **GitHub Actions:** https://docs.github.com/actions

---

## 🎯 What's Next?

1. ✅ **Run dev tools:** Start with `node gobernador-dev.js watch`
2. ✅ **Write tests:** Add tests for your features
3. ✅ **CI/CD setup:** Configure GitHub Actions/GitLab CI
4. ✅ **Deploy:** Use cloud-deploy.sh for production
5. ✅ **Monitor:** Use perf-profile regularly

---

**Happy developing! 🚀**
