// Test file to verify AI speech stopping functionality
// This file can be used to test the speech utilities

import { 
  stopAiSpeech, 
  isAiSpeaking, 
  pauseAiSpeech, 
  resumeAiSpeech, 
  getSpeechStatus,
  handleNavigationSpeechStop 
} from '../utils/speechUtils';

// Test function to start AI speech (for testing purposes)
const testStartSpeech = (text = "This is a test of the AI speech system. The user should be able to stop this speech by navigating to another page or clicking navigation links.") => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.8;
  utterance.volume = 0.7;
  
  utterance.onstart = () => console.log('Test speech started');
  utterance.onend = () => console.log('Test speech ended');
  utterance.onerror = (e) => console.error('Test speech error:', e);
  
  speechSynthesis.speak(utterance);
  return utterance;
};

// Test scenarios
const runTests = () => {
  console.group('AI Speech Control Tests');
  
  // Test 1: Start speech and check if it's speaking
  console.log('Test 1: Starting speech...');
  testStartSpeech();
  
  setTimeout(() => {
    console.log('Is AI speaking?', isAiSpeaking());
    console.log('Speech status:', getSpeechStatus());
  }, 1000);
  
  // Test 2: Stop speech after 3 seconds
  setTimeout(() => {
    console.log('Test 2: Stopping speech...');
    stopAiSpeech();
    
    setTimeout(() => {
      console.log('Is AI speaking after stop?', isAiSpeaking());
    }, 500);
  }, 3000);
  
  // Test 3: Test navigation stop
  setTimeout(() => {
    console.log('Test 3: Testing navigation stop...');
    testStartSpeech("This speech should be stopped by navigation");
    
    setTimeout(() => {
      console.log('Simulating navigation...');
      handleNavigationSpeechStop();
      
      setTimeout(() => {
        console.log('Is AI speaking after navigation stop?', isAiSpeaking());
      }, 500);
    }, 2000);
  }, 6000);
  
  console.groupEnd();
};

// Export test functions for use in development
export { testStartSpeech, runTests };

// Instructions for testing:
/*
1. Open browser console
2. Import this test file
3. Run: runTests()
4. Observe console output and audio behavior
5. Test navigation links while speech is playing
6. Test page visibility changes (minimize/restore window)
7. Test direct stopAiSpeech() function calls

Expected behavior:
- Speech should start and be audible
- isAiSpeaking() should return true while speaking
- stopAiSpeech() should immediately stop any ongoing speech
- Navigation links should stop speech automatically
- Page visibility changes should stop speech
- Component unmounting should stop speech
*/
