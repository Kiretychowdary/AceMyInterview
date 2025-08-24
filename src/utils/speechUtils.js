// Speech Synthesis Utility Functions
// These functions can be used throughout the app to manage AI speech

/**
 * Stops any ongoing AI speech synthesis
 * This is a global function that can be called from anywhere in the app
 */
export const stopAiSpeech = () => {
  try {
    if ('speechSynthesis' in window) {
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        speechSynthesis.cancel();
        console.log('AI speech stopped globally');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error stopping AI speech:', error);
    return false;
  }
};

/**
 * Checks if AI is currently speaking
 * @returns {boolean} True if AI is speaking, false otherwise
 */
export const isAiSpeaking = () => {
  try {
    if ('speechSynthesis' in window) {
      return speechSynthesis.speaking || speechSynthesis.pending;
    }
    return false;
  } catch (error) {
    console.error('Error checking speech status:', error);
    return false;
  }
};

/**
 * Pauses AI speech (if supported by browser)
 */
export const pauseAiSpeech = () => {
  try {
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.pause();
      console.log('AI speech paused');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error pausing AI speech:', error);
    return false;
  }
};

/**
 * Resumes AI speech (if supported by browser)
 */
export const resumeAiSpeech = () => {
  try {
    if ('speechSynthesis' in window && speechSynthesis.paused) {
      speechSynthesis.resume();
      console.log('AI speech resumed');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error resuming AI speech:', error);
    return false;
  }
};

/**
 * Gets the current speech synthesis status
 * @returns {object} Object containing speaking, pending, and paused status
 */
export const getSpeechStatus = () => {
  try {
    if ('speechSynthesis' in window) {
      return {
        speaking: speechSynthesis.speaking,
        pending: speechSynthesis.pending,
        paused: speechSynthesis.paused,
        supported: true
      };
    }
    return {
      speaking: false,
      pending: false,
      paused: false,
      supported: false
    };
  } catch (error) {
    console.error('Error getting speech status:', error);
    return {
      speaking: false,
      pending: false,
      paused: false,
      supported: false
    };
  }
};

/**
 * Event listener for navigation that stops AI speech
 * Can be attached to navigation events throughout the app
 */
export const handleNavigationSpeechStop = () => {
  stopAiSpeech();
};

// Global event listener for page visibility changes
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && isAiSpeaking()) {
      stopAiSpeech();
      console.log('AI speech stopped due to page visibility change');
    }
  });
}

// Global event listener for beforeunload  
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stopAiSpeech();
  });

  // Also stop speech on focus loss (for additional safety)
  window.addEventListener('blur', () => {
    if (isAiSpeaking()) {
      stopAiSpeech();
      console.log('AI speech stopped due to window losing focus');
    }
  });
}
