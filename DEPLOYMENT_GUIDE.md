# 🚀 Deployment Configuration Reference

## ✅ Fixed: All deployment configs now point to `frontend/` folder

### 📦 Vercel Deployment

**File**: `vercel.json` (at root)

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "installCommand": "cd frontend && npm ci"
}
```

**Deploy Steps**:
1. Push to GitHub
2. Import project in Vercel
3. Vercel will auto-detect settings
4. Add environment variables in Vercel dashboard:
   ```
   VITE_API_BASE_URL=https://acemyinterview-backend.onrender.com
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_GEMINI_API_KEY=your_key
   ```
5. Deploy!

---

### 🔥 Firebase Hosting

**Files**: `.firebaserc` and `firebase.json` (at root)

```json
{
  "hosting": {
    "public": "frontend/dist"
  }
}
```

**Deploy Steps**:
```bash
# Build frontend first
cd frontend
npm run build
cd ..

# Deploy from root
firebase deploy --only hosting
```

---

### 📡 Netlify Deployment

**File**: `netlify.toml` (at root)

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "dist"
```

**Deploy Steps**:

**Option 1: Drag & Drop**
```bash
cd frontend
npm run build
# Drag the 'frontend/dist' folder to Netlify
```

**Option 2: Git Integration**
1. Connect GitHub repo to Netlify
2. Netlify will auto-detect `netlify.toml`
3. Add environment variables in Netlify dashboard
4. Deploy!

**Option 3: CLI**
```bash
npm install -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

### 🎯 Render.com (Backend)

**File**: `render.yaml` (at root)

```yaml
services:
  - type: web
    name: acemyinterview-backend
    rootDir: backend
    buildCommand: npm install
    startCommand: npm start
```

**Deploy Steps**:
1. Push to GitHub
2. Connect repo in Render dashboard
3. Render auto-detects `render.yaml`
4. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_uri
   GEMINI_API_KEY=your_key
   JWT_SECRET=NMKRSPVLIDATA_JWT_SECRET
   NODE_ENV=production
   ```
5. Deploy!

---

## 📁 Project Structure

```
AceMyInterview/
├── frontend/              ← Frontend source
│   ├── src/
│   ├── public/
│   ├── dist/             ← Build output (generated)
│   ├── package.json
│   └── vite.config.js
├── backend/              ← Backend source
│   ├── server.js
│   └── package.json
├── vercel.json           ← Vercel config (points to frontend/)
├── firebase.json         ← Firebase config (points to frontend/dist)
├── .firebaserc           ← Firebase project
├── netlify.toml          ← Netlify config (base: frontend)
└── render.yaml           ← Render config (rootDir: backend)
```

---

## 🔧 Environment Variables

### Frontend (All Platforms)
Add these in your deployment platform's dashboard:

```env
VITE_API_BASE_URL=https://acemyinterview-backend.onrender.com
VITE_SUPABASE_URL=https://exzesygjgprxiuqozjns.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Backend (Render)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=NMKRSPVLIDATA_JWT_SECRET
NODE_ENV=production
PORT=10000
```

---

## ✅ Pre-Deployment Checklist

### Frontend
- [ ] Environment variables configured
- [ ] `.env.production` has correct backend URL
- [ ] `npm run build` completes successfully
- [ ] Test build locally: `npm run preview`

### Backend
- [ ] MongoDB connection string is correct
- [ ] All API keys are set
- [ ] CORS origins include your frontend URL
- [ ] `npm start` works locally

---

## 🐛 Troubleshooting

### Vercel: "Could not read package.json"
✅ **FIXED**: `vercel.json` now includes `cd frontend` in commands

### Netlify: Build fails
✅ **FIXED**: `netlify.toml` now sets `base = "frontend"`

### Firebase: No files deployed
✅ **FIXED**: `firebase.json` now points to `frontend/dist`

### Backend CORS errors
Check `backend/server.js` CORS configuration includes your frontend URL:
```javascript
const allowedOrigins = [
  'https://acemyinterview.app',
  'https://your-app.vercel.app',
  'http://localhost:5173'
];
```

---

## 🎯 Quick Deploy Commands

### Build Frontend
```bash
cd frontend
npm run build
```

### Deploy to Firebase
```bash
cd frontend && npm run build && cd .. && firebase deploy --only hosting
```

### Deploy to Netlify (CLI)
```bash
cd frontend && npm run build && netlify deploy --prod --dir=dist
```

### Deploy to Vercel (CLI)
```bash
vercel --prod
```

---

## 📚 Related Docs
- [QUICK_START.md](./QUICK_START.md) - Development setup
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Full structure guide
- [RENDER_DEPLOYMENT_STEPS.md](./RENDER_DEPLOYMENT_STEPS.md) - Backend deployment

---

**Last Updated**: November 18, 2025
**Status**: ✅ All configs fixed and tested
