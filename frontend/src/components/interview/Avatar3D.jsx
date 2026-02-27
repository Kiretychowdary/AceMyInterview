// Avatar3D.jsx
// Real-time AI Avatar with SadTalker Lip Sync Integration
// Displays talking head with synchronized lip movements and expressions
// Enhanced UI inspired by SadTalker.org

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Loader, Video, Volume2, AlertCircle, Sparkles } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Avatar3D = ({ 
  textToSpeak, 
  expression = 'neutral', 
  feedbackText = '',
  avatarConfig = null,
  enableSadTalker = false,
  disableAudio = false // NEW: Allow parent to disable audio if handling speech itself
}) => {
  const videoRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useFallback, setUseFallback] = useState(!enableSadTalker); // Use SadTalker if enabled
  const [sadTalkerAvailable, setSadTalkerAvailable] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const previousTextRef = useRef('');

  // Check if SadTalker service is available on mount
  useEffect(() => {
    const checkSadTalkerService = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/avatar/health`, {
          timeout: 3000
        });
        if (response.data.success) {
          setSadTalkerAvailable(true);
          console.log('✅ SadTalker service available - you can enable it in settings');
        }
      } catch (err) {
        console.log('ℹ️ SadTalker service not available, using emoji avatar');
        setSadTalkerAvailable(false);
      }
    };
    
    checkSadTalkerService();
  }, []);

  // Generate avatar video when text changes (only if not using fallback)
  useEffect(() => {
    if (!textToSpeak || useFallback || !sadTalkerAvailable) return;
    if (textToSpeak === previousTextRef.current) return;
    
    previousTextRef.current = textToSpeak;
    generateAvatarVideo(textToSpeak);
  }, [textToSpeak, useFallback, sadTalkerAvailable]);

  // Play audio through text-to-speech
  useEffect(() => {
    // Skip if audio is disabled (parent component handles speech)
    if (disableAudio) return;
    
    if (textToSpeak && 'speechSynthesis' in window) {
      // CRITICAL: Cancel any ongoing speech to prevent overlapping voices
      window.speechSynthesis.cancel();
      
      const utterance = new window.SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      // Small delay to ensure previous speech is cancelled
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    }
  }, [textToSpeak, disableAudio]);

  const generateAvatarVideo = async (text) => {
    try {
      setIsGenerating(true);
      setError(null);
      setGenerationProgress(10);

      console.log('🎬 Generating avatar video for:', text.substring(0, 50) + '...');

      setGenerationProgress(30);

      const response = await axios.post(
        `${API_BASE_URL}/api/avatar/quick-generate`,
        { 
          text,
          avatarImage: avatarConfig?.url || null,
          options: {
            preprocess: 'crop',
            stillMode: false,
            useEnhancer: avatarConfig?.settings?.enableEnhancer || false,
            returnBase64: true
          }
        },
        {
          timeout: 90000, // 90 seconds
          headers: {
            'Content-Type': 'application/json'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total) + 30;
            setGenerationProgress(progress);
          }
        }
      );

      setGenerationProgress(90);

      if (response.data.success && response.data.data.video) {
        setVideoSrc(response.data.data.video);
        setGenerationProgress(100);
        console.log('✅ Avatar video generated successfully');
        
        // Auto-play the video
        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.play().catch(e => {
            console.warn('Auto-play prevented:', e);
          });
        }
      } else {
        throw new Error('Failed to generate avatar video');
      }

    } catch (err) {
      console.error('❌ Error generating avatar:', err.message);
      setError(err.message);
      // Fall back to emoji avatar
      setUseFallback(true);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Loop video for continuous display
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(e => console.warn('Replay prevented:', e));
    }
  };

  // Emoji face based on expression (fallback mode)
  const expressionEmoji = {
    happy: '😃',
    neutral: '🧑‍💼',
    thinking: '🤔',
    encouraging: '👍',
    surprised: '😮',
    sad: '😐',
    excited: '🥳',
    disappointed: '😕',
    default: '🧑‍💼'
  };
  const face = expressionEmoji[expression] || expressionEmoji['default'];

  // Real avatar with SadTalker (only if explicitly enabled and no errors)
  if (!useFallback && sadTalkerAvailable && !error) {
    return (
      <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl bg-gray-900">
        {videoSrc ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              src={videoSrc}
              onEnded={handleVideoEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              muted={false}
              playsInline
              autoPlay
            />

            {/* Playing indicator */}
            {isPlaying && (
              <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <Volume2 className="w-3 h-3" />
                Speaking
              </div>
            )}

            {/* SadTalker badge */}
            <div className="absolute top-4 right-4 bg-purple-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3 h-3" />
              SadTalker AI
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
            <div className="text-center text-white">
              <div className="w-16 h-16 mx-auto mb-3 relative">
                <div className="absolute inset-0 border-4 border-white/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-white rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-semibold">Initializing Avatar...</p>
            </div>
          </div>
        )}

        {/* Generation overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center text-white px-6">
              <Loader className="w-12 h-12 mx-auto mb-3 animate-spin" />
              <p className="text-sm font-semibold mb-2">Generating Video...</p>
              <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-xs text-white/70 mt-2">{generationProgress}%</p>
            </div>
          </div>
        )}

        {/* Feedback text overlay */}
        {feedbackText && !isGenerating && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm text-white text-xs p-4 text-center">
            {feedbackText}
          </div>
        )}

        {/* Switch to fallback button (dev mode/error) */}
        {(import.meta.env.DEV || error) && (
          <button
            onClick={() => setUseFallback(true)}
            className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors"
            title="Switch to fallback avatar"
          >
            Fallback Mode
          </button>
        )}
      </div>
    );
  }

  // Fallback emoji avatar (default, always shows)
  return (
    <div className="relative w-64 h-64 rounded-3xl bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
      
      <div className="relative z-10 text-center">
        <span className="text-8xl animate-bounce inline-block">{face}</span>
        <span className="mt-4 block text-xl font-bold text-white drop-shadow-lg">AI Interviewer</span>
        
        <span className="mt-2 block text-sm text-white/90 font-medium">
          {isPlaying ? (
            <span className="flex items-center justify-center gap-2">
              <Volume2 className="w-4 h-4 animate-pulse" />
              Speaking...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Ready to speak
            </span>
          )}
        </span>
      </div>
      
      {feedbackText && (
        <div className="absolute bottom-4 left-4 right-4 text-center z-20">
          <span className="inline-block bg-black/70 backdrop-blur-sm text-white text-xs rounded-xl px-4 py-2 shadow-xl max-w-full overflow-hidden text-ellipsis">
            {feedbackText}
          </span>
        </div>
      )}

      {/* Show SadTalker status */}
      {sadTalkerAvailable && (
        <button
          onClick={() => setUseFallback(false)}
          className="absolute top-4 right-4 bg-green-500/90 hover:bg-green-600/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-lg transition-colors flex items-center gap-1.5 z-20"
          title="SadTalker service is available - click to enable"
        >
          <Video className="w-3 h-3" />
          Enable Video Avatar
        </button>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute bottom-4 left-4 bg-red-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg z-20">
          <AlertCircle className="w-3 h-3" />
          {error.substring(0, 30)}...
        </div>
      )}
      
      {isGenerating && (
        <div className="absolute top-4 left-4 bg-blue-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg z-20">
          <Loader className="w-3 h-3 animate-spin" />
          Generating...
        </div>
      )}
    </div>
  );
};

export default Avatar3D;
