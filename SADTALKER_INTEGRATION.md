# SadTalker AI Avatar Integration

Real-time AI interviewer avatar with accurate lip sync and facial expressions powered by [SadTalker](https://github.com/OpenTalker/SadTalker).

## 🎯 Features

- ✅ **Realistic Lip Sync**: Accurate mouth movements synchronized with speech
- ✅ **Natural Expressions**: Dynamic facial expressions during conversation
- ✅ **Real-time Generation**: Fast video generation optimized for interviews
- ✅ **Custom Avatars**: Use your own professional headshot
- ✅ **Automatic Fallback**: Graceful degradation to emoji avatar if needed
- ✅ **GPU Acceleration**: CUDA support for faster generation
- ✅ **Face Enhancement**: Optional GFPGAN integration for better quality

## 📋 Prerequisites

### System Requirements

- **Python**: 3.8 or higher
- **Node.js**: 16 or higher (for backend API)
- **Memory**: 8GB RAM minimum (16GB recommended)
- **Storage**: 5GB free space (for models and temp files)
- **GPU** (Optional): NVIDIA GPU with CUDA 11.8+ for better performance

### Required Software

1. **Python 3.8+**: [Download here](https://www.python.org/downloads/)
2. **Git**: [Download here](https://git-scm.com/downloads)
3. **FFmpeg**: [Download here](https://ffmpeg.org/download.html)
4. **Node.js & npm**: Already installed for the main backend

## 🚀 Installation

### Windows

```powershell
cd backend
.\setup_sadtalker.ps1
```

### Linux/Mac

```bash
cd backend
chmod +x setup_sadtalker.sh
./setup_sadtalker.sh
```

### What the Setup Does

1. ✅ Clone SadTalker repository
2. ✅ Create Python virtual environment
3. ✅ Install PyTorch and dependencies
4. ✅ Download pretrained models (~2GB)
5. ✅ Set up directory structure
6. ✅ Test installation

## 🖼️ Setting Up Your Avatar

### Option 1: Use Default Avatar

1. Find a professional headshot photo (your face or a stock photo)
2. Requirements:
   - Front-facing portrait
   - Clear facial features
   - Good lighting
   - Resolution: 512x512 or 1024x1024 recommended
   - Format: PNG or JPG
3. Save as: `backend/assets/default_avatar.png`

### Option 2: Upload Custom Avatar (Runtime)

Use the API endpoint to set a custom avatar:

```javascript
// Upload from frontend
const formData = new FormData();
formData.append('avatar', avatarFile);

await axios.post('/api/avatar/upload-image', formData);
```

## 🎬 Usage

### 1. Start the SadTalker Service

**Windows:**
```powershell
cd backend
.\start_sadtalker.ps1
```

**Linux/Mac:**
```bash
cd backend
source venv_sadtalker/bin/activate
python3 services/sadtalkerService.py
```

The service will start on `http://localhost:5001`

### 2. Start Your Main Backend

```bash
cd backend
npm start
```

### 3. Access Your Application

The frontend will now automatically use the SadTalker avatar when asking interview questions!

## 🔧 Configuration

### Environment Variables

Add to your `.env` file:

```env
# SadTalker Service URL
SADTALKER_SERVICE_URL=http://localhost:5001

# Avatar Settings
AVATAR_PREPROCESS=crop  # Options: crop, resize, full
AVATAR_STILL_MODE=false  # true = less head movement (faster)
AVATAR_USE_ENHANCER=true  # true = use GFPGAN face enhancement
```

### Performance Tuning

#### For Speed (Real-time Interviews)
```javascript
{
  preprocess: 'crop',
  stillMode: true,
  useEnhancer: false
}
```

#### For Quality (Pre-recorded)
```javascript
{
  preprocess: 'full',
  stillMode: false,
  useEnhancer: true
}
```

## 📡 API Endpoints

### Initialize Avatar
```http
POST /api/avatar/initialize
Content-Type: application/json

{
  "avatarImage": "data:image/png;base64,..." // Optional
}
```

### Generate Avatar Video (Standard)
```http
POST /api/avatar/generate
Content-Type: application/json

{
  "text": "Hello, I'm your AI interviewer...",
  "options": {
    "preprocess": "crop",
    "stillMode": false,
    "useEnhancer": true,
    "returnBase64": true
  }
}
```

### Quick Generate (Optimized)
```http
POST /api/avatar/quick-generate
Content-Type: application/json

{
  "text": "What is your experience with React?"
}
```

### Batch Generate (For Interview Prep)
```http
POST /api/avatar/batch-generate
Content-Type: application/json

{
  "questions": [
    { "id": 1, "text": "Tell me about yourself" },
    { "id": 2, "text": "What are your strengths?" }
  ]
}
```

### Health Check
```http
GET /api/avatar/health
```

## 🎨 Frontend Integration

The `Avatar3D` component automatically handles SadTalker integration:

```jsx
import Avatar3D from './components/interview/Avatar3D';

<Avatar3D 
  textToSpeak="Hello, I'm your AI interviewer!"
  expression="neutral"
  feedbackText="Listening..."
/>
```

### Features:
- ✅ Automatic video generation when text changes
- ✅ Graceful fallback to emoji avatar on errors
- ✅ Loading states and error handling
- ✅ Video looping for continuous display
- ✅ Speaking indicators
- ✅ Dev mode toggle for testing

## 🐛 Troubleshooting

### Issue: "SadTalker service not available"

**Solution:**
1. Make sure the Python service is running: `curl http://localhost:5001/health`
2. Check if port 5001 is available
3. Review Python service logs for errors

### Issue: "Very slow generation"

**Solutions:**
- ✅ Enable `stillMode: true` for faster generation
- ✅ Disable `useEnhancer: false`
- ✅ Use `preprocess: 'crop'` instead of 'full'
- ✅ Install CUDA for GPU acceleration

### Issue: "CUDA out of memory"

**Solutions:**
- ✅ Reduce video resolution
- ✅ Close other GPU-intensive applications
- ✅ Use CPU mode: Set `device = "cpu"` in `sadtalkerService.py`

### Issue: "Avatar quality is poor"

**Solutions:**
- ✅ Use a higher quality source image (1024x1024)
- ✅ Enable face enhancer: `useEnhancer: true`
- ✅ Use `preprocess: 'full'` for better results
- ✅ Ensure good lighting in source photo

### Issue: "Import errors during setup"

**Solutions:**
- ✅ Make sure Python 3.8+ is installed
- ✅ Reinstall dependencies: `pip install -r requirements_sadtalker.txt --force-reinstall`
- ✅ Check CUDA compatibility with PyTorch version

## 🔬 Testing

### Test SadTalker Service

```bash
# Activate virtual environment
source venv_sadtalker/bin/activate  # Linux/Mac
.\venv_sadtalker\Scripts\Activate.ps1  # Windows

# Test imports
python -c "import torch; print(torch.__version__)"
python -c "import cv2; print(cv2.__version__)"

# Test service
curl http://localhost:5001/health
```

### Test Generation

```bash
curl -X POST http://localhost:5001/api/avatar/quick-generate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test!"}'
```

## 📊 Performance Metrics

| Setup | Generation Time | Quality | Use Case |
|-------|----------------|---------|----------|
| CPU + Still Mode | ~10-15s | Good | Development |
| CPU + Full Mode | ~30-45s | Excellent | Pre-recording |
| GPU + Still Mode | ~3-5s | Good | Real-time interviews ✅ |
| GPU + Full Mode | ~8-12s | Excellent | High quality demos |

## 🎯 Production Deployment

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start services
pm2 start backend/sadtalker-service.sh --name sadtalker
pm2 start backend/server.js --name api

# Save configuration
pm2 save
pm2 startup
```

### Using Docker (Coming Soon)

We're working on Docker support for easier deployment!

## 🤝 Contributing

Found a bug or want to improve the avatar? Contributions welcome!

## 📄 License

This project uses [SadTalker](https://github.com/OpenTalker/SadTalker) which is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.

## 🙏 Credits

- **SadTalker**: [OpenTalker/SadTalker](https://github.com/OpenTalker/SadTalker)
- **GFPGAN**: [TencentARC/GFPGAN](https://github.com/TencentARC/GFPGAN)
- **PyTorch**: [pytorch.org](https://pytorch.org/)

## 📞 Support

Need help? 
- 📖 Check the [troubleshooting section](#-troubleshooting)
- 💬 Open an issue on GitHub
- 📧 Contact the development team

---

**Made with ❤️ for AceMyInterview**
