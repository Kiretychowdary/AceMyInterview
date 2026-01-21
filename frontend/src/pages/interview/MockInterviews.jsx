import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RoundRoadmapModal from '../../components/interview/RoundRoadmapModal';
import ChooseYourPath from '../../components/interview/ChooseYourPath';
import { getRoundsForTrack, rounds } from '../../config/roundsConfig';
import { tracksConfig } from '../../config/tracksConfig';

const MockInterviews = () => {
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showSubTopics, setShowSubTopics] = useState(false);
  const [selectedMock, setSelectedMock] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null); // NEW: chosen subtopic before mode
  const [selectedCategory, setSelectedCategory] = useState(null); // 'tech' | 'nonTech' | null
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [selectedTrackKey, setSelectedTrackKey] = useState(null);
  const navigate = useNavigate();

  // Interview modes
  const interviewModes = [
    {
      name: 'MCQ',
      desc: 'Multiple Choice Questions',
      icon: '📝',
      route: '/mcq-interview'
    },
    {
      name: 'Coding Compiler',
      desc: 'Live Coding Practice',
      icon: '💻',
      route: '/compiler'
    },
    {
      name: 'Interview Person to Person',
      desc: 'AI Face-to-Face Interview',
      icon: '🎭',
      route: '/face-to-face-interview'
    },
    {
      name: 'AI HR Interview',
      desc: 'Realistic 3D AI Interview with Lip Sync',
      icon: '🤖',
      route: '/ai-face-interview',
      highlight: true
    }
  ];

  // use centralized tracks config
  const tracks = tracksConfig;

  const codingEligibleTopics = new Set([
    'DSA','System Design','OOP','Concurrency','Testing','Databases','APIs & REST','SQL','ML Models','Feature Engineering','Python/R','Python','Statistics'
  ]);

  const getModesForSubTopic = (topicName) => {
    if (!topicName) return interviewModes.filter(m => m.name !== 'Coding Compiler');
    const includeCoding = codingEligibleTopics.has(topicName);
    return interviewModes.filter(m => includeCoding ? true : m.name !== 'Coding Compiler');
  };

  // Start Practice now opens subtopics first
  const handleStartPractice = (track) => {
    setSelectedMock(track);
    setSelectedSubTopic(null);
    setShowSubTopics(true);
    setShowModeSelection(false);
    setSelectedTrackKey(track.key);
  };

  const handleSubTopicSelect = (topic) => {
    setSelectedSubTopic(topic);
    setShowSubTopics(false);
    // Show roadmap instead of mode selection
    setShowModeSelection(false);
    setShowRoadmap(true);
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setShowModeSelection(false);
    // Navigate with full context
    const state = {
      jobRole: selectedMock?.title,
      subject: selectedSubTopic?.name,
      subTopicDescription: selectedSubTopic?.desc,
      mode: mode.name
    };
    navigate(mode.route, { state });
  };

  // Map round selection to route
  const routeForMode = (mode) => {
    switch(mode){
      case 'MCQ': return '/mcq-interview';
      case 'Coding Compiler': return '/compiler';
      case 'Person-to-Person': return '/face-to-face-interview';
      default: return null; // unimplemented
    }
  };

  const handleRoundSelect = (round) => {
    const route = routeForMode(round.mode);
    if(!route){
      return; // future placeholder
    }
    setShowRoadmap(false);
    const state = {
      jobRole: selectedMock?.title,
      subject: selectedSubTopic?.name,
      subTopicDescription: selectedSubTopic?.desc,
      roundId: round.id,
      mode: round.mode
    };
    navigate(route, { state });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 md:p-8 relative overflow-hidden">
      {/* Decorative corner accents */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 w-56 h-56 rounded-full bg-gradient-to-br from-blue-200 to-transparent opacity-70 blur-3xl transform -rotate-12 sm:-left-32 sm:-top-24 sm:w-80 sm:h-80 sm:opacity-60"></div>
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-transparent opacity-60 blur-3xl transform rotate-12 sm:-right-40 sm:-bottom-24 sm:w-96 sm:h-96 sm:opacity-50"></div>
      <div className="max-w-7xl mx-auto">
        {!selectedCategory && (
          <ChooseYourPath onSelectTrack={(trackType) => setSelectedCategory(trackType)} />
        )}

        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Header with Back Button */}
            <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-3">
                    {selectedCategory === 'tech' ? '💻 Technical' : '🧠 Strategic'}
                  </span>
                  <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 mb-2">
                    {selectedCategory === 'tech' ? 'Tech Tracks' : 'Non-Tech Tracks'}
                  </h2>
                  <p className="text-gray-600 text-base">
                    {selectedCategory === 'tech' ? 'Choose a specialization to begin structured interview preparation.' : 'Select a non-technical domain to start focused practice.'}
                  </p>
                </motion.div>
              </div>
              <motion.button
                onClick={() => { setSelectedCategory(null); setSelectedMock(null); }}
                className="px-5 py-2.5 rounded-xl bg-white border-2 border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                ← Back
              </motion.button>
            </div>

            {/* Track Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks[selectedCategory].map((track, index) => (
                <motion.div
                  key={track.key}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-blue-100/60 hover:border-blue-300 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  whileHover={{ y: -8 }}
                >
                  {/* Image Section */}
                  <div className="h-48 overflow-hidden relative bg-gradient-to-br from-blue-100 to-purple-100">
                    {(() => {
                      const isUnsplash = track.img.includes('images.unsplash.com');
                      const base = track.img.split('?')[0];
                      const src400 = isUnsplash ? `${base}?auto=format&fit=crop&w=400&q=60` : track.img;
                      const src800 = isUnsplash ? `${base}?auto=format&fit=crop&w=800&q=70` : track.img;
                      const src1200 = isUnsplash ? `${base}?auto=format&fit=crop&w=1200&q=75` : track.img;
                      return (
                        <img
                          src={src800}
                          srcSet={isUnsplash ? `${src400} 400w, ${src800} 800w, ${src1200} 1200w` : undefined}
                          sizes="(min-width:1280px) 30vw, (min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                          loading="lazy"
                          decoding="async"
                          alt={track.title + ' cover image'}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 select-none"
                          draggable={false}
                        />
                      );
                    })()}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-black/0 to-black/10" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-blue-700 shadow-md">
                        {track.subTopics.length} Topics
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1 leading-relaxed">
                      {track.desc}
                    </p>
                    
                    {/* Topic Tags */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {track.subTopics.slice(0,3).map(s => (
                        <span key={s.name} className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 font-semibold group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                          {s.name}
                        </span>
                      ))}
                      {track.subTopics.length > 3 && (
                        <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-semibold">
                          +{track.subTopics.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {/* CTA Button */}
                    <motion.button
                      className="w-full mt-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                      onClick={() => { handleStartPractice(track); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Start Practice
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div> {/* close max-w container before modals */}

        {/* Mode Selection Modal */}
        <AnimatePresence>
          {showModeSelection && selectedMock && selectedSubTopic && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowModeSelection(false)}
            >
              <motion.div
                className="bg-white rounded-3xl p-8 w-full max-w-2xl mx-4 shadow-2xl border-2 border-blue-200"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700 mb-2">
                      Choose Interview Mode
                    </h3>
                    <p className="text-gray-600 text-sm">Select how you'd like to practice</p>
                  </div>
                  <button
                    onClick={() => setShowModeSelection(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Selected Topic Info */}
                <div className="mb-6 p-5 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {selectedCategory === 'tech' ? '💻' : '🧠'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs uppercase tracking-wide text-blue-600 font-bold mb-1">Selected Topic</div>
                      <div className="font-bold text-blue-700 text-lg truncate">{selectedMock.title} / {selectedSubTopic.name}</div>
                      <div className="text-sm text-gray-600 mt-1 line-clamp-2">{selectedSubTopic.desc}</div>
                    </div>
                  </div>
                </div>

                {/* Mode Options */}
                <div className="space-y-4">
                  {getModesForSubTopic(selectedSubTopic.name).map((mode, index) => (
                    <motion.button
                      key={mode.name}
                      className="group w-full p-5 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-2xl text-left transition-all duration-200 border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg flex items-center space-x-4"
                      onClick={() => handleModeSelect(mode)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.3 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-md">
                        {mode.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-blue-700 text-lg group-hover:text-blue-800 transition-colors">{mode.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{mode.desc}</div>
                      </div>
                      <svg className="w-6 h-6 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sub Topics Modal */}
        <AnimatePresence>
          {showSubTopics && selectedMock && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowSubTopics(false)}
            >
              <motion.div
                className={`bg-white rounded-3xl p-8 w-full mx-4 shadow-2xl border-2 border-blue-200 ${selectedMock.subTopics.length > 6 ? 'max-w-5xl' : 'max-w-2xl'}`}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-2xl">
                        {selectedCategory === 'tech' ? '💻' : '🧠'}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                          {selectedMock.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">{selectedMock.desc}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSubTopics(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Topics Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      Choose a Topic to Begin
                    </h4>
                    <span className="text-sm text-gray-500 font-medium">
                      {selectedMock.subTopics.length} topics available
                    </span>
                  </div>
                  
                  <div className={`grid gap-4 ${selectedMock.subTopics.length > 10 ? 'md:grid-cols-3' : selectedMock.subTopics.length > 6 ? 'md:grid-cols-2' : 'md:grid-cols-2'} max-h-[55vh] overflow-y-auto pr-2`}>
                    {selectedMock.subTopics.map((topic, index) => (
                      <motion.button
                        key={index}
                        className="group p-5 bg-gradient-to-br from-blue-50 to-white hover:from-blue-100 hover:to-blue-50 rounded-2xl text-left transition-all duration-200 border-2 border-blue-100 hover:border-blue-300 hover:shadow-lg"
                        onClick={() => {
                          handleSubTopicSelect(topic);
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.2 }}
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-bold text-blue-700 group-hover:text-blue-800 transition-colors text-base" title={topic.name}>
                            {topic.name}
                          </div>
                          <svg className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                        <div className="text-xs text-gray-600 leading-relaxed line-clamp-2" title={topic.desc}>
                          {topic.desc}
                        </div>
                      </motion.button>
                    ))}
                  </div>
      </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <RoundRoadmapModal
          open={showRoadmap && !!selectedTrackKey}
          onClose={() => setShowRoadmap(false)}
          trackKey={selectedTrackKey}
          onSelectRound={handleRoundSelect}
        />
    </div>
  );
};

export default MockInterviews;