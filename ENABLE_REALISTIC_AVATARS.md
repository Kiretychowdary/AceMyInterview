# 🎬 Enable REALISTIC Lip-Syncing AI Avatars

## What You're Getting

Instead of this 👇
```
🧑‍💼 (Emoji avatar with gradient background)
```

You'll get this 👇
```
👤 REAL HUMAN FACE with:
✅ Perfect lip-sync with speech
✅ Natural facial expressions
✅ Eye blinking and head movements
✅ Realistic skin texture and lighting
```

## 🚀 Quick Start (3 Steps)

### Step 1: Start SadTalker Service

Open a **NEW terminal** in the `backend` folder and run:

**Windows (PowerShell):**
```powershell
cd backend
.\start_sadtalker.ps1
```

**Mac/Linux:**
```bash
cd backend
chmod +x start_sadtalker.sh
./start_sadtalker.sh
```

**Or manually:**
```bash
cd backend
python services/sadtalkerService.py
```

You should see:
```
🚀 Starting SadTalker Avatar Service...
📍 Device: cuda (or cpu)
📂 SadTalker Path: ...
 * Running on http://0.0.0.0:5001
```

✅ **Keep this terminal running!** The service needs to stay active.

### Step 2: Test Video Generation

Open **another terminal** and run the test:

```bash
cd backend
python test_sadtalker.py
```

This will:
- ✅ Check if service is running
- ✅ Generate a test video
- ✅ Save it to `backend/test_outputs/`
- ✅ Verify everything works

**Expected output:**
```
🧪 SadTalker Video Generation Test Suite
✅ Service is healthy!
🎬 Testing video generation...
✅ Video generated in 12.34 seconds!
💾 Video saved to: backend/test_outputs/test_video_xxxxx.mp4
```

👉 **OPEN THE VIDEO** to see your realistic talking head!

### Step 3: Enable in Your App

**Option A: Enable for specific interview (Recommended)**

In your `FaceToFaceInterview.jsx`, pass `enableSadTalker={true}`:

```jsx
<Avatar3D
  textToSpeak="Welcome to your interview!"
  expression="neutral"
  feedbackText="Question 1 of 5"
  enableSadTalker={true}  // 👈 ADD THIS!
/>
```

**Option B: Use the setup wizard**

The `InterviewAvatarSetup` component already has SadTalker toggle:

```jsx
import InterviewAvatarSetup from '../../components/interview/InterviewAvatarSetup';

// ... in your component
<InterviewAvatarSetup
  interviewConfig={interviewConfig}
  onComplete={(config) => {
    // config.settings.useSadTalker will be true if user enabled it
    setAvatarConfig(config);
  }}
  onCancel={() => navigate('/dashboard')}
/>
```

## 🎭 How It Works

```
┌─────────────────────────────────────────────┐
│  1. User starts face-to-face interview     │
│     ↓                                       │
│  2. Avatar3D component receives text        │
│     ↓                                       │
│  3. Sends to SadTalker service (port 5001)  │
│     ↓                                       │
│  4. Service generates video:                │
│     • Converts text → audio (TTS)          │
│     • Loads avatar image                    │
│     • Generates lip-sync video              │
│     • Returns video as base64               │
│     ↓                                       │
│  5. Avatar3D displays real talking video    │
│     ✨ Realistic human face speaking!       │
└─────────────────────────────────────────────┘
```

## 🎨 Customizing Your Avatar

### Use Your Own Face

```jsx
// In InterviewAvatarSetup or directly in Avatar3D
const avatarConfig = {
  avatar: {
    url: 'path/to/your/photo.jpg',  // Your photo!
    isCustom: true
  }
};

<Avatar3D
  avatarConfig={avatarConfig}
  enableSadTalker={true}
/>
```

### Use Example Avatars

SadTalker comes with professional example faces:
- `backend/SadTalker/examples/source_image/full3.png`
- `backend/SadTalker/examples/source_image/full4.jpeg`
- And many more artistic portraits

### Upload During Interview

The `AvatarSelector` component lets users upload their photo:

```jsx
import AvatarSelector from '../../components/interview/AvatarSelector';

<AvatarSelector
  onAvatarSelect={(avatar) => {
    setSelectedAvatar(avatar);
    // avatar.url contains the image
    // avatar.isCustom is true for uploads
  }}
  onClose={() => setShowSelector(false)}
/>
```

## ⚙️ Performance Tuning

### Fast Mode (Real-time interviews)
```python
# In sadtalkerService.py, quick_generate uses:
still_mode=True        # Less head movement = faster
use_enhancer=False     # Skip quality enhancement
preprocess='crop'      # Fast cropping
```

**Generation time:** ~5-10 seconds per sentence

### Quality Mode (Final videos)
```python
# In generateAvatarVideo:
still_mode=False       # Natural head movements
use_enhancer=True      # GFPGAN face enhancement
preprocess='full'      # Best quality
```

**Generation time:** ~15-30 seconds per sentence

### GPU vs CPU

**With GPU (CUDA):**
- Generation: 5-10 seconds ⚡
- Recommended for production

**Without GPU (CPU only):**
- Generation: 30-60 seconds 🐌
- Works but slower

Check your device:
```bash
curl http://localhost:5001/health
```

Response:
```json
{
  "status": "healthy",
  "device": "cuda",  // or "cpu"
  "model_loaded": true
}
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to SadTalker service"

**Solution:** Start the service first!
```bash
cd backend
python services/sadtalkerService.py
```

### Issue: "Video generation takes too long"

**Solution:** 
1. First generation always takes longer (model loading)
2. Use `quick-generate` endpoint
3. Enable GPU if available
4. Use `still_mode=True`

### Issue: "Model loading failed"

**Solution:** Install SadTalker properly:
```bash
cd backend
git clone https://github.com/OpenTalker/SadTalker.git
cd SadTalker

# Install dependencies
pip install -r requirements.txt

# Download checkpoints (required!)
# Follow: https://github.com/OpenTalker/SadTalker#-quick-start
```

### Issue: Still shows emoji instead of video

**Solution:** Check these:
1. ✅ Service is running (port 5001)
2. ✅ `enableSadTalker={true}` is set
3. ✅ No errors in browser console
4. ✅ No errors in service terminal

**Debug in browser console:**
```javascript
// Should show:
🎬 Generating avatar video for: Hello...
✅ Avatar video generated successfully
```

### Issue: "No default avatar found"

**Solution:** Add an avatar image:
```bash
# Use SadTalker examples
cd backend/SadTalker/examples/source_image
# These images are already there!
```

Or create one:
```bash
cd backend
python create_placeholder_avatar.py
```

## 📊 API Endpoints

### Health Check
```bash
GET http://localhost:5001/health
```

### Initialize Avatar
```bash
POST http://localhost:5001/api/avatar/initialize
Content-Type: application/json

{
  "avatarImage": "data:image/png;base64,..."
}
```

### Generate Video (Standard)
```bash
POST http://localhost:5001/api/avatar/generate
Content-Type: application/json

{
  "text": "Hello, welcome to the interview!",
  "preprocess": "crop",
  "stillMode": false,
  "useEnhancer": true,
  "returnBase64": true
}
```

### Quick Generate (Fast)
```bash
POST http://localhost:5001/api/avatar/quick-generate
Content-Type: application/json

{
  "text": "Hello, welcome to the interview!"
}
```

## 🎯 Production Checklist

Before deploying:

- [ ] SadTalker service starts automatically
- [ ] GPU is enabled and working
- [ ] Default avatar image is set
- [ ] Generated videos are cached
- [ ] Service has error recovery
- [ ] Video files are cleaned up periodically
- [ ] Frontend handles loading states
- [ ] Fallback mode works if service is down

## 🔥 Quick Commands Cheat Sheet

```bash
# Start service
cd backend && python services/sadtalkerService.py

# Test service
cd backend && python test_sadtalker.py

# Check if running
curl http://localhost:5001/health

# View generated test videos
cd backend/test_outputs && ls

# Start your main app
cd frontend && npm run dev
cd backend && npm start
```

## 🎉 Success!

If everything works, you should:
1. ✅ See real human faces in avatars
2. ✅ See perfect lip-sync with text
3. ✅ See natural expressions and movements
4. ✅ Get videos in ~5-10 seconds

**Compare:**

Before: 🧑‍💼 (emoji)
After: 👤 (realistic human with lip-sync)

## 📚 Resources

- **SadTalker GitHub:** https://github.com/OpenTalker/SadTalker
- **Paper:** https://arxiv.org/abs/2211.12194
- **Demo:** https://sadtalker.github.io/

## 🆘 Still Need Help?

1. Check service logs in the terminal
2. Check browser console for errors
3. Run test script: `python test_sadtalker.py`
4. Verify service is on port 5001
5. Try the fallback mode first, then enable SadTalker

---

**Made with ❤️ using SadTalker AI**
