# 📁 AceMyInterview - Project Structure

## 🏗️ **Clean & Organized Architecture**

```
AceMyInterview/
├── 📂 src/
│   ├── 📂 components/         # Reusable UI Components
│   │   ├── AuthContext.jsx    # Authentication provider
│   │   ├── CompilerPage.jsx   # Code editor & compiler
│   │   ├── Navbar.jsx         # Navigation component
│   │   └── ...
│   │
│   ├── 📂 pages/              # Main Application Pages
│   │   ├── Dashboard.jsx      # User progress dashboard
│   │   ├── Login.jsx          # User authentication
│   │   ├── MCQInterview.jsx   # Multiple choice interviews
│   │   ├── FaceToFaceInterview.jsx  # Video interviews
│   │   └── ...
│   │
│   ├── 📂 services/           # API & Business Logic
│   │   ├── GeminiService.js   # AI question generation
│   │   ├── ProgressService.js # User progress tracking
│   │   └── n8nService.js      # Workflow automation
│   │
│   ├── 📂 utils/              # Utility Functions
│   │   ├── fetchProblem.js    # Problem fetching logic
│   │   └── judge0Config.js    # Code execution config
│   │
│   ├── 📂 config/             # Configuration Files
│   │   └── firebase.config.js # Firebase setup
│   │
│   ├── 📂 assets/             # Static Assets
│   │   ├── images/
│   │   └── logos/
│   │
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # Application entry point
│   └── index.css              # Global styles
│
├── 📂 backend/                # Express.js Backend
│   ├── server.js              # Main server file
│   ├── server_clean.js        # Clean server version
│   └── package.json           # Backend dependencies
│
├── 📂 docs/                   # Documentation
│   ├── PROJECT_STRUCTURE.md   # This file
│   ├── LOADING_SCREENS_ENHANCEMENT.md
│   ├── FIREBASE_SETUP.md      # Firebase configuration
│   ├── RENDER_BACKEND_SETUP.md # Backend deployment
│   └── ...
│
├── 📂 scripts/                # Deployment Scripts
│   ├── deploy.sh              # Linux/Mac deployment
│   └── deploy.bat             # Windows deployment
│
├── 📂 public/                 # Static Public Files
│   ├── index.html             # HTML template
│   ├── _redirects             # Netlify redirects
│   └── models/                # AI models
│
├── 📂 functions/              # Firebase Functions
│   ├── index.js               # Cloud functions
│   └── package.json           # Functions dependencies
│
├── 📄 Configuration Files
├── package.json               # Frontend dependencies
├── vite.config.js             # Vite build config
├── tailwind.config.js         # Tailwind CSS config
├── .env                       # Environment variables
├── netlify.toml               # Netlify deployment config
├── firebase.json              # Firebase config
└── README.md                  # Project documentation
```

## 🎯 **Key Architecture Principles**

### **1. Separation of Concerns**
- **Components**: Reusable UI elements
- **Pages**: Route-specific components
- **Services**: API calls and business logic
- **Utils**: Helper functions and utilities
- **Config**: Configuration files

### **2. Clean Code Standards**
- ✅ **Consistent naming conventions**
- ✅ **Proper import organization**
- ✅ **Component decomposition**
- ✅ **Error handling**
- ✅ **Code documentation**

### **3. File Organization**
- ✅ **Logical folder structure**
- ✅ **Related files grouped together**
- ✅ **No duplicate or backup files**
- ✅ **Clear naming patterns**
- ✅ **Proper documentation**

## 🚀 **Development Workflow**

### **Frontend Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### **Backend Development**
```bash
cd backend
npm start            # Start backend server
npm run dev          # Development mode with nodemon
```

### **Deployment**
```bash
# Frontend (Netlify)
npm run build && netlify deploy --prod

# Backend (Render)
git push origin main  # Auto-deploys to Render
```

## 📚 **Technology Stack**

### **Frontend**
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Monaco Editor** - Code editor
- **React Router** - Navigation

### **Backend**
- **Express.js** - Web framework
- **Google Gemini AI** - Question generation
- **Firebase** - Authentication & database
- **Judge0** - Code execution
- **Render** - Hosting platform

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **VS Code** - Code editor

## 🎨 **UI/UX Features**

### **Loading Screens**
- ✅ **Dynamic message cycling** with proper state management
- ✅ **Beautiful animations** using Framer Motion
- ✅ **Theme consistency** across all screens
- ✅ **Mobile responsive** design

### **User Experience**
- ✅ **Professional toast notifications**
- ✅ **Smooth page transitions**
- ✅ **Real-time feedback**
- ✅ **Error handling**
- ✅ **Progress tracking**

---

*This project follows modern React best practices and maintains clean, scalable architecture for optimal development experience.*
