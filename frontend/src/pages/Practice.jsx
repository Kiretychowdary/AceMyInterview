import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { practiceDomains } from '../config/practiceConfig';

const Practice = () => {
  const navigate = useNavigate();

  const handleStartPractice = (domain) => {
    // Navigate directly to practice session for this domain
    navigate('/practice-session', {
      state: {
        domain: domain.id,
        domainTitle: domain.title,
        topics: domain.topics,
        languages: domain.languages,
        difficulty: 'medium'
      }
    });
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans relative overflow-hidden">
      {/* Decorative corner accents (responsive) */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-16 w-44 h-44 rounded-full bg-gradient-to-br from-blue-100 to-transparent opacity-60 blur-2xl transform -rotate-12 sm:-left-32 sm:-top-24 sm:w-72 sm:h-72 sm:opacity-50"></div>
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-12 w-52 h-52 rounded-full bg-gradient-to-tr from-blue-100 to-transparent opacity-55 blur-2xl transform rotate-12 sm:-right-40 sm:-bottom-24 sm:w-96 sm:h-96 sm:opacity-45"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg mb-4">
            <span className="text-blue-700 text-sm font-medium">📚 Technical</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Tech Tracks
          </h1>
          <p className="text-xl text-gray-700">
            Choose a specialization to begin structured interview preparation.
          </p>
        </motion.div>

        {/* Domain Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {practiceDomains.map((domain, index) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all group relative"
            >
              {/* Badge showing topic count */}
              <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                {domain.topics.length} Topics
              </div>

              {/* Domain Image/Icon */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={domain.image || `https://via.placeholder.com/400x200/1e293b/3b82f6?text=${domain.icon}`}
                  alt={domain.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {domain.title}
                  </h3>
                  <p className="text-gray-200 text-sm">{domain.description}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Topics Pills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {domain.topics.slice(0, 3).map((topic, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200"
                      >
                        {topic}
                      </span>
                    ))}
                    {domain.topics.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                        +{domain.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Languages Section */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Languages
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {domain.languages.map((lang, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg text-xs font-medium border border-purple-200 hover:shadow-md transition-shadow"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <button 
                  onClick={() => handleStartPractice(domain)}
                  className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${domain.gradient} hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2`}
                >
                  <span>Start Practice</span>
                  <span className="text-lg">→</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Practice;
