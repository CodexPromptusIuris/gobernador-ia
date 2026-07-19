6
@echo off
REM ============================================
REM Gobernador IA - MCP & LLM Enhanced Launcher
REM ============================================
REM One-click deployment with Ollama, Docker Agent, MCP, and all LLM brands
REM Windows Batch Script with GUI

setlocal enabledelayedexpansion

if "%1"=="" (
    call :show_menu
) else (
    call :%1
    exit /b
)

:show_menu
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  🚀 GOBERNADOR IA - Full MCP/LLM Deployment Launcher   ║
echo ║     Local Ollama + All Cloud LLMs + Docker Agent       ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Mode Selection:
echo   1) QUICK START - Local only (Ollama, fastest setup)
echo   2) HYBRID - Local Ollama + Cloud LLMs (recommended)
echo   3) FULL STACK - All services (Ollama, MCP, Agents, LLMs)
echo   4) CLOUD ONLY - Cloud LLMs only (no local Ollama)
echo.
echo Management:
echo   5) View Status - Check all running services
echo   6) View Logs - Stream live logs from all services
echo   7) Stop All - Shut down all services
echo   8) Restart - Restart all services
echo   9) Setup API Keys - Configure LLM credentials
echo   0) Help - Full documentation
echo.
set /p choice="Enter choice (0-9): "

if "%choice%"=="1" goto local_mode
if "%choice%"=="2" goto hybrid_mode
if "%choice%"=="3" goto full_stack
if "%choice%"=="4" goto cloud_mode
if "%choice%"=="5" goto status
if "%choice%"=="6" goto logs
if "%choice%"=="7" goto stop
if "%choice%"=="8" goto restart
if "%choice%"=="9" goto setup_keys
if "%choice%"=="0" goto help
echo Invalid choice. Exiting.
exit /b

:local_mode
cls
echo.
echo 🔧 Starting LOCAL MODE (Ollama only, no internet required)
echo.
if not exist ".env" (
    copy .env.example .env
    echo ✓ Created .env from template
)
REM Don't include MCP services for local mode
docker compose -f docker-compose.yml up -d
echo.
echo ✅ Waiting for services to start...
timeout /t 10 /nobreak
echo.
echo 📡 SERVICES RUNNING:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8080
echo   Database: localhost:5432
echo.
echo 🎯 To use Ollama models, run:
echo    docker exec gobernador-ollama ollama pull llama2
echo.
goto end_menu

:hybrid_mode
cls
echo.
echo 🔄 Starting HYBRID MODE (Ollama + Cloud LLMs)
echo.
if not exist ".env" (
    copy .env.mcp .env
    echo ✓ Created .env from MCP template
    echo.
    echo ⚠️  Please edit .env with your LLM API keys:
    echo    - OPENAI_API_KEY
    echo    - ANTHROPIC_API_KEY
    echo    - GOOGLE_API_KEY
    echo    - COHERE_API_KEY
    echo.
    pause
)
docker compose -f docker-compose-mcp.yml --profile llm up -d
echo.
echo ✅ Waiting for services (30 seconds)...
timeout /t 30 /nobreak
echo.
echo 📡 SERVICES RUNNING:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8080
echo   MCP Server: http://localhost:3001
echo   Ollama: http://localhost:11434
echo   Qdrant Vector DB: http://localhost:6333
echo   Database: localhost:5432
echo.
echo 🎯 Download Ollama model:
echo    docker exec gobernador-ollama ollama pull mistral
echo.
goto end_menu

:full_stack
cls
echo.
echo 🚀 Starting FULL STACK (All services including Docker Agent)
echo.
if not exist ".env" (
    copy .env.mcp .env
    echo ✓ Created .env from MCP template
    echo.
    echo ⚠️  Please edit .env with your LLM API keys for full functionality
    echo.
    pause
)
docker compose -f docker-compose-mcp.yml --profile full --profile agents up -d
echo.
echo ✅ Waiting for services (45 seconds)...
timeout /t 45 /nobreak
echo.
echo 📡 ALL SERVICES RUNNING:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8080
echo   MCP Server: http://localhost:3001
echo   Docker Agent: http://localhost:8888
echo   Ollama: http://localhost:11434
echo   Qdrant: http://localhost:6333
echo   Database: localhost:5432
echo.
goto end_menu

:cloud_mode
cls
echo.
echo ☁️  Starting CLOUD ONLY MODE (No local Ollama)
echo.
if not exist ".env" (
    copy .env.mcp .env
    echo ✓ Created .env from MCP template
    echo.
    echo ⚠️  Cloud Mode requires LLM API keys. Edit .env with:
    echo    - OPENAI_API_KEY (or other cloud LLM keys)
    echo.
    pause
)
docker compose -f docker-compose-mcp.yml --profile llm up -d --scale ollama=0
echo.
echo ✅ Services starting...
timeout /t 15 /nobreak
echo.
echo 📡 SERVICES RUNNING:
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:8080
echo   MCP Server: http://localhost:3001
echo   Qdrant: http://localhost:6333
echo   Database: localhost:5432
echo.
goto end_menu

:status
cls
echo.
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.
pause
goto show_menu

:logs
cls
echo.
echo 📊 Streaming logs (Ctrl+C to stop)...
docker compose logs -f
goto show_menu

:stop
cls
echo.
echo 🛑 Stopping all services...
docker compose -f docker-compose-mcp.yml down
echo.
echo ✅ All services stopped
echo.
pause
goto show_menu

:restart
cls
echo.
echo 🔄 Restarting all services...
docker compose -f docker-compose-mcp.yml restart
echo.
echo ⏳ Waiting for services (30 seconds)...
timeout /t 30 /nobreak
echo.
echo ✅ Services restarted
echo.
pause
goto show_menu

:setup_keys
cls
echo.
echo 🔐 LLM API KEY SETUP WIZARD
echo.
echo This tool helps you configure cloud LLM API keys.
echo Leave blank to skip (local Ollama will still work)
echo.
echo Which LLM do you want to configure?
echo   1) OpenAI (GPT-4)
echo   2) Anthropic Claude
echo   3) Google Gemini
echo   4) Cohere
echo   5) Mistral AI
echo   6) All of the above
echo   0) Cancel
echo.
set /p llm_choice="Enter choice: "

if "%llm_choice%"=="1" goto setup_openai
if "%llm_choice%"=="2" goto setup_anthropic
if "%llm_choice%"=="3" goto setup_google
if "%llm_choice%"=="4" goto setup_cohere
if "%llm_choice%"=="5" goto setup_mistral
if "%llm_choice%"=="6" goto setup_all
if "%llm_choice%"=="0" goto show_menu

:setup_openai
set /p key="Enter OpenAI API Key: "
powershell -Command "$env:OPENAI_API_KEY='%key%'; [System.IO.File]::AppendAllText('.env', \"`nOPENAI_API_KEY=%key%`n\")"
echo ✓ OpenAI key saved
timeout /t 3
goto setup_keys

:setup_anthropic
set /p key="Enter Anthropic API Key: "
powershell -Command "$env:ANTHROPIC_API_KEY='%key%'; [System.IO.File]::AppendAllText('.env', \"`nANTHROPIC_API_KEY=%key%`n\")"
echo ✓ Anthropic key saved
timeout /t 3
goto setup_keys

:setup_google
set /p key="Enter Google API Key: "
powershell -Command "$env:GOOGLE_API_KEY='%key%'; [System.IO.File]::AppendAllText('.env', \"`nGOOGLE_API_KEY=%key%`n\")"
echo ✓ Google key saved
timeout /t 3
goto setup_keys

:setup_cohere
set /p key="Enter Cohere API Key: "
powershell -Command "$env:COHERE_API_KEY='%key%'; [System.IO.File]::AppendAllText('.env', \"`nCOHERE_API_KEY=%key%`n\")"
echo ✓ Cohere key saved
timeout /t 3
goto setup_keys

:setup_mistral
set /p key="Enter Mistral API Key: "
powershell -Command "$env:MISTRAL_API_KEY='%key%'; [System.IO.File]::AppendAllText('.env', \"`nMISTRAL_API_KEY=%key%`n\")"
echo ✓ Mistral key saved
timeout /t 3
goto setup_keys

:setup_all
echo Running all setup wizards...
goto setup_openai

:help
cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║            GOBERNADOR IA - FULL DOCUMENTATION          ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo DEPLOYMENT MODES:
echo.
echo 1. LOCAL MODE (Ollama only)
echo    - Uses local open-source models (Llama 2, Mistral, etc)
echo    - No internet required
echo    - Best for: Testing, privacy-focused deployments
echo    - Performance: CPU/GPU dependent
echo.
echo 2. HYBRID MODE (Ollama + Cloud LLMs)
echo    - Uses local Ollama for simple tasks
echo    - Falls back to OpenAI/Claude/Gemini for complex tasks
echo    - Best for: Production deployments
echo    - Cost-effective with high availability
echo.
echo 3. FULL STACK (All services)
echo    - Includes Docker Agent for AI-powered automation
echo    - MCP (Model Context Protocol) for agent coordination
echo    - All LLM providers integrated
echo    - Best for: Advanced AI agent deployments
echo.
echo 4. CLOUD ONLY (No local Ollama)
echo    - Uses only cloud LLMs (OpenAI, Claude, etc)
echo    - Best for: Performance-critical applications
echo    - Requires valid API keys
echo.
echo FIRST RUN SETUP:
echo   1. Run option 2 (HYBRID)
echo   2. When prompted, edit .env with your API keys
echo   3. Find keys at:
echo      - OpenAI: https://platform.openai.com/api-keys
echo      - Claude: https://console.anthropic.com/
echo      - Google: https://makersuite.google.com/app/apikey
echo      - Cohere: https://dashboard.cohere.com/api-keys
echo   4. Restart with option 8
echo.
echo USING OLLAMA LOCALLY:
echo   docker exec gobernador-ollama ollama pull llama2
echo   docker exec gobernador-ollama ollama list
echo.
echo SERVICE URLS:
echo   Frontend:   http://localhost:5173
echo   Backend:    http://localhost:8080
echo   MCP Server: http://localhost:3001
echo   Agent:      http://localhost:8888
echo   Ollama:     http://localhost:11434
echo   Qdrant:     http://localhost:6333
echo   Database:   localhost:5432
echo.
echo TROUBLESHOOTING:
echo   - Check status: Option 5
echo   - View logs: Option 6
echo   - Restart: Option 8
echo   - Stop all: Option 7
echo.
pause
goto show_menu

:end_menu
pause
goto show_menu
