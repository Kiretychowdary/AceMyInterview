// NMKRSPVLIDATA
// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React from 'react';
import 'tailwindcss/tailwind.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MockInterviews from './pages/MockInterviews';
// import InterviewRoom from './pages/InterviewRoom';

export default function App() {
  return (
    <>
      {/* NMKRSPVLIDATA */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mock-interviews" element={<MockInterviews />} />
          {/* <Route path="/interview-room" element={<InterviewRoom />} /> */}
        </Routes>
      </Router>
    </>
  );
}