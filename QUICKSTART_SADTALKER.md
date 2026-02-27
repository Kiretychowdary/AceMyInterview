# 🚀 Quick Start: SadTalker Avatar Integration

Get your AI interviewer talking with realistic lip sync in just a few minutes!

## ⚡ Fast Setup (5 Minutes)

### Step 1: Install Dependencies

```powershell
# In backend directory
cd backend

# Install Node.js dependencies
npm install

# Run SadTalker setup
.\setup_sadtalker.ps1
```

### Step 2: Add Avatar Image

Download a professional headshot or use your own photo:

```powershell
# Place your avatar image here:
# backend/assets/default_avatar.png

# Or use this sample image
# Download from: https://thispersondoesnotexist.com/
# Save as: backend/assets/default_avatar.png
```

**Image Requirements:**
- ✅ Front-facing portrait
- ✅ Clear facial features
- ✅ 512x512 or 1024x1024 pixels
- ✅ PNG or JPG format

### Step 3: Start Services

**Terminal 1 - SadTalker Service:**
```powershell
cd backend
.\start_sadtalker.ps1
```

**Terminal 2 - Main Backend:**
```powershell
cd backend
npm start
```

**Terminal 3 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Step 4: Test It!

1. Open your browser: `http://localhost:5173`
2. Navigate to Face-to-Face Interview
3. Click "Start Interview"
4. Watch your AI interviewer come to life! 🎭

## 🧪 Quick Test

Test if SadTalker is working:

```powershell
# Check service health
curl http://localhost:5001/health

# Generate a test video
curl -X POST http://localhost:5001/api/avatar/quick-generate `
  -H "Content-Type: application/json" `
  -d '{"text": "Hello! Welcome to your interview."}'
```

## 🎯 What You Should See

### Before (Old Version)
```
┌─────────────────┐
│       😊        │  ← Static emoji
│  AI Interviewer │
│  (Lip sync &    │
│ expressions soon)│
└─────────────────┘
```

### After (With SadTalker)
```
┌─────────────────┐
│   🎬 VIDEO      │  ← Real talking head
│  AI Interviewer │  ← Synchronized lips
│  [● Speaking]   │  ← Live expressions
└─────────────────┘
```

## 🔧 Troubleshooting

### Problem: Python not found
```powershell
# Install Python 3.8+
# Download from: https://www.python.org/downloads/
# Make sure to check "Add Python to PATH"
```

### Problem: CUDA errors
```powershell
# Option 1: Install CUDA (for GPU)
# Download from: https://developer.nvidia.com/cuda-downloads

# Option 2: Use CPU mode (slower but works)
# Edit backend/services/sadtalkerService.py
# Change: self.device = "cpu"
```

### Problem: Port 5001 already in use
```powershell
# Find and kill the process
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Or change port in .env
SADTALKER_SERVICE_URL=http://localhost:5002
```

### Problem: Slow generation
```powershell
# Enable fast mode in Avatar3D.jsx
# The component already uses quick-generate by default
# If still slow, disable face enhancer:
# Edit backend/services/sadtalkerService.py
# Set: use_enhancer=False
```

## 📊 Performance Tips

### For Development (Fast)
- ✅ Use CPU mode if no GPU
- ✅ Disable face enhancer
- ✅ Use still_mode=True
- ⏱️ Generation time: ~10-15 seconds

### For Production (Quality)
- ✅ Use GPU with CUDA
- ✅ Enable face enhancer
- ✅ Use still_mode=False
- ⏱️ Generation time: ~3-5 seconds

### For Demo (Balanced)
- ✅ Use GPU with CUDA
- ✅ Enable face enhancer
- ✅ Use still_mode=True
- ⏱️ Generation time: ~2-3 seconds ⚡

## 🎨 Customization

### Change Avatar Emotion

The avatar automatically adjusts based on context:
- `neutral` - Default professional look
- `encouraging` - Positive feedback
- `thinking` - Processing answer
- `happy` - Great answer received

### Use Custom Avatar Per Interview

```javascript
// In your interview component
await axios.post('/api/avatar/upload-image', formData);
```

### Pre-generate Questions

For faster interviews, pre-generate videos:

```javascript
const questions = [
  { id: 1, text: "Tell me about yourself" },
  { id: 2, text: "What are your strengths?" }
];

await axios.post('/api/avatar/batch-generate', { questions });
```

## 📝 Next Steps

1. ✅ Read the full documentation: [SADTALKER_INTEGRATION.md](SADTALKER_INTEGRATION.md)
2. ✅ Customize your avatar image
3. ✅ Adjust performance settings
4. ✅ Test with real interviews
5. ✅ Deploy to production

## 🎉 Success Checklist

- [ ] Python 3.8+ installed
- [ ] SadTalker setup completed
- [ ] Avatar image added
- [ ] Both services running
- [ ] Health check passes
- [ ] Test generation works
- [ ] Frontend displays video
- [ ] Lip sync is accurate
- [ ] Performance is acceptable

## 💡 Tips & Tricks

### Faster Startup
```powershell
# Create a startup script
# start_all.ps1

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\start_sadtalker.ps1"
Start-Sleep 5
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"
Start-Sleep 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
```

### Monitor Performance
```powershell
# Watch GPU usage (if using CUDA)
nvidia-smi -l 1

# Watch service logs
Get-Content backend/sadtalker.log -Wait
```

### Debug Mode
```javascript
// In Avatar3D.jsx
// Enable dev mode toggle to switch between modes
if (import.meta.env.DEV) {
  // Switch between SadTalker and fallback
}
```

## 🆘 Need Help?

1. Check [SADTALKER_INTEGRATION.md](SADTALKER_INTEGRATION.md) for detailed docs
2. Review error logs in console
3. Test each service independently
4. Open an issue on GitHub

---

**Ready to impress? Start your AI interviewer now! 🎭🚀**
