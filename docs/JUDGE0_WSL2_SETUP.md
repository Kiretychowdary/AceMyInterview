# Judge0 Self-Hosted Setup Using WSL2 Ubuntu
## Running Judge0 Properly on Windows via Linux Subsystem

---

## 🎯 Why Use WSL2?

You have **WSL2 with Ubuntu** installed! This means you can run Judge0 with **full Linux support**:
- ✅ **Proper cgroups** - Resource isolation works
- ✅ **Real Linux kernel** - No emulation
- ✅ **Full Docker support** - Native Linux containers
- ✅ **Better performance** - Direct kernel access
- ✅ **/box directory works** - No filesystem issues

---

## 🚀 Quick Setup (10 minutes)

### Step 1: Open WSL2 Ubuntu Terminal

```powershell
# From PowerShell or Windows Terminal
wsl
```

Or just open **"Ubuntu"** from Start menu.

### Step 2: Install Docker in WSL2 (if not already)

```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (no sudo needed)
sudo usermod -aG docker $USER

# Start Docker service
sudo service docker start

# Verify Docker is running
docker --version
docker ps
```

### Step 3: Install Docker Compose

```bash
# Install docker-compose
sudo apt install docker-compose -y

# Verify installation
docker-compose --version
```

### Step 4: Copy Project to WSL2

You have two options:

**Option A: Access Windows files from WSL2**
```bash
# Windows C: drive is mounted at /mnt/c/
cd /mnt/c/Users/kiret/Downloads/AceMyInterview
```

**Option B: Copy project to WSL2 (Better performance)**
```bash
# Copy entire project to WSL2 home directory
cp -r /mnt/c/Users/kiret/Downloads/AceMyInterview ~/
cd ~/AceMyInterview
```

### Step 5: Start Judge0 in WSL2

```bash
# Navigate to docker config
cd config/docker

# Fix the paths in docker-compose file for Linux
# The judge0-env folder should be relative to project root
cd ../..

# Start Judge0 services
cd judge0-env
docker-compose -f ../config/docker/docker-compose-judge0.yml up -d

# Or if you're in the project root:
cd config/docker
docker-compose -f docker-compose-judge0.yml up -d
```

### Step 6: Wait for Initialization

```bash
# Wait 30-60 seconds, then check containers
docker ps

# Should see 4 containers running:
# - judge0_api
# - judge0_worker  
# - postgres
# - redis
```

### Step 7: Test Judge0 API

```bash
# Test the API endpoint
curl http://localhost:2358/languages

# Test code execution
curl -X POST http://localhost:2358/submissions?base64_encoded=false&wait=true \
  -H "Content-Type: application/json" \
  -d '{"language_id": 71, "source_code": "print(\"Hello Judge0!\")", "stdin": ""}'
```

If you see `{"stdout": "Hello Judge0!\n", "status": {"id": 3, ...}}` - **SUCCESS!** ✅

---

## 🔧 Fix Docker Compose Paths for WSL2

The current docker-compose file has Windows-style paths. Let me create a WSL2-compatible version:

```yaml
# docker-compose-judge0-wsl.yml
services:
  db:
    image: postgres:13.0
    env_file: ../../judge0-env/judge0.env
    volumes:
      - postgres-data:/var/lib/postgresql/data/
    restart: always

  redis:
    image: redis:6.0
    command: ["bash", "-c", 'docker-entrypoint.sh --appendonly yes --requirepass "$$REDIS_PASSWORD"']
    env_file: ../../judge0-env/judge0.env
    volumes:
      - redis-data:/data
    restart: always

  api:
    image: judge0/judge0:1.13.0
    env_file: ../../judge0-env/judge0.env
    ports:
      - "2358:2358"
    volumes:
      - ../../judge0-env/judge0-config.yml:/judge0.conf:ro
    privileged: true
    depends_on:
      - db
      - redis
    restart: always

  worker:
    image: judge0/judge0:1.13.0
    command: ["./scripts/workers"]
    env_file: ../../judge0-env/judge0.env
    volumes:
      - ../../judge0-env/judge0-config.yml:/judge0.conf:ro
    privileged: true
    depends_on:
      - db
      - redis
      - api
    restart: always

volumes:
  postgres-data:
  redis-data:
```

---

## 🌐 Access Judge0 from Windows

Once Judge0 is running in WSL2, you can access it from Windows:

### From Windows Browser/Frontend:
```
http://localhost:2358
```

WSL2 automatically forwards ports to Windows!

### Update .env in Windows:
```env
VITE_JUDGE0_BASE_URL=http://localhost:2358
VITE_JUDGE0_HOST=localhost
VITE_JUDGE0_TIMEOUT_MS=30000
```

### Start Frontend in Windows:
```powershell
# In Windows PowerShell
cd C:\Users\kiret\Downloads\AceMyInterview
npm run dev
```

Now your frontend (Windows) can communicate with Judge0 (WSL2)! ✅

---

## 🔄 Daily Workflow

### Start Judge0:
```bash
# Open WSL2
wsl

# Start Docker
sudo service docker start

# Start Judge0
cd ~/AceMyInterview/config/docker  # or use /mnt/c path
docker-compose -f docker-compose-judge0.yml up -d
```

### Stop Judge0:
```bash
docker-compose -f docker-compose-judge0.yml down
```

### Check Logs:
```bash
docker-compose logs -f api
docker-compose logs -f worker
```

---

## 🐛 Troubleshooting in WSL2

### Issue: Docker service not starting
```bash
sudo service docker start
# If error, try:
sudo dockerd
```

### Issue: Permission denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and log back in to WSL2
exit
wsl
```

### Issue: Can't access from Windows
```bash
# Check if port is listening
netstat -tulpn | grep 2358

# Make sure containers are running
docker ps

# Test from WSL2 first
curl http://localhost:2358/languages
```

### Issue: Containers crash
```bash
# Check logs
docker-compose logs api
docker-compose logs worker

# Restart with fresh state
docker-compose down -v
docker-compose up -d
```

---

## ⚡ Performance Tips

### 1. Run Project from WSL2 (not /mnt/c)
```bash
# SLOW (Windows filesystem)
cd /mnt/c/Users/kiret/Downloads/AceMyInterview

# FAST (Linux filesystem)
cp -r /mnt/c/Users/kiret/Downloads/AceMyInterview ~/
cd ~/AceMyInterview
```

### 2. Increase WSL2 Memory
Create/edit `%USERPROFILE%\.wslconfig` in Windows:
```ini
[wsl2]
memory=4GB
processors=4
```

### 3. Keep Docker Running
Don't stop/start Docker frequently - leave it running for best performance.

---

## 🎯 Verification Checklist

- [ ] WSL2 Ubuntu is running
- [ ] Docker is installed in WSL2
- [ ] Docker Compose is installed
- [ ] Judge0 containers are running (`docker ps`)
- [ ] API responds to `curl http://localhost:2358/languages`
- [ ] Code execution works (test with Python)
- [ ] Windows frontend can reach Judge0 at `localhost:2358`

---

## 🆚 Comparison: WSL2 vs Docker Desktop vs RapidAPI

| Feature | WSL2 Judge0 | Docker Desktop | RapidAPI |
|---------|------------|----------------|----------|
| **Setup Time** | 15 min (one-time) | 5 min | 2 min |
| **Works on Windows** | ✅ Perfect | ❌ Has issues | ✅ Perfect |
| **Speed** | ⚡ Very Fast | 🐌 Slow/Errors | ⚡ Fast |
| **Maintenance** | Low (start/stop) | High (issues) | None |
| **Cost** | Free | Free | Free (limited) |
| **Requests/Day** | Unlimited | Unlimited | 50 (free tier) |
| **Best For** | Development | Not Judge0 | Production |

---

## 📚 Resources

- WSL2 Setup: https://learn.microsoft.com/en-us/windows/wsl/install
- Docker in WSL2: https://docs.docker.com/desktop/wsl/
- Judge0 Docs: https://ce.judge0.com/

---

## ✅ Summary

**You have the BEST setup for self-hosting Judge0 on Windows:**

1. ✅ WSL2 Ubuntu is already installed
2. ✅ Install Docker in WSL2 (not Docker Desktop)
3. ✅ Run Judge0 containers in WSL2
4. ✅ Access from Windows frontend at `localhost:2358`
5. ✅ Everything works perfectly!

**Next step:** Open WSL2 terminal and follow the setup steps above!
