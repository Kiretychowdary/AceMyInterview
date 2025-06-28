// NMKRSPVLIDATA

import React, { useState } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';

const DeviceSetup = ({ onContinue }) => {
  const [camera, setCamera] = useState('');
  const [mic, setMic] = useState('');
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const navigate = useNavigate();

  // Get available devices
  React.useEffect(() => {
    async function getDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      const audioInputs = devices.filter((d) => d.kind === 'audioinput');
      setCameras(videoInputs);
      setMics(audioInputs);
      if (videoInputs[0]) setCamera(videoInputs[0].deviceId);
      if (audioInputs[0]) setMic(audioInputs[0].deviceId);
    }
    getDevices();
  }, []);

  return (
    
    <div className="min-h-screen bg-black text-white p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center bg-gray-900 p-4 rounded-md">
        <h2 className="text-xl font-semibold">Software Developer</h2>
        
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
      {/* Camera View */}
      <div className="flex flex-col items-center justify-center lg:flex-row gap-4">
      <div className="bg-gray-300 rounded-lg w-64 h-64 flex items-center justify-center text-black text-lg font-semibold shadow overflow-hidden">
        {camera ? (
          <Webcam
            key={camera}
            audio={false}
            videoConstraints={{ deviceId: { exact: camera } }}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span>user camera view</span>
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
          onClick={() => navigate('/interview-room')}
        >
          continue
        </button>
      </div>
      </div>
    </div>
  );
};

export default DeviceSetup;