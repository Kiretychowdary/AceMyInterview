import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RoundRoadmapModal from '../components/RoundRoadmapModal';
import { getRoundsForTrack, rounds } from '../config/roundsConfig';
import { tracksConfig } from '../config/tracksConfig';

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
      route: '/interview-room'
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
      case 'Person-to-Person': return '/interview-room';
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
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {!selectedCategory && (
          <motion.div
            className="flex flex-col items-center justify-center min-h-[60vh] space-y-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
                Choose Your Path
              </h1>
              <p className="text-gray-600 text-lg">
                Start with a broad category. You can explore interview modes and deep-dive topics after selecting a track.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <motion.button
                className="group relative bg-white rounded-2xl p-10 shadow-lg border border-blue-100 hover:shadow-xl transition-all text-left"
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory('tech')}
              >
                <div className="absolute inset-0 rounded-2xl pointer-events-none" />
                <h2 className="text-2xl font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <span className="text-3xl">💻</span> Tech Tracks
                </h2>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Software engineering, cybersecurity, data science — build technical excellence with structured preparation.
                </p>
                <div className="flex flex-wrap gap-2">
                  {tracks.tech.slice(0,3).map(t => (
                    <span key={t.key} className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
                      {t.title}
                    </span>
                  ))}
                </div>
                <div className="mt-6">
                  <span className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold group-hover:bg-blue-700 transition-colors">Explore Tech →</span>
                </div>
              </motion.button>

              <motion.button
                className="group relative bg-white rounded-2xl p-10 shadow-lg border border-blue-100 hover:shadow-xl transition-all text-left"
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory('nonTech')}
              >
                <h2 className="text-2xl font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <span className="text-3xl">🧠</span> Non-Tech Tracks
                </h2>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Product, design, leadership & communication — prepare for strategic and people-focused roles.
                </p>
                <div className="flex flex-wrap gap-2">
                  {tracks.nonTech.slice(0,3).map(t => (
                    <span key={t.key} className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
                      {t.title}
                    </span>
                  ))}
                </div>
                <div className="mt-6">
                  <span className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold group-hover:bg-blue-700 transition-colors">Explore Non-Tech →</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
            className="space-y-10"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold text-blue-700 mb-1">
                  {selectedCategory === 'tech' ? 'Tech Tracks' : 'Non-Tech Tracks'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {selectedCategory === 'tech' ? 'Choose a specialization to begin structured interview preparation.' : 'Select a non-technical domain to start focused practice.'}
                </p>
              </div>
              <button
                onClick={() => { setSelectedCategory(null); setSelectedMock(null); }}
                className="px-4 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 font-medium hover:bg-blue-50 transition-colors"
              >
                ← Back to Categories
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tracks[selectedCategory].map((track, index) => (
                <motion.div
                  key={track.key}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-blue-100/60 flex flex-col"
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="h-44 md:h-48 lg:h-52 overflow-hidden relative bg-blue-100">
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
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 select-none"
                          draggable={false}
                        />
                      );
                    })()}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 via-black/0 to-black/10" />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{track.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">{track.desc}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {track.subTopics.slice(0,3).map(s => (
                        <span key={s.name} className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">
                          {s.name}
                        </span>
                      ))}
                    </div>
                    <motion.button
                      className="w-full mt-auto bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      onClick={() => { handleStartPractice(track); }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      Start Practice
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowModeSelection(false)}
            >
              <motion.div
                className="bg-white/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl border border-white/20"
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-blue-700">Choose Interview Mode</h3>
                  <button
                    onClick={() => setShowModeSelection(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-150 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-6 p-4 rounded-xl border border-blue-100 bg-blue-50/60">
                  <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">Selected Topic</div>
                  <div className="font-semibold text-blue-700">{selectedMock.title} / {selectedSubTopic.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{selectedSubTopic.desc}</div>
                </div>

                <p className="text-gray-600 text-sm mb-4">How would you like to practice?</p>

                <div className="space-y-4">
                  {getModesForSubTopic(selectedSubTopic.name).map((mode, index) => (
                    <motion.button
                      key={mode.name}
                      className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-all duration-150 border border-blue-100 flex items-center space-x-4"
                      onClick={() => handleModeSelect(mode)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="text-3xl">{mode.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-blue-700">{mode.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{mode.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sub Topics Modal - Only for Interview Person to Person */}
        <AnimatePresence>
          {showSubTopics && selectedMock && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setShowSubTopics(false)}
            >
              <motion.div
                className={`bg-white/95 backdrop-blur-md rounded-2xl p-8 w-full mx-4 shadow-2xl border border-white/20 ${selectedMock.subTopics.length > 6 ? 'max-w-4xl' : 'max-w-md'}`}
                initial={{ scale: 0.95, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-blue-700">
                    {selectedMock.title}
                  </h3>
                  <button
                    onClick={() => setShowSubTopics(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold transition-colors duration-150 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-6">{selectedMock.desc}</p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800 mb-3">Choose a topic:</h4>
                  <div className={`grid gap-4 ${selectedMock.subTopics.length > 10 ? 'md:grid-cols-3' : 'md:grid-cols-2'} max-h-[60vh] overflow-y-auto pr-1 custom-scroll`}>
                    {selectedMock.subTopics.map((topic, index) => (
                      <motion.button
                        key={index}
                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-left transition-all duration-150 border border-blue-100"
                        onClick={() => {
                          handleSubTopicSelect(topic);
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.18 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="font-semibold text-blue-700 truncate" title={topic.name}>{topic.name}</div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2" title={topic.desc}>{topic.desc}</div>
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