# Quick Deployment Script for Windows PowerShell
# Deploys AceMyInterview backend to Render.com

Write-Host "🚀 Preparing AceMyInterview Backend for Render Deployment" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Check if git repo exists
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not a git repository. Initializing..." -ForegroundColor Yellow
    git init
    git remote add origin https://github.com/Kiretychowdary/AceMyInterview.git
}

# Add all files
Write-Host "📦 Adding files to git..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Deploy backend to Render.com with contest system"

# Push to GitHub
Write-Host "🔄 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Code pushed to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://dashboard.render.com/"
Write-Host "2. Sign in with GitHub"
Write-Host "3. Click 'New +' → 'Web Service'"
Write-Host "4. Select your repository: Kiretychowdary/AceMyInterview"
Write-Host "5. Render will auto-detect render.yaml and configure everything"
Write-Host "6. Add these environment variables in Render dashboard:"
Write-Host "   - MONGODB_URI (your MongoDB connection string)"
Write-Host "   - GEMINI_API_KEY (your Gemini API key)"
Write-Host "   - JWT_SECRET=NMKRSPVLIDATA_JWT_SECRET" -ForegroundColor Yellow
Write-Host "7. Click 'Create Web Service'"
Write-Host "8. Wait 3-5 minutes for deployment"
Write-Host ""
Write-Host "🌐 Your backend will be live at:" -ForegroundColor Green
Write-Host "   https://acemyinterview-backend.onrender.com"
Write-Host ""
Write-Host "📖 For detailed instructions, see: RENDER_DEPLOYMENT_STEPS.md"
