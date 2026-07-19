#!/bin/bash

################################################################################
# Gobernador IA - MCP & LLM Enhanced Launcher
# Unix/Linux/macOS deployment with Ollama, Docker Agent, MCP, and all LLMs
################################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_menu() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  🚀 GOBERNADOR IA - Full MCP/LLM Deployment Launcher   ║${NC}"
    echo -e "${BLUE}║     Local Ollama + All Cloud LLMs + Docker Agent       ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Mode Selection:${NC}"
    echo "  1) QUICK START - Local only (Ollama, fastest setup)"
    echo "  2) HYBRID - Local Ollama + Cloud LLMs (recommended)"
    echo "  3) FULL STACK - All services (Ollama, MCP, Agents, LLMs)"
    echo "  4) CLOUD ONLY - Cloud LLMs only (no local Ollama)"
    echo ""
    echo -e "${YELLOW}Management:${NC}"
    echo "  5) View Status - Check all running services"
    echo "  6) View Logs - Stream live logs from all services"
    echo "  7) Stop All - Shut down all services"
    echo "  8) Restart - Restart all services"
    echo "  9) Setup API Keys - Configure LLM credentials"
    echo "  10) Download Ollama Models - Pull open-source models"
    echo "  0) Help - Full documentation"
    echo ""
    read -p "Enter choice (0-10): " choice

    case $choice in
        1) local_mode ;;
        2) hybrid_mode ;;
        3) full_stack ;;
        4) cloud_mode ;;
        5) status ;;
        6) logs ;;
        7) stop_all ;;
        8) restart_all ;;
        9) setup_keys ;;
        10) download_models ;;
        0) help ;;
        *) echo "Invalid choice"; sleep 2; show_menu ;;
    esac
}

local_mode() {
    clear
    echo -e "${BLUE}🔧 Starting LOCAL MODE (Ollama only, no internet required)${NC}"
    echo ""
    
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from template${NC}"
    fi
    
    docker compose -f docker-compose.yml up -d
    echo -e "${GREEN}✅ Waiting for services to start...${NC}"
    sleep 10
    
    echo ""
    echo -e "${YELLOW}📡 SERVICES RUNNING:${NC}"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:8080"
    echo "  Database: localhost:5432"
    echo ""
    echo -e "${YELLOW}🎯 To use Ollama models, run:${NC}"
    echo "   docker exec gobernador-ollama ollama pull llama2"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

hybrid_mode() {
    clear
    echo -e "${BLUE}🔄 Starting HYBRID MODE (Ollama + Cloud LLMs)${NC}"
    echo ""
    
    if [ ! -f ".env" ]; then
        cp .env.mcp .env
        echo -e "${GREEN}✓ Created .env from MCP template${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Please edit .env with your LLM API keys:${NC}"
        echo "   - OPENAI_API_KEY"
        echo "   - ANTHROPIC_API_KEY"
        echo "   - GOOGLE_API_KEY"
        echo "   - COHERE_API_KEY"
        echo ""
        read -p "Press Enter after editing .env (use: nano .env or vim .env)..."
    fi
    
    docker compose -f docker-compose-mcp.yml --profile llm up -d
    echo -e "${GREEN}✅ Waiting for services (30 seconds)...${NC}"
    sleep 30
    
    echo ""
    echo -e "${YELLOW}📡 SERVICES RUNNING:${NC}"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:8080"
    echo "  MCP Server: http://localhost:3001"
    echo "  Ollama: http://localhost:11434"
    echo "  Qdrant Vector DB: http://localhost:6333"
    echo "  Database: localhost:5432"
    echo ""
    echo -e "${YELLOW}🎯 Download Ollama model:${NC}"
    echo "   docker exec gobernador-ollama ollama pull mistral"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

full_stack() {
    clear
    echo -e "${BLUE}🚀 Starting FULL STACK (All services including Docker Agent)${NC}"
    echo ""
    
    if [ ! -f ".env" ]; then
        cp .env.mcp .env
        echo -e "${GREEN}✓ Created .env from MCP template${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  For full functionality, edit .env with your LLM API keys${NC}"
        echo ""
        read -p "Press Enter after editing .env..."
    fi
    
    docker compose -f docker-compose-mcp.yml --profile full --profile agents up -d
    echo -e "${GREEN}✅ Waiting for services (45 seconds)...${NC}"
    sleep 45
    
    echo ""
    echo -e "${YELLOW}📡 ALL SERVICES RUNNING:${NC}"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:8080"
    echo "  MCP Server: http://localhost:3001"
    echo "  Docker Agent: http://localhost:8888"
    echo "  Ollama: http://localhost:11434"
    echo "  Qdrant: http://localhost:6333"
    echo "  Database: localhost:5432"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

cloud_mode() {
    clear
    echo -e "${BLUE}☁️  Starting CLOUD ONLY MODE (No local Ollama)${NC}"
    echo ""
    
    if [ ! -f ".env" ]; then
        cp .env.mcp .env
        echo -e "${GREEN}✓ Created .env from MCP template${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  Cloud Mode requires LLM API keys. Edit .env with:${NC}"
        echo "   - OPENAI_API_KEY (or other cloud LLM keys)"
        echo ""
        read -p "Press Enter after editing .env..."
    fi
    
    docker compose -f docker-compose-mcp.yml --profile llm up -d
    echo -e "${GREEN}✅ Services starting...${NC}"
    sleep 15
    
    echo ""
    echo -e "${YELLOW}📡 SERVICES RUNNING:${NC}"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend API: http://localhost:8080"
    echo "  MCP Server: http://localhost:3001"
    echo "  Qdrant: http://localhost:6333"
    echo "  Database: localhost:5432"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

status() {
    clear
    echo -e "${YELLOW}📊 Service Status:${NC}"
    echo ""
    docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

logs() {
    clear
    echo -e "${YELLOW}📊 Streaming logs (Ctrl+C to stop)...${NC}"
    echo ""
    docker compose logs -f
}

stop_all() {
    clear
    echo -e "${RED}🛑 Stopping all services...${NC}"
    docker compose -f docker-compose-mcp.yml down
    echo -e "${GREEN}✅ All services stopped${NC}"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

restart_all() {
    clear
    echo -e "${BLUE}🔄 Restarting all services...${NC}"
    docker compose -f docker-compose-mcp.yml restart
    echo -e "${GREEN}⏳ Waiting for services (30 seconds)...${NC}"
    sleep 30
    echo -e "${GREEN}✅ Services restarted${NC}"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

setup_keys() {
    clear
    echo -e "${BLUE}🔐 LLM API KEY SETUP WIZARD${NC}"
    echo ""
    echo "This tool helps you configure cloud LLM API keys."
    echo "Leave blank to skip (local Ollama will still work)"
    echo ""
    echo "Which LLM do you want to configure?"
    echo "  1) OpenAI (GPT-4)"
    echo "  2) Anthropic Claude"
    echo "  3) Google Gemini"
    echo "  4) Cohere"
    echo "  5) Mistral AI"
    echo "  6) All of the above"
    echo "  0) Cancel"
    echo ""
    read -p "Enter choice: " llm_choice

    case $llm_choice in
        1) setup_openai ;;
        2) setup_anthropic ;;
        3) setup_google ;;
        4) setup_cohere ;;
        5) setup_mistral ;;
        6) setup_all_keys ;;
        0) show_menu ;;
        *) echo "Invalid choice"; sleep 2; setup_keys ;;
    esac
}

setup_openai() {
    read -p "Enter OpenAI API Key: " key
    echo "OPENAI_API_KEY=$key" >> .env
    echo -e "${GREEN}✓ OpenAI key saved${NC}"
    sleep 2
    setup_keys
}

setup_anthropic() {
    read -p "Enter Anthropic API Key: " key
    echo "ANTHROPIC_API_KEY=$key" >> .env
    echo -e "${GREEN}✓ Anthropic key saved${NC}"
    sleep 2
    setup_keys
}

setup_google() {
    read -p "Enter Google API Key: " key
    echo "GOOGLE_API_KEY=$key" >> .env
    echo -e "${GREEN}✓ Google key saved${NC}"
    sleep 2
    setup_keys
}

setup_cohere() {
    read -p "Enter Cohere API Key: " key
    echo "COHERE_API_KEY=$key" >> .env
    echo -e "${GREEN}✓ Cohere key saved${NC}"
    sleep 2
    setup_keys
}

setup_mistral() {
    read -p "Enter Mistral API Key: " key
    echo "MISTRAL_API_KEY=$key" >> .env
    echo -e "${GREEN}✓ Mistral key saved${NC}"
    sleep 2
    setup_keys
}

setup_all_keys() {
    setup_openai
    setup_anthropic
    setup_google
    setup_cohere
    setup_mistral
    setup_keys
}

download_models() {
    clear
    echo -e "${BLUE}📥 Ollama Model Downloader${NC}"
    echo ""
    echo "Available open-source models:"
    echo "  1) Llama 2 (7B, best for most tasks)"
    echo "  2) Mistral (7B, faster than Llama)"
    echo "  3) Neural Chat (7B, optimized for chat)"
    echo "  4) Dolphin Mixtral (8x7B, very capable)"
    echo "  5) Nomic Embed Text (for embeddings)"
    echo "  6) All of the above"
    echo "  0) Cancel"
    echo ""
    read -p "Enter choice: " model_choice

    case $model_choice in
        1) pull_model llama2 ;;
        2) pull_model mistral ;;
        3) pull_model neural-chat ;;
        4) pull_model dolphin-mixtral ;;
        5) pull_model nomic-embed-text ;;
        6) 
            pull_model llama2
            pull_model mistral
            pull_model neural-chat
            pull_model nomic-embed-text
            ;;
        0) show_menu ;;
        *) echo "Invalid choice"; sleep 2; download_models ;;
    esac
}

pull_model() {
    echo -e "${YELLOW}Downloading $1...${NC}"
    docker exec gobernador-ollama ollama pull $1
    echo -e "${GREEN}✓ $1 downloaded${NC}"
    echo ""
}

help() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║            GOBERNADOR IA - FULL DOCUMENTATION          ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}DEPLOYMENT MODES:${NC}"
    echo ""
    echo "1. LOCAL MODE (Ollama only)"
    echo "   - Uses local open-source models (Llama 2, Mistral, etc)"
    echo "   - No internet required"
    echo "   - Best for: Testing, privacy-focused deployments"
    echo "   - Performance: CPU/GPU dependent"
    echo ""
    echo "2. HYBRID MODE (Ollama + Cloud LLMs)"
    echo "   - Uses local Ollama for simple tasks"
    echo "   - Falls back to OpenAI/Claude/Gemini for complex tasks"
    echo "   - Best for: Production deployments"
    echo "   - Cost-effective with high availability"
    echo ""
    echo "3. FULL STACK (All services)"
    echo "   - Includes Docker Agent for AI-powered automation"
    echo "   - MCP (Model Context Protocol) for agent coordination"
    echo "   - All LLM providers integrated"
    echo "   - Best for: Advanced AI agent deployments"
    echo ""
    echo "4. CLOUD ONLY (No local Ollama)"
    echo "   - Uses only cloud LLMs (OpenAI, Claude, etc)"
    echo "   - Best for: Performance-critical applications"
    echo "   - Requires valid API keys"
    echo ""
    echo -e "${YELLOW}FIRST RUN SETUP:${NC}"
    echo "  1. Run option 2 (HYBRID)"
    echo "  2. When prompted, edit .env with your API keys"
    echo "  3. Find keys at:"
    echo "     - OpenAI: https://platform.openai.com/api-keys"
    echo "     - Claude: https://console.anthropic.com/"
    echo "     - Google: https://makersuite.google.com/app/apikey"
    echo "     - Cohere: https://dashboard.cohere.com/api-keys"
    echo "  4. Restart with option 8"
    echo ""
    echo -e "${YELLOW}SERVICE URLS:${NC}"
    echo "  Frontend:   http://localhost:5173"
    echo "  Backend:    http://localhost:8080"
    echo "  MCP Server: http://localhost:3001"
    echo "  Agent:      http://localhost:8888"
    echo "  Ollama:     http://localhost:11434"
    echo "  Qdrant:     http://localhost:6333"
    echo "  Database:   localhost:5432"
    echo ""
    echo -e "${YELLOW}TROUBLESHOOTING:${NC}"
    echo "  - Check status: Option 5"
    echo "  - View logs: Option 6"
    echo "  - Restart: Option 8"
    echo "  - Stop all: Option 7"
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Main entry point
if [ "$1" != "" ]; then
    $1
else
    show_menu
fi
