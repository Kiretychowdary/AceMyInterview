# 🚀 Quick Start Guide - AceMyInterview

## Project Structure
```
AceMyInterview/
├── frontend/     # React + Vite Frontend
├── backend/      # Express.js Backend
└── docs/         # Documentation
```

## ⚡ Development Commands

### Frontend (from root directory)
```bash
cd frontend
npm install          # First time only
npm run dev         # Start dev server on http://localhost:5173
```

### Backend (from root directory)
```bash
cd backend
npm install          # First time only
npm start           # Start server on http://localhost:5000
```

### Run Both Together
```bash
# Terminal 1
cd backend && npm start

# Terminal 2  
cd frontend && npm run dev
```

## 📦 Build & Deploy

### Frontend Build
```bash
cd frontend
npm run build       # Creates 'dist' folder
```

### Deploy Backend to Render
1. Push to GitHub: `git push origin main`
2. Go to https://dashboard.render.com/
3. Click "New +" → "Web Service"
4. Select repo and let Render auto-detect `render.yaml`
5. Add environment variables (see below)

## 🔑 Environment Variables

### Frontend (.env in frontend/)
```env
VITE_API_BASE_URL=https://acemyinterview-backend.onrender.com
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Backend (Set in Render dashboard)
```env
MONGODB_URI=your_mongodb_connection
GEMINI_API_KEY=your_api_key
JWT_SECRET=NMKRSPVLIDATA_JWT_SECRET
```

## 🌐 URLs

- **Local Frontend**: http://localhost:5173
- **Local Backend**: http://localhost:5000
- **Production Backend**: https://acemyinterview-backend.onrender.com
- **Production Frontend**: https://acemyinterview.app

## ✅ Verify Setup

Test backend health:
```bash
curl https://acemyinterview-backend.onrender.com/api/health
```

Should return:
```json
{"status": "healthy"}
```

## 📚 Full Documentation
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Complete structure guide
- [RENDER_DEPLOYMENT_STEPS.md](./RENDER_DEPLOYMENT_STEPS.md) - Deployment guide
- [URGENT_BACKEND_FIX.md](./URGENT_BACKEND_FIX.md) - Troubleshooting CORS

## 🐛 Common Issues

**Frontend can't connect to backend?**
```bash
cd frontend
# Check .env file has correct VITE_API_BASE_URL
cat .env
```

**Backend not starting?**
```bash
cd backend
npm install
npm start
```

**CORS errors?**
- Make sure backend is running
- Check backend/server.js CORS configuration
- Verify environment variables are set correctly
