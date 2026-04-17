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

  const companyTracks = [
    { name: 'Infosys', icon: '🏢' },
    { name: 'TCS', icon: '🌐' },
    { name: 'Cognizant', icon: '🚀' }
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
          Begin your journey with a specialized track. Master technical skills, excel in strategic roles, or prepare for specific companies with our comprehensive interview preparation platform.
        </p>
      </motion.div>

      {/* Track Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Tech Tracks Card */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 md:p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0">
              💻
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Tech Tracks</h2>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed flex-1">
            Software engineering, cybersecurity, data science — build technical excellence.
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
            className="shine-button mt-auto"
          >
            <span>Explore Tech</span>
            <svg className="shine-icon" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"></path>
            </svg>
          </button>
        </motion.div>

        {/* Non-Tech Tracks Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 md:p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0">
              🧠
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Non-Tech Tracks</h2>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed flex-1">
            Product, design, leadership & communication — prepare for strategic roles.
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
            className="shine-button mt-auto"
          >
            <span>Explore Non-Tech</span>
            <svg className="shine-icon" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"></path>
            </svg>
          </button>
        </motion.div>

        {/* Company Specific Card */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 md:p-10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0">
              🏢
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Company Specific</h2>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed flex-1">
            Infosys, TCS, Cognizant — practice tailored interview formats for top companies.
          </p>

          <div className="flex flex-wrap gap-3 mb-8">
            {companyTracks.map((track, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold border border-green-200"
              >
                <span>{track.icon}</span>
                {track.name}
              </span>
            ))}
          </div>

          <button
            onClick={() => onSelectTrack('company')}
            className="shine-button mt-auto"
          >
            <span>Explore Companies</span>
            <svg className="shine-icon" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z"></path>
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
