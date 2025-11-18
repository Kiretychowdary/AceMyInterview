import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActiveParticipantsIndicator = ({ contestId, userId, username, email }) => {
  const [activeCount, setActiveCount] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!contestId || !userId) return;

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    // Send heartbeat every 30 seconds
    const sendHeartbeat = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/contests/${contestId}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId, username, email })
        });
        
        if (res.ok) {
          const data = await res.json();
          setActiveCount(data.activeCount || 0);
        }
      } catch (err) {
        console.error('Failed to send heartbeat:', err);
      }
    };

    // Initial heartbeat
    sendHeartbeat();

    // Set up interval for heartbeat
    const heartbeatInterval = setInterval(sendHeartbeat, 30000); // Every 30 seconds

    // Fetch active count every 10 seconds
    const fetchActiveCount = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/contests/${contestId}/active-count`, {
          credentials: 'include'
        });
        
        if (res.ok) {
          const data = await res.json();
          setActiveCount(data.activeCount || 0);
        }
      } catch (err) {
        console.error('Failed to fetch active count:', err);
      }
    };

    const countInterval = setInterval(fetchActiveCount, 10000); // Every 10 seconds

    // Cleanup
    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(countInterval);
    };
  }, [contestId, userId, username, email]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed top-20 right-4 z-50"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 cursor-pointer"
            onClick={() => setIsVisible(!isVisible)}
          >
            <div className="relative">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-white rounded-full animate-ping"></div>
            </div>
            
            <div>
              <div className="text-xs font-medium opacity-90">Active Now</div>
              <div className="text-2xl font-bold">{activeCount}</div>
            </div>
            
            <div className="text-2xl">👥</div>
          </motion.div>
          
          {/* Minimize button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="absolute -bottom-2 -left-2 bg-white text-green-600 rounded-full w-6 h-6 flex items-center justify-center shadow-lg text-xs font-bold"
          >
            ×
          </motion.button>
        </motion.div>
      )}
      
      {/* Show button when minimized */}
      {!isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsVisible(true)}
          className="fixed top-20 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl"
        >
          <div className="relative">
            <span className="text-xl">👥</span>
            <span className="absolute -top-1 -right-1 bg-white text-green-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ActiveParticipantsIndicator;
