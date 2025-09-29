// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { toast } from "react-toastify";
import { useAuth } from '../components/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyAPPmXjX3_uY40381jTjoHvYkJR6uLnf9U";

const InterviewRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Fix: Extract subject and prompt from location.state
  const { subject, prompt } = location.state || {};
  const topic = prompt ? prompt : subject || "Interview";
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [camera, setCamera] = useState("");
  const [cameras, setCameras] = useState([]);
  const [canAnswer, setCanAnswer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const tabSwitchCount = useRef(0);
  const [lastSpokenIdx, setLastSpokenIdx] = useState(-1);
  const [showInput, setShowInput] = useState(false);
  const [timer, setTimer] = useState(30 * 60); // 30 min in seconds
  const [availableVoices, setAvailableVoices] = useState([]);
  const [voiceSettings, setVoiceSettings] = useState({
    rate: 0.9,
    pitch: 1.0,
    volume: 0.8,
    selectedVoiceName: ''
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [speechFailures, setSpeechFailures] = useState(0);
  const { user } = useAuth();

  // Initialize voices when component loads
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Log available voices for debugging
      console.log('Available voices:', voices.map(v => ({
        name: v.name,
        lang: v.lang,
        quality: v.quality || 'unknown'
      })));
    };
    
    // Load voices immediately if they're already available
    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    }
    
    // Also listen for the voiceschanged event (some browsers load voices asynchronously)
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet connection restored! Voice recognition is now available.');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warn('Internet connection lost. Voice recognition unavailable.');
      if (isRecording) {
        setIsRecording(false);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isRecording]);

  useEffect(() => {
    async function getDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setCameras(videoInputs);
      if (videoInputs[0]) setCamera(videoInputs[0].deviceId);
    }
    getDevices();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Tab switch detection and toast
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        tabSwitchCount.current++;
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      } else if (document.visibilityState === "visible") {
        toast.warn("Tab switch detected! Stay focused on the interview.");
        if (tabSwitchCount.current >= 2) {
          toast.error("Too many tab switches. Redirecting...");
          navigate("/mock-interviews");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [navigate]);

  useEffect(() => {
    if (!topic) return;
    setLoading(true);
    setCanAnswer(false);
    const promptText = `You are an AI interviewer. Start a classic interview by first asking the user for their name and a brief introduction. Then, conduct a technical interview on the topic "${topic}", moving from basic to advanced concepts, topic by topic. For each sub-topic, ask only 1 or 2 short questions at a time, and wait for the user's answer before proceeding. Keep your questions concise.`;
    fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: promptText }] }],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const aiText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn't generate a response.";
        setMessages([{ role: "ai", text: aiText }]);
        speak(aiText);
        setCanAnswer(true);
      })
      .finally(() => setLoading(false));
  }, [topic]);

  // Timer logic
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Speak only once per new AI message
  useEffect(() => {
    if (!messages.length) return;
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (lastMsg.role === 'ai' && lastSpokenIdx !== lastIdx) {
      window.speechSynthesis.cancel();
      speak(lastMsg.text);
      setLastSpokenIdx(lastIdx);
    }
  }, [messages, lastSpokenIdx]);

  // Stop AI speech when navigating away from the interview room
  useEffect(() => {
    const stopSpeech = () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
    return () => {
      stopSpeech();
    };
  }, []);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // Check internet connectivity
    if (!isOnline) {
      toast.error('No internet connection detected. Speech recognition requires internet access.');
      setShowInput(true); // Show text input as fallback
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      // Enhanced speech recognition settings for better accuracy
      recognition.lang = "en-US";
      recognition.continuous = false; // Stop after one phrase
      recognition.interimResults = false; // Only return final results
      recognition.maxAlternatives = 1; // We only want the best result
      
      // Add timeout for better error handling
      const timeoutId = setTimeout(() => {
        if (recognition && setIsRecording) {
          recognition.stop();
          setIsRecording(false);
          toast.warn('Speech recognition timed out. Please try typing your answer.');
          setTimeout(() => setShowInput(true), 500);
        }
      }, 10000); // 10 second timeout
      
      // Additional settings for better quality
      if (recognition.serviceURI) {
        recognition.serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up'; // Use Google's service if available
      }

      recognition.onstart = () => {
        console.log('Voice recognition started');
        setIsRecording(true);
        toast.info('Listening... Speak clearly!', { duration: 2000 });
      };

      recognition.onresult = (event) => {
        clearTimeout(timeoutId); // Clear timeout on successful result
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        console.log('Speech recognition result:', { transcript, confidence });
        
        // Only accept results with reasonable confidence
        if (confidence > 0.6) {
          setInput(transcript);
          toast.success(`Recognized: "${transcript}"`);
          setSpeechFailures(0); // Reset failures on success
        } else {
          toast.warn('Speech not clear enough. Please try again or type your answer.');
          setInput('');
          // Show text input as fallback for unclear speech
          setTimeout(() => setShowInput(true), 1500);
        }
        
        setIsRecording(false);
      };
      
      recognition.onerror = (event) => {
        clearTimeout(timeoutId); // Clear timeout on error
        console.error('Speech recognition error:', event.error, event);
        setIsRecording(false);
        
        // Provide specific error messages and solutions
        switch (event.error) {
          case 'network':
            setSpeechFailures(prev => prev + 1);
            if (speechFailures >= 2) {
              toast.error(
                'Speech recognition is having persistent issues. We recommend using the text input option for the rest of this interview.', 
                { duration: 6000 }
              );
            } else {
              toast.error(
                'Speech service temporarily unavailable. Please type your answer instead.', 
                { duration: 4000 }
              );
            }
            // Automatically show text input as the primary fallback
            setTimeout(() => setShowInput(true), 1000);
            break;
          case 'not-allowed':
            toast.error('Microphone access denied. Please allow microphone access in browser settings.');
            break;
          case 'no-speech':
            toast.warn('No speech detected. Please try speaking louder or closer to the microphone.');
            break;
          case 'audio-capture':
            toast.error('Microphone not found. Please check your microphone connection.');
            break;
          case 'service-not-allowed':
            toast.error('Speech service blocked. Please enable speech recognition in browser.');
            break;
          case 'aborted':
            toast.info('Speech recognition cancelled.');
            break;
          case 'language-not-supported':
            toast.error('English language not supported by your browser.');
            break;
          default:
            toast.error(`Speech error: ${event.error}. Please type your answer instead.`);
        }
        
        // Always show text input as fallback after any error
        setTimeout(() => {
          setShowInput(true);
        }, 2000);

        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
      
      recognition.onend = () => {
        clearTimeout(timeoutId); // Clear timeout when recognition ends
        console.log('Voice recognition ended');
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      toast.error('Speech recognition failed to start. Please type your answer.');
      setShowInput(true);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setInput("");
    }
  };

  const handleSend = async (userText) => {
    if (!userText.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);
    setShowInput(false);
    try {
      const promptText = `You are an AI interviewer. First, ask the user for their name and a brief introduction. Then, conduct a technical interview on the topic "${topic}", starting from basic to advanced concepts. For each sub-topic, ask no more than 2 questions at a time, and wait for the user's answers before proceeding. After the user answers, ask the next question related to the topic, moving step by step through the interview.\nThe user answered: "${userText}"\nNow ask the next question related to the topic.`;
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: promptText }] }],
        }),
      });
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: 'ai', text: aiText }]);
      setCanAnswer(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, there was an error connecting to Gemini.' },
      ]);
    }
    setLoading(false);
    setInput('');
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Wait a bit to ensure cancellation is processed
    setTimeout(() => {
      const utterance = new window.SpeechSynthesisUtterance(text);
      
      // Use current voice settings
      utterance.lang = "en-US";
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      
      // Try to use selected voice or find a good default
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;
      
      // If user has selected a specific voice, use it
      if (voiceSettings.selectedVoiceName) {
        selectedVoice = voices.find(voice => voice.name === voiceSettings.selectedVoiceName);
      }
      
      // If no selected voice or selected voice not found, use default selection logic
      if (!selectedVoice) {
        // Prefer high-quality English voices (look for female voices which are often clearer)
        const preferredVoices = [
          'Microsoft Zira - English (United States)',
          'Microsoft Aria - English (United States)', 
          'Google US English Female',
          'Microsoft David - English (United States)',
          'Google US English',
          'Alex',
          'Samantha'
        ];
        
        // Find the best available voice
        for (const preferredVoice of preferredVoices) {
          selectedVoice = voices.find(voice => 
            voice.name.includes(preferredVoice) || 
            voice.name.toLowerCase().includes(preferredVoice.toLowerCase())
          );
          if (selectedVoice) break;
        }
        
        // Fallback to any English voice if preferred voices not found
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => 
            voice.lang.startsWith('en-') && 
            (voice.name.toLowerCase().includes('female') || 
             voice.name.toLowerCase().includes('woman') ||
             voice.quality === 'high')
          );
        }
        
        // Final fallback to any English voice
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith('en-'));
        }
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name);
      }
      
      // Add event listeners for better error handling
      utterance.onstart = () => {
        console.log('Speech started with voice:', selectedVoice?.name || 'default');
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event.error);
        // Retry with default voice if there's an error
        if (event.error === 'voice-unavailable') {
          const retryUtterance = new window.SpeechSynthesisUtterance(text);
          retryUtterance.lang = "en-US";
          retryUtterance.rate = voiceSettings.rate;
          retryUtterance.pitch = voiceSettings.pitch;
          retryUtterance.volume = voiceSettings.volume;
          window.speechSynthesis.speak(retryUtterance);
        }
      };
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const handleInputSend = () => {
    if (input.trim()) {
      handleSend(input);
      setInput("");
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-white text-black px-1 py-2 md:py-6 md:px-4 flex flex-col items-center justify-center relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Professional Background Decorations with Floating Animations */}
      <motion.div 
        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-transparent rounded-full blur-3xl -translate-x-48 -translate-y-48"
        animate={{ 
          x: [-48, -30, -48],
          y: [-48, -30, -48],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      <motion.div 
        className="absolute top-1/3 right-0 w-80 h-80 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl translate-x-40"
        animate={{ 
          x: [40, -20, 40],
          y: [-30, 30, -30],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 5
        }}
      />
      <motion.div 
        className="absolute bottom-0 left-1/3 w-72 h-72 bg-gradient-to-tr from-purple-200/25 to-transparent rounded-full blur-3xl translate-y-36"
        animate={{ 
          x: [-30, 30, -30],
          y: [36, 10, 36],
          scale: [1, 1.15, 1]
        }}
        transition={{ 
          duration: 18, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 10
        }}
      />
      {/* Professional Top Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 py-2 md:py-4 bg-white/90 backdrop-blur-sm border-b border-blue-200/50 shadow-lg" 
        style={{maxWidth:'100vw'}}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3">
          <motion.img 
            src="/src/assets/Logo.jpg" 
            alt="Logo" 
            className="w-8 h-8 rounded-lg shadow-md" 
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          />
          <motion.span 
            className="text-lg md:text-xl font-bold text-blue-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {topic}
          </motion.span>
        </div>
        <div className="flex-1 flex justify-center">
          <motion.span 
            className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold px-6 py-2 rounded-full text-sm md:text-base shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
          >
            {`${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`}
          </motion.span>
        </div>
        <div className="flex items-center gap-3">
          {/* Network Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
            isOnline 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white animate-pulse'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-300' : 'bg-red-300'}`}></div>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          
          <motion.button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded-full transition-colors border border-blue-300/50"
            title="Voice Settings"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 12a1 1 0 011-1h4a1 1 0 011 1v0a1 1 0 01-1 1h-4a1 1 0 01-1-1v0z" />
            </svg>
          </motion.button>
          <div className="text-right">
            <p className="font-semibold text-blue-700">{user?.displayName || 'User'}</p>
            <p className="text-xs text-gray-600">{user?.email || ''}</p>
          </div>
          <motion.div 
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
          >
            <img src="https://cdn-icons-png.flaticon.com/512/9203/9203764.png" alt="User" className="w-8 h-8 rounded" />
          </motion.div>
        </div>
      </motion.div>
      {/* Main Area */}
      <motion.div 
        className="w-full max-w-6xl flex flex-col md:flex-row gap-4 bg-white/80 backdrop-blur-sm rounded-3xl pb-4 md:pb-8 px-2 md:px-8 mt-20 shadow-2xl border border-blue-200/50 relative z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
      >
        {/* Center: AI & User Video */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 py-6">
          <motion.div 
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.div 
              className="w-36 h-36 md:w-44 md:h-44 bg-gradient-to-br from-blue-600 to-purple-700 rounded-full flex items-center justify-center border-4 border-white shadow-2xl relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-600/30 animate-pulse"></div>
              <motion.img 
                src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
                alt="AI" 
                className="w-28 h-28 md:w-36 md:h-36 relative z-10" 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
            <motion.span 
              className="text-blue-700 font-bold text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              AI Interviewer
            </motion.span>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.div 
              className="w-36 h-36 md:w-44 md:h-44 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-2xl relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {camera ? (
                <Webcam
                  key={camera}
                  audio={false}
                  videoConstraints={{ deviceId: { exact: camera } }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-700 font-semibold text-center px-2">User Live Video</span>
              )}
              <div className="absolute inset-0 border-2 border-blue-400/50 rounded-full animate-pulse"></div>
            </motion.div>
            <motion.select
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              className="w-40 px-3 py-2 rounded-xl bg-white/90 backdrop-blur-sm text-gray-800 font-semibold shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400/50 text-sm border border-blue-200/50"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {cameras.length === 0 && <option>No camera found</option>}
              {cameras.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || `Camera ${c.deviceId.slice(-4)}`}
                </option>
              ))}
            </motion.select>
          </motion.div>
        </div>
        {/* Right: Transcript/Chat */}
        <motion.div 
          className="w-full md:w-1/3 bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6 flex flex-col min-h-[350px] max-h-[450px] overflow-y-auto border border-blue-200/50 shadow-xl"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <motion.h2 
            className="text-blue-700 text-xl font-bold mb-4 flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            <span className="text-2xl">💬</span>
            Interview Transcript
          </motion.h2>
          <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
            <AnimatePresence>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className={`px-4 py-3 rounded-2xl max-w-[88%] text-sm shadow-lg ${
                    msg.role === 'ai' 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                  }`}>
                    <span className="block font-bold mb-1 text-xs opacity-90">
                      {msg.role === 'ai' ? '🤖 AI' : '👤 You'}
                    </span>
                    <span className="leading-relaxed">{msg.text}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div 
                className="flex justify-start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-500 text-white max-w-[88%] text-sm shadow-lg">
                  <span className="block font-bold mb-1 text-xs opacity-90">🤖 AI</span>
                  <span className="flex items-center gap-2">
                    Typing
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ...
                    </motion.span>
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>
        </motion.div>
      </motion.div>
      {/* Bottom Bar */}
      <motion.div 
        className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-6 mt-6 px-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <motion.button
          className="group relative w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-xl border-none focus:outline-none focus:ring-4 focus:ring-blue-300/50 overflow-hidden"
          onClick={() => setShowInput(true)}
          disabled={loading || !canAnswer}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10 flex items-center gap-3">
            <span className="text-xl">💭</span>
            {isOnline ? 'Click to Answer' : 'Type Answer (Offline)'}
          </span>
          <motion.div
            className="absolute top-0 left-0 h-full w-8 bg-white opacity-20 transform -skew-x-12"
            animate={{ x: [-50, 350] }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity, 
              repeatDelay: 4,
              ease: "easeInOut" 
            }}
          />
        </motion.button>
        
        {/* Voice Recording Button with status indicator */}
        <div className="flex flex-col items-center gap-3">
          <motion.button
            className={`group relative w-full md:w-auto font-bold py-4 px-10 rounded-2xl text-lg shadow-xl border-none focus:outline-none focus:ring-4 overflow-hidden transition-all duration-300 ${
              !isOnline 
                ? 'bg-gray-400 text-white cursor-not-allowed focus:ring-gray-300/50' 
                : speechFailures >= 3
                  ? 'bg-yellow-500 text-white cursor-not-allowed focus:ring-yellow-300/50'
                : isRecording 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red-300/50' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green-300/50'
            }`}
            onClick={!isOnline || speechFailures >= 3 ? null : (isRecording ? stopRecording : startRecording)}
            disabled={loading || !canAnswer || !isOnline || speechFailures >= 3}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              isRecording 
                ? 'bg-gradient-to-r from-red-400 to-red-500' 
                : 'bg-gradient-to-r from-green-400 to-green-500'
            }`}></div>
            <span className="relative z-10 flex items-center gap-3">
              {!isOnline ? (
                <>🚫 Voice Unavailable (Offline)</>
              ) : speechFailures >= 3 ? (
                <>⚠️ Voice Service Issues</>
              ) : isRecording ? (
                <>🔴 Stop Recording</>
              ) : (
                <>🎤 Record Voice</>
              )}
            </span>
          </motion.button>
          
          {/* Connection/Service status indicator */}
          <AnimatePresence>
            {!isOnline ? (
              <motion.span 
                className="text-xs text-red-500 text-center px-3 py-1 bg-red-50 rounded-full"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Internet required for voice recognition
              </motion.span>
            ) : speechFailures >= 3 ? (
              <motion.span 
                className="text-xs text-yellow-600 text-center px-3 py-1 bg-yellow-50 rounded-full"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Multiple speech errors detected. Use text input.
              </motion.span>
            ) : speechFailures > 0 ? (
              <motion.span 
                className="text-xs text-orange-600 text-center px-3 py-1 bg-orange-50 rounded-full"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Speech service having issues. Try text input.
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
        
        <motion.button
          className="group relative w-full md:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-xl border-none focus:outline-none focus:ring-4 focus:ring-red-300/50 overflow-hidden"
          onClick={() => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            navigate('/mock-interviews');
          }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10 flex items-center gap-3">
            <span className="text-xl">🏁</span>
            End Interview
          </span>
        </motion.button>
      </motion.div>
      {/* Answer Input Modal */}
      <AnimatePresence>
        {showInput && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInput(false)}
          >
            <motion.div 
              className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 flex flex-col gap-6 border border-blue-200/50 relative overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-blue-200/30 rounded-full opacity-50 transform translate-x-16 -translate-y-16"></div>
              <motion.h3 
                className="text-2xl font-bold text-center text-blue-700 mb-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                💭 Your Answer
              </motion.h3>
              <motion.textarea
                className="w-full min-h-[100px] rounded-xl border-2 border-blue-200/50 p-4 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 backdrop-blur-sm bg-white/80 resize-none"
                placeholder="Type your answer or use Record..."
                value={input}
                onChange={e => setInput(e.target.value)}
                autoFocus
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              />
              <div className="flex gap-3">
                <motion.button
                  onClick={() => { handleSend(input); setShowInput(false); }}
                  disabled={loading || !input.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>📤</span>
                    Send
                  </span>
                </motion.button>
                <motion.button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={loading}
                  className={`flex-1 font-bold py-3 rounded-xl shadow-lg transition-all duration-300 ${
                    isRecording 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    {isRecording ? (
                      <>⏹️ Stop</>
                    ) : (
                      <>🎤 Record</>
                    )}
                  </span>
                </motion.button>
                <motion.button
                  onClick={() => setShowInput(false)}
                  className="flex-1 bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 font-bold py-3 rounded-xl shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  ❌ Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Settings Modal */}
      <AnimatePresence>
        {showVoiceSettings && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowVoiceSettings(false)}
          >
            <motion.div 
              className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4 flex flex-col gap-6 border border-blue-200/50 relative overflow-hidden max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/30 to-blue-200/30 rounded-full opacity-50 transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-100/30 to-purple-200/30 rounded-full opacity-50 transform -translate-x-12 translate-y-12"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <motion.h3 
                  className="text-2xl font-bold text-blue-700 flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <span className="text-3xl">🎛️</span>
                  AI Voice Settings
                </motion.h3>
                <motion.button
                  onClick={() => setShowVoiceSettings(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100/80 hover:bg-red-100/80 text-gray-600 hover:text-red-600 transition-all duration-200"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            
            <motion.div 
              className="space-y-6 relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {/* Voice Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <label className="flex text-sm font-semibold text-blue-700 mb-3 items-center gap-2">
                  <span className="text-lg">🎤</span>
                  Voice Selection
                </label>
                <motion.select
                  value={voiceSettings.selectedVoiceName}
                  onChange={(e) => setVoiceSettings({...voiceSettings, selectedVoiceName: e.target.value})}
                  className="w-full p-3 border-2 border-blue-200/50 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 bg-white/80 backdrop-blur-sm text-gray-800 font-medium"
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <option value="">🔄 Auto (Best Available)</option>
                  {availableVoices
                    .filter(voice => voice.lang.startsWith('en-'))
                    .map(voice => (
                      <option key={voice.name} value={voice.name}>
                        🔊 {voice.name} ({voice.lang})
                      </option>
                    ))
                  }
                </motion.select>
              </motion.div>

              {/* Speech Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speech Rate: {voiceSettings.rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="1.5"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => setVoiceSettings({...voiceSettings, rate: parseFloat(e.target.value)})}
                  className="w-full voice-slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Slow</span>
                  <span>Normal</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Pitch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pitch: {voiceSettings.pitch.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => setVoiceSettings({...voiceSettings, pitch: parseFloat(e.target.value)})}
                  className="w-full voice-slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>Normal</span>
                  <span>High</span>
                </div>
              </div>

              {/* Volume */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume: {Math.round(voiceSettings.volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={voiceSettings.volume}
                  onChange={(e) => setVoiceSettings({...voiceSettings, volume: parseFloat(e.target.value)})}
                  className="w-full voice-slider"
                />
              </div>

              {/* Test Voice */}
              <button
                onClick={() => speak("Hello, this is how I sound with your current settings. How do you like my voice quality and clarity?")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Test Voice
              </button>

              {/* Reset to Defaults */}
              <motion.button
                onClick={() => setVoiceSettings({
                  rate: 0.9,
                  pitch: 1.0,
                  volume: 0.8,
                  selectedVoiceName: ''
                })}
                className="w-full bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-800 font-bold py-3 rounded-xl shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                🔄 Reset to Defaults
              </motion.button>
            </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InterviewRoom;