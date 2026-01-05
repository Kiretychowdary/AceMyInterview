// nmkrspvlidata
//  import Logo from '../assets/Logo.jpg';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from "../../assets/Logo.jpg";
import { useAuth } from "../../contexts/AuthContext";
const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Practice', href: '/mock-interviews' },
  { name: 'Interview Preparation', href: '/interview-preparation' },
  { name: 'Contests', href: '/contests' },
  { name: 'Dashboard', href: '/dashboard' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  

  return (
    <motion.header
      className="sticky top-0 z-50 bg-white border-b border-blue-700 shadow-lg font-sans"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <nav className="flex items-center justify-between px-6 md:px-12 py-3 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <Link to="/">
            <img src={Logo} alt="Logo" className="w-11 h-11 rounded-full object-cover border-2 border-blue-700 shadow" />
          </Link>
          <Link to="/">
            <span className="font-sans text-2xl font-bold text-blue-700 tracking-wide select-none">
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
              className="transition-colors duration-200 text-blue-900 hover:text-white px-2 py-1 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 font-sans"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Buttons */}
        {user ? (
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
            {/* User Profile Circle */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <button 
              onClick={logout}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden md:flex space-x-3 flex-shrink-0">
            <Link to="/login" tabIndex={0} aria-label="User Login Button" className="user-profile">
              <div className="user-profile-inner text-blue-900 hover:text-white hover:bg-blue-700 transition rounded px-3 py-1 font-sans">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g data-name="Layer 2" id="Layer_2">
                    <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                  </g>
                </svg>
                <p>Log In</p>
              </div>
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle Button (Always visible) */}
        <button
          className={`md:hidden flex items-center justify-center w-10 h-10 rounded-full border transition font-sans
            ${menuOpen ? "bg-blue-700 border-blue-700 shadow-lg text-white" : "bg-white border-blue-700 hover:bg-blue-50 text-blue-700"}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg
            className={`w-7 h-7 transition-transform duration-300 ${menuOpen ? "rotate-90 text-white" : "text-blue-700"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"}
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-xs bg-white px-6 py-8 shadow-2xl z-50 flex flex-col border-l-2 border-blue-100"
            style={{ minHeight: "100vh" }}
          >
            {/* Overlay to close sidebar when clicking outside */}
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setMenuOpen(false)}
              aria-label="Close sidebar when clicking outside"
            />
            <div className="relative z-50 flex flex-col space-y-4 mt-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-lg font-semibold text-blue-900 hover:text-blue-700 transition px-4 py-3 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-200"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <button className="bg-blue-700 text-white font-semibold py-2 px-5 rounded-full border border-blue-700 shadow transition hover:bg-blue-800" aria-label="Contact Us (no action)" onClick={() => setMenuOpen(false)}>
                    Contact Us
                  </button>
                  <button className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-full border border-blue-700 shadow transition hover:bg-blue-700" aria-label="Feedback (no action)" onClick={() => setMenuOpen(false)}>
                    Feedback
                  </button>
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="user-profile-inner" tabIndex={0} aria-label="User Logout Button">
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <g data-name="Layer 2" id="Layer_2">
                        <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                      </g>
                    </svg>
                    <p>Log Out</p>
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-blue-700 text-white font-semibold py-2 px-5 rounded-full border border-blue-700 shadow transition hover:bg-blue-800" aria-label="Contact Us (no action)" onClick={() => setMenuOpen(false)}>
                    Contact Us
                  </button>
                  <Link to="/login" tabIndex={0} aria-label="User Login Button" className="user-profile" onClick={() => setMenuOpen(false)}>
                    <div className="user-profile-inner">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <g data-name="Layer 2" id="Layer_2">
                          <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                        </g>
                      </svg>
                      <p>Log In</p>
                    </div>
                  </Link>
                </>
              )}
            </div>
            {/* Close button inside the drawer */}
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow hover:bg-blue-700 transition"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
            #e0e7ef 0%,
            rgba(46, 142, 255, 0) 30%
          );
          background-color: #f5f7fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-profile:hover,
        .user-profile:focus {
          background-color: #e0e7ef;
          box-shadow: 0 0 10px #b6c2d1;
          outline: none;
        }
        .user-profile-inner {
          width: 127px;
          height: 47px;
          border-radius: 13px;
          background-color: #f5f7fa;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          color: #222;
          font-weight: 600;
        }
        .user-profile-inner svg {
          width: 27px;
          height: 27px;
          fill: #222;
        }
      `}</style>
    </motion.header>
  );
};

export default Navbar;