import React from 'react';
import 'tailwindcss/tailwind.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MockInterviews from './pages/MockInterviews';
import Login from './pages/Login';
import InterviewRoom from './pages/InterviewRoom';
import DeviceSetup from './pages/DeviceSetup';

function AppContent() {
  const location = useLocation();
  // Hide Navbar on /interview-room
  const hideNavbar = (location.pathname === '/interview-room') || (location.pathname==='/device-interview');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mock-interviews" element={<MockInterviews />} />
        <Route path="/device-interview" element={<DeviceSetup />} />
        <Route path="/interview-room" element={<InterviewRoom />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}