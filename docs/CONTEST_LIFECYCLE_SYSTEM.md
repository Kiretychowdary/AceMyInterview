# Contest Lifecycle Management System

## 📋 Overview
Complete implementation of contest lifecycle with automatic status updates, countdown timers, conditional registration, and time-bound scoring.

---

## ✅ Features Implemented

### 1. **Real-Time Countdown Timer Component** (`src/components/ContestCountdown.jsx`)
- ✅ Dynamic countdown showing days, hours, minutes, seconds
- ✅ Automatically updates every second
- ✅ Three states:
  - **Upcoming**: Shows time until contest starts (blue theme)
  - **Ongoing**: Shows time remaining (green theme)
  - **Completed**: Shows "Available for Practice" (gray theme)
- ✅ Notifies parent component of status changes

### 2. **Automatic Contest Status Updates** (`backend/services/contestStatusUpdater.cjs`)
- ✅ Auto-updates contest status every 60 seconds
- ✅ Status flow: `draft` → `scheduled` → `ongoing` → `completed`
- ✅ Starts automatically when server starts
- ✅ Logs status changes in console

### 3. **Contest Status API** (`/api/contests/:id/status`)
- ✅ Returns current contest status
- ✅ Provides timing information:
  - `canSubmitForScore`: true during contest
  - `canPractice`: true after contest ends
  - `timeUntilStart`: milliseconds until start
  - `timeRemaining`: milliseconds remaining
  - `isRegistrationOpen`: can users register
  - `isActive`: is contest currently running

### 4. **Conditional Registration Logic** (Updated `src/pages/Contests.jsx`)
- ✅ **Before Start**: Shows "Register Now" button
- ✅ **During Contest**: Shows "Enter Contest →" button (green, pulsing)
- ✅ **After End**: Shows "Practice Mode →" button (gray)
- ✅ Already registered users see "✓ Registered" badge
- ✅ Countdown timer on each contest card

### 5. **Time-Bound Scoring System** (Updated `backend/controllers/submissionsController.cjs`)
- ✅ **During Contest**: Submissions count for score
- ✅ **After Contest**: Submissions marked as practice mode
- ✅ Practice submissions have `isPracticeMode: true` and `countsForScore: false`
- ✅ Prevents late submissions from affecting contest scores
- ✅ Users can still practice and see if code is correct after contest ends

### 6. **Updated Submission Model** (`backend/models/Submission.cjs`)
- ✅ Added `isPracticeMode` field
- ✅ Added `countsForScore` field
- ✅ Enables tracking of scored vs practice submissions

---

## 🎨 UI/UX Improvements

### Contest Card Design
```jsx
- Professional blue/white color scheme
- Countdown timer with animated time units
- Status-based button colors:
  * Blue: Registration (upcoming)
  * Green: Enter Contest (ongoing, animated pulse)
  * Gray: Practice Mode (completed)
- Smooth animations on hover (scale, shadow)
```

### Countdown Timer Design
```jsx
- Large, bold numbers in boxes
- Color-coded by status:
  * Blue: Upcoming contest
  * Green: Ongoing contest
  * Gray: Completed contest
- Labels: "Starts in" / "Time Remaining" / "Contest Ended"
- Responsive padding and spacing
```

---

## 🔧 Technical Implementation

### Server Startup (backend/server.js)
```javascript
// Auto-start contest status updater
const ContestStatusUpdater = require('./services/contestStatusUpdater.cjs');
ContestStatusUpdater.startPolling(60000); // Every 60 seconds
```

### Contest Status Logic (backend/models/Contest.cjs)
```javascript
contestSchema.methods.updateStatus = function() {
  const now = new Date();
  
  if (now < this.startTime) {
    this.status = 'scheduled';
  } else if (now >= this.startTime && now <= this.endTime) {
    this.status = 'ongoing';
  } else if (now > this.endTime) {
    this.status = 'completed';
  }
  
  return this.status;
};
```

### Submission Timing Check
```javascript
if (payload.contestId) {
  const contest = await Contest.findById(payload.contestId);
  const now = new Date();
  
  if (now > contest.endTime) {
    isPracticeMode = true;
    canScore = false; // Don't count for scoring
  } else if (now < contest.startTime) {
    return res.status(400).json({ 
      error: 'Contest has not started yet' 
    });
  }
}
```

---

## 📊 Database Schema Updates

### Contest Model
```javascript
{
  participants: [{
    userId: String,
    email: String,
    displayName: String,
    registeredAt: Date,
    score: Number,
    submissions: [...]
  }],
  // Existing fields...
}
```

### Submission Model
```javascript
{
  isPracticeMode: Boolean,     // True if after contest
  countsForScore: Boolean,     // False if after contest
  // Existing fields...
}
```

---

## 🎯 User Flow

### Before Contest Starts
1. User sees countdown timer: "Starts in X days, Y hours..."
2. "Register Now" button available
3. After registration: "✓ Registered" badge shown
4. Cannot enter contest yet

### During Contest
1. Countdown shows "Time Remaining"
2. "Enter Contest →" button (green, pulsing)
3. Submissions count toward score
4. Marks calculated based on test cases passed
5. Best submission saved

### After Contest Ends
1. Timer shows "Contest Ended - Available for Practice"
2. "Practice Mode →" button (gray)
3. Users can still submit code
4. Submissions marked as practice (no score impact)
5. Can see if code passes tests
6. Leaderboard frozen at contest end time

---

## 🔄 Automatic Updates

### Status Update Service
- Runs every 60 seconds
- Updates all non-cancelled contests
- Logs changes to console
- Example output:
```
🕐 Starting contest status updater (polling every 60 seconds)...
Contest "Weekly Challenge #45" status updated: scheduled → ongoing
✓ Updated 1 contest(s) status at 2025-11-01T14:30:00.000Z
```

---

## 🚀 Benefits

1. **Fair Competition**: Submissions after deadline don't affect scores
2. **Practice Mode**: Users can practice after contest without penalties
3. **Real-Time Updates**: No page refresh needed to see status changes
4. **Professional UX**: Clear visual feedback on contest state
5. **Automatic Management**: Admin doesn't need to manually update statuses
6. **Scalable**: Works with hundreds of concurrent contests

---

## 🎨 Color Scheme (Blue/White Professional)

```css
Primary Blue: #2563eb (blue-600)
Light Blue: #3b82f6 (blue-500)
Blue Background: #eff6ff (blue-50)
Border Blue: #dbeafe (blue-100)

Success Green: #16a34a (green-600)
Practice Gray: #4b5563 (gray-600)
White: #ffffff
Text Gray: #6b7280 (gray-500)
```

---

## 📝 API Endpoints

### New Endpoint
- **GET** `/api/contests/:id/status` - Get real-time contest status

### Updated Endpoints
- **POST** `/api/contests/:id/register` - Requires auth, checks timing
- **POST** `/api/submissions` - Checks contest timing for scoring

---

## 🧪 Testing Checklist

- [x] Countdown timer updates every second
- [x] Status changes automatically at start/end times
- [x] Registration button hides during/after contest
- [x] Submissions during contest count for score
- [x] Submissions after contest marked as practice
- [x] Practice mode allows code testing
- [x] Leaderboard shows only scored submissions
- [x] Server logs status updates
- [x] UI shows correct button for each state
- [x] Blue/white theme consistent

---

## 🔮 Future Enhancements

1. **Email Notifications**: Notify registered users when contest starts
2. **Webhooks**: Trigger actions on status changes
3. **Extended Practice**: Allow practice with hidden test cases after contest
4. **Time Extensions**: Admin ability to extend contest duration
5. **Partial Credit**: More granular scoring for partial solutions
6. **Real-Time Leaderboard**: Live updates during contest

---

## 📄 Files Modified/Created

### New Files
- `src/components/ContestCountdown.jsx`
- `backend/services/contestStatusUpdater.cjs`
- `docs/CONTEST_LIFECYCLE_SYSTEM.md`

### Modified Files
- `backend/server.js` - Added status updater initialization
- `backend/models/Contest.cjs` - Enhanced participant tracking
- `backend/models/Submission.cjs` - Added practice mode fields
- `backend/controllers/contestsController.cjs` - Added status endpoint, timing checks
- `backend/controllers/submissionsController.cjs` - Added contest timing validation
- `backend/routes/contests.cjs` - Added status route, auth requirements
- `src/pages/Contests.jsx` - Added countdown timer, conditional buttons
- `src/pages/AdminDashboard.jsx` - Blue/white professional theme

---

## ✨ Summary

Complete contest lifecycle management system with:
- ⏰ Real-time countdown timers
- 🔄 Automatic status updates
- 🎯 Time-bound scoring
- 🎨 Professional blue/white UI
- 🏆 Fair competition enforcement
- 🔧 Practice mode after contests

**Status**: ✅ Production Ready
