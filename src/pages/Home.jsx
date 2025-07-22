// NMKRSPVLIDATA
// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../assets/Logo.jpg';
import image from '../assets/image.png';
import ExploreSolutions from '../components/ExploreSolutions';
import PageFeatures from '../components/PageFeatures';
  import { useAuth } from "../components/AuthContext";
const navLinks = [
  { name: 'Questions', href: '#' },
  { name: 'Practice', href: '#' },
  { name: 'Guide', href: '#' },
];

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-white/95 border-b border-gray-200 shadow-lg text-gray-900 font-sans">
      {/* HERO SECTION */}
      <div className="flex flex-col h-screen md:flex-row items-center justify-between px-6 md:px-16 py-20 max-w-7xl mx-auto">
        {/* TEXT */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left"
          initial={{ opacity: 0, x: -70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
            <span className="text-blue-700">Level Up</span> Your Career
            <br className="hidden md:block" />
            with <span className="text-blue-700">AI-Powered</span>
            <br className="hidden md:block" />
            Interview Mocks
          </h1>
          <p className="text-lg text-gray-700 mt-4 max-w-lg">
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
              className="group border-none w-[15em] h-[5em] rounded-[3em] flex justify-center items-center gap-3 bg-blue-700 cursor-pointer transition-all duration-300 ease-in-out hover:bg-blue-800 hover:shadow-lg hover:-translate-y-0.5"
            >
              <svg
                height="24"
                width="24"
                viewBox="0 0 24 24"
                className="fill-white transition-all duration-300 ease group-hover:scale-110"
              >
                <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
              </svg>
              <Link
                to={user ? '/mock-interviews' : '/login'}
                className="font-semibold text-white text-base group-hover:text-white transition-colors duration-300"
              >
                <span className="font-semibold text-white text-base group-hover:text-white transition-colors duration-300">
                  Explore
                </span>
              </Link>
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
            className="rounded-xl w-[300px] sm:w-[400px] md:w-[500px] shadow-lg border-4 border-blue-600/20"
            whileHover={{ scale: 1.03 }}
          />
        </motion.div>
      </div>
      <ExploreSolutions />
      <PageFeatures/>
    </div>
  );
};

export default Home;