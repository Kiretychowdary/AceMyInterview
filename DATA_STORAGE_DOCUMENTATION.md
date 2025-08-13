# DATA STORAGE DOCUMENTATION - AceMyInterview

## 🔥 Firebase Firestore Database Structure

### Project Details
- **Project ID**: `radhakrishna-8d46e`
- **Database**: Cloud Firestore
- **Region**: Default (us-central1)
- **Authentication**: Firebase Auth with Google OAuth

---

## 📊 Collections & Data Structure

### 1. `users` Collection (Managed by Firebase Auth)
```json
{
  "uid": "user123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "createdAt": "2025-08-13T...",
  "lastLogin": "2025-08-13T..."
}
```

### 2. `interviewSessions` Collection
**Purpose**: Store all MCQ and Coding interview sessions

**Document Structure**:
```json
{
  "id": "session123",
  "userId": "user123",
  "type": "mcq" | "coding",
  "topic": "JavaScript",
  "difficulty": "medium",
  "timestamp": "2025-08-13T12:00:00Z",
  
  // MCQ Specific Fields
  "totalQuestions": 10,
  "correctAnswers": 8,
  "accuracy": 80,
  "questions": [
    {
      "question": "What is closure?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0
    }
  ],
  "answers": [
    {
      "question": "What is closure?",
      "selectedAnswer": "A",
      "correctAnswer": "A", 
      "isCorrect": true
    }
  ],
  
  // Coding Specific Fields
  "language": "javascript",
  "totalProblems": 3,
  "solvedProblems": 2,
  "successRate": 67,
  "problems": [
    {
      "title": "Two Sum",
      "difficulty": "Easy",
      "description": "Find two numbers..."
    }
  ],
  "solutions": [
    {
      "problemId": 1,
      "solved": true,
      "code": "function twoSum() {...}",
      "timeSpent": 900
    }
  ],
  
  "timeSpent": 1200
}
```

### 3. `interviewAssessments` Collection
**Purpose**: Store AI-powered face-to-face interview assessments

**Document Structure**:
```json
{
  "id": "assessment123",
  "userId": "user123",
  "type": "interview",
  "interviewType": "technical",
  "topic": "Software Developer",
  "difficulty": "medium",
  "duration": 30,
  "timestamp": "2025-08-13T12:00:00Z",
  
  "interviewQuestions": [
    "Tell me about your JavaScript experience",
    "How would you optimize this algorithm?",
    "Explain promises in JavaScript"
  ],
  
  "userResponses": [
    "I have 3 years of experience...",
    "I would use memoization...",
    "Promises represent async operations..."
  ],
  
  "assessment": {
    "overallRating": 4.2,
    "detailedScores": {
      "technicalKnowledge": 4.0,
      "problemSolving": 4.5,
      "communication": 3.8,
      "codeQuality": 4.1,
      "systemDesign": 3.9
    },
    "strengths": [
      "Strong problem-solving approach",
      "Good understanding of algorithms",
      "Clear communication style"
    ],
    "improvements": [
      "Could improve edge case handling",
      "Need more system design practice"
    ],
    "recommendations": [
      "Practice advanced data structures",
      "Focus on system design patterns",
      "Work on explaining solutions step by step"
    ],
    "performanceInsights": {
      "responseTime": "Good - answered promptly",
      "depthOfKnowledge": "Solid with room for advanced concepts",
      "practicalApplication": "Can apply concepts well"
    },
    "nextSteps": [
      "Practice advanced data structures",
      "Study system design patterns",
      "Mock interview practice recommended"
    ],
    "interviewReadiness": "75% - Good foundation, needs refinement"
  }
}
```

### 4. `userProgress` Collection
**Purpose**: Aggregated user statistics and progress summary

**Document Structure**:
```json
{
  "id": "user123", // Same as userId
  "userId": "user123",
  "totalMCQAttempts": 15,
  "totalCodingAttempts": 8,
  "totalFaceToFaceInterviews": 3,
  "totalMCQQuestions": 150,
  "totalCorrectAnswers": 120,
  "totalCodingProblems": 24,
  "totalSolvedProblems": 18,
  "lastActivity": "2025-08-13T12:00:00Z",
  "lastAssessmentRating": 4.2,
  "createdAt": "2025-08-01T10:00:00Z",
  "updatedAt": "2025-08-13T12:00:00Z"
}
```

---

## 🔄 Data Flow & Storage Process

### 1. MCQ Session Storage
```javascript
// Frontend: MCQInterview.jsx completes quiz
handleQuizComplete() → 
  progressService.saveMCQSession() →
    addDoc(collection(db, 'interviewSessions'), sessionData) →
    updateUserProgress() →
    setDoc(doc(db, 'userProgress', userId), aggregatedData)
```

### 2. Coding Session Storage
```javascript
// Frontend: Compiler.jsx completes coding session
handleSessionComplete() →
  progressService.saveCodingSession() →
    addDoc(collection(db, 'interviewSessions'), sessionData) →
    updateUserProgress() →
    Backend API call for additional processing
```

### 3. Face-to-Face Interview Assessment
```javascript
// Frontend: FaceToFaceInterview.jsx completes interview
endInterview() →
  progressService.getAIAssessment() → Backend /api/assess-interview →
  Gemini AI generates assessment →
  progressService.saveInterviewAssessment() →
    addDoc(collection(db, 'interviewAssessments'), assessmentData) →
    updateUserProgress()
```

### 4. Dashboard Data Retrieval
```javascript
// Dashboard.jsx loads user progress
fetchDashboardData() →
  getDoc(doc(db, 'userProgress', userId)) →
  getDocs(query(collection(db, 'interviewSessions'), where('userId', '==', userId))) →
  getDocs(query(collection(db, 'interviewAssessments'), where('userId', '==', userId))) →
  processProgressData() → Display charts and analytics
```

---

## 🛡️ Security & Access Control

### Firebase Security Rules
```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /interviewSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /interviewAssessments/{assessmentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /userProgress/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

---

## 📈 Performance Optimizations

### 1. Index Requirements
- **Collection**: `interviewSessions`
  - Fields: `userId` (Ascending) + `timestamp` (Descending)
  
- **Collection**: `interviewAssessments`
  - Fields: `userId` (Ascending) + `timestamp` (Descending)

### 2. Fallback Strategies
- **In-memory sorting** when indexes not available
- **Batch operations** for multiple document updates
- **Cached progress summaries** in `userProgress` collection
- **Optimistic updates** with offline support

---

## 🌐 Backend Integration

### Node.js Backend (server.js)
```javascript
// Additional storage endpoints
POST /api/store-mcq-session     → Log to console/future DB
POST /api/store-coding-session  → Log to console/future DB  
POST /api/assess-interview       → Generate AI assessment
GET  /api/user-progress/:userId  → Retrieve progress summary
```

### Future Storage Extensions
- **PostgreSQL** for complex analytics
- **Redis** for session caching
- **AWS S3** for file storage (code submissions)
- **Elasticsearch** for advanced search

---

## 🔧 Local Development Storage

### Development Environment
- **Local Firestore Emulator**: Optional for offline development
- **Live Firebase**: Current setup uses live database
- **Environment Variables**: API keys managed via `.env`

### Data Persistence
- ✅ **Real-time synchronization** across devices
- ✅ **Offline support** with Firestore caching
- ✅ **Automatic backups** via Firebase
- ✅ **GDPR compliant** data handling

---

## 📊 Current Storage Stats
- **Project**: radhakrishna-8d46e
- **Database Size**: Growing with user activity
- **Collections**: 4 main collections
- **Security**: User-scoped access only
- **Backup**: Automatic Firebase backups
- **Scaling**: Auto-scaling NoSQL architecture
