#!/bin/bash
# Quick start Judge0 in WSL2

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Start Docker
echo "Starting Docker..."
sudo service docker start
sleep 2

# Find project
PROJECT_DIR=""
if [ -f "package.json" ] && [ -d "judge0-env" ]; then
    PROJECT_DIR=$(pwd)
elif [ -d "/mnt/c/Users/kiret/Downloads/AceMyInterview" ]; then
    PROJECT_DIR="/mnt/c/Users/kiret/Downloads/AceMyInterview"
elif [ -d "$HOME/AceMyInterview" ]; then
    PROJECT_DIR="$HOME/AceMyInterview"
else
    echo -e "${RED}❌ Project not found${NC}"
    exit 1
fi

cd "$PROJECT_DIR/config/docker"

# Start Judge0
echo "Starting Judge0..."
docker-compose -f docker-compose-judge0-wsl.yml up -d

echo ""
echo "Waiting 15 seconds for services..."
sleep 15

# Test
if curl -s http://localhost:2358/languages > /dev/null; then
    echo -e "${GREEN}✅ Judge0 is running at http://localhost:2358${NC}"
    echo ""
    echo "To stop: docker-compose -f docker-compose-judge0-wsl.yml down"
else
    echo -e "${RED}❌ Judge0 failed to start${NC}"
    echo "Check logs: docker-compose logs api"
fi