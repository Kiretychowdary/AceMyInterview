import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUND_MODES, getRoundsForTrack, isModeImplemented } from '../../config/roundsConfig';
import { tracksConfig, getTrackByKey } from '../../config/tracksConfig';

// Professional multi-step: Category (tech/non) -> Role selection -> Rounds list with START button
export default function InterviewPreparation() {
  const [category, setCategory] = React.useState(null); // 'tech' | 'nonTech'
  const [selectedRoleKey, setSelectedRoleKey] = React.useState(null);
  const [showStartConfirmation, setShowStartConfirmation] = React.useState(false);
  const navigate = useNavigate();

  const selectedTrack = selectedRoleKey ? getTrackByKey(selectedRoleKey) : null;
  const rounds = selectedRoleKey ? getRoundsForTrack(selectedRoleKey) : [];
  const implementedRounds = rounds.filter(r => isModeImplemented(r.mode));
  const totalRounds = rounds.length;
  const readyRounds = implementedRounds.length;

  const modeRoute = (mode) => {
    switch(mode){
      case ROUND_MODES.CODING: return '/compiler';
      case ROUND_MODES.PERSON: return '/face-to-face-interview';
      case ROUND_MODES.MCQ: return '/mcq-interview';
      default: return '/mcq-interview'; // temporary fallback
    }
  };

  // TrackCard subcomponent
  const TrackCard = ({ track, delay=0 }) => {
    const isUnsplash = track.img.includes('images.unsplash.com');
    const base = track.img.split('?')[0];
    const src400 = isUnsplash ? `${base}?auto=format&fit=crop&w=400&q=60` : track.img;
    const src800 = isUnsplash ? `${base}?auto=format&fit=crop&w=800&q=70` : track.img;
    const src1200 = isUnsplash ? `${base}?auto=format&fit=crop&w=1200&q=75` : track.img;
    return (
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setSelectedRoleKey(track.key)}
        className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all text-left border border-blue-100/60 overflow-hidden flex flex-col"
      >
        <div className="h-44 md:h-48 lg:h-52 overflow-hidden relative bg-blue-100">
          <img
            src={src800}
            srcSet={isUnsplash ? `${src400} 400w, ${src800} 800w, ${src1200} 1200w` : undefined}
            sizes="(min-width:1280px) 30vw, (min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
            loading="lazy"
            decoding="async"
            alt={track.title + ' cover image'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 select-none"/>
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 via-black/0 to-black/10" />
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{track.title}</h3>
          <p className="text-gray-600 text-sm mb-4 flex-1">{track.desc}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {track.subTopics.slice(0,3).map(s => (
              <span key={s.name} className="text-[11px] px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium">{s.name}</span>
            ))}
          </div>
          <span className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold group-hover:bg-blue-700 transition-colors mt-auto">Select Role →</span>
        </div>
      </motion.button>
    );
  };

  // RoundCard subcomponent
  const RoundCard = ({ round }) => {
    const isImplemented = isModeImplemented(round.mode);
    const modeEmoji = round.mode === ROUND_MODES.CODING ? '💻' :
                      round.mode === ROUND_MODES.PERSON ? '🎭' :
                      round.mode === ROUND_MODES.MCQ ? '📝' : '❓';
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative bg-white rounded-xl border-2 p-5 shadow-sm transition-all ${
          isImplemented 
            ? 'border-blue-200 hover:border-blue-400 hover:shadow-md' 
            : 'border-gray-200 opacity-60'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{modeEmoji}</span>
            <h5 className="font-bold text-gray-800">{round.title}</h5>
          </div>
          {!isImplemented && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
              Coming Soon
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-3">{round.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Round {round.number}</span>
          <span className="capitalize">{round.mode}</span>
        </div>
      </motion.div>
    );
  };

  // Main render
  return (
    <div className="max-w-7xl mx-auto py-10">
      {/* Main Heading and Subtitle */}
      {!category && !selectedRoleKey && (
        <>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 text-center mb-4"
          >
            Choose Your Path
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl text-gray-600 text-center mb-12 max-w-3xl mx-auto"
          >
            Begin your journey with a specialized track. Master technical skills or excel in strategic roles with our comprehensive interview preparation platform.
          </motion.p>
        </>
      )}
      {!category && !selectedRoleKey && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-10">
          {[
            {
              key: 'tech',
              title: 'Tech Tracks',
              emoji: '💻',
              desc: 'Software engineering, cybersecurity, data science — build technical excellence with structured preparation.',
              roles: tracksConfig.tech
            },
            {
              key: 'nonTech',
              title: 'Non-Tech Tracks',
              emoji: '🧠',
              desc: 'Product, design, leadership & communication — prepare for strategic and people-focused roles.',
              roles: tracksConfig.nonTech
            }
          ].map(card => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-10 text-left shadow-md hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl select-none" aria-hidden>{card.emoji}</span>
                <h2 className="text-2xl font-bold text-blue-800 tracking-tight">{card.title}</h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-md mb-6 pr-4">
                {card.desc}
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                {card.roles.map(r => (
                  <button
                    key={r.key}
                    onClick={() => { setCategory(card.key); setSelectedRoleKey(r.key); }}
                    className="px-4 py-1.5 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold tracking-wide border border-blue-200 transition-colors"
                  >
                    {r.title}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCategory(card.key)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors text-sm"
              >
                Explore {card.key === 'tech' ? 'Tech' : 'Non-Tech'} →
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Step 2: Role Selection */}
      {category && !selectedRoleKey && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-800">Select a Role</h2>
              <p className="text-gray-600 text-sm">Choose the role you want to prepare for. Rounds are tailored per role.</p>
            </div>
            <button onClick={() => setCategory(null)} className="px-4 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 font-medium hover:bg-blue-50 transition-colors">← Back</button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tracksConfig[category].map((t,i) => (
              <TrackCard key={t.key} track={t} delay={i*0.06} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Step 3: Rounds with START Button */}
      {selectedRoleKey && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-1">{selectedTrack?.title} – Interview Rounds</h2>
              <p className="text-gray-600 text-sm max-w-xl">Progress through structured stages. Some advanced or strategic rounds may still be in development.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelectedRoleKey(null)} className="px-5 py-2.5 rounded-lg bg-white border-2 border-blue-300 text-blue-700 font-semibold hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm hover:shadow-md">← Roles</button>
              <button onClick={() => { setSelectedRoleKey(null); setCategory(null); }} className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">Change Category</button>
            </div>
          </div>

          {/* Interview Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 border-2 border-blue-200 shadow-lg"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-3 text-blue-800">Ready to Start Your Interview?</h3>
                <p className="text-gray-700 text-lg mb-4">
                  Complete <span className="font-bold text-blue-600">{totalRounds} rounds</span> to master {selectedTrack?.title} interviews
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="font-semibold text-blue-800">{readyRounds}/{totalRounds} Rounds Ready</div>
                      <div className="text-gray-600 text-xs">Available to practice now</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <div className="font-semibold text-blue-800">Real-Time Practice</div>
                      <div className="text-gray-600 text-xs">Simulated interview experience</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="font-semibold text-blue-800">Track Progress</div>
                      <div className="text-gray-600 text-xs">Monitor your improvement</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowStartConfirmation(true)}
                  disabled={readyRounds === 0}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                    readyRounds > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg border-2 border-blue-600 hover:border-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed border-2 border-gray-300'
                  }`}
                >
                  {readyRounds > 0 ? (
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">🚀</span>
                      START FULL INTERVIEW
                    </span>
                  ) : (
                    'No Rounds Available'
                  )}
                </motion.button>
                <p className="text-gray-600 text-xs text-center">
                  Complete all {readyRounds} rounds sequentially
                </p>
              </div>
            </div>
          </motion.div>

          {/* Round Cards */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Individual Rounds ({totalRounds})</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rounds.map(r => <RoundCard key={r.id} round={r} />)}
            </div>
          </div>
        </motion.div>
      )}

      {/* Start Confirmation Modal */}
      <AnimatePresence>
        {showStartConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStartConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Full Interview?</h3>
                <p className="text-gray-600">
                  You're about to begin a complete {selectedTrack?.title} interview with <strong>{readyRounds} rounds</strong>.
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <span>📋</span> What to Expect:
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Complete {readyRounds} rounds sequentially</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Real-time coding, MCQs, and interactive interviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Progress automatically tracked</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Take breaks between rounds if needed</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowStartConfirmation(false)}
                  className="flex-1 px-6 py-3 rounded-xl bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold transition-all hover:bg-gray-50 shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowStartConfirmation(false);
                    startFullInterview();
                  }}
                  className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md hover:shadow-lg border-2 border-blue-600 hover:border-blue-700"
                >
                  Let's Begin! 🚀
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

