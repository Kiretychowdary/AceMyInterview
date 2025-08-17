<!--nmkrspvlidata-->
<!--radhakrishna-->

# 🚀 AceMyInterview
**AI-Powered Interview Practice Platform**

A comprehensive interview preparation platform featuring AI-generated questions, real-time coding challenges, and face-to-face interview simulation.

## ✨ Features

- 🤖 **AI-Generated MCQ Questions** - Dynamic questions powered by Google Gemini
- 💻 **Live Code Compiler** - Execute code in multiple languages
- 🎥 **Face-to-Face Interview Simulation** - Webcam-based interview practice
- 📊 **Progress Tracking** - Monitor your improvement over time
- 🔥 **Motivational Quotes** - Stay inspired during practice sessions
- 🛡️ **Interview Integrity Monitoring** - Face detection and behavior analysis

## 🏗️ Project Structure

```
AceMyInterview/
├── 📁 src/                    # Frontend source code
│   ├── 📁 components/         # React components
│   ├── 📁 pages/             # Page components
│   ├── 📁 services/          # API services
│   └── 📁 utils/             # Utility functions
├── 📁 backend/               # Backend server
│   ├── server.js             # Main server file
│   ├── package.json          # Backend dependencies
│   └── .env                  # Backend environment variables
├── 📁 public/                # Static assets
├── 📁 docs/                  # Documentation files
├── 📄 .env                   # Frontend environment variables
├── 📄 package.json           # Frontend dependencies
└── 📄 README.md              # This file
```

## 🚦 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key
- RapidAPI key for Judge0 (optional, for code compilation)

### Frontend Setup
```bash
# Install dependencies
npm install

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
