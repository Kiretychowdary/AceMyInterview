#!/bin/bash
# RADHAKRISHNALOVEPERMANENT
# AMMALOVEBLESSINGSONRECURSION

# Quick start script for ML Engine (Mac/Linux)
# Run: chmod +x start.sh && ./start.sh

echo ""
echo "========================================"
echo "  AceMyInterview ML Engine Starter"
echo "========================================"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created!"
    echo ""
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
echo "🔄 Checking dependencies..."
if ! pip list | grep -q "flask"; then
    echo ""
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    echo "✅ Dependencies installed!"
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please configure it before running!"
    echo ""
fi

# Check if model is trained
if [ ! -f "models/dkt_model.pth" ]; then
    echo "❌ Trained model not found!"
    echo ""
    echo "Would you like to train the model now? (Y/N)"
    read response
    
    if [ "$response" = "Y" ] || [ "$response" = "y" ]; then
        echo ""
        echo "🏋️  Training model..."
        python train.py
        echo ""
        echo "✅ Model training completed!"
        echo ""
    else
        echo ""
        echo "⚠️  Warning: ML Engine will start but predictions may fail without trained model!"
        echo ""
    fi
fi

# Start the Flask app
echo "========================================"
echo "🚀 Starting ML Engine..."
echo "========================================"
echo ""

echo "📡 API will be available at: http://localhost:5000"
echo "🔧 Press Ctrl+C to stop the server"
echo ""

python app.py
