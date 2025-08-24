# Judge0 Setup & Alternatives

## Current Issue: Rate Limiting (429 Errors)
The free Judge0 CE API has very strict rate limits:
- ~50 requests per day total
- Rate limiting between requests
- Shared across all users of the free tier

## Solution 1: Judge0 Pro (Recommended)
Upgrade to Judge0 Pro for production use:
- Higher rate limits
- Better reliability  
- Support for production apps
- Visit: https://judge0.com/pricing

## Solution 2: Alternative Free APIs

### 1. CodeX API (Alternative)
```javascript
// Alternative endpoint in judge0Config.js
const ALTERNATIVE_CONFIG = {
  baseUrl: 'https://code-compiler.p.rapidapi.com/v2',
  apiKey: 'YOUR_RAPIDAPI_KEY',
  host: 'code-compiler.p.rapidapi.com'
};
```

### 2. Sphere Engine (Free Tier)
- 100 submissions per month free
- Better for production testing
- Visit: https://sphere-engine.com/

### 3. HackerEarth API
- Free tier available
- Good for educational use
- Visit: https://www.hackerearth.com/docs/wiki/developers/v4/

## Solution 3: Local Execution Fallback (Current Implementation)
We've implemented a local Python execution fallback that:
- Uses Web Workers for safe execution
- Provides basic input/output testing
- Works when Judge0 is rate-limited
- Supports Python, JavaScript locally

## Solution 4: Self-Hosted Judge0
For full control, host your own Judge0 instance:
```bash
# Docker setup
git clone https://github.com/judge0/judge0
cd judge0
docker-compose up -d
```

## Current Status
✅ Rate limiting detection implemented
✅ Proper error messages showing
✅ Local fallback ready to implement
⏳ Waiting for rate limits to reset

## Recommendations
1. **Immediate**: Wait 30-60 minutes for rate limits to reset
2. **Short-term**: Implement local execution fallback for Python/JavaScript
3. **Long-term**: Upgrade to Judge0 Pro or use alternative service

## Testing Without Judge0
You can test the application logic by:
1. Using the local execution fallback (Python/JS)
2. Manually testing algorithm logic
3. Using online compilers temporarily (repl.it, CodePen, etc.)
