// NMKRSPVLIDATAPERMANENT
// AMMARADHAKRISHNANANNA
// KSVIDPERMANENT
// KIRETY
import React from "react";
import 'tailwindcss/tailwind.css';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Home from './pages/Home.jsx';
import MockInterviews from './pages/interview/MockInterviews.jsx';
import Login from './pages/auth/Login.jsx';
import Contests from './pages/contest/Contests.jsx';
import ContestProblems from './pages/contest/ContestProblems.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Register from './pages/auth/Register.jsx';
import MCQInterview from './pages/interview/MCQInterview.jsx';
import Compiler from './pages/interview/Compiler.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FaceToFaceInterview from './pages/interview/FaceToFaceInterview.jsx';
import InterviewPreparation from './pages/interview/InterviewPreparation.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import ProfessionalAdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminContestView from './pages/admin/AdminContestView.jsx';

// ✅ ProtectedRoute component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  return children;
}

function AppContent() {
  const location = useLocation();

  const hideNavbar = false; // All pages now show navbar

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
          fontWeight: '500',
        }}
        toastStyle={{
          backgroundColor: '#ffffff',
          color: '#1f2937',
          border: '2px solid #3b82f6',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          minHeight: '70px',
          padding: '16px',
        }}
      />
      {!hideNavbar && <Navbar />}
      <main className="flex-1 w-full mx-auto px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32 max-w-screen-2xl bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<MockInterviews />} />
          <Route path="/mock-interviews" element={<MockInterviews />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/contest/:contestId/problems" element={<ProtectedRoute><ContestProblems /></ProtectedRoute>} />
          <Route path="/preparation" element={<InterviewPreparation />} />
          <Route path="/interview-preparation" element={<InterviewPreparation />} />

          {/* ✅ Protected Routes */}
          <Route path="/compiler" element={<ProtectedRoute><Compiler /></ProtectedRoute>} />
          <Route path="/mcq-interview" element={<ProtectedRoute><MCQInterview /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/face-to-face-interview" element={<ProtectedRoute><FaceToFaceInterview /></ProtectedRoute>} />

          {/* ✅ Public Routes */}
          <Route path="/Login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ✅ Admin Routes */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<ProfessionalAdminDashboard />} />
          <Route path="/admin/contest/:contestId" element={<AdminContestView />} />
        </Routes>
      </main>
    </div>
  );
}

// ✅ Wrap only with AuthProvider (no Router)
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
