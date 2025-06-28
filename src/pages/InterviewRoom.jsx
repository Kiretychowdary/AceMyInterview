// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import image from '../assets/image.png';

const InterviewRoom = () => {
  const [time, setTime] = useState(1800); // 30 minutes in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-md">
        <h2 className="text-xl font-semibold">Software Developer</h2>
        <div className="bg-green-500 px-4 py-1 rounded-full text-black font-bold">
          00:{formatTime(time)}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-semibold">Vara prasad</p>
            <p className="text-sm text-gray-300">Chinnikirety123@gmail.com</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
            <span className="material-icons">person</span>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-purple-950 rounded-md p-4 flex flex-col lg:flex-row items-center justify-around">
          <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center">
            <img src={image} alt="Bot" className="w-24 h-24" />
          </div>
          <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center">
            <p className="text-black font-semibold">User live video</p>
          </div>
        </div>

        <div className="w-full lg:w-1/3 bg-gray-900 rounded-md p-4">
          <h3 className="text-lg font-semibold mb-2">Interview Transcript</h3>
          <div className="h-60 overflow-y-auto text-sm space-y-2">
            <p className="bg-purple-800 p-2 rounded-md">
              <strong>AI:</strong> Hey Vara, I am the bot here to interview you. Can you tell me about yourself?
            </p>
            <p className="bg-purple-800 p-2 rounded-md">
              <strong>You:</strong> Good question, I am a post graduate in information systems and interned at software wing in Google.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center gap-6">
        <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full">Click to answer</button>
        <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full">End Interview</button>
      </div>
    </div>
  );
};

export default InterviewRoom;
