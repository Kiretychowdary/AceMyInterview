// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * AI Learning Companion Chat Widget
 * Always visible conversational AI that guides users
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AICompanionChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [proactiveSuggestion, setProactiveSuggestion] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    // Load voice preference from localStorage, default to true
    const saved = localStorage.getItem('aiVoiceEnabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const speechSynthRef = useRef(null);

  // Save voice preference whenever it changes
  useEffect(() => {
    localStorage.setItem('aiVoiceEnabled', voiceEnabled.toString());
  }, [voiceEnabled]);

  useEffect(() => {
    if (user && isOpen && !sessionId) {
      initializeChat();
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (user) {
      fetchProactiveSuggestion();
      // Fetch new suggestions every 2 minutes
      const interval = setInterval(fetchProactiveSuggestion, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthRef.current = window.speechSynthesis;
    }
    return () => {
      // Stop any ongoing speech when component unmounts
      if (speechSynthRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  const speakText = (text) => {
    if (!voiceEnabled || !speechSynthRef.current) return;

    // Stop any ongoing speech
    speechSynthRef.current.cancel();

    // Remove emojis and special characters for cleaner speech
    const cleanText = text.replace(/[👋🤖💡🎉💪📊🔥⚡✨🌟]/g, '').trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure voice settings
    utterance.rate = 1.0;  // Speed of speech
    utterance.pitch = 1.0; // Pitch of voice
    utterance.volume = 1.0; // Volume

    // Try to use a female voice for more friendly feel
    const voices = speechSynthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Female') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Google US English')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/ai-agent/session`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSessionId(response.data.sessionId);
      setMessages(response.data.messages || []);
      
      // Speak welcome message if voice is enabled
      if (voiceEnabled && response.data.messages && response.data.messages.length > 0) {
        const welcomeMessage = response.data.messages[response.data.messages.length - 1];
        if (welcomeMessage.role === 'assistant') {
          setTimeout(() => speakText(welcomeMessage.content), 500);
        }
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setMessages([{
        role: 'assistant',
        content: "👋 Hi! I'm your AI learning companion. I'm here to guide you!",
        timestamp: new Date()
      }]);
    }
  };

  const fetchProactiveSuggestion = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await axios.get(`${API_BASE_URL}/api/ai-agent/suggestion`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProactiveSuggestion(response.data);
      
      // Show suggestion briefly if chat is closed
      if (!isOpen && response.data.type !== 'welcome') {
        setShowSuggestion(true);
        setTimeout(() => setShowSuggestion(false), 10000); // Hide after 10 seconds
      }
    } catch (error) {
      console.error('Error fetching suggestion:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Add user message immediately
    const newMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await axios.post(
        `${API_BASE_URL}/api/ai-agent/chat`,
        {
          message: userMessage,
          sessionId: sessionId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      }]);

      // Speak the AI response if voice is enabled
      if (voiceEnabled) {
        setTimeout(() => speakText(response.data.response), 300);
      }

      // Refresh proactive suggestion after interaction
      setTimeout(fetchProactiveSuggestion, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble responding right now. Please try again!",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getSuggestionColor = (type) => {
    switch (type) {
      case 'celebration': return 'bg-green-500';
      case 'encouragement': return 'bg-orange-500';
      case 'milestone': return 'bg-purple-500';
      default: return 'bg-blue-500';
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Proactive Suggestion Bubble (when chat is closed) */}
      {!isOpen && showSuggestion && proactiveSuggestion && (
        <div className="fixed bottom-24 right-6 z-40 animate-bounce">
          <div className="bg-white rounded-lg shadow-2xl border-2 border-purple-300 p-4 max-w-xs">
            <p className="text-sm text-gray-700">{proactiveSuggestion.suggestion}</p>
            <button
              onClick={() => {
                setIsOpen(true);
                setShowSuggestion(false);
              }}
              className="mt-2 text-purple-600 text-xs font-medium hover:underline"
            >
              Chat with me →
            </button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border-2 border-purple-300 flex flex-col z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-2xl animate-pulse">
                🤖
              </div>
              <div>
                <h3 className="font-bold">AI Learning Companion</h3>
                <p className="text-xs text-purple-100">Always here to guide you</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Voice Toggle Button */}
              <button
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) stopSpeaking();
                }}
                className={`p-2 rounded-lg transition ${
                  voiceEnabled 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                title={voiceEnabled ? 'Voice ON - Click to mute' : 'Voice OFF - Click to enable'}
              >
                <span className="text-lg">
                  {voiceEnabled ? (isSpeaking ? '🔊' : '🔉') : '🔇'}
                </span>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 text-xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Proactive Suggestion Bar */}
          {proactiveSuggestion && (
            <div className={`${getSuggestionColor(proactiveSuggestion.type)} text-white text-xs p-2 text-center`}>
              💡 {proactiveSuggestion.suggestion?.substring(0, 80)}...
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between space-x-2">
                    <p className="text-sm whitespace-pre-wrap flex-1">{msg.content}</p>
                    {msg.role === 'assistant' && voiceEnabled && (
                      <button
                        onClick={() => speakText(msg.content)}
                        className="text-purple-600 hover:text-purple-800 flex-shrink-0"
                        title="Read aloud"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                  <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your learning..."
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="2"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <span className="text-xl">📤</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {voiceEnabled 
                ? '🎤 Voice enabled - AI will speak responses' 
                : 'Your personal AI that learns with you'}
            </p>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-40 flex items-center justify-center"
      >
        {isOpen ? (
          <span className="text-2xl">×</span>
        ) : (
          <span className="text-3xl animate-bounce">🤖</span>
        )}
      </button>
    </>
  );
}
