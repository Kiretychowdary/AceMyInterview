@echo off
echo 🚀 Starting Judge0 Services...
echo.

REM Check if Docker is running
docker version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Desktop is not running!
    echo 💡 Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Change to docker config directory
cd /d "%~dp0..\..\config\docker"

REM Check if docker-compose file exists
if not exist "docker-compose-judge0.yml" (
    echo ❌ Docker compose file not found!
    echo 📁 Expected: config\docker\docker-compose-judge0.yml
    pause
    exit /b 1
)

echo 📋 Starting Judge0 containers...
docker compose -f docker-compose-judge0.yml up -d

if %errorlevel% neq 0 (
    echo ❌ Failed to start Judge0 services!
    echo 💡 Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ✅ Judge0 services started successfully!
echo.
echo 🔗 Judge0 API: http://localhost:2358
echo 🔗 Judge0 UI: http://localhost:3001
echo.
echo 🔍 To verify services are working:
echo    node scripts\health\check-judge0.js
echo.
echo 🛑 To stop services:
echo    scripts\setup\stop-judge0.bat
echo.
pause
echo To stop Judge0 services, run stop-judge0.bat