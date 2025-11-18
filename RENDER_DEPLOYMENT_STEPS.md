# 🚀 Render.com Backend Deployment Guide

## Step 1: Prepare Repository

Your backend is ready! All necessary files are configured.

## Step 2: Deploy to Render.com

### Option A: Deploy from GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare backend for Render deployment"
   git push origin main
   ```

2. **Go to Render Dashboard:**
   - Visit: https://dashboard.render.com/
   - Sign in with GitHub

3. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `Kiretychowdary/AceMyInterview`
   - Click "Connect"

4. **Configure Service:**
   - **Name:** `acemyinterview-backend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** Leave empty (render.yaml handles it)
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free

5. **Add Environment Variables:**
   Click "Environment" tab and add these:
   
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://your-connection-string
   GEMINI_API_KEY=your-gemini-api-key
   JWT_SECRET=NMKRSPVLIDATA_JWT_SECRET
   ADMIN_SECRET=NMKRSPVLIDATA_ADMIN_SECRET
   REQUEST_TIMEOUT=30000
   CORS_ORIGIN=http://localhost:5173,http://acemyinterview.app,https://acemyinterview.app
   ```

6. **Deploy:**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Your backend URL will be: `https://acemyinterview-backend.onrender.com`

### Option B: Manual Deploy (if render.yaml doesn't work)

If the automatic deployment has issues:

1. Create Web Service manually
2. Connect GitHub repo
3. Set these manually:
   - Build: `cd backend && npm install`
   - Start: `cd backend && npm start`
   - Add all environment variables listed above

## Step 3: Update Frontend Configuration

After backend is deployed, update your frontend:

1. **Create `.env.production` file:**
   ```env
   VITE_API_URL=https://acemyinterview-backend.onrender.com/api
   VITE_API_BASE_URL=https://acemyinterview-backend.onrender.com
   VITE_FIREBASE_PROJECT_ID=radhakrishna-8d46e
   ```

2. **Update existing `.env.development`:** (already correct for local testing)
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_API_BASE_URL=http://localhost:5000
   VITE_FIREBASE_PROJECT_ID=radhakrishna-8d46e
   ```

## Step 4: Test Deployment

1. **Check backend health:**
   - Visit: `https://acemyinterview-backend.onrender.com/api/health`
   - Should return: `{"status":"ok","message":"Server is running"}`

2. **Test contests API:**
   - Visit: `https://acemyinterview-backend.onrender.com/api/contests`
   - Should return JSON with contests data

3. **Test from deployed frontend:**
   - Go to: `https://acemyinterview.app/contests`
   - Contests should now load!

## Step 5: Keep Backend Alive (Free Tier Limitation)

Render free tier suspends after 15 minutes of inactivity.

**Solutions:**

1. **Use UptimeRobot (Free):**
   - Sign up: https://uptimerobot.com/
   - Add monitor: `https://acemyinterview-backend.onrender.com/api/health`
   - Interval: 5 minutes
   - This pings your backend to keep it awake

2. **Upgrade to paid plan ($7/month):**
   - No sleep
   - Faster performance
   - More resources

## Troubleshooting

### Backend shows "Suspended"
- Click "Resume" button in Render dashboard
- Or visit the URL to wake it up (takes 30-50 seconds)

### CORS Errors
- Check CORS_ORIGIN includes your frontend domain
- Redeploy after updating environment variables

### MongoDB Connection Errors
- Verify MONGODB_URI is correct
- Check MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### 401 Unauthorized on Admin Actions
- Ensure JWT_SECRET and ADMIN_SECRET are set
- Must match the secrets used when creating admin accounts

## Quick Commands

```bash
# Test locally first
cd backend
npm start
# Visit http://localhost:5000/api/health

# Commit and push
git add .
git commit -m "Deploy backend to Render"
git push origin main

# Redeploy on Render (after push)
# Render auto-deploys on push, or click "Manual Deploy" button
```

## Your Backend URLs

- **Local:** http://localhost:5000
- **Production:** https://acemyinterview-backend.onrender.com
- **Health Check:** https://acemyinterview-backend.onrender.com/api/health
- **Contests API:** https://acemyinterview-backend.onrender.com/api/contests

## Important Notes

1. **First deployment takes 3-5 minutes**
2. **Free tier sleeps after 15 min inactivity** - First request after sleep takes 30-50 seconds
3. **Backend restarts on every code push** to GitHub
4. **Environment variables** must be set in Render dashboard (not in code)
5. **MongoDB Atlas** must allow Render IP addresses (use 0.0.0.0/0 for simplicity)

---

✅ After deployment, your contest system will work perfectly on the live site!
