import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../assets/Logo.jpg';

const navLinks = [
  { name: 'Questions', href: '#' },
  { name: 'Practice', href: '#' },
  { name: 'Guide', href: '#' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.header
      className="sticky top-0 z-50 bg-gradient-to-r from-black via-gray-900 to-gray-800/90 backdrop-blur-md shadow-lg"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 py-3 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <img src={Logo} alt="Logo" className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 shadow" />
          <span className="font-extrabold text-2xl tracking-wide bg-gradient-to-r from-emerald-400 via-purple-400 to-blue-400 bg-clip-text text-transparent select-none">
            AceMyInterview
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8 font-medium">
          {navLinks.map((link) => (
            <motion.a
              key={link.name}
              href={link.href}
              whileHover={{ scale: 1.08, color: '#6366f1' }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="transition-colors duration-200 text-gray-200 hover:text-indigo-400 px-2 py-1 rounded"
            >
              {link.name}
            </motion.a>
          ))}
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex space-x-3 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.07 }}
            className="bg-white text-gray-900 font-semibold py-1.5 px-5 rounded-full border border-gray-300 shadow transition hover:bg-gray-100 hover:text-indigo-600"
          >
            Contact Us
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.07 }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-5 rounded-full shadow transition"
          >
            Login
          </motion.button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-800 transition"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"} />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-black/95 px-6 pb-4"
          >
            <div className="flex flex-col space-y-4 mt-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-semibold text-gray-200 hover:text-indigo-400 transition px-2 py-1 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <button className="bg-white text-gray-900 font-semibold py-2 px-5 rounded-full border border-gray-300 shadow transition hover:bg-gray-100 hover:text-indigo-600">
                Contact Us
              </button>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-full shadow transition">
                Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;