// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Add this import
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import image from '../assets/image.png';

const InterviewRoom = () => {
  const [time, setTime] = useState(1800); // 30 minutes in seconds
  const [camera, setCamera] = useState('');
  const [cameras, setCameras] = useState([]);
  const [showTranscript, setShowTranscript] = useState(true); // visibility state
  const [tabSwitchCount, setTabSwitchCount] = useState(0); // <-- Track tab switches
  const navigate = useNavigate(); // <-- For navigation

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get available cameras
  useEffect(() => {
    async function getDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setCameras(videoInputs);
      if (videoInputs[0]) setCamera(videoInputs[0].deviceId);
    }
    getDevices();
  }, []);

  // Tab switch alert and redirect after 3 times
  useEffect(() => {
    const handleTabSwitch = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          alert('You switched tabs or minimized the window. Please stay on the interview page!');
          if (next >= 3) {
            navigate('/mock-interviews');
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleTabSwitch);
    return () => document.removeEventListener('visibilitychange', handleTabSwitch);
  }, [navigate]);

  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  // Visibility change function
  const handleVisibilityChange = () => {
    setShowTranscript((prev) => {
      const next = !prev;
      alert(next ? "Transcript is now visible." : "Transcript is now hidden.");
      return next;
    });
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

      {/* Toggle Button */}
      <div className="flex justify-end">
        <button
          onClick={handleVisibilityChange}
          className="bg-yellow-600 hover:bg-yellow-700 px-4 py-1 rounded-full mb-2"
        >
          {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
        </button>
      </div>

      {/* Main Area */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-purple-950 rounded-md p-4 flex flex-col lg:flex-row items-center justify-around">
          {/* AI Loader */}
          <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center">
            <div className="loader" style={{ background: 'transparent' }}>
              <div className="box"></div>
              <div className="box"></div>
              <div className="box"></div>
              <div className="box"></div>
              <div className="box"></div>
              <div className="logo">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 94 94"
                  className="svg"
                >
                  <path
                    d="M38.0481 4.82927C38.0481 2.16214 40.018 0 42.4481 0H51.2391C53.6692 0 55.6391 2.16214 55.6391 4.82927V40.1401C55.6391 48.8912 53.2343 55.6657 48.4248 60.4636C43.6153 65.2277 36.7304 67.6098 27.7701 67.6098C18.8099 67.6098 11.925 65.2953 7.11548 60.6663C2.37183 56.0036 3.8147e-06 49.2967 3.8147e-06 40.5456V4.82927C3.8147e-06 2.16213 1.96995 0 4.4 0H13.2405C15.6705 0 17.6405 2.16214 17.6405 4.82927V39.1265C17.6405 43.7892 18.4805 47.2018 20.1605 49.3642C21.8735 51.5267 24.4759 52.6079 27.9678 52.6079C31.4596 52.6079 34.0127 51.5436 35.6268 49.4149C37.241 47.2863 38.0481 43.8399 38.0481 39.0758V4.82927Z"
                  ></path>
                  <path
                    d="M86.9 61.8682C86.9 64.5353 84.9301 66.6975 82.5 66.6975H73.6595C71.2295 66.6975 69.2595 64.5353 69.2595 61.8682V4.82927C69.2595 2.16214 71.2295 0 73.6595 0H82.5C84.9301 0 86.9 2.16214 86.9 4.82927V61.8682Z"
                  ></path>
                  <path
                    d="M2.86102e-06 83.2195C2.86102e-06 80.5524 1.96995 78.3902 4.4 78.3902H83.6C86.0301 78.3902 88 80.5524 88 83.2195V89.1707C88 91.8379 86.0301 94 83.6 94H4.4C1.96995 94 0 91.8379 0 89.1707L2.86102e-06 83.2195Z"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
          {/* User Webcam */}
          <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center overflow-hidden">
            {camera ? (
              <Webcam
                key={camera}
                audio={false}
                videoConstraints={{ deviceId: { exact: camera } }}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <p className="text-black font-semibold">User live video</p>
            )}
          </div>
        </div>

        {/* Interview Transcript - visibility controlled */}
        {showTranscript && (
          <div className="w-full lg:w-1/3 bg-gray-900 rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2">Interview Transcript</h3>
            <div className="h-60 overflow-y-auto text-sm space-y-2">
              <p className="bg-purple-800 p-2 rounded-md">
                <strong>AI:</strong> <span>AI is asking...</span>
              </p>
              <p className="bg-purple-800 p-2 rounded-md">
                <strong>You:</strong> Good question, I am a post graduate in information systems and interned at software wing in Google.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-center gap-6">
        <button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full">Click to answer</button>
        <button className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full">End Interview</button>
      </div>

      {/* Loader CSS */}
      <style>{`
        .loader {
          --size: 160px;
          --duration: 2s;
          --logo-color: grey;
          --background: linear-gradient(
            0deg,
            rgba(50, 50, 50, 0.2) 0%,
            rgba(100, 100, 100, 0.2) 100%
          );
          height: var(--size);
          aspect-ratio: 1;
          position: relative;
        }
        .loader .box {
          position: absolute;
          background: rgba(100, 100, 100, 0.15);
          background: var(--background);
          border-radius: 50%;
          border-top: 1px solid rgba(100, 100, 100, 1);
          box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 10px -0px;
          backdrop-filter: blur(5px);
          animation: ripple var(--duration) infinite ease-in-out;
        }
        .loader .box:nth-child(1) {
          inset: 40%;
          z-index: 99;
        }
        .loader .box:nth-child(2) {
          inset: 30%;
          z-index: 98;
          border-color: rgba(100, 100, 100, 0.8);
          animation-delay: 0.2s;
        }
        .loader .box:nth-child(3) {
          inset: 20%;
          z-index: 97;
          border-color: rgba(100, 100, 100, 0.6);
          animation-delay: 0.4s;
        }
        .loader .box:nth-child(4) {
          inset: 10%;
          z-index: 96;
          border-color: rgba(100, 100, 100, 0.4);
          animation-delay: 0.6s;
        }
        .loader .box:nth-child(5) {
          inset: 0%;
          z-index: 95;
          border-color: rgba(100,  100, 100, 0.2);
          animation-delay: 0.8s;
        }
        .loader .logo {
          position: absolute;
          inset: 0;
          display: grid;
          place-content: center;
          padding: 30%;
        }
        .loader .logo svg {
          fill: var(--logo-color);
          width: 100%;
          animation: color-change var(--duration) infinite ease-in-out;
        }
        @keyframes ripple {
          0% {
            transform: scale(1);
            box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 10px -0px;
          }
          50% {
            transform: scale(1.3);
            box-shadow: rgba(0, 0, 0, 0.3) 0px 30px 20px -0px;
          }
          100% {
            transform: scale(1);
            box-shadow: rgba(0, 0, 0, 0.3) 0px 10px 10px -0px;
          }
        }
        @keyframes color-change {
          0% {
            fill: var(--logo-color);
          }
          50% {
            fill: white;
          }
          100% {
            fill: var(--logo-color);
          }
        }
      `}</style>
    </div>
  );
};

export default InterviewRoom;
