@echo off
setlocal enabledelayedexpansion

REM ============================================
REM Gobernador IA - Windows Launcher
REM ============================================

set "SCRIPT_DIR=%~dp0"

echo.
echo ========================================
echo Gobernador IA - Deployment Launcher
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed!
    echo.
    echo Please install Docker Desktop from:
    echo https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)

echo Docker found - OK
echo.

REM Setup environment
if not exist "%SCRIPT_DIR%.env" (
    echo Creating .env file from template...
    if exist "%SCRIPT_DIR%.env.example" (
        copy "%SCRIPT_DIR%.env.example" "%SCRIPT_DIR%.env" >nul
        echo.
        echo IMPORTANT: Edit the .env file and change all passwords!
        echo File location: %SCRIPT_DIR%.env
        echo.
        echo Opening .env file...
        timeout /t 2 /nobreak
        notepad "%SCRIPT_DIR%.env"
    ) else (
        echo ERROR: .env.example not found!
        pause
        exit /b 1
    )
)

REM Process commands
if "%1"=="" (
    REM Default: start all services
    cls
    echo.
    echo ========================================
    echo STARTING SERVICES
    echo ========================================
    echo.
    echo Building and starting containers...
    echo This may take 2-5 minutes on first run.
    echo.
    
    cd /d "%SCRIPT_DIR%"
    docker compose up -d --build
    
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to start services
        echo Try running: docker compose up
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo Waiting for services to start...
    timeout /t 5 /nobreak
    
    cls
    echo.
    echo ========================================
    echo SUCCESS! Services are running!
    echo ========================================
    echo.
    echo FRONTEND:  http://localhost:5173
    echo BACKEND:   http://localhost:8080
    echo DATABASE:  localhost:5432
    echo.
    echo Open your browser and go to:
    echo http://localhost:5173
    echo.
    echo COMMANDS:
    echo   gobernador logs       - View live logs
    echo   gobernador stop       - Stop all services
    echo   gobernador restart    - Restart services
    echo   gobernador status     - Check status
    echo.
    pause
) else if "%1"=="start" (
    cd /d "%SCRIPT_DIR%"
    docker compose up -d --build
    echo Services starting...
    timeout /t 3 /nobreak
    docker compose ps
) else if "%1"=="stop" (
    cd /d "%SCRIPT_DIR%"
    docker compose down
    echo Services stopped.
) else if "%1"=="restart" (
    cd /d "%SCRIPT_DIR%"
    echo Restarting services...
    docker compose restart
    timeout /t 3 /nobreak
    docker compose ps
) else if "%1"=="logs" (
    cd /d "%SCRIPT_DIR%"
    docker compose logs -f --tail 50
) else if "%1"=="status" (
    cd /d "%SCRIPT_DIR%"
    docker compose ps
) else if "%1"=="cleanup" (
    echo.
    echo WARNING: This will DELETE all data!
    echo.
    set /p response="Continue? Type 'yes' to proceed: "
    if /i "!response!"=="yes" (
        cd /d "%SCRIPT_DIR%"
        docker compose down -v
        echo Cleanup complete.
    ) else (
        echo Cleanup cancelled.
    )
) else (
    echo Usage: gobernador [command]
    echo.
    echo Commands:
    echo   (no args) - Start all services
    echo   start     - Start services
    echo   stop      - Stop services
    echo   restart   - Restart services
    echo   logs      - View logs
    echo   status    - Show status
    echo   cleanup   - Delete all data
    echo.
)

endlocal
