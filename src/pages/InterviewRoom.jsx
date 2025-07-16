// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { toast } from "react-toastify";
import { useAuth } from '../components/AuthContext';

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyAPPmXjX3_uY40381jTjoHvYkJR6uLnf9U";

const InterviewRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [camera, setCamera] = useState("");
  const [cameras, setCameras] = useState([]);
  const [canAnswer, setCanAnswer] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const tabSwitchCount = useRef(0);
  const [lastSpokenIdx, setLastSpokenIdx] = useState(-1);
  const [showInput, setShowInput] = useState(false);
  const [timer, setTimer] = useState(30 * 60); // 30 min in seconds
  const { user } = useAuth();

  useEffect(() => {
    async function getDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setCameras(videoInputs);
      if (videoInputs[0]) setCamera(videoInputs[0].deviceId);
    }
    getDevices();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Request fullscreen on load
  useEffect(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
  }, []);

  // Tab switch detection and toast
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        tabSwitchCount.current++;
      } else if (document.visibilityState === "visible") {
        toast.warn("Tab switch detected! Stay focused on the interview.");
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        if (tabSwitchCount.current >= 2) {
          toast.error("Too many tab switches. Redirecting...");
          navigate("/mock-interviews");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [navigate]);

  useEffect(() => {
    if (!topic) return;
    setLoading(true);
    setCanAnswer(false);
    const prompt = `You are an AI interviewer. Start a classic interview by first asking the user for their name and a brief introduction. Then, conduct a technical interview on the topic "${topic}", moving from basic to advanced concepts, topic by topic. For each sub-topic, ask only 1 or 2 short questions at a time, and wait for the user's answer before proceeding. Keep your questions concise.`;
    fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const aiText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Sorry, I couldn't generate a response.";
        setMessages([{ role: "ai", text: aiText }]);
        speak(aiText);
        setCanAnswer(true);
      })
      .finally(() => setLoading(false));
  }, [topic]);

  // Timer logic
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Speak only once per new AI message
  useEffect(() => {
    if (!messages.length) return;
    const lastIdx = messages.length - 1;
    const lastMsg = messages[lastIdx];
    if (lastMsg.role === 'ai' && lastSpokenIdx !== lastIdx) {
      window.speechSynthesis.cancel();
      speak(lastMsg.text);
      setLastSpokenIdx(lastIdx);
    }
  }, [messages, lastSpokenIdx]);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      recognition.stop();
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
      setInput("");
    }
  };

  const handleSend = async (userText) => {
    if (!userText.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);
    setShowInput(false);
    try {
      const prompt = `You are an AI interviewer. First, ask the user for their name and a brief introduction. Then, conduct a technical interview on the topic "${topic}", starting from basic to advanced concepts. For each sub-topic, ask no more than 2 questions at a time, and wait for the user's answers before proceeding. After the user answers, ask the next question related to the topic, moving step by step through the interview.\nThe user answered: "${userText}"\nNow ask the next question related to the topic.`;
      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
        }),
      });
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: 'ai', text: aiText }]);
      setCanAnswer(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, there was an error connecting to Gemini.' },
      ]);
    }
    setLoading(false);
    setInput('');
  };

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const handleInputSend = () => {
    if (input.trim()) {
      handleSend(input);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-1 py-2 md:py-6 md:px-4">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 py-2 md:py-4 bg-black border-b border-gray-700" style={{maxWidth:'100vw'}}>
        <div className="flex items-center gap-3">
          <img src="/src/assets/Logo.jpg" alt="Logo" className="w-8 h-8 rounded" />
          <span className="text-lg md:text-xl font-bold text-white">{topic || 'Interview'}</span>
        </div>
        <div className="flex-1 flex justify-center">
          <span className="bg-green-600 text-white font-bold px-4 py-1 rounded-full text-sm md:text-base">
            {`${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-white">{user?.displayName || 'User'}</p>
            <p className="text-xs text-gray-300">{user?.email || ''}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
            <img src="https://cdn-icons-png.flaticon.com/512/9203/9203764.png" alt="User" className="w-8 h-8 rounded" />
          </div>
        </div>
      </div>
      {/* Main Area */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-4 bg-black rounded-b-3xl pb-4 md:pb-8 px-2 md:px-8 mt-20">
        {/* Center: AI & User Video */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-[#2d2233] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <img src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" alt="AI" className="w-24 h-24 md:w-32 md:h-32" />
            </div>
            <span className="text-white font-semibold mt-2">AI Interviewer</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
              {camera ? (
                <Webcam
                  key={camera}
                  audio={false}
                  videoConstraints={{ deviceId: { exact: camera } }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-black">User live video</span>
              )}
            </div>
            <select
              value={camera}
              onChange={(e) => setCamera(e.target.value)}
              className="w-32 px-2 py-1 rounded-lg bg-white text-gray-800 font-semibold shadow focus:outline-none text-xs md:text-base mt-1"
            >
              {cameras.length === 0 && <option>No camera found</option>}
              {cameras.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || `Camera ${c.deviceId.slice(-4)}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Right: Transcript/Chat */}
        <div className="w-full md:w-1/3 bg-[#231f24] rounded-2xl p-3 md:p-5 flex flex-col min-h-[300px] max-h-[420px] overflow-y-auto border border-gray-700">
          <h2 className="text-white text-lg font-bold mb-2">Interview Transcript</h2>
          <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                <div className={`px-3 py-2 rounded-xl max-w-[90%] text-xs md:text-sm shadow ${msg.role === 'ai' ? 'bg-[#3a2c4d] text-green-300' : 'bg-[#e9d5ff] text-black'}`}>
                  <span className="block font-semibold mb-1">{msg.role === 'ai' ? 'AI' : 'You'}</span>
                  <span>{msg.text}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl bg-[#3a2c4d] text-green-300 max-w-[90%] text-xs md:text-sm shadow">
                  <span className="block font-semibold mb-1">AI</span>
                  <span>Typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-4 mt-4 px-2">
        <button
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow transition"
          onClick={() => setShowInput(true)}
          disabled={loading || !canAnswer}
        >
          Click to answer
        </button>
        <button
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow transition"
          onClick={() => navigate('/mock-interviews')}
        >
          End Interview
        </button>
      </div>
      {/* Answer Input Modal */}
      {showInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" style={{ backdropFilter: 'blur(2px)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 flex flex-col gap-4">
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Your Answer</h3>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-gray-300 p-3 text-gray-800 focus:outline-none focus:border-blue-400"
              placeholder="Type your answer or use Record..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => { handleSend(input); setShowInput(false); }}
                disabled={loading || !input.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow transition disabled:opacity-60"
              >
                Send
              </button>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`flex-1 ${isRecording ? 'bg-red-500' : 'bg-green-500'} text-white font-bold py-2 rounded-lg shadow transition`}
              >
                {isRecording ? 'Stop' : 'Record'}
              </button>
              <button
                onClick={() => setShowInput(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg shadow transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;
