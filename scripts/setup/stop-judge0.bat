@echo off
echo 🛑 Stopping Judge0 Services...
echo.

REM Change to docker config directory
cd /d "%~dp0..\..\config\docker"

echo 📋 Stopping Judge0 containers...
docker compose -f docker-compose-judge0.yml down

if %errorlevel% neq 0 (
    echo ❌ Error stopping some services
    echo 💡 Some containers may still be running
) else (
    echo ✅ Judge0 services stopped successfully!
)

echo.
echo 🔍 To verify containers are stopped:
echo    docker ps
echo.
pause