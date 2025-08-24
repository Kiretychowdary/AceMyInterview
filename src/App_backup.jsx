import React from "react";
import 'tailwindcss/tailwind.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import MockInterviews from './pages/MockInterviews.jsx';
import Login from './pages/Login.jsx';
import InterviewRoom from './pages/InterviewRoom.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeviceSetup from './pages/DeviceSetup.jsx';
import Register from './pages/Register.jsx';
import InterviewModeSelect from './pages/InterviewModeSelect.jsx';
import MCQInterview from './pages/MCQInterview.jsx';
import Compiler from './pages/Compiler.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FaceToFaceInterview from './pages/FaceToFaceInterview.jsx';
import DashboardTest from './pages/DashboardTest.jsx';
import { AuthProvider, useAuth } from './components/AuthContext.jsx';

// ProtectedRoute component to check authentication
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/Login" replace />;
  }
  
  return children;
}

function AppContent() {
  const location = useLocation();
  
  // Hide Navbar on specific pages
  const hideNavbar =
    location.pathname === "/interview-room" ||
    location.pathname === "/device-interview" ||
    location.pathname === "/device-setup";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          fontSize: '16px',
          fontWeight: '500'
        }}
        toastStyle={{
          backgroundColor: '#ffffff',
          color: '#1f2937',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          minHeight: '70px',
          padding: '16px'
        }}
      />
      {!hideNavbar && <Navbar />}
      <main className="flex-1 w-full mx-auto px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 max-w-screen-2xl bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mock-interviews" element={<MockInterviews />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route 
            path="/compiler" 
            element={
              <ProtectedRoute>
                <Compiler />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/device-setup" 
            element={
              <ProtectedRoute>
                <DeviceSetup />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview-room" 
            element={
              <ProtectedRoute>
                <InterviewRoom />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/interview-mode" 
            element={
              <ProtectedRoute>
                <InterviewModeSelect />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/mcq-interview" 
            element={
              <ProtectedRoute>
                <MCQInterview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/face-to-face-interview" 
            element={
              <ProtectedRoute>
                <FaceToFaceInterview />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard-test" 
            element={
              <ProtectedRoute>
                <DashboardTest />
              </ProtectedRoute>
            } 
          />
          
          {/* Public Routes */}
          <Route path="/Login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
