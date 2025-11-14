// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React, { useState } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import "tailwindcss/tailwind.css";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      
      toast.success("Welcome! Your account has been created successfully!", {
        autoClose: 4000,
        position: "top-right",
        style: {
          backgroundColor: '#f0fdf4',
          color: '#14532d',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px',
          borderRadius: '10px',
          border: '2px solid #22c55e',
          boxShadow: '0 6px 20px rgba(34, 197, 94, 0.15)'
        }
      });
      // Google OAuth will handle redirect automatically
    } catch (error) {
      console.error("Registration error:", error.message);
      toast.error(error.message || "Signup failed. Please try again.", {
        autoClose: 5000,
        position: "top-right",
        style: {
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px',
          borderRadius: '10px',
          border: '2px solid #ef4444',
          boxShadow: '0 6px 20px rgba(239, 68, 68, 0.15)'
        }
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="form-container">
        <p className="title">Create Your Account</p>
        <div className="signup-description">
          <h3 className="signup-subtitle">Join AceMyInterview Today!</h3>
          <p className="signup-text">
            Get started with your coding interview preparation journey. 
            Sign up with Google to access personalized mock interviews, contests, and more.
          </p>
        </div>
        
        <div className="buttons-container">
          <div className={`google-signup-button ${loading ? 'disabled' : ''}`} onClick={!loading ? handleGoogleSignup : undefined}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" version="1.1" x="0px" y="0px" className="google-icon" viewBox="0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12
    c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24
    c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657
    C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36
    c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571
    c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            <span>{loading ? 'Creating Account...' : 'Sign up with Google'}</span>
          </div>
        </div>

        <div className="features-list">
          <h4 className="features-title">What you'll get:</h4>
          <ul className="features">
            <li>✨ Personalized mock interviews</li>
            <li>🏆 Coding contests and challenges</li>
            <li>📊 Real-time progress tracking</li>
            <li>🎯 AI-powered interview feedback</li>
          </ul>
        </div>

        <p className="sign-up-label">
          Already have an account?
          <span className="sign-up-link cursor-pointer" onClick={() => navigate('/Login')}>
           Login here
          </span>
        </p>
      </div>

      {/* Inline Styles */}
      <style>{`
        .form-container {
          width: 400px;
          background-color: #fff;
          border-radius: 16px;
          box-shadow: rgba(0, 0, 0, 0.1) 0px 10px 50px;
          padding: 32px 40px;
          border: 1px solid #e5e7eb;
        }
        .title {
          text-align: center;
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 16px;
          font-family: 'Lucida Sans', Geneva, Verdana, sans-serif;
          color: #1d4ed8;
        }
        .signup-description {
          text-align: center;
          margin-bottom: 32px;
        }
        .signup-subtitle {
          font-size: 18px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        .signup-text {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }
        .buttons-container {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .google-signup-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border: 2px solid #1d4ed8;
          background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(29, 78, 216, 0.3);
        }
        .google-signup-button:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(29, 78, 216, 0.4);
        }
        .google-signup-button.disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .google-icon {
          font-size: 20px;
        }
        .features-list {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }
        .features-title {
          font-size: 16px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }
        .features {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .features li {
          font-size: 14px;
          color: #4b5563;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sign-up-label {
          text-align: center;
          font-size: 14px;
          color: #6b7280;
        }
        .sign-up-link {
          color: #1d4ed8;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          margin-left: 4px;
        }
        .sign-up-link:hover {
          color: #1e40af;
        }
      `}</style>
    </div>
  );
};

export default Register;
