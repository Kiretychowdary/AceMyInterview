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
    <div className="min-h-screen bg-white text-black font-sans">
      {/* HERO SECTION */}
      <div className="flex flex-col h-auto md:h-screen md:flex-row items-center justify-between px-2 sm:px-6 md:px-16 py-10 sm:py-20 max-w-7xl mx-auto">
        {/* TEXT */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left"
          initial={{ opacity: 0, x: -70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="mb-6">
            <motion.div 
              className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-semibold text-sm">@AceMyInterview Platform</span>
            </motion.div>
          </div>
          
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-blue-600">Master Your</span>
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Interview Skills
            </span>
            <br className="hidden md:block" />
            <span className="text-gray-800">with AI Power</span>
          </h1>
          
          <p className="text-base xs:text-lg lg:text-xl text-gray-600 mt-4 mb-8 max-w-xs xs:max-w-sm sm:max-w-lg lg:max-w-xl leading-relaxed">
            Practice with AI-powered mock interviews, get instant feedback, and access curated learning resources. 
            <span className="text-blue-600 font-semibold"> Join 10,000+ successful candidates</span> who aced their interviews.
          </p>

          {/* CTA BUTTONS */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to={user ? '/mock-interviews' : '/Login'}
              className="group inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <svg
                height="20"
                width="20"
                viewBox="0 0 24 24"
                className="fill-white transition-all duration-300 group-hover:scale-110"
              >
                <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
              </svg>
              Start Free Practice
            </Link>
            
            <Link
              to="#resources"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-600 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Explore Resources
            </Link>
          </motion.div>

          {/* STATS */}
          <motion.div
            className="flex flex-wrap gap-8 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">10K+</div>
              <div className="text-sm text-gray-600">Success Stories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">500+</div>
              <div className="text-sm text-gray-600">Practice Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </motion.div>
        </motion.div>

        {/* IMAGE */}
        <motion.div
          className="mt-8 xs:mt-10 md:mt-0 md:ml-10 w-full md:w-1/2 flex justify-center md:justify-end"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
        >
          <div className="relative">
            <motion.img
              src={image}
              alt="AI Interview Platform"
              className="rounded-3xl w-[180px] xs:w-[250px] sm:w-[300px] md:w-[400px] lg:w-[500px] shadow-2xl border border-blue-100"
              whileHover={{ scale: 1.03 }}
            />
            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-xl shadow-lg"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* PROFESSIONAL RESOURCES SECTION */}
      <div id="resources">
        <ExploreSolutions />
      </div>
      
      <PageFeatures/>
    </div>
  );
};
 

export default Home;