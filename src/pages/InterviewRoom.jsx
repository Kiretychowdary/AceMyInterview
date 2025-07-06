// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { toast } from "react-toastify";

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
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setLoading(true);

    try {
      const prompt = `You are an AI interviewer. First, ask the user for their name and a brief introduction. Then, conduct a technical interview on the topic "${topic}", starting from basic to advanced concepts. For each sub-topic, ask no more than 2 questions at a time, and wait for the user's answers before proceeding. After the user answers, ask the next question related to the topic, moving step by step through the interview.\nThe user answered: "${userText}"\nNow ask the next question related to the topic.`;

      const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      });
      const data = await res.json();
      const aiText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
      speak(aiText);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, there was an error connecting to Gemini." },
      ]);
    }
    setLoading(false);
    setInput("");
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
    <div className="min-h-screen bg-gradient-to-br from-[#232526] via-[#414345] to-[#232526] flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-4xl bg-white/90 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left: Webcam & Info */}
        <div className="md:w-1/3 bg-gradient-to-br from-blue-700 to-purple-700 flex flex-col items-center justify-center p-8">
          <div className="w-40 h-40 bg-black rounded-2xl overflow-hidden mb-6 border-4 border-white shadow-lg">
            {camera ? (
              <Webcam
                key={camera}
                audio={false}
                videoConstraints={{ deviceId: { exact: camera } }}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white flex items-center justify-center h-full">Camera</span>
            )}
          </div>
          <select
            value={camera}
            onChange={(e) => setCamera(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white text-gray-800 font-semibold shadow focus:outline-none"
          >
            {cameras.length === 0 && <option>No camera found</option>}
            {cameras.map((c) => (
              <option key={c.deviceId} value={c.deviceId}>
                {c.label || `Camera ${c.deviceId.slice(-4)}`}
              </option>
            ))}
          </select>
          <div className="mt-8 text-center">
            <h2 className="text-xl font-bold text-white mb-1">{topic}</h2>
            <p className="text-white/80 text-sm">AI Interview Mode</p>
          </div>
        </div>

        {/* Right: Chat */}
        <div className="flex-1 flex flex-col bg-white/80 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Interview Chat
          </h1>
          <div
            className="flex-1 overflow-y-auto space-y-4 pb-2"
            style={{ minHeight: 300, maxHeight: 400 }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`px-5 py-3 rounded-2xl shadow-md max-w-[75%] ${
                    msg.role === "ai"
                      ? "bg-gradient-to-r from-blue-100 to-purple-100 text-blue-900"
                      : "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                  }`}
                >
                  <span className="block font-semibold mb-1">
                    {msg.role === "ai" ? "AI" : "You"}
                  </span>
                  <span>{msg.text}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-5 py-3 rounded-2xl shadow-md bg-gradient-to-r from-blue-100 to-purple-100 text-blue-900 max-w-[75%]">
                  <span className="block font-semibold mb-1">AI</span>
                  <span>Typing...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          {/* Text Input & Record/Stop/Send Button */}
          <div className="mt-6 flex gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 rounded-full border-2 border-purple-300 focus:border-blue-400 focus:outline-none text-gray-800 font-semibold bg-white shadow"
              placeholder="Type your answer or use Record..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInputSend()}
              disabled={!canAnswer || loading || isRecording}
            />
            <button
              onClick={handleInputSend}
              disabled={loading || !input.trim() || isRecording}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all duration-300 disabled:opacity-60"
            >
              Send
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!canAnswer || loading}
              className={`px-6 py-3 rounded-full font-bold shadow-lg transition-all duration-300 ${
                isRecording
                  ? "bg-red-500 text-white"
                  : "bg-gradient-to-r from-green-400 to-green-600 text-white"
              }`}
            >
              {isRecording ? "Stop" : "Record"}
            </button>
          </div>
          <div className="text-center text-gray-500 text-xs mt-2">
            🎤 Click "Record", then "Send" to answer by voice, or type your answer.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
