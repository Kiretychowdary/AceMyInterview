#!/bin/bash
# SadTalker Setup Script for AceMyInterview
# Installs SadTalker and all dependencies for real-time avatar generation

set -e

echo "🚀 Setting up SadTalker for AceMyInterview..."
echo "=============================================="

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR"
PROJECT_ROOT="$(dirname "$BACKEND_DIR")"

echo "📂 Backend directory: $BACKEND_DIR"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed"
    echo "Please install Python 3.8 or higher from https://www.python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo "✅ Found: $PYTHON_VERSION"

# Check for CUDA (optional but recommended)
if command -v nvidia-smi &> /dev/null; then
    echo "✅ CUDA detected - GPU acceleration will be available"
    nvidia-smi --query-gpu=name --format=csv,noheader | head -1
else
    echo "⚠️  No CUDA detected - will use CPU (slower)"
fi

# Step 1: Clone SadTalker repository
echo ""
echo "📥 Step 1: Cloning SadTalker repository..."
cd "$BACKEND_DIR"

if [ -d "SadTalker" ]; then
    echo "⚠️  SadTalker directory already exists"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd SadTalker
        git pull
        cd ..
    fi
else
    git clone https://github.com/OpenTalker/SadTalker.git
    echo "✅ SadTalker cloned successfully"
fi

# Step 2: Create Python virtual environment
echo ""
echo "🐍 Step 2: Creating Python virtual environment..."
cd "$BACKEND_DIR"

if [ ! -d "venv_sadtalker" ]; then
    python3 -m venv venv_sadtalker
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
source venv_sadtalker/bin/activate
echo "✅ Virtual environment activated"

# Step 3: Install dependencies
echo ""
echo "📦 Step 3: Installing Python dependencies..."

# Upgrade pip
pip install --upgrade pip

# Install PyTorch (choose appropriate version based on CUDA)
if command -v nvidia-smi &> /dev/null; then
    echo "Installing PyTorch with CUDA support..."
    pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
else
    echo "Installing PyTorch CPU version..."
    pip install torch torchvision torchaudio
fi

# Install SadTalker requirements
if [ -f "SadTalker/requirements.txt" ]; then
    pip install -r SadTalker/requirements.txt
fi

# Install additional requirements for our service
pip install -r requirements_sadtalker.txt

echo "✅ Dependencies installed"

# Step 4: Download SadTalker pretrained models
echo ""
echo "📥 Step 4: Downloading pretrained models..."
cd SadTalker

# Create checkpoints directory
mkdir -p checkpoints

# Download models (these are large files ~2GB total)
echo "Downloading model checkpoints... This may take a while..."

# Main checkpoint
if [ ! -f "checkpoints/SadTalker_V0.0.2_256.safetensors" ]; then
    echo "Downloading SadTalker checkpoint..."
    wget -O checkpoints/SadTalker_V0.0.2_256.safetensors \
        "https://github.com/OpenTalker/SadTalker/releases/download/v0.0.2/SadTalker_V0.0.2_256.safetensors"
fi

# GFPGAN for face enhancement
if [ ! -f "checkpoints/GFPGANv1.4.pth" ]; then
    echo "Downloading GFPGAN checkpoint..."
    wget -O checkpoints/GFPGANv1.4.pth \
        "https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth"
fi

cd "$BACKEND_DIR"
echo "✅ Models downloaded"

# Step 5: Create default avatar image
echo ""
echo "🖼️  Step 5: Setting up default avatar..."

ASSETS_DIR="$BACKEND_DIR/assets"
mkdir -p "$ASSETS_DIR"

# Download or create a default professional avatar image
if [ ! -f "$ASSETS_DIR/default_avatar.png" ]; then
    echo "Creating default avatar placeholder..."
    # You can replace this with a real professional headshot
    # For now, we'll note that users should add their own
    echo "⚠️  Please add a professional headshot as: $ASSETS_DIR/default_avatar.png"
    echo "   Recommended: 512x512 or 1024x1024, PNG format, frontal face"
fi

# Step 6: Create temp directories
echo ""
echo "📁 Step 6: Creating temporary directories..."
mkdir -p "$BACKEND_DIR/temp/avatars"
mkdir -p "$BACKEND_DIR/temp/audio"
echo "✅ Directories created"

# Step 7: Test installation
echo ""
echo "🧪 Step 7: Testing installation..."

python3 << EOF
import sys
sys.path.append('SadTalker')

try:
    import torch
    print(f"✅ PyTorch {torch.__version__}")
    print(f"   CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"   GPU: {torch.cuda.get_device_name(0)}")
    
    import cv2
    print(f"✅ OpenCV {cv2.__version__}")
    
    import flask
    print(f"✅ Flask {flask.__version__}")
    
    print("\n✅ All core dependencies installed successfully!")
    
except ImportError as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)
EOF

# Step 8: Create systemd service (optional, for production)
echo ""
echo "📝 Step 8: Service configuration..."
cat > "$BACKEND_DIR/sadtalker-service.sh" << 'EOF'
#!/bin/bash
# SadTalker Service Launcher

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Activate virtual environment
source venv_sadtalker/bin/activate

# Start the service
python3 services/sadtalkerService.py
EOF

chmod +x "$BACKEND_DIR/sadtalker-service.sh"
echo "✅ Service launcher created: sadtalker-service.sh"

# Final instructions
echo ""
echo "=============================================="
echo "✅ SadTalker setup completed successfully!"
echo "=============================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Add a professional avatar image:"
echo "   cp your_avatar.png $ASSETS_DIR/default_avatar.png"
echo ""
echo "2. Start the SadTalker service:"
echo "   cd $BACKEND_DIR"
echo "   source venv_sadtalker/bin/activate"
echo "   python3 services/sadtalkerService.py"
echo ""
echo "   Or use the launcher:"
echo "   ./sadtalker-service.sh"
echo ""
echo "3. The service will run on: http://localhost:5001"
echo "   Check health: curl http://localhost:5001/health"
echo ""
echo "4. Your main backend (Node.js) should already be configured"
echo "   to communicate with the SadTalker service."
echo ""
echo "🎉 You're ready to use real-time avatar with lip sync!"
echo ""
