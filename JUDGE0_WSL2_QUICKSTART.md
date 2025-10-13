# 🚀 Judge0 WSL2 - Quick Start

## The Best Way to Run Judge0 on Windows

You have **WSL2 with Ubuntu** - this is perfect for Judge0! ✅

---

## ⚡ Super Quick Setup (One-Time)

### Option 1: Automated (Easiest)
```powershell
# From Windows PowerShell in project directory
npm run judge0:wsl:setup
```

### Option 2: Manual
```powershell
# Open WSL2
wsl

# Copy these commands in WSL2:
sudo apt update
curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo service docker start
exit

# Restart WSL2
wsl

# Navigate to project
cd /mnt/c/Users/kiret/Downloads/AceMyInterview

# Run setup script
bash scripts/setup/setup-judge0-wsl.sh
```

---

## 🎯 Daily Usage

### Start Judge0
```powershell
npm run judge0:wsl:start
```

### Stop Judge0
```powershell
npm run judge0:wsl:stop
```

### Start Frontend (in separate terminal)
```powershell
npm run dev
```

---

## ✅ Verify It's Working

1. **Open WSL2 and start Judge0:**
   ```bash
   wsl
   cd /mnt/c/Users/kiret/Downloads/AceMyInterview
   bash scripts/setup/start-judge0.sh
   ```

2. **Test the API:**
   ```bash
   curl http://localhost:2358/languages
   ```
   Should return list of 70+ languages ✅

3. **Test code execution:**
   ```bash
   curl -X POST http://localhost:2358/submissions?base64_encoded=false&wait=true \
     -H "Content-Type: application/json" \
     -d '{"language_id": 71, "source_code": "print(\"Hello!\")", "stdin": ""}'
   ```
   Should return `"stdout": "Hello!\n"` ✅

4. **Open your app in Windows:**
   ```powershell
   npm run dev
   ```
   Go to http://localhost:5173 and click "Test Judge0" button ✅

---

## 🔥 Why WSL2 is Perfect

| Feature | WSL2 | Docker Desktop | RapidAPI |
|---------|------|----------------|----------|
| **Works on Windows** | ✅ Perfect | ❌ Issues | ✅ Works |
| **Speed** | ⚡ Fast | 🐌 Slow | ⚡ Fast |
| **Unlimited Requests** | ✅ Yes | ✅ Yes | ❌ 50/day |
| **Setup Time** | 15 min | 5 min | 2 min |
| **Reliability** | ✅ 100% | ❌ 50% | ✅ 99% |
| **Cost** | Free | Free | Free/Paid |
| **Best For** | ✅ Development | ❌ | Production |

---

## 🐛 Troubleshooting

### Docker not starting in WSL2
```bash
sudo service docker start
```

### Permission denied
```bash
sudo usermod -aG docker $USER
exit
wsl  # Restart WSL2
```

### Can't access from Windows
```bash
# In WSL2, check if running:
docker ps

# Should see 4 containers:
# - judge0_api
# - judge0_worker
# - postgres
# - redis
```

### Port 2358 not accessible
```bash
# Check if API is listening:
netstat -tulpn | grep 2358

# Test from WSL2:
curl http://localhost:2358/languages
```

---

## 📁 Project Structure in WSL2

You can access Windows files from WSL2:
```bash
# Windows C: drive is at /mnt/c/
cd /mnt/c/Users/kiret/Downloads/AceMyInterview
```

For better performance, copy to WSL2:
```bash
cp -r /mnt/c/Users/kiret/Downloads/AceMyInterview ~/
cd ~/AceMyInterview
```

---

## 🎓 Key Commands

### WSL2
```powershell
wsl                           # Enter WSL2 Ubuntu
wsl --list --verbose          # Show distributions
wsl --shutdown                # Restart WSL2
```

### Docker in WSL2
```bash
sudo service docker start     # Start Docker
docker ps                     # Show containers
docker-compose logs -f api    # View Judge0 logs
```

### Judge0 in WSL2
```bash
cd /mnt/c/Users/kiret/Downloads/AceMyInterview/config/docker
docker-compose -f docker-compose-judge0-wsl.yml up -d      # Start
docker-compose -f docker-compose-judge0-wsl.yml down       # Stop
docker-compose -f docker-compose-judge0-wsl.yml restart    # Restart
```

---

## 🎉 Summary

1. ✅ You have WSL2 Ubuntu (perfect!)
2. ✅ Run `npm run judge0:wsl:setup` (one-time)
3. ✅ Run `npm run judge0:wsl:start` (daily)
4. ✅ Run `npm run dev` (start frontend)
5. ✅ Everything works!

**Judge0 API:** http://localhost:2358  
**Frontend:** http://localhost:5173

---

## 📚 Full Documentation

See [JUDGE0_WSL2_SETUP.md](./docs/JUDGE0_WSL2_SETUP.md) for complete guide.
