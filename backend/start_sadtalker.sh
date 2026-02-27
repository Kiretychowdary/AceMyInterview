#!/bin/bash
# Start SadTalker Service for Realistic AI Avatars
# This script starts the Python service that generates realistic talking head videos

echo "🚀 Starting SadTalker Avatar Service..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed!"
    echo "   Please install Python 3.8+ and try again."
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version)
echo "✅ Found: $PYTHON_VERSION"

# Navigate to backend directory
cd "$(dirname "$0")"

echo ""
echo "📦 Checking dependencies..."

# Check if virtual environment exists
if [ -d "venv_sadtalker" ]; then
    echo "✅ Virtual environment found"
    echo "   Activating..."
    source venv_sadtalker/bin/activate
else
    echo "⚠️  Virtual environment not found!"
    echo "   Creating virtual environment..."
    python3 -m venv venv_sadtalker
    source venv_sadtalker/bin/activate
    
    echo "   Installing dependencies..."
    pip install -r requirements_sadtalker.txt
fi

echo ""
echo "🎭 Starting SadTalker service on http://localhost:5001"
echo "   Press Ctrl+C to stop"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the service
python3 services/sadtalkerService.py
