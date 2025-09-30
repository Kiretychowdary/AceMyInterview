import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUND_MODES, getRoundsForTrack, isModeImplemented } from '../config/roundsConfig';
import { tracksConfig, getTrackByKey } from '../config/tracksConfig';

// Professional multi-step: Category (tech/non) -> Role selection -> Rounds list
export default function InterviewPreparation() {
  const [category, setCategory] = React.useState(null); // 'tech' | 'nonTech'
  const [selectedRoleKey, setSelectedRoleKey] = React.useState(null);
  const navigate = useNavigate();

  const selectedTrack = selectedRoleKey ? getTrackByKey(selectedRoleKey) : null;
  const rounds = selectedRoleKey ? getRoundsForTrack(selectedRoleKey) : [];

  const modeRoute = (mode) => {
    switch(mode){
      case ROUND_MODES.CODING: return '/compiler';
      case ROUND_MODES.PERSON: return '/face-to-face-interview';
      case ROUND_MODES.MCQ: return '/mcq-interview';
      default: return '/mcq-interview'; // temporary fallback
    }
  };

  const startRound = (round) => {
    if(!isModeImplemented(round.mode)) return;
    navigate(modeRoute(round.mode), { state: { roundId: round.id, role: selectedTrack?.title, category, mode: round.mode, stage: round.stage, label: round.label } });
  };

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

  const RoundCard = ({ round }) => {
    const implemented = isModeImplemented(round.mode);
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: implemented ? -5 : 0 }}
        className={`relative border rounded-xl p-5 flex flex-col gap-3 shadow-sm transition bg-white ${implemented ? 'border-blue-600 hover:shadow-xl' : 'border-blue-200 opacity-70'} `}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide text-blue-700">Stage {round.stage}</span>
          <span className={`text-xs px-2 py-1 rounded-full border ${implemented ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>{round.mode}</span>
        </div>
        <h3 className="font-bold text-lg text-blue-800 leading-snug">{round.label}</h3>
        {round.objectives && (
          <div className="flex flex-wrap gap-1">
            {round.objectives.slice(0,3).map(o => (
              <span key={o} className="text-[10px] tracking-wide uppercase bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded">{o.replace(/_/g,' ')}</span>
            ))}
          </div>
        )}
        {round.topics && (
          <div className="flex flex-wrap gap-1">
            {round.topics.slice(0,4).map(t => (
              <span key={t} className="text-[10px] bg-blue-100/60 text-blue-700 px-2 py-0.5 rounded">{t}</span>
            ))}
          </div>
        )}
        <div className="mt-auto flex justify-end">
          <button
            disabled={!implemented}
            onClick={() => startRound(round)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all ${implemented ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md' : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'}`}
          >
            {implemented ? 'Start' : 'Coming Soon'}
          </button>
        </div>
        {!implemented && <div className="absolute inset-0 rounded-xl bg-white/60 backdrop-blur-[1px]" />}
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-10">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-extrabold text-blue-800 tracking-tight text-center mb-10">
        Interview Preparation
      </motion.h1>

      {/* Step 1: Category Selection (redesigned) */}
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

      {/* Step 3: Rounds */}
      {selectedRoleKey && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-800 mb-1">{selectedTrack?.title} – Rounds</h2>
              <p className="text-gray-600 text-sm max-w-xl">Progress through structured stages. Some advanced or strategic rounds may still be in development.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelectedRoleKey(null)} className="px-4 py-2 rounded-lg bg-white border border-blue-200 text-blue-700 font-medium hover:bg-blue-50 transition-colors">← Roles</button>
              <button onClick={() => { setSelectedRoleKey(null); setCategory(null); }} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">Change Category</button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rounds.map(r => <RoundCard key={r.id} round={r} />)}
          </div>
        </motion.div>
      )}
    </div>
  );
}
