// Error handling utilities for the application

/**
 * Enhanced error logging with context
 */
export const logError = (error, context = '') => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.error('Application Error:', errorInfo);
  
  // You could send this to an error reporting service here
  // Example: sendToErrorReporting(errorInfo);
  
  return errorInfo;
};

/**
 * Safe function execution with error handling
 */
export const safeExecute = (fn, context = '', fallback = null) => {
  try {
    return fn();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
};

/**
 * Async safe function execution
 */
export const safeExecuteAsync = async (fn, context = '', fallback = null) => {
  try {
    return await fn();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
};

/**
 * Check if speech synthesis is supported and working
 */
export const checkSpeechSupport = () => {
  const support = {
    speechSynthesis: 'speechSynthesis' in window,
    speechRecognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
    mediaDevices: 'mediaDevices' in navigator,
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  };
  
  console.log('Browser support check:', support);
  return support;
};

/**
 * Network status checker
 */
export const checkNetworkStatus = () => {
  const isOnline = navigator.onLine;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  const networkInfo = {
    isOnline,
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 'unknown',
    rtt: connection?.rtt || 'unknown'
  };
  
  console.log('Network status:', networkInfo);
  return networkInfo;
};

/**
 * Error boundary for speech-related errors
 */
export const handleSpeechError = (error, action = 'unknown') => {
  const context = `Speech Error during ${action}`;
  logError(error, context);
  
  // Provide user-friendly error messages
  const userMessage = getSpeechErrorMessage(error);
  return { error: error.message, userMessage, context };
};

/**
 * Get user-friendly error messages for speech errors
 */
export const getSpeechErrorMessage = (error) => {
  const errorType = error.message || error.error || 'unknown';
  
  const errorMessages = {
    'network': 'Network connection issue. Please check your internet connection.',
    'not-allowed': 'Microphone permission denied. Please allow microphone access.',
    'no-speech': 'No speech detected. Please try speaking clearly.',
    'audio-capture': 'Microphone not accessible. Please check your microphone.',
    'service-not-allowed': 'Speech service not available. Please try again later.',
    'synthesis-failed': 'Speech synthesis failed. Please try again.',
    'synthesis-unavailable': 'Speech synthesis not available in your browser.'
  };
  
  return errorMessages[errorType] || 'An unexpected error occurred with speech functionality.';
};
