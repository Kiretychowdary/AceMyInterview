// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import image from '../assets/image.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Gemini API endpoint and key (replace with your actual API key)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyAPPmXjX3_uY40381jTjoHvYkJR6uLnf9U"; // <-- Replace with your Gemini API key

const InterviewRoom = () => {
  const [time, setTime] = useState(1800); // 30 minutes in seconds
  const [camera, setCamera] = useState('');
  const [cameras, setCameras] = useState([]);
  const [showTranscript, setShowTranscript] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Welcome! Tell me about yourself.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();
  const transcriptRef = useRef(null);
  const recognitionRef = useRef(null);
  useEffect(() => {
    const handleTabSwitch = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          toast.warn(
            'You switched tabs or minimized the window. Please stay on the interview page!',
            {
              toastId: 'tab-switch-warning',
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "colored",
            }
          );
          if (next >= 3) {
            toast.error('You have switched tabs too many times. Redirecting...', {
              position: "top-center",
              autoClose: 2000,
              theme: "colored",
            });
            setTimeout(() => navigate('/mock-interviews'), 2000);
          }
          
          return next;
        });
      }
       else {
        // When user comes back and tab switches are less than 3, force fullscreen again
        setTabSwitchCount((prev) => {
          if (prev < 3) {
            setTimeout(() => {
              if (window.screenfull && window.screenfull.isEnabled) {
                window.screenfull.request();
              } else if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
              }
            }, 300);
          }
          return prev;
        });
      }
    };
    document.addEventListener('visibilitychange', handleTabSwitch);
    return () => document.removeEventListener('visibilitychange', handleTabSwitch);
  }, [navigate]);
  // On mount: If redirected with state, start AI interview automatically
  useEffect(() => {
    if (window.screenfull && window.screenfull.isEnabled) {
      window.screenfull.request();
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    // Get topic/subtopic from location.state and start interview
    if (window.history.state && window.history.state.usr) {
      const { category, topic, subtopic } = window.history.state.usr;
      if (topic && subtopic) {
        const introPrompt = `You are an AI interviewer. Start a professional interview for the position of ${topic} focusing on ${subtopic}. Ask your first question.`;
        setMessages([{ role: 'ai', text: introPrompt }]);
      }
    }
  }, []);
  // Timer
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

  useEffect(() => {
    const handleTabSwitch = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          toast.warn('You switched tabs or minimized the window. Please stay on the interview page!', {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          });
          if (next >= 3) {
            toast.error('You have switched tabs too many times. Redirecting...', {
              position: "top-center",
              autoClose: 2000,
              theme: "colored",
            });
            setTimeout(() => navigate('/mock-interviews'), 2000);
          }
          else {
        // When user comes back, force fullscreen again
        setTimeout(() => {
          if (window.screenfull && window.screenfull.isEnabled) {
            window.screenfull.request();
          } else if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
          }
        }, 300);
      }
          return next;
        });
      }
       else {
        // When user comes back, force fullscreen again
        setTimeout(() => {
          if (window.screenfull && window.screenfull.isEnabled) {
            window.screenfull.request();
          } else if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
          }
        }, 300);
      }
    };
    document.addEventListener('visibilitychange', handleTabSwitch);
    return () => document.removeEventListener('visibilitychange', handleTabSwitch);
  }, [navigate]);

  // Scroll transcript to bottom on new message
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [messages, showTranscript]);

  // Timer formatting
  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  // Toggle transcript visibility
  const handleVisibilityChange = () => {
    setShowTranscript((prev) => {
      const next = !prev;
       toast.error(next ? "Transcript is now visible." : "Transcript is now hidden.");
      return next;
    });
  };

  // Handle user input and send to Gemini API
  const handleSend = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            ...newMessages.map((msg) => ({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            }))
          ]
        })
      });
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: 'ai', text: aiText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: "Sorry, there was an error connecting to Gemini." }
      ]);
    }
    setLoading(false);
  };

  // Enter key to send
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSend();
    }
  };

  // Speech Recognition setup
  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
       toast.error('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
      // Optionally, auto-send after recording:
      // handleSend();
    };
recognition.onerror = () => {
  setIsRecording(false);
  toast.error('Speech recognition error.');
};

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Speak AI message
  useEffect(() => {
    // Find the last AI message
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'ai') {
      const utterance = new window.SpeechSynthesisUtterance(lastMsg.text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] text-white p-4 flex flex-col gap-8">
      {/* Header */}
      {/* <ToastContainer /> */}
      <motion.div
        className="flex justify-between items-center bg-[#10131a] p-6 rounded-xl shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
      >
        <h2 className="text-2xl font-bold tracking-wide">Software Developer</h2>
        <motion.div
          className="bg-green-500 px-6 py-2 rounded-full text-black font-bold text-lg shadow"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          00:{formatTime(time)}
        </motion.div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-lg">Vara prasad</p>
            <p className="text-sm text-gray-300">Chinnikirety123@gmail.com</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#a47cf3] to-[#683fea] text-black flex items-center justify-center shadow-lg">
            <span className="material-icons text-2xl">person</span>
          </div>
        </div>
      </motion.div>

      {/* Toggle Button */}
      <div className="flex justify-end">
        <motion.button
          onClick={handleVisibilityChange}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 px-6 py-2 rounded-full font-semibold shadow-lg transition-all duration-300"
          whileTap={{ scale: 0.95 }}
        >
          {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
        </motion.button>
      </div>

      {/* Main Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div
          className="flex-1 bg-gradient-to-br from-[#4e0066] to-[#2e0859] rounded-2xl p-8 flex flex-col lg:flex-row items-center justify-around shadow-xl"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
        >
          {/* AI Loader */}
          <motion.div
            className="w-56 h-56 bg-white rounded-full flex items-center justify-center shadow-2xl"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring" }}
          >
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
                  <path d="M38.0481 4.82927C38.0481 2.16214 40.018 0 42.4481 0H51.2391C53.6692 0 55.6391 2.16214 55.6391 4.82927V40.1401C55.6391 48.8912 53.2343 55.6657 48.4248 60.4636C43.6153 65.2277 36.7304 67.6098 27.7701 67.6098C18.8099 67.6098 11.925 65.2953 7.11548 60.6663C2.37183 56.0036 3.8147e-06 49.2967 3.8147e-06 40.5456V4.82927C3.8147e-06 2.16213 1.96995 0 4.4 0H13.2405C15.6705 0 17.6405 2.16214 17.6405 4.82927V39.1265C17.6405 43.7892 18.4805 47.2018 20.1605 49.3642C21.8735 51.5267 24.4759 52.6079 27.9678 52.6079C31.4596 52.6079 34.0127 51.5436 35.6268 49.4149C37.241 47.2863 38.0481 43.8399 38.0481 39.0758V4.82927Z"></path>
                  <path d="M86.9 61.8682C86.9 64.5353 84.9301 66.6975 82.5 66.6975H73.6595C71.2295 66.6975 69.2595 64.5353 69.2595 61.8682V4.82927C69.2595 2.16214 71.2295 0 73.6595 0H82.5C84.9301 0 86.9 2.16214 86.9 4.82927V61.8682Z"></path>
                  <path d="M2.86102e-06 83.2195C2.86102e-06 80.5524 1.96995 78.3902 4.4 78.3902H83.6C86.0301 78.3902 88 80.5524 88 83.2195V89.1707C88 91.8379 86.0301 94 83.6 94H4.4C1.96995 94 0 91.8379 0 89.1707L2.86102e-06 83.2195Z"></path>
                </svg>
              </div>
            </div>
          </motion.div>
          {/* User Webcam */}
          <motion.div
            className="w-56 h-56 bg-white rounded-full flex items-center justify-center overflow-hidden shadow-2xl"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
          >
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
          </motion.div>
        </motion.div>

        {/* Interview Transcript - visibility controlled */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              className="w-full lg:w-1/3 bg-[#10131a] rounded-2xl p-6 shadow-xl flex flex-col"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <h3 className="text-xl font-semibold mb-4">Interview Transcript</h3>
              <div
                className="h-60 overflow-y-auto text-base space-y-3 flex-1"
                ref={transcriptRef}
                style={{ scrollbarWidth: 'thin' }}
              >
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    className={`p-3 rounded-lg ${msg.role === 'ai'
                      ? 'bg-gradient-to-r from-[#7b2ff2] to-[#f357a8] font-semibold'
                      : 'bg-gradient-to-r from-[#232526] to-[#2c5364] text-white'
                      }`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <strong>{msg.role === 'ai' ? 'AI' : 'You'}:</strong> {msg.text}
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    className="p-3 rounded-lg bg-gradient-to-r from-[#7b2ff2] to-[#f357a8] font-semibold"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <strong>AI:</strong> <span>Typing...</span>
                  </motion.div>
                )}
              </div>
              {/* Input for user */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-full px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[#7b2ff2] transition"
                  placeholder="Type your answer and press Enter..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  disabled={loading || isRecording}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-gradient-to-r from-[#7b2ff2] to-[#f357a8] px-6 py-2 rounded-full font-semibold shadow-lg transition-all duration-300 hover:from-[#f357a8] hover:to-[#7b2ff2] disabled:opacity-60"
                >
                  Send
                </button>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-full font-semibold shadow-lg transition-all duration-300 ${isRecording
                    ? 'bg-red-500 text-white'
                    : 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                    }`}
                  disabled={loading}
                >
                  {isRecording ? 'Stop' : 'Record'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Buttons */}
      <motion.div
        className="flex justify-center gap-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, type: "spring" }}
      >
        <button className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300">
          Click to answer
        </button>
        <button className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 px-8 py-3 rounded-full text-lg font-semibold shadow-lg transition-all duration-300">
          End Interview
        </button>
      </motion.div>

      {/* Loader CSS */}
      <style>{`
        .loader {
          --size: 180px;
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
