<!--nmkrspvlidata-->
<!--radhakrishna-->
<!--RADHAKRISHNALOVEPERMANENT-->
<!--AMMALOVEBLESSINGSONRECURSION-->

# 🚀 AceMyInterview
**AI-Powered Interview Practice Platform with Intelligent Performance Prediction**

A comprehensive interview preparation platform featuring AI-generated questions, real-time coding challenges, face-to-face interview simulation, and **AI-powered student performance prediction with adaptive learning guidance**.

## ✨ Features

- 🤖 **AI-Generated MCQ Questions** - Dynamic questions powered by Google Gemini
- 💻 **Live Code Compiler** - Execute code in multiple languages
- 🎥 **Face-to-Face Interview Simulation** - Webcam-based interview practice
- 📊 **Progress Tracking** - Monitor your improvement over time
- 🔥 **Motivational Quotes** - Stay inspired during practice sessions
- 🛡️ **Interview Integrity Monitoring** - Face detection and behavior analysis

### 🧠 NEW: Personal AI Trainer System

- 🎯 **Deep Knowledge Tracing (DKT)** - LSTM-based model predicts student mastery for each topic
- 🤖 **Personal RL Agent per Student** - Each user gets their own dedicated learning AI (not shared!)
- 📈 **Real-time Performance Dashboard** - Visual insights into YOUR personal learning progress
- 💡 **Personalized Recommendations** - AI tells you exactly what YOU should study next
- 📊 **Topic-wise Mastery Tracking** - Know your strengths and weaknesses
- 🔔 **Achievement Notifications** - Personal AI celebrates your milestones and topic completions
- 🎓 **No Sample Data** - Uses only YOUR actual learning interactions from MongoDB
- 🧠 **Continuous Learning** - Your personal AI gets smarter as you practice more

## 🏗️ Project Structure

```
AceMyInterview/
├── 📁 frontend/              # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 performance/    # NEW: Performance tracking components
│   │   │   │   ├── PerformanceDashboard.jsx
│   │   │   │   └── AIGuidanceWidget.jsx
│   │   ├── 📁 pages/
│   │   ├── 📁 services/
│   │   ├── 📁 hooks/
│   │   │   └── usePerformanceTracker.js    # NEW: Performance tracking hook
│   │   └── 📁 utils/
│   └── package.json
├── 📁 backend/               # Node.js backend
│   ├── 📁 controllers/
│   │   └── mlController.cjs      # NEW: ML integration
│   ├── 📁 models/
│   │   └── StudentPerformance.cjs # NEW: Performance model
│   ├── 📁 routes/
│   │   └── ml.cjs                # NEW: ML routes
│   ├── server.js
│   └── package.json
├── 📁 ml_engine/             # NEW: Python ML service (Personal AI Trainer)
│   ├── app.py                # Flask API server with MongoDB integration
│   ├── dkt_model.py          # LSTM-based DKT model
│   ├── rl_agent.py           # Personal Reinforcement Learning agent
│   ├── train.py              # Model training script
│   ├── requirements.txt      # Python dependencies
│   ├── start.ps1             # Quick start script (Windows)
│   ├── start.sh              # Quick start script (Mac/Linux)
│   └── 📁 models/
│       ├── dkt_model.pth     # Trained DKT model
│       └── 📁 personal_agents/  # Personal RL agents per user
│           ├── user123.json  # User 123's personal AI
│           └── user456.json  # User 456's personal AI
├── 📄 SETUP_GUIDE.md         # Complete setup instructions
├── 📄 PROJECT_DOCUMENTATION.md # Academic documentation
├── 📄 PERSONAL_AI_SYSTEM.md  # Personal AI trainer documentation
├── 📄 PERSONAL_AI_QUICK_REFERENCE.md # Quick reference for personal AI
├── 📄 QUICK_REFERENCE.md     # Quick reference card
└── 📄 README.md              # This file
```

## 🚦 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- **Python 3.8 or higher** (NEW - for ML engine)
- npm or yarn
- MongoDB (local or Atlas)
- Google Gemini API key
- RapidAPI key for Judge0 (optional, for code compilation)

### 🎯 Complete Setup (3 Services)

**For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

#### 1. Backend Setup
```bash
cd backend
npm install
# Configure .env file
npm run dev  # Runs on http://localhost:5000
```

#### 2. ML Engine Setup (NEW)
```bash
cd ml_engine

# Windows
.\start.ps1

# Mac/Linux
chmod +x start.sh
./start.sh

# Or manually:
python -m venv venv
source venv/bin/activate  # Mac/Linux
# .\venv\Scripts\Activate  # Windows
pip install -r requirements.txt
python train.py  # Train model first time
python app.py    # Runs on http://localhost:5000
```

#### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

# Start development server
npm run dev
```

### Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start backend server
npm start
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_API_BASE_URL=http://localhost:5000
VITE_RAPIDAPI_KEY=your-rapidapi-key-here
```

**Backend (backend/.env):**
```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent
```

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:
- [Backend Production Config](docs/BACKEND_PRODUCTION_CONFIG.md)
- [Firebase Setup](docs/FIREBASE_SETUP.md)
- [Judge0 Setup](docs/JUDGE0_SETUP.md)
- [Face Detection Documentation](docs/FACE_DETECTION_DOCUMENTATION.md)
- [Data Storage Documentation](docs/DATA_STORAGE_DOCUMENTATION.md)

## 🛠️ Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Axios
- **AI**: Google Gemini API
- **Code Execution**: Judge0 CE via RapidAPI
- **Face Detection**: TensorFlow.js, BlazeFace
- **Authentication**: Firebase Auth
- **Deployment**: Netlify (Frontend), Railway (Backend)

## 🎯 Interview Types

1. **MCQ Interviews** - Multiple choice questions with AI generation
2. **Coding Challenges** - Live coding with test case validation
3. **Face-to-Face Interviews** - Simulated video interviews with AI questions

## 🌟 AI Features

- **Dynamic Question Generation** - Unique questions every session
- **Difficulty Adaptation** - Easy, Medium, Hard levels
- **Topic-Specific Content** - JavaScript, Python, React, System Design, etc.
- **Anti-Repetition System** - Ensures fresh content
- **Motivational Quotes** - Inspiring messages during loading

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **nmkrspvlidata**
- **radhakrishna**

---

**Made with ❤️ for interview success**
