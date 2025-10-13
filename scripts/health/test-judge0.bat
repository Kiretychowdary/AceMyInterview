@echo off
REM Quick Judge0 Connection Test Script
echo ========================================
echo   Testing Judge0 Connection
echo ========================================
echo.

echo [1/4] Checking Docker...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running
    echo Please start Docker Desktop
    exit /b 1
)
echo [OK] Docker is running

echo.
echo [2/4] Checking Judge0 containers...
docker ps | findstr "judge0"
if %errorlevel% neq 0 (
    echo [ERROR] Judge0 containers not found
    echo Run setup-judge0.bat first
    exit /b 1
)
echo [OK] Judge0 containers are running

echo.
echo [3/4] Testing Judge0 API endpoint...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:2358/languages
if %errorlevel% neq 0 (
    echo [ERROR] Cannot connect to Judge0 API
    echo Make sure containers are fully started (may take 60 seconds)
    exit /b 1
)

echo.
echo [4/4] Fetching supported languages...
curl -s http://localhost:2358/languages | python -m json.tool
if %errorlevel% neq 0 (
    echo [WARNING] Could not parse JSON (python not available)
    echo But the API responded successfully
)

echo.
echo ========================================
echo   Judge0 is Ready!
echo ========================================
echo.
echo Test a simple code execution:
echo.
echo curl -X POST http://localhost:2358/submissions?base64_encoded=false^&wait=true ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"language_id\": 71, \"source_code\": \"print('Hello, World!')\"}"
echo.
pause
