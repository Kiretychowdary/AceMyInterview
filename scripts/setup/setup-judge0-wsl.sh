#!/bin/bash
# Judge0 Setup Script for WSL2 Ubuntu

set -e  # Exit on error

echo "========================================="
echo "Judge0 Setup for WSL2 Ubuntu"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running in WSL2
if ! grep -qi microsoft /proc/version; then
    echo -e "${RED}❌ This script must be run in WSL2 Ubuntu${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Running in WSL2${NC}"
echo ""

# Check if Docker is installed
echo "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Installing Docker...${NC}"
    
    # Update packages
    sudo apt update
    
    # Install Docker
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    echo -e "${GREEN}✅ Docker installed${NC}"
    echo -e "${YELLOW}⚠️  You need to log out and log back in for group changes to take effect${NC}"
    echo "Run: exit, then: wsl"
else
    echo -e "${GREEN}✅ Docker is installed: $(docker --version)${NC}"
fi

# Check if Docker is running
echo ""
echo "Checking Docker service..."
if ! sudo service docker status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Starting Docker service...${NC}"
    sudo service docker start
    sleep 2
fi

if sudo service docker status &> /dev/null; then
    echo -e "${GREEN}✅ Docker is running${NC}"
else
    echo -e "${RED}❌ Failed to start Docker${NC}"
    exit 1
fi

# Check if docker-compose is installed
echo ""
echo "Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installing Docker Compose...${NC}"
    sudo apt install docker-compose -y
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose is installed: $(docker-compose --version)${NC}"
fi

# Find project directory
echo ""
echo "Finding project directory..."
PROJECT_DIR=""

# Check if we're already in the project
if [ -f "package.json" ] && [ -d "judge0-env" ]; then
    PROJECT_DIR=$(pwd)
    echo -e "${GREEN}✅ Found project in current directory${NC}"
elif [ -d "/mnt/c/Users/kiret/Downloads/AceMyInterview" ]; then
    PROJECT_DIR="/mnt/c/Users/kiret/Downloads/AceMyInterview"
    echo -e "${GREEN}✅ Found project in Windows filesystem${NC}"
elif [ -d "$HOME/AceMyInterview" ]; then
    PROJECT_DIR="$HOME/AceMyInterview"
    echo -e "${GREEN}✅ Found project in WSL2 home directory${NC}"
else
    echo -e "${RED}❌ Could not find project directory${NC}"
    echo "Please cd to the project directory and run this script again"
    exit 1
fi

cd "$PROJECT_DIR"
echo "Project directory: $PROJECT_DIR"

# Check if using Windows filesystem
if [[ "$PROJECT_DIR" == /mnt/* ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: You're using Windows filesystem (/mnt/c)${NC}"
    echo "For better performance, consider copying to WSL2:"
    echo "  cp -r $PROJECT_DIR ~/AceMyInterview"
    echo "  cd ~/AceMyInterview"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Check if Judge0 env files exist
echo ""
echo "Checking Judge0 configuration files..."
if [ ! -f "judge0-env/judge0.env" ]; then
    echo -e "${RED}❌ judge0.env not found${NC}"
    exit 1
fi
if [ ! -f "judge0-env/judge0-config.yml" ]; then
    echo -e "${RED}❌ judge0-config.yml not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Configuration files found${NC}"

# Stop any existing Judge0 containers
echo ""
echo "Checking for existing Judge0 containers..."
cd config/docker
if docker-compose -f docker-compose-judge0-wsl.yml ps | grep -q Up; then
    echo -e "${YELLOW}⚠️  Stopping existing containers...${NC}"
    docker-compose -f docker-compose-judge0-wsl.yml down
    echo -e "${GREEN}✅ Stopped${NC}"
fi

# Start Judge0
echo ""
echo "========================================="
echo "Starting Judge0 Services..."
echo "========================================="
docker-compose -f docker-compose-judge0-wsl.yml up -d

# Wait for services
echo ""
echo "Waiting for services to start (30 seconds)..."
for i in {30..1}; do
    echo -ne "${YELLOW}$i seconds remaining...\r${NC}"
    sleep 1
done
echo ""

# Check status
echo ""
echo "========================================="
echo "Checking Service Status"
echo "========================================="
docker-compose -f docker-compose-judge0-wsl.yml ps

# Test API
echo ""
echo "Testing Judge0 API..."
sleep 5  # Extra wait for API to be ready

if curl -s http://localhost:2358/languages > /dev/null; then
    echo -e "${GREEN}✅ Judge0 API is responding!${NC}"
    
    # Test code execution
    echo ""
    echo "Testing code execution..."
    RESULT=$(curl -s -X POST http://localhost:2358/submissions?base64_encoded=false&wait=true \
      -H "Content-Type: application/json" \
      -d '{"language_id": 71, "source_code": "print(\"Hello Judge0!\")", "stdin": ""}')
    
    if echo "$RESULT" | grep -q "Hello Judge0"; then
        echo -e "${GREEN}✅ Code execution works!${NC}"
        echo ""
        echo "========================================="
        echo "🎉 SUCCESS! Judge0 is running!"
        echo "========================================="
        echo ""
        echo "Judge0 API: http://localhost:2358"
        echo ""
        echo "Next steps:"
        echo "1. Open Windows and start your frontend: npm run dev"
        echo "2. Test compiler in the app"
        echo "3. Judge0 logs: docker-compose logs -f api"
        echo ""
    else
        echo -e "${YELLOW}⚠️  API responds but code execution may have issues${NC}"
        echo "Response: $RESULT"
    fi
else
    echo -e "${RED}❌ Judge0 API is not responding${NC}"
    echo "Check logs: docker-compose logs api"
fi

echo ""
echo "========================================="
echo "Useful Commands"
echo "========================================="
echo "View logs:        docker-compose -f docker-compose-judge0-wsl.yml logs -f"
echo "Stop Judge0:      docker-compose -f docker-compose-judge0-wsl.yml down"
echo "Restart Judge0:   docker-compose -f docker-compose-judge0-wsl.yml restart"
echo "Remove all data:  docker-compose -f docker-compose-judge0-wsl.yml down -v"
echo ""
