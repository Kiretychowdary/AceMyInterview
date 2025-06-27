// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React from 'react';
import { motion } from 'framer-motion';
import Logo from '../assets/Logo.jpg';
import image from '../assets/image.png';

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* NAVBAR */}
      <motion.header
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-md shadow-md"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <img src={Logo} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
            <span className="font-bold text-xl tracking-wide">AceMyInterview</span>
          </div>

          <div className="hidden md:flex items-center space-x-8 font-medium text-white">
            <motion.a
              href="#"
              whileHover={{ scale: 1.1, color: '#c084fc' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Questions
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1, color: '#c084fc' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Practice
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ scale: 1.1, color: '#c084fc' }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              Guide
            </motion.a>
          </div>

          <div className="space-x-4 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-purple-200 hover:bg-purple-300 text-black font-semibold py-1 px-4 rounded-full border border-green-400 transition"
            >
              CONTACT US
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-4 rounded-full transition"
            >
              login
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-16 py-20 max-w-7xl mx-auto">
        {/* TEXT */}
        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, x: -70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Start Level Up <br />
            Yourself with <br />
            our AI-Powered <br />
            interview <br />
            mocks
          </h1>

          {/* EXPLORE BUTTON */}
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              type="submit"
              className="flex justify-center gap-2 items-center mx-auto shadow-xl text-lg bg-gray-50 backdrop-blur-md lg:font-semibold isolation-auto border-gray-50 before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-emerald-500 hover:text-gray-50 before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-4 py-2 overflow-hidden border-2 rounded-full group"
            >
              Explore
              <svg
                className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-gray-50 ease-linear duration-300 rounded-full border border-gray-700 group-hover:border-none p-2 rotate-45"
                viewBox="0 0 16 19"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                  className="fill-gray-800 group-hover:fill-gray-800"
                />
              </svg>
            </button>
          </motion.div>
        </motion.div>

        {/* IMAGE */}
        <motion.div
          className="mt-10 md:mt-0 md:ml-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
        >
          <motion.img
            src={image}
            alt="AI Interview"
            className="rounded-xl w-[300px] sm:w-[400px] md:w-[500px] shadow-lg"
            whileHover={{ scale: 1.03 }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
