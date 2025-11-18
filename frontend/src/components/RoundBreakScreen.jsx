import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RoundBreakScreen = ({ 
  currentRound, 
  nextRound, 
  currentRoundIndex, 
  totalRounds,
  onContinue,
  trackKey
}) => {
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds
  const [isSkipped, setIsSkipped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft > 0 && !isSkipped) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSkipped) {
      // Auto-continue when timer reaches 0
      handleContinue();
    }
  }, [timeLeft, isSkipped]);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    }
  };

  const handleSkipBreak = () => {
    setIsSkipped(true);
    handleContinue();
  };

  const handleEndInterview = () => {
    navigate('/interview-preparation');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentRoundIndex + 1) / totalRounds) * 100;

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-200"
      >
        {/* Progress Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
            <span className="text-2xl">✅</span>
            <span className="font-semibold text-blue-800">Round {currentRoundIndex + 1} Completed!</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Great Progress!</h1>
          <p className="text-gray-600">You've completed <strong>{currentRound?.label}</strong></p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span className="font-semibold">{currentRoundIndex + 1} of {totalRounds} rounds</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-blue-600"
            />
          </div>
        </div>

        {/* Break Timer */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-4">☕</div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">Take a Short Break</h2>
            <p className="text-gray-700 mb-4">Relax for a moment before the next round</p>
            
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-lg border-2 border-blue-300 mb-4">
              <span className="text-3xl">⏱️</span>
              <div className="text-left">
                <div className="text-sm text-gray-600">Time Remaining</div>
                <div className="text-3xl font-bold text-blue-600">{formatTime(timeLeft)}</div>
              </div>
            </div>

            <p className="text-sm text-gray-500">Next round will start automatically</p>
          </div>
        </div>

        {/* Next Round Preview */}
        {nextRound && (
          <div className="bg-blue-600 rounded-xl p-6 text-white mb-6 border-2 border-blue-600">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎯</div>
              <div className="flex-1">
                <div className="text-sm opacity-90 mb-1">Coming Up Next</div>
                <h3 className="text-xl font-bold mb-2">Round {currentRoundIndex + 2}: {nextRound.label}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    {nextRound.mode === 'MCQ' && '📝 Multiple Choice Questions'}
                    {(nextRound.mode === 'CODING' || nextRound.mode === 'Coding Compiler') && '💻 Live Coding Challenge'}
                    {(nextRound.mode === 'PERSON' || nextRound.mode === 'Person-to-Person') && '👥 Face-to-Face Interview'}
                  </span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    Stage {nextRound.stage}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleEndInterview}
            className="flex-1 px-6 py-3 rounded-xl bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold transition-all hover:bg-gray-50 shadow-sm hover:shadow-md"
          >
            End Interview
          </button>
          <button
            onClick={handleSkipBreak}
            className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md hover:shadow-lg border-2 border-blue-600 hover:border-blue-700"
          >
            Skip Break & Continue 🚀
          </button>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Quick Tips</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Stay hydrated and take deep breaths</li>
                <li>• Review your notes if needed</li>
                <li>• Get ready for the next challenge</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RoundBreakScreen;
