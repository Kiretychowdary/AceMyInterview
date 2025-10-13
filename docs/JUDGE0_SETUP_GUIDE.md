# Judge0 Setup Guide - Self-Hosted Docker Configuration
# =====================================================

## Prerequisites
1. Docker Desktop installed and running
2. Docker Compose available
3. Ports 2358, 5432, 6379 available

## Step 1: Start Docker Desktop
- Open Docker Desktop application
- Wait until it shows "Docker is running"
- Verify with: docker --version

## Step 2: Navigate to Project Directory
cd C:\Users\kiret\Downloads\AceMyInterview

## Step 3: Check Judge0 Configuration Files
# Ensure these files exist:
# - config/docker/docker-compose-judge0.yml
# - judge0-env/judge0.env
# - judge0-env/judge0-config.yml

## Step 4: Start Judge0 Services
cd config/docker
docker-compose -f docker-compose-judge0.yml up -d

## Step 5: Verify Containers Are Running
docker ps

# You should see 4 containers:
# - docker-db-1 (PostgreSQL)
# - docker-redis-1 (Redis)
# - docker-api-1 (Judge0 API)
# - docker-worker-1 (Judge0 Worker)

## Step 6: Test Judge0 API
# Wait 30-60 seconds for services to initialize, then test:
curl http://localhost:2358/languages

# Should return JSON with list of supported languages

## Step 7: Update Environment Configuration
# Edit .env file to use local Judge0:
VITE_JUDGE0_BASE_URL=http://localhost:2358
VITE_JUDGE0_HOST=localhost

## Step 8: Restart Development Server
npm run dev

## Troubleshooting

### Issue: Docker not starting
Solution: 
- Open Docker Desktop
- Check if WSL2 is installed (for Windows)
- Restart Docker Desktop

### Issue: Port 2358 already in use
Solution:
docker ps -a
docker stop <container_id>
docker-compose down

### Issue: Containers crash immediately
Solution:
docker-compose logs api
# Check for errors in the logs

### Issue: "Connection refused" when testing
Solution:
- Wait longer (services take 30-60s to start)
- Check if all 4 containers are running
- Verify PostgreSQL and Redis are healthy

## Stopping Judge0
docker-compose -f docker-compose-judge0.yml down

## Viewing Logs
docker-compose -f docker-compose-judge0.yml logs -f api
docker-compose -f docker-compose-judge0.yml logs -f worker

## Complete Restart (Clean State)
docker-compose -f docker-compose-judge0.yml down -v
docker-compose -f docker-compose-judge0.yml up -d
