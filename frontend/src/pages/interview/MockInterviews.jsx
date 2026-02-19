import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import RoundRoadmapModal from '../../components/interview/RoundRoadmapModal';
import ChooseYourPath from '../../components/interview/ChooseYourPath';
import { getRoundsForTrack, rounds } from '../../config/roundsConfig';
import { tracksConfig } from '../../config/tracksConfig';
import { practiceDomains } from '../../config/practiceConfig';
import { programmingLanguages, frameworksAndTools } from '../../config/techSectionsConfig';

const MockInterviews = () => {
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showSubTopics, setShowSubTopics] = useState(false);
  const [selectedMock, setSelectedMock] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null); // NEW: chosen subtopic before mode
  const [selectedCategory, setSelectedCategory] = useState(null); // 'tech' | 'nonTech' | null
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [selectedTrackKey, setSelectedTrackKey] = useState(null);
  const [showLanguageTopics, setShowLanguageTopics] = useState(false);
  const [selectedLanguageDomain, setSelectedLanguageDomain] = useState(null);
  const [selectedTechSection, setSelectedTechSection] = useState(null); // 'languages' | 'domains' | 'frameworks'
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
    <div className="min-h-screen bg-white text-black font-sans relative overflow-hidden p-4 md:p-8">
      {/* Decorative corner accents for full page (responsive) */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-16 w-44 h-44 rounded-full bg-gradient-to-br from-blue-100 to-transparent opacity-60 blur-2xl transform -rotate-12 sm:-left-32 sm:-top-24 sm:w-72 sm:h-72 sm:opacity-50"></div>
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-12 w-52 h-52 rounded-full bg-gradient-to-tr from-blue-100 to-transparent opacity-55 blur-2xl transform rotate-12 sm:-right-40 sm:-bottom-24 sm:w-96 sm:h-96 sm:opacity-45"></div>
      <div className="max-w-7xl mx-auto relative z-10">
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

            {/* Section Selector - Only for Tech Tracks */}
            {selectedCategory === 'tech' && !selectedTechSection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mb-8"
              >
                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Choose Your Practice Path
                  </h3>
                  <p className="text-gray-600">
                    Select a section to start practicing
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                  {/* Programming Languages Section */}
                  <motion.div
                    className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200 hover:border-yellow-400 cursor-pointer transition-all hover:shadow-xl"
                    onClick={() => setSelectedTechSection('languages')}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Programming Languages</h4>
                    <p className="text-gray-600 text-sm mb-4">Practice individual languages like Python, Java, JavaScript & more</p>
                    <div className="text-blue-600 font-semibold text-sm flex items-center gap-2">
                      {programmingLanguages.length} Languages
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </motion.div>

                  {/* Domains Section */}
                  <motion.div
                    className="group bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all hover:shadow-xl"
                    onClick={() => setSelectedTechSection('domains')}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💻</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Domain Practice</h4>
                    <p className="text-gray-600 text-sm mb-4">Explore domains like Software Engineering, Data Science, Cybersecurity</p>
                    <div className="text-purple-600 font-semibold text-sm flex items-center gap-2">
                      {practiceDomains.length} Domains
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </motion.div>

                  {/* Frameworks & Tools Section */}
                  <motion.div
                    className="group bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 border-2 border-green-200 hover:border-green-400 cursor-pointer transition-all hover:shadow-xl"
                    onClick={() => setSelectedTechSection('frameworks')}
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🛠️</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-2">Frameworks & Tools</h4>
                    <p className="text-gray-600 text-sm mb-4">Master React, Docker, AWS, MongoDB & popular technologies</p>
                    <div className="text-green-600 font-semibold text-sm flex items-center gap-2">
                      {frameworksAndTools.length} Technologies
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Programming Languages Grid */}
            {selectedCategory === 'tech' && selectedTechSection === 'languages' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="inline-block px-4 py-2 bg-yellow-500/10 rounded-lg mb-3">
                      <span className="text-yellow-700 text-sm font-semibold">⚡ Programming Languages</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Practice by Programming Language
                    </h3>
                    <p className="text-gray-600">
                      Choose a language to practice coding problems and interview questions
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setSelectedTechSection(null)}
                    className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Back to Sections
                  </motion.button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {programmingLanguages.map((lang, index) => (
                    <motion.div
                      key={lang.id}
                      className="group bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -5 }}
                      onClick={() => {
                        navigate('/practice-session', {
                          state: {
                            type: 'language',
                            language: lang.name,
                            languageId: lang.id,
                            topics: lang.topics,
                            difficulty: lang.difficulty
                          }
                        });
                      }}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${lang.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                        {lang.icon}
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">
                        {lang.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">{lang.description}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {lang.topics.slice(0, 3).map((topic) => (
                          <span key={topic} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            {topic}
                          </span>
                        ))}
                        {lang.topics.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            +{lang.topics.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">{lang.difficulty}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Domain Practice Grid */}
            {selectedCategory === 'tech' && selectedTechSection === 'domains' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="inline-block px-4 py-2 bg-blue-500/10 rounded-lg mb-3">
                      <span className="text-blue-700 text-sm font-semibold">💻 Domain Practice</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Practice by Domain
                    </h3>
                    <p className="text-gray-600">
                      Choose a domain to practice specific topics and multiple languages
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setSelectedTechSection(null)}
                    className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Back to Sections
                  </motion.button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {practiceDomains.map((domain, index) => (
                    <motion.div
                      key={domain.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-blue-100/60 hover:border-blue-300 flex flex-col"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.08, duration: 0.4 }}
                      whileHover={{ y: -8 }}
                    >
                      {/* Image Section */}
                      <div className="h-48 overflow-hidden relative bg-gradient-to-br from-blue-100 to-purple-100">
                        {(() => {
                          const isUnsplash = domain.image && domain.image.includes('images.unsplash.com');
                          const base = domain.image ? domain.image.split('?')[0] : '';
                          const src400 = isUnsplash ? `${base}?auto=format&fit=crop&w=400&q=60` : domain.image;
                          const src800 = isUnsplash ? `${base}?auto=format&fit=crop&w=800&q=70` : domain.image;
                          const src1200 = isUnsplash ? `${base}?auto=format&fit=crop&w=1200&q=75` : domain.image;
                          return (
                            <img
                              src={src800}
                              srcSet={isUnsplash ? `${src400} 400w, ${src800} 800w, ${src1200} 1200w` : undefined}
                              sizes="(min-width:1280px) 30vw, (min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                              loading="lazy"
                              decoding="async"
                              alt={domain.title + ' cover image'}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 select-none"
                              draggable={false}
                            />
                          );
                        })()}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/30 via-black/0 to-black/10" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-blue-700 shadow-md">
                            {domain.topics.length} Topics
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">
                          {domain.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 flex-1 leading-relaxed">
                          {domain.description}
                        </p>
                        
                        {/* Topic Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {domain.topics.slice(0,3).map(s => (
                            <span key={s} className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 font-semibold group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                              {s}
                            </span>
                          ))}
                          {domain.topics.length > 3 && (
                            <span className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-semibold">
                              +{domain.topics.length - 3} more
                            </span>
                          )}
                        </div>

                        {/* Languages Section */}
                        <div className="mb-5">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                            Languages
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {domain.languages.map((lang, idx) => (
                              <span 
                                key={idx}
                                className="px-2.5 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-md text-xs font-medium border border-purple-200 hover:shadow-md transition-shadow"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* CTA Button */}
                        <motion.button
                          className={`w-full mt-auto bg-gradient-to-r ${domain.gradient} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                          onClick={() => {
                            setSelectedLanguageDomain(domain);
                            setShowLanguageTopics(true);
                          }}
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

            {/* Frameworks & Tools Grid */}
            {selectedCategory === 'tech' && selectedTechSection === 'frameworks' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="inline-block px-4 py-2 bg-green-500/10 rounded-lg mb-3">
                      <span className="text-green-700 text-sm font-semibold">🛠️ Frameworks & Tools</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Master Modern Technologies
                    </h3>
                    <p className="text-gray-600">
                      Practice frameworks, tools, and technologies used in production
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setSelectedTechSection(null)}
                    className="px-4 py-2 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Back to Sections
                  </motion.button>
                </div>

                {/* Group by category */}
                {['Frontend', 'Backend', 'DevOps', 'Cloud', 'Database', 'Tools'].map((category) => {
                  const items = frameworksAndTools.filter(item => item.category === category);
                  if (items.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-8">
                      <h4 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        {category}
                      </h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {items.map((tool, index) => (
                          <motion.div
                            key={tool.id}
                            className="group bg-white rounded-xl p-5 border-2 border-gray-100 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                            onClick={() => {
                              navigate('/practice-session', {
                                state: {
                                  type: 'framework',
                                  technology: tool.name,
                                  technologyId: tool.id,
                                  topics: tool.topics,
                                  category: tool.category
                                }
                              });
                            }}
                          >
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                              {tool.icon}
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-green-700 transition-colors">
                              {tool.name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {tool.topics.slice(0, 3).map((topic) => (
                                <span key={topic} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                                  {topic}
                                </span>
                              ))}
                              {tool.topics.length > 3 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                                  +{tool.topics.length - 3}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Track Cards Grid - Interview Tracks */}
            {selectedCategory && !selectedTechSection && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-6">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg mb-3">
                    <span className="text-blue-700 text-sm font-semibold">🎯 Interview Tracks</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Domain-Specific Interview Preparation
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Choose a specialization for structured mock interviews
                  </p>
                </div>
                
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

        {/* Language Topics Modal */}
        <AnimatePresence>
          {showLanguageTopics && selectedLanguageDomain && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguageTopics(false)}
            >
              <motion.div
                className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowLanguageTopics(false)}
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedLanguageDomain.gradient} flex items-center justify-center text-white text-3xl shadow-lg`}>
                    {selectedLanguageDomain.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-800">
                      {selectedLanguageDomain.title}
                    </h2>
                    <p className="text-gray-600">{selectedLanguageDomain.description}</p>
                  </div>
                </div>

                {/* Topic Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      Choose a Topic to Begin
                    </h3>
                    <span className="text-sm text-gray-500">
                      {selectedLanguageDomain.topics.length} topics available
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLanguageDomain.topics.map((topic, index) => (
                      <motion.button
                        key={topic}
                        onClick={() => {
                          navigate('/practice-session', {
                            state: {
                              domain: selectedLanguageDomain.id,
                              domainTitle: selectedLanguageDomain.title,
                              topic: topic,
                              languages: selectedLanguageDomain.languages,
                              difficulty: 'medium'
                            }
                          });
                        }}
                        className="group p-5 rounded-xl bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 hover:border-blue-400 hover:shadow-lg transition-all text-left"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        whileHover={{ scale: 1.02, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-bold text-blue-700 group-hover:text-blue-800 transition-colors text-base">
                            {topic}
                          </div>
                          <svg className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </div>
                        <div className="text-xs text-gray-600 leading-relaxed">
                          Practice {topic.toLowerCase()} concepts and problems
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Languages Section */}
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Available Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedLanguageDomain.languages.map((lang, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

export default MockInterviews;