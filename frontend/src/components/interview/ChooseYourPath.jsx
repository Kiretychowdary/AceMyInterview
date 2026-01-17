import React from 'react';
import { motion } from 'framer-motion';

/**
 * ChooseYourPath Component
 * Displays Tech and Non-Tech track selection cards
 * Reusable across multiple pages
 */
export default function ChooseYourPath({ onSelectTrack }) {
  const techTracks = [
    { name: 'Software Engineering', icon: '💻' },
    { name: 'Cybersecurity', icon: '🔐' },
    { name: 'Data Science', icon: '📊' }
  ];

  const nonTechTracks = [
    { name: 'Product Management', icon: '📱' },
    { name: 'UI/UX Design', icon: '🎨' },
    { name: 'Management & Leadership', icon: '👔' }
  ];

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-16 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold text-blue-600 mb-6">
          Choose Your Path
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Begin your journey with a specialized track. Master technical skills or excel in strategic roles with our comprehensive interview preparation platform.
        </p>
      </motion.div>

      {/* Track Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl w-full">
        {/* Tech Tracks Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 md:p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              💻
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Tech Tracks</h2>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Software engineering, cybersecurity, data science — build technical excellence with structured preparation.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {techTracks.map((track, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200"
              >
                <span>{track.icon}</span>
                {track.name}
              </span>
            ))}
          </div>

          <button
            onClick={() => onSelectTrack('tech')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>Explore Tech</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>

        {/* Non-Tech Tracks Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 md:p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              🧠
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Non-Tech Tracks</h2>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Product, design, leadership & communication — prepare for strategic and people-focused roles.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {nonTechTracks.map((track, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-semibold border border-purple-200"
              >
                <span>{track.icon}</span>
                {track.name}
              </span>
            ))}
          </div>

          <button
            onClick={() => onSelectTrack('nonTech')}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span>Explore Non-Tech</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
