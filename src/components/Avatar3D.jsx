// Avatar3D.jsx
// Placeholder for a 3D/animated AI interviewer avatar with lip sync and facial expressions
// Replace with a real avatar integration (Ready Player Me, DeepBrain, etc.)
import React, { useEffect, useRef } from 'react';

const Avatar3D = ({ textToSpeak, expression = 'neutral', feedbackText = '' }) => {
  const avatarRef = useRef(null);

  // Simple text-to-speech for demo (replace with advanced TTS and lip sync)
  useEffect(() => {
    if (textToSpeak && 'speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  }, [textToSpeak]);

  // Emoji face based on expression
  const expressionEmoji = {
    happy: '😃',
    neutral: '🧑‍💼',
    thinking: '🤔',
    encouraging: '👍',
    surprised: '😮',
    sad: '😐',
    excited: '🥳',
    disappointed: '😕',
    // fallback
    default: '🧑‍💼'
  };
  const face = expressionEmoji[expression] || expressionEmoji['default'];

  return (
    <div ref={avatarRef} className="w-56 h-56 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 shadow-lg flex flex-col items-center justify-center relative overflow-hidden animate-pulse">
      <span className="text-7xl">{face}</span>
      <span className="mt-4 text-lg font-semibold text-white drop-shadow-lg">AI Interviewer</span>
      <span className="mt-1 text-xs text-white/80">(Lip sync & expressions soon)</span>
      {feedbackText && (
        <div className="absolute bottom-2 left-0 w-full text-center px-2">
          <span className="inline-block bg-black/60 text-white text-xs rounded-lg px-2 py-1 mt-2 shadow-lg animate-fade-in">{feedbackText}</span>
        </div>
      )}
    </div>
  );
};

export default Avatar3D;
