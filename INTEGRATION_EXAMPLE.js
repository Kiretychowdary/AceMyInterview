// Example: How to integrate the new avatar setup into FaceToFaceInterview.jsx
// This file shows the key changes needed

import React, { useState } from 'react';
import InterviewAvatarSetup from '../../components/interview/InterviewAvatarSetup';
import Avatar3D from '../../components/interview/Avatar3D';
// ... other imports

const FaceToFaceInterview = () => {
  // ADD: New state for avatar configuration
  const [showAvatarSetup, setShowAvatarSetup] = useState(true);
  const [avatarConfig, setAvatarConfig] = useState(null);
  
  // ... existing state variables ...
  const [interviewPhase, setInterviewPhase] = useState('setup');
  const [questions, setQuestions] = useState([]);
  // etc...

  // ADD: Handler for avatar setup completion
  const handleAvatarSetupComplete = (config) => {
    console.log('Avatar setup completed:', config);
    setAvatarConfig(config);
    setShowAvatarSetup(false);
    
    // Continue to interview
    setInterviewPhase('interview');
    generateQuestions(); // Start generating questions
  };

  // ADD: Handler for skipping avatar setup (optional)
  const handleSkipAvatarSetup = () => {
    // Use default avatar configuration
    setAvatarConfig({
      avatar: {
        id: 'default',
        name: 'AI Avatar',
        url: null,
        isDefault: true
      },
      settings: {
        useSadTalker: false,
        avatarSpeed: 'normal',
        expressiveness: 'medium',
        enableEnhancer: false
      }
    });
    setShowAvatarSetup(false);
    setInterviewPhase('interview');
    generateQuestions();
  };

  // SHOW AVATAR SETUP WIZARD FIRST
  if (showAvatarSetup) {
    return (
      <InterviewAvatarSetup
        interviewConfig={interviewConfig}
        onComplete={handleAvatarSetupComplete}
        onCancel={() => navigate('/dashboard')}
      />
    );
  }

  // EXISTING INTERVIEW UI WITH ENHANCED AVATAR
  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ... existing layout ... */}
      
      <div className="interview-container">
        {/* REPLACE OLD Avatar3D with enhanced version */}
        <Avatar3D
          textToSpeak={
            interviewPhase === 'setup' 
              ? 'Welcome! Let me generate your interview questions...'
              : questions[currentQuestionIndex]?.question || ''
          }
          expression={avatarExpression}
          feedbackText={avatarFeedback}
          avatarConfig={avatarConfig?.avatar}           // NEW: Pass avatar config
          enableSadTalker={avatarConfig?.settings?.useSadTalker || false}  // NEW: Enable SadTalker
        />

        {/* ... rest of your interview UI ... */}
        {/* Question display, answer input, controls, etc. */}
      </div>
    </div>
  );
};

export default FaceToFaceInterview;

/* 
 * KEY CHANGES SUMMARY:
 * 
 * 1. Import InterviewAvatarSetup component
 * 2. Add showAvatarSetup and avatarConfig state
 * 3. Add handleAvatarSetupComplete callback
 * 4. Show InterviewAvatarSetup wizard first
 * 5. Pass avatarConfig to Avatar3D component
 * 6. Enable SadTalker based on user selection
 * 
 * OPTIONAL ENHANCEMENTS:
 * - Add a "Settings" button to re-open avatar setup
 * - Save avatar preferences to localStorage
 * - Allow switching avatars mid-interview
 * - Pre-generate avatar videos for all questions
 */
