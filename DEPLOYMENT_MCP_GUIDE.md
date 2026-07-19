# 🚀 Gobernador IA - Full MCP/LLM Deployment Guide

## Quick Start (Choose Your Setup)

### **Windows Users (30 seconds)**
```cmd
REM Just double-click this file:
gobernador-mcp.bat

REM Or run from Command Prompt:
gobernador-mcp.bat
```

### **macOS/Linux Users (30 seconds)**
```bash
# Make script executable (first time only)
chmod +x gobernador-mcp.sh

# Run the launcher
./gobernador-mcp.sh
```

---

## 📋 Four Deployment Modes

### **1. LOCAL MODE** ✅ Fastest, Privacy-First
```bash
# What you get:
- Full-stack app (React + Rust backend + PostgreSQL)
- Ollama for local AI models (Llama 2, Mistral, etc)
- Zero internet required
- Perfect for: Testing, development, offline environments

# Setup time: 5 minutes
# Launch: gobernador-mcp.bat (option 1) or ./gobernador-mcp.sh (option 1)
```

**Available Models (download in launcher):**
- `llama2` - 7B, best for most tasks
- `mistral` - 7B, faster
- `neural-chat` - 7B, optimized for chat
- `dolphin-mixtral` - 8x7B, very capable
- `nomic-embed-text` - for embeddings/search

---

### **2. HYBRID MODE** ⭐ Recommended for Production
```bash
# What you get:
- Full LOCAL setup above
- PLUS cloud LLM fallback: OpenAI, Claude, Gemini, Cohere
- Auto-selects best provider per task
- Cost-effective (uses local first, upgrades for complex tasks)

# Setup time: 10 minutes
# Launch: gobernador-mcp.bat (option 2) or ./gobernador-mcp.sh (option 2)

# First time setup:
1. Choose option 2 in launcher
2. Edit .env with your API keys (or skip for local-only)
3. Keys available at:
   - OpenAI: https://platform.openai.com/api-keys
   - Claude: https://console.anthropic.com/
   - Google: https://makersuite.google.com/app/apikey
   - Cohere: https://dashboard.cohere.com/api-keys
```

---

### **3. FULL STACK** 🤖 For AI Agents
```bash
# What you get:
- Everything in HYBRID
- PLUS Docker Agent for AI-powered automation
- PLUS MCP (Model Context Protocol) server
- PLUS Qdrant vector database for semantic search & RAG

# Setup time: 15 minutes
# Launch: gobernador-mcp.bat (option 3) or ./gobernador-mcp.sh (option 3)

# Use cases:
- AI-powered code generation
- Automated deployment
- Document analysis and RAG
- Multi-agent workflows
```

---

### **4. CLOUD ONLY** ☁️ For Performance
```bash
# What you get:
- Full app without local Ollama
- Uses ONLY cloud LLMs (faster, more capable)
- Requires valid API keys

# Setup time: 5 minutes
# Launch: gobernador-mcp.bat (option 4) or ./gobernador-mcp.sh (option 4)

# Best for:
- Production deployments
- High-performance requirements
- Team environments
```

---

## 🎯 Service URLs (After Launch)

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | React web app |
| **Backend API** | http://localhost:8080 | REST API |
| **MCP Server** | http://localhost:3001 | LLM coordination |
| **Docker Agent** | http://localhost:8888 | AI automation |
| **Ollama** | http://localhost:11434 | Local AI models |
| **Qdrant** | http://localhost:6333 | Vector database |
| **Database** | localhost:5432 | PostgreSQL |

---

## 🔧 Management Commands

After launching, use the interactive menu for:

**Status & Monitoring:**
- `5` - View all running services
- `6` - Stream live logs
- `docker ps -a` - List containers

**Service Control:**
- `7` - Stop all services
- `8` - Restart all services
- `gobernador-mcp.bat status` (Windows)

**Model Management:**
- `10` - Download Ollama models
- `docker exec gobernador-ollama ollama list` - See installed models
- `docker exec gobernador-ollama ollama pull mistral` - Download specific model

**Configuration:**
- `9` - Setup LLM API keys
- Edit `.env` directly for advanced settings

---

## 📡 Using the LLM APIs

### **Quick Chat Example**
```bash
# Using Ollama (local, free)
curl -X POST http://localhost:3001/llm/ollama/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "What is Docker?",
    "model": "llama2"
  }'

# Using OpenAI (cloud, paid)
curl -X POST http://localhost:3001/llm/openai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What is Docker?"}],
    "model": "gpt-4-turbo"
  }'

# Auto-select best provider
curl -X POST http://localhost:3001/llm/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain REST APIs",
    "task": "general"
  }'
```

---

## 🔍 Semantic Search & RAG

```bash
# Store documents in vector database
curl -X POST http://localhost:3001/qdrant/store \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "docs",
    "documents": [
      {
        "content": "Docker is a containerization platform...",
        "metadata": {"source": "docker-intro", "type": "tutorial"}
      }
    ]
  }'

# Search semantically
curl -X POST http://localhost:3001/qdrant/search \
  -H "Content-Type: application/json" \
  -d '{
    "collection": "docs",
    "query": "What is containerization?",
    "limit": 5
  }'
```

---

## 🐛 Troubleshooting

### **Problem: Services won't start**
```bash
# View detailed logs
gobernador-mcp.bat logs (Windows)
./gobernador-mcp.sh logs   (macOS/Linux)

# Or directly
docker compose -f docker-compose-mcp.yml logs
```

### **Problem: Port already in use**
```bash
# Windows - kill process using port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# macOS/Linux - kill process using port 5173
lsof -ti:5173 | xargs kill -9
```

### **Problem: Out of memory**
```bash
# Reduce services
docker compose -f docker-compose.yml up -d  # Local only

# Or increase Docker memory in Docker Desktop settings
```

### **Problem: Docker not installed**
```bash
# Install Docker Desktop from: https://www.docker.com/products/docker-desktop
# Then restart this launcher
```

---

## 🎓 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Frontend (React)                    │
│            http://localhost:5173               │
└────────────┬────────────────────────────────────┘
             │
┌────────────▼────────────────────────────────────┐
│           Backend API (Rust/Axum)              │
│            http://localhost:8080               │
│  ┌─────────────────────────────────────────┐  │
│  │  MCP Client (routes to LLMs)            │  │
│  └──┬──────────────────────────┬───────────┘  │
└────┼──────────────────────────┼───────────────┘
     │                          │
   ┌─▼──────────────────────────▼──────┐
   │   MCP Server (http://3001)        │
   │  ┌───────────────────────────────┐│
   │  │ LLM Router & Coordination      ││
   │  └───────────────────────────────┘│
   └─────┬──┬──┬──┬──────────────────────┘
         │  │  │  │
    ┌────┘  │  │  └──────────┐
    │       │  │             │
┌───▼────┐┌─▼──▼───┐┌───────▼────┐┌─────────────┐
│ Ollama │ OpenAI  │  Anthropic  │  Google/    │
│ Local  │ (Cloud) │   (Cloud)   │  Cohere     │
└────────┘└────────┘└─────────────┘└─────────────┘

┌──────────────────────────────────────────────────┐
│  Vector DB (Qdrant)  │  Docker Agent  │  DB     │
│  Semantic Search     │  Automation    │  Data   │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Production Deployment

### **AWS Deployment**
```bash
# Use provided AWS compose file
docker compose -f docker-compose.aws.yml up -d

# Set environment variables
export DEPLOYMENT_MODE=hybrid
export AWS_REGION=us-east-1
```

### **Azure/GCP/Digital Ocean**
```bash
# Same .env setup, adjust cloud provider settings
# All services are containerized and cloud-agnostic
```

---

## 📊 Performance & Costs

| Mode | CPU | Memory | Monthly Cost | Speed |
|------|-----|--------|--------------|-------|
| Local | Medium | 2-4GB | $0 | Varies |
| Hybrid | Medium | 3-6GB | $10-50 | Fast |
| Full Stack | High | 6-8GB | $20-100 | Very Fast |
| Cloud Only | Low | 1-2GB | $50-200+ | Fastest |

---

## 🔐 Security

✅ **Built-in Security:**
- Non-root container users
- API key management via `.env`
- CORS protection
- JWT authentication
- Secrets excluded from Git
- Health checks on all services
- Automatic security updates

✅ **Best Practices:**
- Never commit `.env` to Git
- Rotate API keys regularly
- Use strong passwords
- Enable HTTPS in production
- Monitor Docker logs for errors

---

## 📚 API Reference

### MCP Server Endpoints

**LLM Generation:**
- `POST /llm/generate` - Auto-select provider
- `POST /llm/openai/chat` - OpenAI GPT
- `POST /llm/anthropic/message` - Anthropic Claude
- `POST /llm/google/generate` - Google Gemini
- `POST /llm/cohere/generate` - Cohere
- `POST /llm/ollama/generate` - Local Ollama

**Embeddings & Search:**
- `POST /embeddings/generate` - Generate embeddings
- `POST /qdrant/store` - Store documents
- `POST /qdrant/search` - Semantic search

**Agents:**
- `POST /agent/execute` - Run AI agent tasks

**Utilities:**
- `GET /models` - List available models
- `GET /health` - Health check

---

## 🎯 Next Steps

1. **Launch** with `gobernador-mcp.bat` or `./gobernador-mcp.sh`
2. **Choose mode** (recommended: option 2 - Hybrid)
3. **Configure API keys** if using cloud LLMs
4. **Download Ollama models** with option 10
5. **Visit** http://localhost:5173 to use the app

---

## 📞 Support

- **Issues?** Check logs with option 6
- **Need help?** Run help (option 0)
- **Docker not working?** Install Docker Desktop
- **API keys?** See links in .env.mcp file

---

**You're all set! Start deploying with one click. 🎉**
