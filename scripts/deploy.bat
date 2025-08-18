@echo off
REM 🚀 Firebase Deployment Script for AceMyInterview (Windows)

echo 🔥 Starting Firebase Deployment Process...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

REM Check if logged in
echo 🔐 Checking Firebase authentication...
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔑 Please login to Firebase...
    firebase login
)

REM Install function dependencies
echo 📦 Installing Firebase Functions dependencies...
cd functions
npm install

REM Go back to root
cd ..

REM Build the frontend
echo 🏗️ Building frontend...
npm run build

REM Deploy everything
echo 🚀 Deploying to Firebase...
firebase deploy

echo ✅ Deployment complete!
echo 🌐 Your app is live at: https://radhakrishna-8d46e.web.app
echo.
echo ⚠️ Don't forget to set your environment variables:
echo firebase functions:config:set gemini.api_key="YOUR_KEY"
echo firebase functions:config:set judge0.api_key="YOUR_KEY"

pause
