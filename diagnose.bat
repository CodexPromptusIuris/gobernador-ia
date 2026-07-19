@echo off
REM Gobernador IA - Diagnostics Tool
REM Use this to troubleshoot issues

echo.
echo ========================================
echo GOBERNADOR IA - DIAGNOSTICS
echo ========================================
echo.

REM Check Docker
echo Checking Docker installation...
docker --version
if errorlevel 1 (
    echo ERROR: Docker not installed!
    echo Download from: https://www.docker.com/products/docker-desktop
    goto end
)
echo OK - Docker found
echo.

REM Check Docker is running
echo Checking if Docker daemon is running...
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker daemon not running!
    echo Please start Docker Desktop
    goto end
)
echo OK - Docker is running
echo.

REM Check Docker Compose
echo Checking Docker Compose...
docker compose version
if errorlevel 1 (
    echo ERROR: Docker Compose not found!
    goto end
)
echo OK - Docker Compose found
echo.

REM Check files
echo Checking required files...
if not exist "docker-compose.yml" (
    echo ERROR: docker-compose.yml not found!
    goto end
)
echo OK - docker-compose.yml exists
echo.

if not exist ".env" (
    echo WARNING: .env file not found - will be created
) else (
    echo OK - .env file exists
)
echo.

REM Check ports
echo Checking ports...
netstat -ano | findstr :5173 >nul 2>&1
if errorlevel 0 (
    echo WARNING: Port 5173 may be in use
) else (
    echo OK - Port 5173 is free
)
echo.

netstat -ano | findstr :8080 >nul 2>&1
if errorlevel 0 (
    echo WARNING: Port 8080 may be in use
) else (
    echo OK - Port 8080 is free
)
echo.

REM Check current services
echo Checking current containers...
docker compose ps
echo.

REM Show recommendations
echo.
echo ========================================
echo DIAGNOSTICS COMPLETE
echo ========================================
echo.
echo If you see errors above:
echo.
echo 1. Docker Not Installed?
echo    - Download: https://www.docker.com/products/docker-desktop
echo    - Install and restart computer
echo.
echo 2. Port Already in Use?
echo    - Close other applications
echo    - Or change ports in docker-compose.yml
echo.
echo 3. Services Not Starting?
echo    - Run: docker compose logs
echo    - Look for error messages
echo.
echo 4. Still Having Issues?
echo    - Try: docker compose up
echo    - This will show detailed output
echo.

:end
echo.
pause
