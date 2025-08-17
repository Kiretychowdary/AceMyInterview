#!/bin/bash

# 🚀 Firebase Deployment Script for AceMyInterview

echo "🔥 Starting Firebase Deployment Process..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if logged in
echo "🔐 Checking Firebase authentication..."
firebase projects:list > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🔑 Please login to Firebase..."
    firebase login
fi

# Install function dependencies
echo "📦 Installing Firebase Functions dependencies..."
cd functions
npm install

# Go back to root
cd ..

# Build the frontend
echo "🏗️ Building frontend..."
npm run build

# Deploy everything
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment complete!"
echo "🌐 Your app is live at: https://radhakrishna-8d46e.web.app"
echo ""
echo "⚠️ Don't forget to set your environment variables:"
echo "firebase functions:config:set gemini.api_key=\"YOUR_KEY\""
echo "firebase functions:config:set judge0.api_key=\"YOUR_KEY\""
