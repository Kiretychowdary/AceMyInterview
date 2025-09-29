import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRoundsForTrack, isModeImplemented, ROUND_MODES } from '../config/roundsConfig';

const modeBadges = {
  [ROUND_MODES.MCQ]: 'bg-blue-50 text-blue-700 border-blue-200',
  [ROUND_MODES.CODING]: 'bg-green-50 text-green-700 border-green-200',
  [ROUND_MODES.PERSON]: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  case: 'bg-orange-50 text-orange-700 border-orange-200',
  scenario: 'bg-purple-50 text-purple-700 border-purple-200',
  pitch: 'bg-pink-50 text-pink-700 border-pink-200',
  analysis: 'bg-gray-50 text-gray-700 border-gray-200'
};

export default function RoundRoadmapModal({ open, onClose, trackKey, onSelectRound, userId='anonymous' }) {
  const rounds = trackKey ? getRoundsForTrack(trackKey) : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white/95 backdrop-blur rounded-2xl w-full max-w-5xl mx-4 shadow-2xl p-8 border border-white/30"
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-blue-700 mb-1">Round Roadmap</h2>
                <p className="text-sm text-gray-600">Track progression for: <span className="font-semibold">{trackKey}</span></p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none px-3 py-1 rounded-full hover:bg-gray-100">×</button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-h-[60vh] overflow-y-auto pr-1 custom-scroll">
              {rounds.map((r) => {
                const enabled = isModeImplemented(r.mode);
                return (
                  <motion.button
                    key={r.id}
                    whileHover={{ scale: enabled ? 1.02 : 1 }}
                    whileTap={{ scale: enabled ? 0.97 : 1 }}
                    disabled={!enabled}
                    onClick={() => enabled && onSelectRound(r)}
                    className={`relative p-5 rounded-xl border-2 text-left transition-all group ${enabled ? 'bg-white hover:shadow-md border-blue-100' : 'bg-gray-50 border-dashed border-gray-300 opacity-60 cursor-not-allowed'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${modeBadges[r.mode] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{r.mode}</span>
                      <span className="text-[11px] text-gray-400 font-mono">Stage {r.stage}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 min-h-[2.5rem]">{r.label}</h3>
                    {r.topics && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {r.topics.slice(0,4).map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{t}</span>
                        ))}
                      </div>
                    )}
                    {r.objectives && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {r.objectives.slice(0,3).map(o => (
                          <span key={o} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600">{o.replace(/_/g,' ')}</span>
                        ))}
                      </div>
                    )}
                    {r.optional && <div className="text-[10px] inline-block px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 mb-2">Optional</div>}
                    <div className="text-xs text-gray-500">
                      {enabled ? 'Click to start' : 'Coming soon'}
                    </div>
                    {r.next && (
                      <div className="absolute top-2 right-2 text-[9px] text-gray-400">→ {r.next}</div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-6 text-[11px] text-gray-400 flex flex-wrap gap-4">
              <div><span className="font-semibold text-gray-600">Legend:</span> MCQ / Coding / Person are active. Case, Scenario, Pitch, Analysis are placeholders.</div>
              <div>Future: progress badges & performance insights.</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
