// NMKRSPVLIDATAPERMANENT
// AMMARADHAKRISHNANANNA
// KSVIDPERMANENT
// KIRETY
import React from 'react';
import 'tailwindcss/tailwind.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import MockInterviews from './pages/MockInterviews.jsx';
import Login from './pages/Login.jsx';
import InterviewRoom from './pages/InterviewRoom.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeviceSetup from './pages/DeviceSetup.jsx';
import Register from './pages/Register.jsx';
import { useAuth } from "./components/AuthContext.jsx"; // Ensure this path is correct
import InterviewModeSelect from './pages/InterviewModeSelect.jsx';
import MCQInterview from './pages/MCQInterview.jsx'; // Ensure this path is correct
import Compiler from './pages/Compiler.jsx';
// import InterviewCategoryFlow from './pages/InterviewCategoryFlow'; // adjust path if needed
function AppContent() {
  const location = useLocation();
  // Hide Navbar on /interview-room
  const hideNavbar =
    location.pathname === "/interview-room" ||
    location.pathname === "/device-interview" ||
    location.pathname === "/device-setup";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ToastContainer />
      {!hideNavbar && <Navbar />}
      <main className="flex-1 w-full mx-auto px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 max-w-screen-2xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mock-interviews" element={<MockInterviews />} />
          <Route path="/compiler" element={<Compiler />} />
          <Route path="/device-setup" element={<DeviceSetup />} />
          <Route path="/interview-room" element={<InterviewRoom />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/interview-mode" element={<InterviewModeSelect />} />
          <Route path="/mcq-interview" element={<MCQInterview />} />
          {/* <Route path='/inteview-category-flow' element={<InterviewCategoryFlow />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}