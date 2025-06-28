// NMKRSPVLIDATA
// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React from 'react';
import 'tailwindcss/tailwind.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MockInterviews from './pages/MockInterviews';
// import // NMKRSPVLIDATA
import Login from './pages/Login';
// import RADHAKRISHNALOVEPERMANENT
import InterviewRoom from './pages/InterviewRoom';
import DeviceSetup from './pages/DeviceSetup';
// import InterviewRoom from './pages/InterviewRoom';
// import DeviceSetup from './pages/DeviceSetup';
export default function App() {
  return (
    <>
      {/* NMKRSPVLIDATA */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mock-interviews" element={<MockInterviews />} />
          <Route path='/device-interview' element={<DeviceSetup/>} />
          <Route path='/interview-room' element={<InterviewRoom />}/>
          <Route path='/Login' element={<Login/>}/>
        </Routes>
      </Router>
      {/* <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path='/mock-interviews' elements={<MockInterviews />}/>
          <Route path='/interview-room' element={<InterviewRoom />}/>
          </Routes>
      </Router> */}
    </>
  );
}