// nmkrspvlidata
//  import Logo from '../assets/Logo.jpg';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../assets/Logo.jpg';

const navLinks = [
  { name: 'Practice', href: '/mock-interviews' },
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
          <Link to="/">
            <img src={Logo} alt="Logo" className="w-11 h-11 rounded-full object-cover border-2 border-emerald-400 shadow" />
          </Link>
          <Link to="/">
            <span className="font-extrabold text-2xl tracking-wide bg-gradient-to-r from-emerald-400 via-purple-400 to-blue-400 bg-clip-text text-transparent select-none">
              AceMyInterview
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8 font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="transition-colors duration-200 text-gray-200 hover:text-indigo-400 px-2 py-1 rounded"
            >
              {link.name}
            </Link>
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
          <Link to="/login" tabIndex={0} aria-label="User Login Button" className="user-profile">
            <div className="user-profile-inner">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g data-name="Layer 2" id="Layer_2">
                  <path
                    d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"
                  ></path>
                </g>
              </svg>
              <p>Log In</p>
            </div>
          </Link>
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
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-lg font-semibold text-gray-200 hover:text-indigo-400 transition px-2 py-1 rounded"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <button className="bg-white text-gray-900 font-semibold py-2 px-5 rounded-full border border-gray-300 shadow transition hover:bg-gray-100 hover:text-indigo-600">
                Contact Us
              </button>
              <Link to="/login" tabIndex={0} aria-label="User Login Button" className="user-profile">
                <div className="user-profile-inner">
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g data-name="Layer 2" id="Layer_2">
                      <path
                        d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"
                      ></path>
                    </g>
                  </svg>
                  <p>Log In</p>
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Login Button Styles */}
      <style>{`
        .user-profile {
          width: 131px;
          height: 51px;
          border-radius: 15px;
          cursor: pointer;
          transition: 0.3s ease;
          background: linear-gradient(
            to bottom right,
            #2e8eff 0%,
            rgba(46, 142, 255, 0) 30%
          );
          background-color: rgba(46, 142, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-profile:hover,
        .user-profile:focus {
          background-color: rgba(46, 142, 255, 0.7);
          box-shadow: 0 0 10px rgba(46, 142, 255, 0.5);
          outline: none;
        }
        .user-profile-inner {
          width: 127px;
          height: 47px;
          border-radius: 13px;
          background-color: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          color: #fff;
          font-weight: 600;
        }
        .user-profile-inner svg {
          width: 27px;
          height: 27px;
          fill: #fff;
        }
      `}</style>
    </motion.header>
  );
};

export default Navbar;