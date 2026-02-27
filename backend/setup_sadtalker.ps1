# SadTalker Setup Script for Windows
# PowerShell script to install SadTalker and all dependencies

Write-Host "🚀 Setting up SadTalker for AceMyInterview..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"
$BackendDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $BackendDir

Write-Host "📂 Backend directory: $BackendDir" -ForegroundColor Yellow

# Check if Python is installed
$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    try {
        $version = & $cmd --version 2>&1
        if ($version -match "Python 3\.[8-9]|Python 3\.1[0-9]") {
            $pythonCmd = $cmd
            Write-Host "✅ Found: $version" -ForegroundColor Green
            break
        }
    } catch {}
}

if (-not $pythonCmd) {
    Write-Host "❌ Error: Python 3.8 or higher is not installed" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/" -ForegroundColor Yellow
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    exit 1
}

# Check for CUDA (optional but recommended)
try {
    $gpuInfo = nvidia-smi --query-gpu=name --format=csv,noheader 2>&1 | Select-Object -First 1
    Write-Host "✅ CUDA detected - GPU acceleration will be available" -ForegroundColor Green
    Write-Host "   GPU: $gpuInfo" -ForegroundColor Gray
    $useCuda = $true
} catch {
    Write-Host "⚠️  No CUDA detected - will use CPU (slower)" -ForegroundColor Yellow
    $useCuda = $false
}

# Step 1: Clone SadTalker repository
Write-Host ""
Write-Host "📥 Step 1: Cloning SadTalker repository..." -ForegroundColor Cyan
Set-Location $BackendDir

if (Test-Path "SadTalker") {
    Write-Host "⚠️  SadTalker directory already exists" -ForegroundColor Yellow
    $response = Read-Host "Do you want to update it? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Set-Location SadTalker
        git pull
        Set-Location ..
    }
} else {
    git clone https://github.com/OpenTalker/SadTalker.git
    Write-Host "✅ SadTalker cloned successfully" -ForegroundColor Green
}

# Step 2: Create Python virtual environment
Write-Host ""
Write-Host "🐍 Step 2: Creating Python virtual environment..." -ForegroundColor Cyan
Set-Location $BackendDir

if (-not (Test-Path "venv_sadtalker")) {
    & $pythonCmd -m venv venv_sadtalker
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "✅ Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
$venvActivate = Join-Path $BackendDir "venv_sadtalker\Scripts\Activate.ps1"
& $venvActivate
Write-Host "✅ Virtual environment activated" -ForegroundColor Green

# Step 3: Install dependencies
Write-Host ""
Write-Host "📦 Step 3: Installing Python dependencies..." -ForegroundColor Cyan

# Upgrade pip
& python -m pip install --upgrade pip

# Install PyTorch
if ($useCuda) {
    Write-Host "Installing PyTorch with CUDA support..." -ForegroundColor Yellow
    & pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
} else {
    Write-Host "Installing PyTorch CPU version..." -ForegroundColor Yellow
    & pip install torch torchvision torchaudio
}

# Install SadTalker requirements
if (Test-Path "SadTalker\requirements.txt") {
    & pip install -r SadTalker\requirements.txt
}

# Install additional requirements
& pip install -r requirements_sadtalker.txt

Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 4: Download SadTalker pretrained models
Write-Host ""
Write-Host "📥 Step 4: Downloading pretrained models..." -ForegroundColor Cyan
Set-Location SadTalker

# Create checkpoints directory
New-Item -ItemType Directory -Force -Path "checkpoints" | Out-Null

Write-Host "Downloading model checkpoints... This may take a while..." -ForegroundColor Yellow

# Download main checkpoint
if (-not (Test-Path "checkpoints\SadTalker_V0.0.2_256.safetensors")) {
    Write-Host "Downloading SadTalker checkpoint..." -ForegroundColor Yellow
    $url = "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2/SadTalker_V0.0.2_256.safetensors"
    Invoke-WebRequest -Uri $url -OutFile "checkpoints\SadTalker_V0.0.2_256.safetensors"
}

# Download GFPGAN for face enhancement
if (-not (Test-Path "checkpoints\GFPGANv1.4.pth")) {
    Write-Host "Downloading GFPGAN checkpoint..." -ForegroundColor Yellow
    $url = "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth"
    Invoke-WebRequest -Uri $url -OutFile "checkpoints\GFPGANv1.4.pth"
}

Set-Location $BackendDir
Write-Host "✅ Models downloaded" -ForegroundColor Green

# Step 5: Create default avatar image directory
Write-Host ""
Write-Host "🖼️  Step 5: Setting up default avatar..." -ForegroundColor Cyan

$AssetsDir = Join-Path $BackendDir "assets"
New-Item -ItemType Directory -Force -Path $AssetsDir | Out-Null

if (-not (Test-Path "$AssetsDir\default_avatar.png")) {
    Write-Host "⚠️  Please add a professional headshot as: $AssetsDir\default_avatar.png" -ForegroundColor Yellow
    Write-Host "   Recommended: 512x512 or 1024x1024, PNG format, frontal face" -ForegroundColor Gray
}

# Step 6: Create temp directories
Write-Host ""
Write-Host "📁 Step 6: Creating temporary directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path "$BackendDir\temp\avatars" | Out-Null
New-Item -ItemType Directory -Force -Path "$BackendDir\temp\audio" | Out-Null
Write-Host "✅ Directories created" -ForegroundColor Green

# Step 7: Test installation
Write-Host ""
Write-Host "🧪 Step 7: Testing installation..." -ForegroundColor Cyan

$testScript = @"
import sys
sys.path.append('SadTalker')

try:
    import torch
    print(f'✅ PyTorch {torch.__version__}')
    print(f'   CUDA available: {torch.cuda.is_available()}')
    if torch.cuda.is_available():
        print(f'   GPU: {torch.cuda.get_device_name(0)}')
    
    import cv2
    print(f'✅ OpenCV {cv2.__version__}')
    
    import flask
    print(f'✅ Flask {flask.__version__}')
    
    print('\n✅ All core dependencies installed successfully!')
    
except ImportError as e:
    print(f'\n❌ Error: {e}')
    sys.exit(1)
"@

$testScript | & python

# Step 8: Create launcher script
Write-Host ""
Write-Host "📝 Step 8: Service configuration..." -ForegroundColor Cyan

$launcherScript = @"
# SadTalker Service Launcher for Windows
Write-Host 'Starting SadTalker Avatar Service...' -ForegroundColor Cyan

`$BackendDir = Split-Path -Parent `$MyInvocation.MyCommand.Path
Set-Location `$BackendDir

# Activate virtual environment
& .\venv_sadtalker\Scripts\Activate.ps1

# Start the service
python services\sadtalkerService.py
"@

$launcherScript | Out-File -FilePath "$BackendDir\start_sadtalker.ps1" -Encoding UTF8
Write-Host "✅ Service launcher created: start_sadtalker.ps1" -ForegroundColor Green

# Final instructions
Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "✅ SadTalker setup completed successfully!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Add a professional avatar image:" -ForegroundColor White
Write-Host "   Copy-Item your_avatar.png $AssetsDir\default_avatar.png" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the SadTalker service:" -ForegroundColor White
Write-Host "   .\start_sadtalker.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "   Or manually:" -ForegroundColor White
Write-Host "   .\venv_sadtalker\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "   python services\sadtalkerService.py" -ForegroundColor Gray
Write-Host ""
Write-Host "3. The service will run on: http://localhost:5001" -ForegroundColor White
Write-Host "   Check health: curl http://localhost:5001/health" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Your main backend (Node.js) should already be configured" -ForegroundColor White
Write-Host "   to communicate with the SadTalker service." -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 You're ready to use real-time avatar with lip sync!" -ForegroundColor Green
Write-Host ""
