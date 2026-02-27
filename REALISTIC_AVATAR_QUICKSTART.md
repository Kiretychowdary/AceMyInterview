# 🎬 REALISTIC AI AVATAR - Quick Setup

You want **REAL human faces with lip-syncing**, not emojis! Here's how:

## ⚡ 3 Commands to Get Real Avatars

### 1️⃣ Start SadTalker Service (REQUIRED)

**Open Terminal 1:**
```bash
cd backend
python services/sadtalkerService.py
```

**Keep it running!** You should see:
```
🚀Starting SadTalker Avatar Service...
📍 Device: cuda
 * Running on http://0.0.0.0:5001
```

### 2️⃣ Test It Works

**Open Terminal 2:**
```bash
cd backend
python test_sadtalker.py
```

**You'll get:**
```
✅ Video generated in 12.34 seconds!
💾 Video saved to: backend/test_outputs/test_video_xxxxx.mp4
```

👉 **WATCH THE VIDEO** - You'll see a REAL human face talking!

### 3️⃣ Enable in Your App

**Add ONE line to your code:**

```jsx
<Avatar3D
  textToSpeak="Welcome to your interview!"
  enableSadTalker={true}  // 👈 THIS LINE!
/>
```

## ✅ That's It!

Now when you run your interview:
- ❌ Before: 🧑‍💼 (emoji)
- ✅ After: 👤 (real human with perfect lip-sync)

## 🔥 Full Example

```jsx
import Avatar3D from '../../components/interview/Avatar3D';

function FaceToFaceInterview() {
  return (
    <div>
      <Avatar3D
        textToSpeak="Hello! Tell me about yourself and your experience."
        expression="neutral"
        feedbackText="Question 1 of 5"
        enableSadTalker={true}  // Real video!
        avatarConfig={{  // Optional: custom image
          url: '/path/to/photo.jpg'
        }}
      />
      {/* Your interview UI */}
    </div>
  );
}
```

## 🐛 Not Working?

**Check these:**

1. Is service running?
   ```bash
   curl http://localhost:5001/health
   ```

2. Did you set `enableSadTalker={true}`?

3. Check browser console for errors

4. Try test script first: `python test_sadtalker.py`

## 📖 Need More Details?

Read: [ENABLE_REALISTIC_AVATARS.md](ENABLE_REALISTIC_AVATARS.md)

---

**That's it! Now you have realistic AI avatars! 🎉**
