@echo off
REM Judge0 Self-Hosted Setup Script
REM Automatically starts Judge0 services and configures the environment

echo ========================================
echo   Judge0 Self-Hosted Setup Script
echo ========================================
echo.

REM Check if Docker is running
echo [1/6] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Desktop is not running
    echo Please start Docker Desktop and try again
    pause
    exit /b 1
)
echo [OK] Docker is running

REM Check if docker-compose file exists
echo [2/6] Checking configuration files...
if not exist "config\docker\docker-compose-judge0.yml" (
    echo [ERROR] docker-compose-judge0.yml not found
    echo Expected location: config\docker\docker-compose-judge0.yml
    pause
    exit /b 1
)
echo [OK] Configuration files found

REM Check if Judge0 containers are already running
echo [3/6] Checking existing Judge0 containers...
docker ps | findstr "judge0" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Judge0 containers are already running
    echo Do you want to restart them? (Y/N)
    set /p RESTART=
    if /i "%RESTART%"=="Y" (
        echo Stopping existing containers...
        cd config\docker
        docker-compose -f docker-compose-judge0.yml down
        cd ..\..
    )
)

REM Start Judge0 services
echo [4/6] Starting Judge0 services...
cd config\docker
docker-compose -f docker-compose-judge0.yml up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start Judge0 services
    echo Check Docker logs: docker-compose logs
    cd ..\..
    pause
    exit /b 1
)
cd ..\..
echo [OK] Judge0 services started

REM Wait for services to initialize
echo [5/6] Waiting for services to initialize (30 seconds)...
timeout /t 30 /nobreak >nul

REM Test Judge0 API
echo [6/6] Testing Judge0 API...
curl -s http://localhost:2358/languages >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Judge0 API not responding yet
    echo Services may need more time to start (up to 60 seconds)
    echo You can test manually: curl http://localhost:2358/languages
) else (
    echo [OK] Judge0 API is responding
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Judge0 Services Status:
docker ps | findstr "judge0\|db\|redis\|CONTAINER"
echo.
echo Next Steps:
echo 1. Update .env file with: VITE_JUDGE0_BASE_URL=http://localhost:2358
echo 2. Restart your dev server: npm run dev
echo 3. Test the compiler in your application
echo.
echo Useful Commands:
echo - View logs: cd config\docker ^&^& docker-compose logs -f api
echo - Stop services: cd config\docker ^&^& docker-compose down
echo - Restart: cd config\docker ^&^& docker-compose restart
echo.
pause
