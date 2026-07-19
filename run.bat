@echo off
REM Gobernador IA - Simple Launcher
REM Just run Docker Compose

cd /d "%~dp0"

REM Check Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker not found! Install from: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Setup .env if missing
if not exist ".env" (
    echo Creating .env file...
    if exist ".env.example" copy ".env.example" ".env"
    echo.
    echo EDIT .env FILE WITH YOUR PASSWORDS!
    echo.
    notepad ".env"
)

REM Start services
echo.
echo Starting Gobernador IA...
echo Please wait 2-5 minutes for first run.
echo.

docker compose up -d --build

echo.
echo Services are starting!
echo.
echo Open: http://localhost:5173
echo.
pause
