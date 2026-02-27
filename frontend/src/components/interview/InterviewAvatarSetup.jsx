// InterviewAvatarSetup.jsx
// Setup wizard for configuring avatar before starting face-to-face interview
// Inspired by SadTalker.org's workflow: Image → Audio → Generate

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  User, Video, Settings, ArrowRight, Check, 
  Sparkles, Clock, MessageSquare, Zap 
} from 'lucide-react';
import AvatarSelector from './AvatarSelector';

const InterviewAvatarSetup = ({ 
  interviewConfig, 
  onComplete,
  onCancel 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [interviewSettings, setInterviewSettings] = useState({
    useSadTalker: false,
    avatarSpeed: 'normal',
    expressiveness: 'high',
    enableEnhancer: true
  });

  const steps = [
    {
      number: 1,
      title: 'Choose Avatar',
      description: 'Select or upload your AI interviewer',
      icon: User
    },
    {
      number: 2,
      title: 'Configure Settings',
      description: 'Customize your interview experience',
      icon: Settings
    },
    {
      number: 3,
      title: 'Ready to Start',
      description: 'Review and begin your interview',
      icon: Video
    }
  ];

  const handleAvatarSelect = (avatar) => {
    setSelectedAvatar(avatar);
    setShowAvatarSelector(false);
    
    // If custom avatar is selected, enable SadTalker
    if (avatar.isCustom) {
      setInterviewSettings(prev => ({ ...prev, useSadTalker: true }));
    }
    
    setCurrentStep(2);
  };

  const handleComplete = () => {
    if (!selectedAvatar) {
      toast.error('Please select an avatar first');
      return;
    }

    onComplete({
      avatar: selectedAvatar,
      settings: interviewSettings
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-blue-500" />
                Setup Your AI Interview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {interviewConfig.topic} • {interviewConfig.difficulty} • {interviewConfig.duration} min
              </p>
            </div>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center flex-1">
                <motion.div
                  initial={false}
                  animate={{
                    scale: currentStep === step.number ? 1.1 : 1,
                    backgroundColor: currentStep >= step.number ? '#3B82F6' : '#E5E7EB'
                  }}
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    ${currentStep >= step.number ? 'text-white' : 'text-gray-500'}
                    shadow-lg
                  `}
                >
                  {currentStep > step.number ? (
                    <Check className="w-8 h-8" />
                  ) : (
                    <step.icon className="w-8 h-8" />
                  )}
                </motion.div>
                <p className={`
                  mt-3 font-semibold text-sm
                  ${currentStep >= step.number ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}
                `}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center max-w-[120px]">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <motion.div
                    initial={false}
                    animate={{
                      width: currentStep > step.number ? '100%' : '0%'
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-blue-500"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Choose Your AI Interviewer
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Select a professional avatar or upload your own custom image for a personalized experience
              </p>

              {selectedAvatar ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 flex items-center gap-6">
                    {selectedAvatar.isDefault ? (
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-4xl">🧑‍💼</span>
                      </div>
                    ) : (
                      <img
                        src={selectedAvatar.url}
                        alt="Selected avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {selectedAvatar.name}
                        <Check className="w-5 h-5 text-green-500" />
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {selectedAvatar.description || 'Custom uploaded avatar'}
                      </p>
                      {selectedAvatar.isCustom && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                          <Sparkles className="w-4 h-4" />
                          <span>SadTalker will generate realistic talking videos</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAvatarSelector(true)}
                      className="px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      Change
                    </button>
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                  >
                    Continue to Settings
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAvatarSelector(true)}
                  className="w-full py-12 border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
                >
                  <User className="w-16 h-16 mx-auto text-gray-400 group-hover:text-blue-500 transition-colors mb-4" />
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    Click to Select Avatar
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Choose from presets or upload your own
                  </p>
                </button>
              )}
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Configure Interview Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Customize your AI interviewer's behavior and appearance
              </p>

              <div className="space-y-6">
                {/* SadTalker Toggle */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Enable SadTalker AI
                        </h3>
                        <span className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full font-semibold">
                          PREMIUM
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Generate realistic talking videos with perfect lip sync and natural expressions
                      </p>
                      <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Realistic facial movements
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Natural eye blinking and expressions
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Multi-language lip sync
                        </li>
                      </ul>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={interviewSettings.useSadTalker}
                        onChange={(e) => setInterviewSettings(prev => ({ 
                          ...prev, 
                          useSadTalker: e.target.checked 
                        }))}
                        className="sr-only peer"
                        disabled={!selectedAvatar?.isCustom}
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  {!selectedAvatar?.isCustom && (
                    <p className="mt-3 text-xs text-orange-600 dark:text-orange-400 flex items-center gap-2">
                      ⚠️ Upload a custom avatar to enable SadTalker features
                    </p>
                  )}
                </div>

                {/* Other Settings */}
                <div className="space-y-4">
                  {/* Avatar Speed */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <Zap className="w-4 h-4" />
                      Response Speed
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['fast', 'normal', 'slow'].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => setInterviewSettings(prev => ({ ...prev, avatarSpeed: speed }))}
                          className={`
                            px-4 py-2 rounded-lg font-medium capitalize transition-all
                            ${interviewSettings.avatarSpeed === speed
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }
                          `}
                        >
                          {speed}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expressiveness */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <MessageSquare className="w-4 h-4" />
                      Expressiveness
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setInterviewSettings(prev => ({ ...prev, expressiveness: level }))}
                          className={`
                            px-4 py-2 rounded-lg font-medium capitalize transition-all
                            ${interviewSettings.expressiveness === level
                              ? 'bg-purple-500 text-white shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }
                          `}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Video Enhancer */}
                  {interviewSettings.useSadTalker && (
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">Enable Video Enhancer</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Improves quality but takes longer</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={interviewSettings.enableEnhancer}
                          onChange={(e) => setInterviewSettings(prev => ({ 
                            ...prev, 
                            enableEnhancer: e.target.checked 
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Ready to Start Your Interview!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Review your settings and begin when ready
              </p>

              <div className="space-y-4 mb-8">
                {/* Interview Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Interview Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Topic</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{interviewConfig.topic}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {interviewConfig.duration} minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Difficulty</p>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">{interviewConfig.difficulty}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Questions</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{interviewConfig.numberOfQuestions || 3}</p>
                    </div>
                  </div>
                </div>

                {/* Avatar & Settings Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Your Configuration</h3>
                  <div className="flex items-center gap-4 mb-4">
                    {selectedAvatar?.isDefault ? (
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">🧑‍💼</span>
                      </div>
                    ) : (
                      <img
                        src={selectedAvatar?.url}
                        alt="Selected avatar"
                        className="w-16 h-16 rounded-full object-cover border-4 border-blue-500 flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedAvatar?.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {interviewSettings.useSadTalker ? 'With SadTalker AI' : 'Animated Avatar'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">Speed: <strong className="text-gray-900 dark:text-white capitalize">{interviewSettings.avatarSpeed}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3 h-3 text-purple-500" />
                      <span className="text-gray-600 dark:text-gray-400">Expression: <strong className="text-gray-900 dark:text-white capitalize">{interviewSettings.expressiveness}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all font-bold shadow-xl flex items-center justify-center gap-2 text-lg"
                >
                  <Video className="w-6 h-6" />
                  Start Interview
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Avatar Selector Modal */}
      <AnimatePresence>
        {showAvatarSelector && (
          <AvatarSelector
            onAvatarSelect={handleAvatarSelect}
            currentAvatar={selectedAvatar}
            onClose={() => setShowAvatarSelector(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewAvatarSetup;
