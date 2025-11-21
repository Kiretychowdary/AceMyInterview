# Authentication & Data Flow Architecture

## 🔐 Authentication System (Supabase)

### User Authentication
- **Provider**: Supabase Auth
- **Methods**: 
  - Email/Password
  - Google OAuth
- **Implementation**: `frontend/src/components/AuthContext.jsx`
- **User ID Source**: `user.uid` from Supabase session

### Authentication Flow
1. User logs in via Supabase (email or Google)
2. `AuthContext` receives user object with `user.uid`
3. `user.uid` is used as the primary identifier across the application
4. All pages use `const { user } = useAuth()` to access authenticated user

## 💾 Data Storage System (MongoDB)

### Data Storage Location
- **Database**: MongoDB (via Express.js backend)
- **NOT using**: Supabase tables, Firebase/Firestore
- **Backend API**: `backend/routes/interview.cjs`

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    COMPLETE DATA FLOW                        │
└─────────────────────────────────────────────────────────────┘

1. USER AUTHENTICATION (Supabase)
   ↓
   User logs in → Supabase Auth → Returns user.uid
   
2. DATA STORAGE (When completing interview)
   ↓
   Interview completed → ProgressService.saveMCQSession(user.uid, data)
   ↓
   POST request to: /api/interview/store-session
   ↓
   MongoDB stores with userId = user.uid from Supabase
   
3. DATA RETRIEVAL (Dashboard view)
   ↓
   Dashboard loads → fetchDashboardData()
   ↓
   GET request to: /api/interview/history/{user.uid}
   ↓
   MongoDB queries: { userId: user.uid }
   ↓
   Returns matching sessions → Display in Dashboard
```

## 📡 API Endpoints

### Store Interview Session
- **Endpoint**: `POST /api/interview/store-session`
- **Purpose**: Save MCQ, coding, or face-to-face interview results
- **Payload**: 
  ```json
  {
    "sessionId": "mcq_1234567890_uid123",
    "userId": "supabase-user-uid",
    "topic": "JavaScript",
    "difficulty": "medium",
    "totalQuestions": 5,
    "answeredQuestions": 5,
    "timeSpent": 600,
    "assessment": { "overallScore": 8.5 }
  }
  ```

### Fetch User History
- **Endpoint**: `GET /api/interview/history/:userId`
- **Purpose**: Retrieve all interview sessions for a user
- **Query Params**: `limit=10`, `offset=0`
- **Response**: Array of session objects

### Fetch Analytics
- **Endpoint**: `GET /api/interview/analytics/:userId`
- **Purpose**: Get aggregated statistics
- **Response**: Total interviews, average scores, difficulty breakdown

### Database Cleanup (NEW)
- **Clear All**: `DELETE /api/interview/clear-all`
- **Clear User**: `DELETE /api/interview/clear-user/:userId`
- **Clear Old**: `DELETE /api/interview/clear-old/:days`

## 🔄 Integration Points

### 1. MCQ Interview (`frontend/src/pages/MCQInterview.jsx`)
```javascript
import { useAuth } from '../components/AuthContext';
import { progressService } from '../services/ProgressService.supabase.js';

const { user } = useAuth();

// On quiz completion
await progressService.saveMCQSession(user.uid, {
  topic, difficulty, totalQuestions, correctAnswers, timeSpent
});
```

### 2. Face-to-Face Interview (`frontend/src/pages/FaceToFaceInterview.jsx`)
```javascript
await progressService.saveInterviewAssessment(user.uid, {
  topic, difficulty, interviewQuestions, userResponses, aiAssessment
});
```

### 3. Coding Interview (Compiler)
```javascript
await progressService.saveCodingSession(user.uid, {
  topic, difficulty, totalProblems, solvedProblems, timeSpent
});
```

### 4. Dashboard (`frontend/src/pages/Dashboard.jsx`)
```javascript
const { user } = useAuth();

// Fetch from MongoDB backend (NOT Supabase tables)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const response = await fetch(`${API_BASE}/api/interview/history/${user.uid}?limit=20`);
const data = await response.json();
```

## 🎯 Key Points

### ✅ Correct Data Flow
1. **Authentication**: Supabase provides `user.uid`
2. **Storage**: MongoDB stores all interview data with `userId = user.uid`
3. **Retrieval**: Fetch from MongoDB using `user.uid` as query parameter
4. **Display**: Dashboard shows data from MongoDB backend

### ❌ Common Mistakes to Avoid
- ❌ Don't query Supabase tables for interview data (tables don't exist)
- ❌ Don't use Firebase/Firestore (removed from project)
- ❌ Don't store userId as email - always use `user.uid`
- ❌ Don't mix authentication source - always use Supabase auth

## 🔍 Debugging & Logging

### Console Logs to Check

**When Saving Data:**
```
📦 [ProgressService] Saving MCQ session to MongoDB backend...
📋 User ID from Supabase: abc123-def456-ghi789
🌐 Sending to MongoDB: http://localhost:5000/api/interview/store-session
✅ MCQ session saved successfully to MongoDB
📊 Session ID: mcq_1234567890_abc123
👤 Stored for user: abc123-def456-ghi789
```

**When Fetching Data:**
```
📊 [Dashboard] Starting data fetch...
👤 [Dashboard] Supabase User ID: abc123-def456-ghi789
🌐 [Dashboard] Backend API: http://localhost:5000
🚀 [Dashboard] Fetching from: /api/interview/history/abc123-def456-ghi789
✅ [Dashboard] Successfully fetched sessions from MongoDB
📊 [Dashboard] Total sessions retrieved: 5
```

## 🧪 Testing the Flow

### 1. Clear Database (Fresh Start)
```bash
# Clear all data
curl -X DELETE http://localhost:5000/api/interview/clear-all

# Or clear specific user
curl -X DELETE http://localhost:5000/api/interview/clear-user/{userId}
```

### 2. Login & Complete Interview
1. Login with Supabase (check console for `user.uid`)
2. Complete an MCQ interview
3. Check console logs for storage confirmation
4. Verify MongoDB has the record with correct userId

### 3. View Dashboard
1. Navigate to Dashboard
2. Check console logs for fetch request
3. Verify data displays correctly
4. Confirm userId matches between storage and retrieval

## 📝 Environment Variables

```env
# Frontend (.env)
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key

# Backend (.env)
MONGODB_URI=your-mongodb-connection-string
PORT=5000
CORS_ORIGIN=http://localhost:5173,https://acemyinterview.app
```

## 🚀 Deployment Considerations

### Frontend (Vercel)
- Set `VITE_API_BASE_URL` to production backend URL
- Example: `https://acemyinterview-backend.onrender.com`

### Backend (Render)
- Set `CORS_ORIGIN` to include production frontend URL
- Example: `https://acemyinterview.app`
- Ensure MongoDB connection string is set

---

**Last Updated**: November 2025  
**Architecture**: Supabase Auth + MongoDB Data Storage  
**Status**: ✅ Fully Integrated
