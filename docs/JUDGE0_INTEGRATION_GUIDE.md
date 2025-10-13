# Judge0 Integration - Complete Setup Guide
## Self-Hosted Docker Configuration

---

## 🎯 Overview

This guide will help you connect your Compiler to a **self-hosted Judge0 instance** running in Docker. Judge0 is a code execution system that safely compiles and runs code in multiple programming languages.

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **Docker Desktop** installed and running
   - Download: https://www.docker.com/products/docker-desktop
   - Version: 20.10+ recommended

2. **Ports Available**:
   - `2358` - Judge0 API
   - `5432` - PostgreSQL
   - `6379` - Redis

3. **System Requirements**:
   - Windows 10/11 (with WSL2) or macOS/Linux
   - At least 4GB RAM available for Docker
   - 10GB disk space

---

## 🚀 Quick Start (Automated)

### Option 1: Using NPM Scripts (Recommended)

```bash
# Step 1: Setup and start Judge0 (first time)
npm run judge0:setup

# Step 2: Test the connection
npm run judge0:test

# Step 3: Start your development server
npm run dev
```

### Option 2: Manual Setup

```bash
# Step 1: Navigate to docker config directory
cd config/docker

# Step 2: Start Judge0 services
docker-compose -f docker-compose-judge0.yml up -d

# Step 3: Wait 30-60 seconds for initialization

# Step 4: Test the API
curl http://localhost:2358/languages
```

---

## 📋 Detailed Setup Steps

### 1. Start Docker Desktop

- Open **Docker Desktop** application
- Wait until you see "Docker is running" (green indicator)
- Verify: Open PowerShell/Terminal and run:
  ```bash
  docker --version
  docker ps
  ```

### 2. Verify Configuration Files

Ensure these files exist in your project:

```
AceMyInterview/
├── config/
│   └── docker/
│       └── docker-compose-judge0.yml  ✅
├── judge0-env/
│   ├── judge0.env                     ✅
│   └── judge0-config.yml              ✅
├── .env                               ✅ (updated with Judge0 URL)
└── scripts/
    └── setup/
        └── setup-judge0.bat           ✅
```

### 3. Run Setup Script

**Windows:**
```bash
scripts\setup\setup-judge0.bat
```

**Or manually with npm:**
```bash
npm run judge0:setup
```

This script will:
- ✅ Check if Docker is running
- ✅ Verify configuration files exist
- ✅ Start Judge0 containers (API, Worker, PostgreSQL, Redis)
- ✅ Wait for services to initialize
- ✅ Test the API connection

### 4. Verify Judge0 is Running

**Check Docker containers:**
```bash
docker ps
```

You should see 4 running containers:
```
CONTAINER ID   IMAGE                    STATUS
xxxxx          judge0/judge0:1.13.0     Up (api)
xxxxx          judge0/judge0:1.13.0     Up (worker)
xxxxx          postgres:13.0            Up (db)
xxxxx          redis:6.0                Up (redis)
```

**Test the API:**
```bash
curl http://localhost:2358/languages
```

Should return JSON with ~70+ programming languages.

### 5. Update Environment Variables

Your `.env` file should already have:

```env
# Judge0 Configuration (Self-Hosted Docker)
VITE_JUDGE0_BASE_URL=http://localhost:2358
VITE_JUDGE0_HOST=localhost
VITE_JUDGE0_TIMEOUT_MS=15000
```

### 6. Restart Development Server

```bash
npm run dev
```

### 7. Test in the Compiler

1. Open your browser to http://localhost:5173
2. Navigate to the **Compiler** page
3. Click the **"🔌 Test Judge0"** button in the top right
4. You should see: **✅ Judge0 is connected and working!**

---

## 🔧 Testing & Verification

### In-Browser Test (Compiler Page)

The Compiler now has a built-in connection test:

1. Click **"🔌 Test Judge0"** button
2. Wait for test to complete (~5 seconds)
3. Check the status indicator:
   - **✅ Judge0** (green) = Connected
   - **❌ Judge0** (red) = Not connected

### Manual API Test

**Test 1: Get Languages**
```bash
curl http://localhost:2358/languages
```

**Test 2: Execute Python Code**
```bash
curl -X POST http://localhost:2358/submissions?base64_encoded=false&wait=true \
  -H "Content-Type: application/json" \
  -d "{\"language_id\": 71, \"source_code\": \"print('Hello, World!')\"}"
```

**Test 3: Using NPM Script**
```bash
npm run judge0:test
```

### Check Logs

View real-time logs from Judge0:

```bash
cd config/docker

# View all logs
docker-compose logs -f

# View API logs only
docker-compose logs -f api

# View worker logs only
docker-compose logs -f worker
```

---

## 🐛 Troubleshooting

### Issue 1: Docker Desktop Not Running

**Error:** `error during connect: ... dockerDesktopLinuxEngine: The system cannot find the file specified`

**Solution:**
1. Open Docker Desktop
2. Wait for it to fully start (green indicator)
3. Try again

### Issue 2: Port 2358 Already in Use

**Error:** `Bind for 0.0.0.0:2358 failed: port is already allocated`

**Solution:**
```bash
# Find what's using the port
netstat -ano | findstr :2358

# Stop the process or change Judge0 port in docker-compose-judge0.yml
# Then restart:
docker-compose down
docker-compose up -d
```

### Issue 3: Containers Keep Restarting

**Solution:**
```bash
# Check logs for errors
cd config/docker
docker-compose logs api

# Common fixes:
# 1. Make sure judge0.env file exists
# 2. Increase Docker memory limit (Docker Settings > Resources)
# 3. Restart Docker Desktop
```

### Issue 4: "Connection Refused" When Testing

**Symptoms:**
- API returns 500 errors
- Cannot connect to http://localhost:2358

**Solution:**
```bash
# Wait longer (services take 30-60 seconds to start fully)
timeout /t 60

# Check container health
docker ps

# Restart services
cd config/docker
docker-compose restart api
```

### Issue 5: Compilation/Execution Timeout

**Error:** "Execution timeout" in compiler

**Solution:**
1. Increase timeout in `.env`:
   ```env
   VITE_JUDGE0_TIMEOUT_MS=30000
   ```
2. Check worker logs:
   ```bash
   docker-compose logs -f worker
   ```

### Issue 6: Database Connection Errors

**Error:** `PG::ConnectionBad: could not connect to server`

**Solution:**
```bash
# Restart database
docker-compose restart db

# If that doesn't work, recreate with fresh data
docker-compose down -v
docker-compose up -d
```

---

## 🔄 Common Commands

### Start Judge0
```bash
npm run judge0:setup    # First time setup
npm run judge0:start    # Start if already setup
```

### Stop Judge0
```bash
npm run judge0:stop
# or
cd config/docker && docker-compose down
```

### Restart Judge0
```bash
cd config/docker
docker-compose restart
```

### Complete Reset (Fresh Start)
```bash
cd config/docker
docker-compose down -v  # Remove volumes (deletes data)
docker-compose up -d    # Start fresh
```

### View Logs
```bash
cd config/docker
docker-compose logs -f api      # API logs
docker-compose logs -f worker   # Worker logs
docker-compose logs -f db       # Database logs
```

### Check Service Status
```bash
docker ps                       # Running containers
docker stats                    # Resource usage
npm run judge0:test            # Connection test
```

---

## 🎨 Compiler Features

Once Judge0 is connected, you can:

### Supported Languages

- **C** (GCC 9.2.0)
- **C++** (GCC 9.2.0)
- **Java** (OpenJDK 13)
- **Python** (3.8)
- **JavaScript** (Node.js 12)
- **TypeScript** (3.7.4)
- **Go** (1.13)
- **Rust** (1.40)
- **Ruby** (2.7)
- **PHP** (7.4)
- **C#** (Mono 6.6)
- **Swift** (5.2)
- **Kotlin** (1.3)
- ...and 60+ more!

### Compiler Actions

1. **Run Code** - Execute once with custom input
2. **Run Tests** - Execute against multiple test cases
3. **Live Feedback** - See compilation errors, runtime errors, or output
4. **Time & Memory** - Track execution time and memory usage

---

## 📊 Performance Tips

### Optimize Docker Resources

1. Open Docker Desktop
2. Go to **Settings** > **Resources**
3. Allocate:
   - **CPUs:** 2-4 cores
   - **Memory:** 4-8 GB
   - **Swap:** 1-2 GB

### Speed Up Compilation

1. Keep Judge0 running (don't stop/start frequently)
2. Use `wait=false` for async submissions
3. Implement submission caching if needed

---

## 🔐 Security Considerations

### Production Deployment

If deploying to production:

1. **Add Authentication:**
   ```env
   VITE_JUDGE0_API_KEY=your-secret-key
   ```

2. **Use HTTPS:**
   - Put Judge0 behind a reverse proxy (nginx)
   - Enable SSL/TLS

3. **Rate Limiting:**
   - Implement request throttling
   - Set max execution time limits

4. **Network Isolation:**
   - Run Judge0 in isolated Docker network
   - Block outbound internet from workers

---

## 📚 Additional Resources

- **Judge0 Documentation:** https://ce.judge0.com/
- **Docker Documentation:** https://docs.docker.com/
- **GitHub Repository:** https://github.com/judge0/judge0

---

## ✅ Success Checklist

Before using the compiler, verify:

- [ ] Docker Desktop is running
- [ ] All 4 Judge0 containers are up (`docker ps`)
- [ ] API responds to `curl http://localhost:2358/languages`
- [ ] `.env` file has `VITE_JUDGE0_BASE_URL=http://localhost:2358`
- [ ] Development server restarted (`npm run dev`)
- [ ] "🔌 Test Judge0" button shows **✅ Judge0** (green)
- [ ] Can compile and run code in the Compiler page

---

## 🆘 Getting Help

If you're still having issues:

1. **Check logs:** `docker-compose logs -f api`
2. **Run diagnostics:** `npm run judge0:test`
3. **Restart everything:**
   ```bash
   docker-compose down
   docker-compose up -d
   npm run dev
   ```

4. **Check Console:** Open browser DevTools (F12) and look for errors

---

**Setup Date:** October 4, 2025  
**Judge0 Version:** 1.13.0  
**Status:** ✅ Fully Configured
