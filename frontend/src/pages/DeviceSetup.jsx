// NMKRSPVLIDATA
// NMKRSPVLIDATA
// NMKRSPVLIDATA

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import Webcam from 'react-webcam';

const DeviceSetup = () => {
  const [camera, setCamera] = useState('');
  const [mic, setMic] = useState('');
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [cameraError, setCameraError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Get the topic and prompt from navigation state
  const { subject, prompt } = location.state || {};

  // Automatically request camera and mic permissions on mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // Stop all tracks after permission is granted
        stream.getTracks().forEach(track => track.stop());
      })
      .catch((err) => {
        setCameraError('Could not access camera or microphone. Please check browser permissions.');
        console.error('Permission denied or error:', err);
      });
  }, []);

  useEffect(() => {
    async function getDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        const audioInputs = devices.filter((d) => d.kind === 'audioinput');
        setCameras(videoInputs);
        setMics(audioInputs);
        if (videoInputs[0]) setCamera(videoInputs[0].deviceId);
        if (audioInputs[0]) setMic(audioInputs[0].deviceId);
        console.log('Video Inputs:', videoInputs);
        console.log('Audio Inputs:', audioInputs);
      } catch (err) {
        setCameraError('Could not access media devices. Please check browser permissions.');
        console.error('Error enumerating devices:', err);
      }
    }
    getDevices();
  }, []);

  // Webcam error handler
  const handleWebcamError = (err) => {
    setCameraError('Could not access camera. Please check browser permissions and device connection.');
    console.error('Webcam error:', err);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header Bar */}
      <div className="flex justify-between items-center px-8 py-4">
        <div className="flex items-center gap-3">
          <img src="\src\assets\Logo.jpg" alt="Logo" className="w-8 h-8 rounded" />
          <span className="text-lg font-bold">
            {prompt ? prompt : subject || 'Device Setup'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold">{user?.displayName || 'User'}</p>
            <p className="text-sm text-gray-300">{user?.email || ''}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
            <img src="https://cdn-icons-png.flaticon.com/512/9203/9203764.png" alt="Logo" className="w-8 h-8 rounded" />
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center md:flex-row gap-8">
        {/* Camera View */}
        <div className="bg-gray-300 rounded-lg w-64 h-64 flex items-center justify-center text-black text-lg font-semibold shadow overflow-hidden">
          {cameraError ? (
            <span className="text-red-600 text-center p-2">{cameraError}</span>
          ) : camera ? (
            <Webcam
              key={camera}
              audio={false}
              videoConstraints={{ deviceId: { exact: camera } }}
              className="w-full h-full object-cover rounded-lg"
              onUserMediaError={handleWebcamError}
            />
          ) : (
            <span>No camera found or not selected</span>
          )}
        </div>
        {/* Device Setup Form */}
        <div className="bg-[#2d2628] border border-gray-500 rounded-lg w-80 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-white text-center mb-4">Device Setup</h2>
          <div className="mb-4">
            <label className="block text-gray-300 mb-1" htmlFor="camera">
              Camera
            </label>
            <select
              id="camera"
              value={camera}
              onChange={e => setCamera(e.target.value)}
              className="w-full px-3 py-2 rounded bg-black text-white border border-gray-600 focus:outline-none"
            >
              {cameras.length === 0 && <option>No camera found</option>}
              {cameras.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>
                  {c.label || `Camera ${c.deviceId.slice(-4)}`}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-1" htmlFor="mic">
              Mic
            </label>
            <select
              id="mic"
              value={mic}
              onChange={e => setMic(e.target.value)}
              className="w-full px-3 py-2 rounded bg-black text-white border border-gray-600 focus:outline-none"
            >
              {mics.length === 0 && <option>No mic found</option>}
              {mics.map((m) => (
                <option key={m.deviceId} value={m.deviceId}>
                  {m.label || `Mic ${m.deviceId.slice(-4)}`}
                </option>
              ))}
            </select>
          </div>
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
            onClick={() => navigate('/interview-room', { state: { subject, prompt } })}
          >
            continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceSetup;