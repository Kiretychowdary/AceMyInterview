# RADHAKRISHNALOVEPERMANENT
# AMMALOVEBLESSINGSONRECURSION

# Quick start script for ML Engine
# Run this script to start the ML service

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  AceMyInterview ML Engine Starter" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if virtual environment exists
if (-Not (Test-Path "venv")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "`nCreating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "✅ Virtual environment created!`n" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Check if requirements are installed
Write-Host "🔄 Checking dependencies..." -ForegroundColor Yellow
$pipList = pip list
if ($pipList -notmatch "flask") {
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
    Write-Host "✅ Dependencies installed!`n" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed`n" -ForegroundColor Green
}

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Copying from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please configure it before running!`n" -ForegroundColor Green
}

# Check if model is trained
if (-Not (Test-Path "models/dkt_model.pth")) {
    Write-Host "❌ Trained model not found!" -ForegroundColor Red
    Write-Host "`nWould you like to train the model now? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq "Y" -or $response -eq "y") {
        Write-Host "`n🏋️  Training model..." -ForegroundColor Cyan
        python train.py
        Write-Host "`n✅ Model training completed!`n" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Warning: ML Engine will start but predictions may fail without trained model!`n" -ForegroundColor Yellow
    }
}

# Start the Flask app
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting ML Engine..." -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📡 API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🔧 Press Ctrl+C to stop the server`n" -ForegroundColor Yellow

python app.py
