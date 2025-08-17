# 🎯 QUICK DEPLOYMENT CHECKLIST

## 📋 Pre-Deployment Setup

### 1. Get Your API Keys
- **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Judge0 API Key**: Get from [RapidAPI Judge0](https://rapidapi.com/judge0-official/api/judge0-ce)

### 2. Set Environment Variables
```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
firebase functions:config:set judge0.api_key="YOUR_JUDGE0_KEY" 
firebase functions:config:set judge0.api_host="judge0-ce.p.rapidapi.com"
```

### 3. Build and Deploy
```bash
# Build frontend
npm run build

# Deploy everything
firebase deploy
```

## 🌐 Live URLs (After Deployment)
- **Frontend**: https://radhakrishna-8d46e.web.app
- **Backend API**: https://radhakrishna-8d46e.web.app/api

## ✅ Status: READY TO DEPLOY!
