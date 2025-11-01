# Contest Progress Tracking System

## 📊 Overview
Real-time progress tracking system that automatically updates user scores and problem completion status as they solve contest problems.

---

## ✅ Features Implemented

### 1. **Automatic Progress Updates on Submission**
When a user submits code during a contest:
- ✅ Their score is calculated based on test cases passed
- ✅ Progress is saved in `Contest.participants` array
- ✅ Best submission per problem is tracked
- ✅ Total score is sum of best scores across all problems
- ✅ Updates happen in real-time after each submission

### 2. **Progress API Endpoint** 
**GET** `/api/contests/:id/progress/:userId`

Returns:
```json
{
  "success": true,
  "data": {
    "registered": true,
    "solved": 2,           // Fully solved problems
    "partial": 1,          // Partially solved problems
    "totalProblems": 5,    // Total problems in contest
    "score": 250,          // Total score
    "submissions": [...],  // Best submission per problem
    "registeredAt": "2025-11-01T..."
  }
}
```

### 3. **Live Progress Display with Animations**
- ✅ Progress counter shows: `X solved, Y partial`
- ✅ Animated updates with spring transitions
- ✅ Green checkmark icon with gradient
- ✅ Numbers update with smooth fade-in animations
- ✅ "Refresh Status" button to manually update

### 4. **Background Progress Calculation**
```javascript
// In submissionsController.cjs
async function updateContestProgress(userId, contestId, problemId, score, status) {
  // Find participant in contest
  // Update or add submission for this problem
  // Keep best score per problem
  // Recalculate total score
  // Save to database
}
```

---

## 🔧 Technical Implementation

### Database Structure

#### Contest.participants Schema
```javascript
participants: [{
  userId: String,
  email: String,
  displayName: String,
  registeredAt: Date,
  score: Number,  // Total score (sum of best scores)
  submissions: [{
    problemId: ObjectId,
    submittedAt: Date,
    passed: Boolean,    // True if fully solved
    score: Number       // Score for this problem
  }]
}]
```

### Submission Flow

1. **User submits code** → Judge0 evaluates → Test results returned
2. **Backend calculates score** → Marks based on passed/total tests
3. **Progress update triggered** → `updateContestProgress()` called
4. **Participant record updated**:
   - Find existing submission for this problem
   - Update if new score > old score
   - Add to submissions array if first attempt
   - Recalculate total score
5. **Database saved** → Progress persisted
6. **Frontend refreshes** → New progress displayed

### Score Calculation Logic

```javascript
// Per problem score (0-100)
const marksObtained = (passedTestCases / totalTestCases) * 100;

// Total score (sum of best scores)
participant.score = participant.submissions.reduce(
  (total, sub) => total + (sub.score || 0), 
  0
);

// Status determination
if (passedTestCases === totalTestCases) {
  completionStatus = 'fully_solved';  // Counts as "solved"
} else if (passedTestCases > 0) {
  completionStatus = 'partially_solved';  // Counts as "partial"
}
```

---

## 🎨 UI Components

### Progress Display (ContestProblems.jsx)
```jsx
<motion.div 
  key={`progress-${userProgress.solved}-${userProgress.partial}`}
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
>
  <span className="text-green-600 font-bold">
    {userProgress.solved || 0}
  </span>
  {' solved, '}
  <span className="text-orange-600 font-bold">
    {userProgress.partial || 0}
  </span>
  {' partial'}
</motion.div>
```

### Animated Checkmark Icon
```jsx
<motion.div 
  key={`${userProgress.solved}-${userProgress.partial}`}
  initial={{ scale: 0.8 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 300 }}
  className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl"
>
  ✓
</motion.div>
```

### Refresh Button
```jsx
<motion.button
  onClick={async () => {
    await Promise.all([
      loadProblemStatuses(problems),
      loadUserProgress()
    ]);
    toast.success('Progress updated!');
  }}
>
  🔄 Refresh Status
</motion.button>
```

---

## 📡 API Endpoints

### New Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contests/:id/progress/:userId` | Get user's progress in contest |

### Updated Endpoints
| Method | Endpoint | Changes |
|--------|----------|---------|
| POST | `/api/submissions` | Now updates contest progress after saving |

---

## 🔄 Auto-Refresh Mechanism

### Visibility Change Listener
```javascript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden && user?.uid && problems.length > 0) {
      loadProblemStatuses(problems);
      loadUserProgress();  // Refresh progress when tab becomes visible
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [problems, user]);
```

**When it triggers:**
- User switches back to the contest tab
- After submitting in CompilerPage and navigating back
- Ensures progress is always current

---

## 🎯 User Experience Flow

### Before Solving Any Problems
```
Your Progress
0 solved, 0 partial
```

### After Solving First Problem (100% tests passed)
```
✓ Updated progress for user abc123 in contest xyz: Score 100
→ Frontend updates:
Your Progress
1 solved, 0 partial
```

### After Partial Solution (60% tests passed)
```
✓ Updated progress for user abc123 in contest xyz: Score 160
→ Frontend updates:
Your Progress
1 solved, 1 partial
```

### User Improves Partial Solution (80% → 100%)
```
✓ Updated progress for user abc123 in contest xyz: Score 200
→ Frontend updates:
Your Progress
2 solved, 0 partial
```

---

## 🎨 Visual Feedback

### Progress Counter
- **Color Coding**:
  - Green: Fully solved problems
  - Orange: Partially solved problems
- **Animations**:
  - Spring animation on number change
  - Fade-in transition
  - Scale effect on checkmark

### Status Indicators
- ✅ Green checkmark: Fully solved
- ⚠️ Orange badge: Partially solved
- ⭕ Gray circle: Not attempted

---

## 💾 Data Persistence

### What Gets Saved
1. **Per-Problem Submissions**:
   - Problem ID
   - Submission timestamp
   - Pass/fail status
   - Score (0-100)

2. **Total Score**:
   - Sum of best scores
   - Updated on each new submission
   - Used for leaderboard ranking

3. **Completion Status**:
   - Fully solved count
   - Partially solved count
   - Not attempted count

### When Progress is Updated
- ✅ During contest (if `canScore = true`)
- ❌ After contest (practice mode, `canScore = false`)
- ✅ Only for better submissions (keeps best score)

---

## 🔍 Backend Logging

```bash
# Successful progress update
✓ Updated progress for user 6723abc... in contest 6724def...: Score 250

# Error handling (non-blocking)
Error updating contest progress: Contest not found
# Submission still saved, progress update skipped
```

---

## 🚀 Performance Optimizations

1. **Parallel Requests**: Progress and statuses load simultaneously
2. **Background Updates**: Progress calculation doesn't block submission response
3. **Smart Caching**: Only updates if score improves
4. **Minimal Re-renders**: Uses `key` prop to trigger animations only on actual changes

---

## 🧪 Testing Scenarios

### Scenario 1: First Submission
```
User submits → 3/5 tests pass
✓ Saved as: { problemId: X, score: 60, passed: false }
✓ Progress: 0 solved, 1 partial
```

### Scenario 2: Improve Existing Submission
```
User submits again → 5/5 tests pass
✓ Updated to: { problemId: X, score: 100, passed: true }
✓ Progress: 1 solved, 0 partial
✓ Total score: +40 (60→100)
```

### Scenario 3: Worse Submission (Ignored)
```
User submits → 2/5 tests pass
✓ Saved but not used for progress
✓ Best score maintained: 100
✓ Progress unchanged: 1 solved, 0 partial
```

### Scenario 4: Practice Mode (After Contest)
```
User submits after deadline
✓ Marked as practice (countsForScore: false)
✓ Progress NOT updated
✓ Can still see test results
```

---

## 📊 Example Progress Timeline

```
09:00 - Contest starts
09:15 - User solves Problem 1 (100%) → 1 solved, 0 partial, Score: 100
09:30 - User partial Problem 2 (60%) → 1 solved, 1 partial, Score: 160
10:00 - User improves Problem 2 (80%) → 1 solved, 1 partial, Score: 180
10:30 - User solves Problem 2 (100%) → 2 solved, 0 partial, Score: 200
11:00 - User partial Problem 3 (40%) → 2 solved, 1 partial, Score: 240
12:00 - Contest ends → Final: 2 solved, 1 partial, Score: 240
12:30 - User practices Problem 3 (100%) → Progress unchanged (practice mode)
```

---

## 🎯 Benefits

1. **Real-Time Feedback**: Users see progress immediately
2. **Accurate Scoring**: Best submission per problem is tracked
3. **Fair Competition**: Only in-contest submissions count
4. **Practice Mode**: Users can improve after contest without affecting scores
5. **Smooth UX**: Animations provide satisfying feedback
6. **Reliable**: Background updates don't block submissions

---

## 📝 Files Modified

### Backend
- ✅ `backend/controllers/submissionsController.cjs` - Added `updateContestProgress()`
- ✅ `backend/controllers/contestsController.cjs` - Added `getUserProgress()`
- ✅ `backend/routes/contests.cjs` - Added progress endpoint
- ✅ `backend/models/Contest.cjs` - Already has participants.submissions structure

### Frontend
- ✅ `src/pages/ContestProblems.jsx` - Added progress state and animations
- ✅ `src/services/ContestService.js` - Added `getUserProgress()` function

---

## ✨ Summary

Complete progress tracking system with:
- 📊 Real-time score updates
- 🎯 Accurate per-problem tracking
- 🎨 Animated progress displays
- 🔄 Auto-refresh on tab focus
- 💾 Best score persistence
- ⏱️ Time-based scoring (contest vs practice)

**Status**: ✅ Production Ready
**Performance**: Optimized with background updates
**UX**: Smooth animations and instant feedback
