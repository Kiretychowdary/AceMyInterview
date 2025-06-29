import React from 'react';
import 'tailwindcss/tailwind.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MockInterviews from './pages/MockInterviews';
import Login from './pages/Login';
import InterviewRoom from './pages/InterviewRoom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeviceSetup from './pages/DeviceSetup';
// import InterviewCategoryFlow from './pages/InterviewCategoryFlow'; // adjust path if needed
function AppContent() {
  const location = useLocation();
  // Hide Navbar on /interview-room
  const hideNavbar = (location.pathname === '/interview-room') || (location.pathname === '/device-interview');

  return (
    <>
      <ToastContainer />

      {!hideNavbar && <Navbar />}
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/mock-interviews" element={<MockInterviews />} />
        <Route path="/device-setup" element={<DeviceSetup />} />
        <Route path="/interview-room" element={<InterviewRoom />} />
        <Route path="/Login" element={<Login />} />
        {/* <Route path='/inteview-category-flow' element={<InterviewCategoryFlow />} /> */}
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