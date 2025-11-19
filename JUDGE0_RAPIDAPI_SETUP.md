# Judge0 RapidAPI Setup Guide

## ✅ Issues Fixed

1. **React Key Warning** - Fixed missing unique keys in Contests.jsx
2. **Judge0 401 Errors** - Added RapidAPI authentication headers
3. **Judge0 429 Errors** - Added rate limit handling with user-friendly messages

## 🔑 Get Your RapidAPI Key (Required for Code Compilation)

### Step 1: Sign Up for RapidAPI
1. Go to https://rapidapi.com/
2. Click "Sign Up" (top right)
3. Create a free account (or sign in with Google/GitHub)

### Step 2: Subscribe to Judge0 API
1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Click "Subscribe to Test" button
3. Select the **FREE plan** (50 requests/day)
4. Click "Subscribe"

### Step 3: Get Your API Key
1. After subscribing, you'll see your API key on the right side
2. Copy the value next to **"X-RapidAPI-Key"**
3. It will look like: `1234567890abcdef1234567890abcdef12`

### Step 4: Add Key to Your Project
1. Open `frontend/.env` file
2. Find the line: `VITE_RAPIDAPI_KEY=YOUR_RAPIDAPI_KEY_HERE`
3. Replace `YOUR_RAPIDAPI_KEY_HERE` with your actual key:
   ```
   VITE_RAPIDAPI_KEY=1234567890abcdef1234567890abcdef12
   ```
4. Save the file
5. **Restart your dev server** (stop and run `npm run dev` again)

## 🎯 Free Tier Limits

**Judge0 Free Plan:**
- ✅ 50 requests per day
- ✅ All programming languages
- ✅ No credit card required

**If you need more:**
- Basic Plan: $9.99/month (500 requests/day)
- Pro Plan: $49.99/month (5,000 requests/day)

## 🧪 Test It

After adding your key:

1. Go to Contests page
2. Click on any problem
3. Write some code
4. Click "Run Code"
5. You should see compilation results! 🎉

## ❌ Error Messages Explained

- **401 Unauthorized**: Invalid RapidAPI key - check your key in `.env`
- **429 Too Many Requests**: Hit rate limit - wait a few minutes or upgrade plan
- **Configuration Error**: `VITE_RAPIDAPI_KEY` not found in `.env` file

## 🔒 Security Note

**NEVER commit your `.env` file to Git!**
- It's already in `.gitignore`
- Your API key is private
- Don't share it publicly

## 🆘 Troubleshooting

### "Configuration Error" message?
- Make sure you added `VITE_RAPIDAPI_KEY=your_key_here` to `frontend/.env`
- Restart your dev server after adding the key

### Still getting 401 errors?
- Double-check your API key is copied correctly (no extra spaces)
- Make sure you subscribed to Judge0 CE (Community Edition)
- Verify the key works: https://rapidapi.com/judge0-official/api/judge0-ce/playground

### Rate limit (429) errors?
- Free tier: 50 requests/day
- Each "Run Code" = 1 request (single test case) or multiple requests (batch test cases)
- Reset happens every 24 hours
- Consider upgrading if you need more

## 🚀 Alternative: Self-Hosted Judge0

If you don't want to use RapidAPI, you can run Judge0 locally:

```bash
cd judge0
docker-compose up -d
```

Then update `frontend/src/services/judge0Client.js`:
```javascript
const JUDGE0_BASE_URL = 'http://localhost:2358'; // Instead of RapidAPI URL
```

Remove RapidAPI headers from requests.

---

**Questions?** Check the docs: https://rapidapi.com/judge0-official/api/judge0-ce
