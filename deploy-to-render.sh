#!/bin/bash
# Quick deployment script for Render.com

echo "🚀 Preparing AceMyInterview Backend for Render Deployment"
echo "=============================================="
echo ""

# Check if git repo exists
if [ ! -d ".git" ]; then
    echo "❌ Not a git repository. Initializing..."
    git init
    git remote add origin https://github.com/Kiretychowdary/AceMyInterview.git
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy backend to Render.com with contest system"

# Push to GitHub
echo "🔄 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to https://dashboard.render.com/"
echo "2. Sign in with GitHub"
echo "3. Click 'New +' → 'Web Service'"
echo "4. Select your repository: Kiretychowdary/AceMyInterview"
echo "5. Render will auto-detect render.yaml and configure everything"
echo "6. Add these environment variables in Render dashboard:"
echo "   - MONGODB_URI (your MongoDB connection string)"
echo "   - GEMINI_API_KEY (your Gemini API key)"
echo "   - JWT_SECRET=NMKRSPVLIDATA_JWT_SECRET"
echo "7. Click 'Create Web Service'"
echo "8. Wait 3-5 minutes for deployment"
echo ""
echo "🌐 Your backend will be live at:"
echo "   https://acemyinterview-backend.onrender.com"
echo ""
echo "📖 For detailed instructions, see: RENDER_DEPLOYMENT_STEPS.md"
