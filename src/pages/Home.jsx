// NMKRSPVLIDATA
// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../assets/Logo.jpg';
import image from '../assets/image.png';
import ExploreSolutions from '../components/ExploreSolutions';
import PageFeatures from '../components/PageFeatures';
const navLinks = [
  { name: 'Questions', href: '#' },
  { name: 'Practice', href: '#' },
  { name: 'Guide', href: '#' },
];

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white font-sans">
      {/* NMKRSPVLIDATA */}
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-20 max-w-7xl mx-auto">
        {/* TEXT */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left"
          initial={{ opacity: 0, x: -70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            <span className="text-emerald-400">Level Up</span> Your Career
            <br className="hidden md:block" />
            with <span className="text-purple-400">AI-Powered</span>
            <br className="hidden md:block" />
            Interview Mocks
          </h1>
          <p className="text-lg text-gray-300 mt-4 max-w-lg">
            Practice real interview questions, get instant feedback, and ace your next interview with confidence.
          </p>

          {/* EXPLORE BUTTON */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              type="button"
              className="group border-none w-[15em] h-[5em] rounded-[3em] flex justify-center items-center gap-3 bg-[#1C1A1C] cursor-pointer transition-all duration-[450ms] ease-in-out hover:bg-gradient-to-t hover:from-[#A47CF3] hover:to-[#683FEA] hover:shadow-[0_0_180px_0px_#9917FF] hover:-translate-y-0.5"
            >
              <svg
                height="24"
                width="24"
                viewBox="0 0 24 24"
                className="fill-[#AAAAAA] transition-all duration-[800ms] ease group-hover:fill-white group-hover:scale-125"
              >
                <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
              </svg>
              <span className="font-semibold text-[#AAAAAA] text-base group-hover:text-white transition-colors duration-300">
                Generate
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* IMAGE */}
        <motion.div
          className="mt-10 md:mt-0 md:ml-10 w-full md:w-1/2 flex justify-center md:justify-end"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
        >
          <motion.img
            src={image}
            alt="AI Interview"
            className="rounded-xl w-[300px] sm:w-[400px] md:w-[500px] shadow-lg border-4 border-emerald-500/20"
            whileHover={{ scale: 1.03 }}
          />
        </motion.div>
      </div>
      {/* NMKRSPVLIDATA */}
      <ExploreSolutions />
      <PageFeatures/>
    </div>
  );
};

export default Home;