// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { toast } from "react-toastify";
import { useAuth } from '../components/AuthContext';

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
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Enhanced speech recognition settings for better accuracy
    recognition.lang = "en-US";
    recognition.continuous = false; // Stop after one phrase
    recognition.interimResults = false; // Only return final results
    recognition.maxAlternatives = 1; // We only want the best result
    
    // Additional settings for better quality
    if (recognition.serviceURI) {
      recognition.serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up'; // Use Google's service if available
    }

    recognition.onstart = () => {
      console.log('Voice recognition started');
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      
      console.log('Speech recognition result:', { transcript, confidence });
      
      // Only accept results with reasonable confidence
      if (confidence > 0.6) {
        setInput(transcript);
        toast.success(`Recognized: "${transcript}"`);
      } else {
        toast.warn('Speech not clear enough. Please try again.');
        setInput('');
      }
      
      setIsRecording(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      // Provide specific error messages
      switch (event.error) {
        case 'network':
          toast.error('Network error. Please check your internet connection.');
          break;
        case 'not-allowed':
          toast.error('Microphone access denied. Please allow microphone access.');
          break;
        case 'no-speech':
          toast.warn('No speech detected. Please try again.');
          break;
        case 'audio-capture':
          toast.error('Microphone not found. Please check your microphone.');
          break;
        default:
          toast.error(`Speech recognition error: ${event.error}`);
      }
      
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
    
    recognition.onend = () => {
      console.log('Voice recognition ended');
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-1 py-2 md:py-6 md:px-4">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 py-2 md:py-4 bg-black border-b border-gray-700" style={{maxWidth:'100vw'}}>
        <div className="flex items-center gap-3">
          <img src="/src/assets/Logo.jpg" alt="Logo" className="w-8 h-8 rounded" />
          {/* Fix: topic is always a string */}
          <span className="text-lg md:text-xl font-bold text-white">{topic}</span>
        </div>
        <div className="flex-1 flex justify-center">
          <span className="bg-green-600 text-white font-bold px-4 py-1 rounded-full text-sm md:text-base">
            {`${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            title="Voice Settings"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 12a1 1 0 011-1h4a1 1 0 011 1v0a1 1 0 01-1 1h-4a1 1 0 01-1-1v0z" />
            </svg>
          </button>
          <div className="text-right">
            <p className="font-semibold text-white">{user?.displayName || 'User'}</p>
            <p className="text-xs text-gray-300">{user?.email || ''}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
            <img src="https://cdn-icons-png.flaticon.com/512/9203/9203764.png" alt="User" className="w-8 h-8 rounded" />
          </div>
        </div>
      </div>
      {/* Main Area */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-4 bg-black rounded-b-3xl pb-4 md:pb-8 px-2 md:px-8 mt-20">
        {/* Center: AI & User Video */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-[#2d2233] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="AI" className="w-24 h-24 md:w-32 md:h-32" />
            </div>
            <span className="text-white font-semibold mt-2">AI Interviewer</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
              {camera ? (
                <Webcam
                  key={camera}
                  audio={false}
                  videoConstraints={{ deviceId: { exact: camera } }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-black">User live video</span>
              )}
            </div>
            <select
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              className="w-32 px-2 py-1 rounded-lg bg-white text-gray-800 font-semibold shadow focus:outline-none text-xs md:text-base mt-1"
            >
              {cameras.length === 0 && <option>No camera found</option>}
              {cameras.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || `Camera ${c.deviceId.slice(-4)}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Right: Transcript/Chat */}
        <div className="w-full md:w-1/3 bg-[#231f24] rounded-2xl p-3 md:p-5 flex flex-col min-h-[300px] max-h-[420px] overflow-y-auto border border-gray-700">
          <h2 className="text-white text-lg font-bold mb-2">Interview Transcript</h2>
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`px-3 py-2 rounded-xl max-w-[90%] text-xs md:text-sm shadow ${msg.role === 'ai' ? 'bg-[#3a2c4d] text-green-300' : 'bg-[#e9d5ff] text-black'}`}>
                  <span className="block font-semibold mb-1">{msg.role === 'ai' ? 'AI' : 'You'}</span>
                  <span>{msg.text}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl bg-[#3a2c4d] text-green-300 max-w-[90%] text-xs md:text-sm shadow">
                  <span className="block font-semibold mb-1">AI</span>
                  <span>Typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-4 mt-4 px-2">
        <button
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow transition"
          onClick={() => setShowInput(true)}
          disabled={loading || !canAnswer}
        >
          Click to answer
        </button>
        <button
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow transition"
          onClick={() => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            navigate('/mock-interviews');
          }}
        >
          End Interview
        </button>
      </div>
      {/* Answer Input Modal */}
      {showInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Your Answer</h3>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-gray-300 p-3 text-gray-800 focus:outline-none focus:border-blue-400"
              placeholder="Type your answer or use Record..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { handleSend(input); setShowInput(false); }}
                disabled={loading || !input.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow transition disabled:opacity-60"
              >
                Send
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`flex-1 ${isRecording ? 'bg-red-500' : 'bg-green-500'} text-white font-bold py-2 rounded-lg shadow transition`}
              >
                {isRecording ? 'Stop' : 'Record'}
              </button>
              <button
                onClick={() => setShowInput(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg shadow transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Settings Modal */}
      {showVoiceSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">AI Voice Settings</h3>
              <button
                onClick={() => setShowVoiceSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice</label>
                <select
                  value={voiceSettings.selectedVoiceName}
                  onChange={(e) => setVoiceSettings({...voiceSettings, selectedVoiceName: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                >
                  <option value="">Auto (Best Available)</option>
                  {availableVoices
                    .filter(voice => voice.lang.startsWith('en-'))
                    .map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))
                  }
                </select>
              </div>

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
              <button
                onClick={() => setVoiceSettings({
                  rate: 0.9,
                  pitch: 1.0,
                  volume: 0.8,
                  selectedVoiceName: ''
                })}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;