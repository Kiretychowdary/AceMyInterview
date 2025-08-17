# Judge0 Setup Instructions

## Getting RapidAPI Key for Judge0

To use the code compilation feature, you need to get a free RapidAPI key for Judge0 CE:

### Step 1: Sign up for RapidAPI
1. Go to [RapidAPI.com](https://rapidapi.com/)
2. Create a free account or sign in

### Step 2: Subscribe to Judge0 CE
1. Visit [Judge0 CE on RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce/)
2. Click "Subscribe to Test" 
3. Choose the **FREE** plan (1000 requests/month)
4. Click "Subscribe"

### Step 3: Get Your API Key
1. After subscribing, you'll see your **X-RapidAPI-Key** 
2. Copy this key (it looks like: `1234567890abcdef1234567890abcdef12`)

### Step 4: Add Key to Environment
1. Open `.env` file in your project root
2. Replace `your-rapidapi-key-here` with your actual key:
   ```
   VITE_RAPIDAPI_KEY=your-actual-key-here
   ```

### Step 5: Restart Development Server
```bash
npm run dev
```

## Alternative: Free Judge0 CE Instance

If you prefer not to use RapidAPI, you can also:

1. Use Judge0's free CE instance (limited): `https://ce.judge0.com`
2. Set up your own Judge0 instance with Docker
3. Use alternative online code execution APIs

## Supported Languages

Judge0 CE supports many languages including:
- JavaScript (Node.js)
- Python 3
- Java
- C++
- C
- Go
- Rust
- And many more!

## Rate Limits

- **Free Plan**: 1000 requests/month
- **Pro Plan**: 10,000+ requests/month (paid)

## Troubleshooting

- **403 Error**: Invalid or missing API key
- **429 Error**: Rate limit exceeded
- **Time Limit**: Code execution timeout (usually 10 seconds)

For help, check the [Judge0 documentation](https://ce.judge0.com/) or [RapidAPI support](https://rapidapi.com/support/).
