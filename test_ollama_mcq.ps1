# PowerShell Test for Ollama MCQ Endpoint
# nmkrspvlidata - quick test script for Windows

Write-Host "🧪 Testing Ollama MCQ Generation Endpoint" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "http://localhost:5000"

Write-Host "📡 Backend: $BACKEND_URL" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1️⃣  Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/ollama-mcq/health" -Method Get -ContentType "application/json" -ErrorAction Stop
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "✅ Health Status:" -ForegroundColor Green
    Write-Host ($healthData | ConvertTo-Json | Out-String)
} catch {
    Write-Host "❌ Health check failed: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Generate MCQ
Write-Host "2️⃣  Generate MCQ Questions..." -ForegroundColor Yellow
try {
    $body = @{
        topic = "JavaScript"
        difficulty = "medium"
        count = 2
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/ollama-mcq/generate" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ MCQ Generated:" -ForegroundColor Green
    Write-Host ($data | ConvertTo-Json -Depth 10 | Out-String)
    
} catch {
    Write-Host "❌ MCQ generation failed: $_" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ Tests Complete!" -ForegroundColor Green
