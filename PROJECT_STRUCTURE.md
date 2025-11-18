# 📁 AceMyInterview - Project Structure

## Overview
This project is now organized into separate `frontend` and `backend` directories for better maintainability and deployment.

```
AceMyInterview/
├── frontend/               # React + Vite Frontend Application
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── config/        # Configuration files
│   │   ├── utils/         # Utility functions
│   │   └── assets/        # Static assets
│   ├── public/            # Public assets
│   ├── dist/              # Build output (generated)
│   ├── node_modules/      # Dependencies (generated)
│   ├── index.html         # Entry HTML file
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS config
│   ├── postcss.config.js  # PostCSS config
│   ├── .env               # Environment variables
│   ├── .env.production    # Production environment variables
│   ├── .env.development   # Development environment variables
│   ├── .firebaserc        # Firebase project config
│   └── vercel.json        # Vercel deployment config
│
├── backend/               # Express.js Backend API
│   ├── controllers/       # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic services
│   ├── node_modules/      # Dependencies (generated)
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
│
├── docs/                  # Documentation files
│   ├── FIREBASE_DEPLOYMENT_GUIDE.md
│   ├── JUDGE0_INTEGRATION_GUIDE.md
│   ├── NETLIFY_DEPLOYMENT_FIX.md
│   ├── PROJECT_STRUCTURE.md
│   └── ...
│
├── config/                # Configuration files (kept at root for backend docker configs)
│   └── docker/            # Docker compose files
│
├── render.yaml            # Render.com deployment config
├── .gitignore             # Git ignore rules
└── README.md              # Main project README
```

## 🚀 Quick Start

### Frontend Development
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Backend Development
```bash
cd backend
npm install
npm start
# Runs on http://localhost:5000
```

### Full Stack Development
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔧 Environment Variables

### Frontend (.env in frontend/)
```env
VITE_API_URL=https://acemyinterview-backend.onrender.com/api
VITE_API_BASE_URL=https://acemyinterview-backend.onrender.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### Backend (.env in backend/)
```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=NMKRSPVLIDATA_JWT_SECRET
NODE_ENV=production
PORT=5000
```

## 📦 Deployment

### Backend (Render.com)
1. Push code to GitHub
2. Connect repo to Render
3. Render will auto-detect `render.yaml`
4. Set environment variables in Render dashboard
5. Deploy

Backend URL: `https://acemyinterview-backend.onrender.com`

### Frontend (Multiple Options)

**Option 1: Netlify**
```bash
cd frontend
npm run build
# Drag 'dist' folder to Netlify
```

**Option 2: Vercel**
```bash
cd frontend
vercel --prod
```

**Option 3: Firebase Hosting**
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

## 🛠️ Build Commands

### Frontend
```bash
cd frontend
npm run build      # Production build
npm run preview    # Preview production build
npm run dev        # Development server
```

### Backend
```bash
cd backend
npm start          # Start server
npm run dev        # Development mode (if nodemon configured)
```

## 📝 Important Notes

1. **Environment Files**: 
   - Frontend uses `.env` files in `frontend/` directory
   - Backend uses `.env` files in `backend/` directory
   - Never commit `.env` files with sensitive data

2. **API URLs**:
   - Local development: `http://localhost:5000`
   - Production: `https://acemyinterview-backend.onrender.com`

3. **CORS Configuration**:
   - Backend CORS is configured to accept:
     - `http://localhost:5173` (local dev)
     - `https://acemyinterview.app` (production)
     - All Vercel preview deployments

4. **Port Configuration**:
   - Frontend dev: 5173 (Vite default)
   - Backend: 5000 (can be changed via PORT env var)

## 🔍 Troubleshooting

### Frontend won't start
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

### CORS Errors
- Check `.env` files point to correct backend URL
- Verify backend CORS configuration in `server.js`
- Check browser console for specific error details

## 📚 Related Documentation

- [Render Deployment Guide](./RENDER_DEPLOYMENT_STEPS.md)
- [Urgent Backend Fix](./URGENT_BACKEND_FIX.md)
- [Contest System](./CONTEST_SYSTEM_COMPLETE.md)
- [Firebase Deployment](./docs/FIREBASE_DEPLOYMENT_GUIDE.md)
- [Netlify Deployment](./docs/NETLIFY_DEPLOYMENT_FIX.md)

## 🤝 Contributing

1. Make changes in appropriate directory (`frontend/` or `backend/`)
2. Test locally before committing
3. Update documentation if needed
4. Commit with clear messages
5. Push to GitHub

## 📄 License

This project is private and proprietary.
