
@echo off
REM Gobernador IA - Easy Setup Wizard
REM Interactive setup for Windows users

cls
echo.
echo ========================================
echo GOBERNADOR IA SETUP WIZARD
echo ========================================
echo.

REM Step 1: Check Docker
echo STEP 1: Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Docker is not installed!
    echo.
    echo Please download and install Docker Desktop:
    echo https://www.docker.com/products/docker-desktop
    echo.
    echo After installing, run this script again.
    echo.
    pause
    exit /b 1
)
echo OK - Docker is installed
echo.

REM Step 2: Setup .env
echo STEP 2: Setting up configuration...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo Created .env file
    )
)

if exist ".env" (
    echo Opening .env for editing...
    echo.
    echo Please edit the passwords:
    echo - POSTGRES_PASSWORD
    echo - ADMIN_PASSWORD
    echo - JWT_SECRET
    echo - WEBHOOK_API_KEY
    echo.
    echo Make them strong (12+ characters)
    echo.
    timeout /t 3 /nobreak
    notepad ".env"
    echo OK - .env configured
) else (
    echo ERROR: Could not create .env
    pause
    exit /b 1
)
echo.

REM Step 3: Check disk space
echo STEP 3: Checking disk space...
for /f "tokens=3" %%A in ('dir /-c ^| find "bytes free"') do set free=%%A
echo Available space: %free% bytes
echo.
if %free% LSS 2000000000 (
    echo WARNING: Less than 2GB free space
    echo You need at least 2GB to download Docker images
)
echo OK
echo.

REM Step 4: Start services
echo STEP 4: Starting services...
echo This may take 2-5 minutes. Please wait...
echo.

cd /d "%~dp0"
docker compose up -d --build

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start services
    echo.
    echo Try running: docker compose up
    echo This will show more details
    echo.
    pause
    exit /b 1
)

echo.
echo Waiting for services to initialize...
timeout /t 10 /nobreak

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo Your app should now be available at:
echo.
echo   http://localhost:5173
echo.
echo Open this URL in your web browser.
echo.
echo If the page doesn't load:
echo - Wait another 30 seconds (services starting)
echo - Run: docker compose logs
echo - Run: docker compose ps
echo.
echo To stop services:
echo - Run: gobernador.bat stop
echo - Or: docker compose down
echo.
echo To view logs:
echo - Run: gobernador.bat logs
echo - Or: docker compose logs -f
echo.
pause
