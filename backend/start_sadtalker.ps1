# Start SadTalker Service for Realistic AI Avatars
# This script starts the Python service that generates realistic talking head videos

Write-Host "🚀 Starting SadTalker Avatar Service..." -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "   Please install Python 3.8+ and try again." -ForegroundColor Yellow
    exit 1
}

# Check Python version
$pythonVersion = python --version
Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green

# Navigate to backend directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan

# Check if virtual environment exists
if (Test-Path "venv_sadtalker") {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
    Write-Host "   Activating..." -ForegroundColor Gray
    & .\venv_sadtalker\Scripts\Activate.ps1
} else {
    Write-Host "⚠️  Virtual environment not found!" -ForegroundColor Yellow
    Write-Host "   Creating virtual environment..." -ForegroundColor Gray
    python -m venv venv_sadtalker
    & .\venv_sadtalker\Scripts\Activate.ps1
    
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    pip install -r requirements_sadtalker.txt
}

Write-Host ""
Write-Host "🎭 Starting SadTalker service on http://localhost:5001" -ForegroundColor Cyan
Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Start the service
try {
    python services/sadtalkerService.py
} catch {
    Write-Host ""
    Write-Host "❌ Error starting service!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    exit 1
}
