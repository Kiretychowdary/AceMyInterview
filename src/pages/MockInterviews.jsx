// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import image from '../assets/image.png';

const mockData = [
  {
    title: 'Software Developer',
    desc: 'Land top dev jobs with AI-powered software mock interview',
    category: 'Tech',
    img: image,
  },
  {
    title: 'Data Analyst',
    desc: 'Nail your data analyst job with AI-powered mock interview',
    category: 'Tech',
    img: image,
  },
  {
    title: 'Product Manager',
    desc: 'Practice Product Manager interview, get job-ready with AI',
    category: 'Management',
    img: image,
  },
  {
    title: 'HR Interview',
    desc: 'Crack general HR interviews with mock practice',
    category: 'General',
    img: image,
  },
  {
    title: 'Project Coordinator',
    desc: 'Practice project-based management interview with AI',
    category: 'Management',
    img: image,
  },
  {
    title: 'System Admin',
    desc: 'System admin AI mock interview to secure infra jobs',
    category: 'Tech',
    img: image,
  },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const categories = ['All', 'Tech', 'Management', 'General'];

const MockInterviews = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredData =
    selectedCategory === 'All'
      ? mockData
      : mockData.filter((mock) => mock.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-10 md:px-16 py-10">
      {/* HEADER */}
      <motion.div
        className="text-white max-w-3xl mb-6"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold">AI-Powered Mock Interview</h2>
        <p className="mt-2 text-gray-300">
          Master your concepts with AI-Powered full-length mock tests for 360<sup>o</sup> preparation!
        </p>
      </motion.div>

      {/* TAG FILTERS */}
      <div className="flex flex-wrap gap-3 mb-8">
        {categories.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedCategory(tag)}
            className={`px-4 py-1 rounded-full font-medium transition-all duration-200 ${selectedCategory === tag
                ? 'bg-purple-500 text-white'
                : 'bg-white text-black hover:bg-gray-300'
              }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* MOCK CARD GRID */}
      <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        <AnimatePresence>
          {filteredData.map((mock, idx) => (
            <motion.div
              key={mock.title + idx}
              layout
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-white text-black p-4 rounded-xl shadow hover:shadow-2xl transition min-h-[300px] flex flex-col justify-between"
            >
              <img
                src={mock.img}
                alt={mock.title}
                className="rounded-md h-32 w-full object-cover mb-3"
              />
              <div className="flex-1">
                <h3 className="text-base font-bold mb-1">{mock.title}</h3>
                <p className="text-sm text-gray-700">{mock.desc}</p>
              </div>

              <div className="mt-4 text-right">
                {/* Glowing Button */}
                <button className="group relative bg-neutral-900 border border-pink-400 rounded-full p-[2px] overflow-hidden hover:scale-105 transition-transform">
                  <span className="flex items-center gap-2 px-5 py-2 bg-black rounded-full text-white relative z-10">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <defs>
                        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#7A69F9" />
                          <stop offset="50%" stopColor="#F26378" />
                          <stop offset="100%" stopColor="#F5833F" />
                        </linearGradient>
                      </defs>
                      <path
                        fill="url(#grad)"
                        d="M12 2L14.09 8.26L21 9.27L16 14.14L17.45 21.02L12 17.77L6.55 21.02L8 14.14L3 9.27L9.91 8.26L12 2Z"
                      />
                    </svg>
                    <span className="text-sm font-semibold">Start Interview</span>
                  </span>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MockInterviews;
