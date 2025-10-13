# Alternative: RapidAPI Judge0 Setup (Cloud-hosted)

## ⚠️ Why Use RapidAPI Instead of Self-Hosted?

**Docker Desktop on Windows** has limitations with Linux cgroups and isolated filesystems. Judge0 requires:
- cgroups for resource limiting
- `/box` directory for isolated code execution
- Full system privileges for sandboxing

These don't work well on Windows Docker Desktop, causing errors like:
- `No such file or directory @ rb_sysopen - /box/script.py`
- `Failed to create control group /sys/fs/cgroup/memory/box-X/`

**Solution:** Use RapidAPI's cloud-hosted Judge0 service (free tier available!)

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Get RapidAPI Key

1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Click **"Sign Up"** (free account)
3. After signing in, click **"Subscribe to Test"**
4. Select **"Basic Plan"** (FREE - 50 requests/day)
5. Copy your **API Key** from the **"X-RapidAPI-Key"** field

### Step 2: Update .env File

Open `.env` and add your key:

```env
VITE_JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
VITE_RAPIDAPI_KEY=YOUR_KEY_HERE  # Paste your key here
VITE_JUDGE0_HOST=judge0-ce.p.rapidapi.com
VITE_JUDGE0_TIMEOUT_MS=30000
```

### Step 3: Restart Dev Server

```bash
npm run dev
```

### Step 4: Test in Compiler

1. Go to http://localhost:5173/compiler
2. Write some code (Python, C++, Java, etc.)
3. Click **Run** or **Run Tests**
4. Should work perfectly! ✅

---

## 📊 Free Tier Limits

RapidAPI Judge0 Free Tier:
- ✅ **50 requests/day**
- ✅ **All 70+ languages**
- ✅ **Fast execution**
- ✅ **No setup needed**
- ✅ **Works on Windows/Mac/Linux**

**Upgrade options:**
- Basic: $0/month (50 req/day)
- Pro: $5/month (500 req/day)
- Ultra: $20/month (10,000 req/day)
- Mega: $100/month (100,000 req/day)

---

## ✅ Advantages vs Self-Hosted

| Feature | Self-Hosted Docker | RapidAPI Cloud |
|---------|-------------------|----------------|
| **Windows Support** | ❌ Has cgroup issues | ✅ Works perfectly |
| **Setup Time** | 30+ minutes | 5 minutes |
| **Maintenance** | Need to manage containers | Zero maintenance |
| **Execution Speed** | Fast (local) | Very fast (CDN) |
| **Cost** | Free (uses your resources) | Free tier: 50/day |
| **Reliability** | Depends on Docker | 99.9% uptime |

---

## 🔧 Configuration Code

The app automatically detects if you're using RapidAPI. The `judge0Config.js` checks:

```javascript
if (JUDGE0_CONFIG.baseUrl.includes('rapidapi')) {
  headers['X-RapidAPI-Key'] = JUDGE0_CONFIG.apiKey;
  headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
}
```

---

## 🐛 Troubleshooting

### Issue: "Invalid API Key"
**Solution:** 
- Make sure you copied the full key from RapidAPI
- Check for extra spaces in `.env` file
- Make sure the key starts with the right prefix

### Issue: "Rate Limit Exceeded"
**Solution:**
- You've used your 50 free requests for the day
- Wait 24 hours or upgrade plan
- Or use self-hosted on a Linux machine

### Issue: "Network Error"
**Solution:**
- Check your internet connection
- RapidAPI might be down (rare) - check status at https://status.rapidapi.com

---

## 🔄 Switch Back to Self-Hosted (Linux Only)

If you're on **Linux or WSL2 with proper Docker**, you can use self-hosted:

```env
# Switch to self-hosted
VITE_JUDGE0_BASE_URL=http://localhost:2358
VITE_JUDGE0_HOST=localhost
# Remove or comment out VITE_RAPIDAPI_KEY
```

Then run:
```bash
npm run judge0:setup
```

---

## 📚 Resources

- RapidAPI Judge0: https://rapidapi.com/judge0-official/api/judge0-ce
- Judge0 Docs: https://ce.judge0.com/
- Supported Languages: https://ce.judge0.com/#supported-languages

---

**Recommended for Production:** Use RapidAPI Pro plan ($5/month) for reliable service.

**For Development:** Free tier (50/day) is usually enough for testing.
