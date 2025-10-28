// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../components/AuthContext';
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const login = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: registerEmail,
        password: registerPassword,
      });
      if (error) throw error;
      toast.success("Login successful!", {
        autoClose: 3000,
        position: "top-right",
        style: {
          backgroundColor: '#ecfdf5',
          color: '#065f46',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px',
          borderRadius: '10px',
          border: '2px solid #10b981'
        }
      });
      // AuthContext will update and redirect
    } catch (error) {
      toast.error(error.message || "Login failed", {
        autoClose: 5000,
        position: "top-right",
        style: {
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px',
          borderRadius: '10px',
          border: '2px solid #ef4444'
        }
      });
    }
  };

  const googleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      // On success, Supabase will handle redirect and AuthContext will update
    } catch (error) {
      toast.error(error.message || "Google login failed", {
        autoClose: 5000,
        position: "top-right",
        style: {
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px',
          borderRadius: '10px',
          border: '2px solid #ef4444'
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="form-container">
        <p className="title">Welcome back</p>
        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <input
            type="email"
            className="input"
            placeholder="Email"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
          />
          <input
            type="password"
            className="input"
            placeholder="Password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
          />
          <p className="page-link">
            <span className="page-link-label cursor-pointer">Forgot Password?</span>
          </p>
          <button type="submit" className="form-btn">
            Log in
          </button>
        </form>
        <p className="sign-up-label">
          Don't have an account?
          <span
            className="sign-up-link cursor-pointer"
            onClick={() => navigate('/register')}
          >
            Sign up
          </span>
        </p>
        <div className="buttons-container">
          <div className="google-login-button" onClick={googleLogin}>
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
            <span>Log in with Google</span>
          </div>
        </div>
      </div>
      <style>{`
        .form-container {
          width: 350px;
          background-color: #fff;
          border-radius: 10px;
          box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
          padding: 20px 30px;
        }
        .title {
          text-align: center;
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 30px;
          font-family: 'Lucida Sans', Geneva, Verdana, sans-serif;
          color: #1d4ed8;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .input {
          padding: 12px 15px;
          border-radius: 20px;
          border: 1px solid #1d4ed8;
          outline: none;
        }
        .input:focus {
          border-color: #1d4ed8;
          box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.1);
        }
        .form-btn {
          background-color: #1d4ed8;
          color: white;
          padding: 10px;
          border-radius: 20px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
          transition: background-color 0.3s ease;
        }
        .form-btn:hover {
          background-color: #1e40af;
        }
        .form-btn:active {
          box-shadow: none;
        }
        .page-link {
          text-align: right;
          font-size: 12px;
        }
        .page-link-label {
          text-decoration: underline;
          cursor: pointer;
          color: #000000;
        }
        .sign-up-label {
          margin-top: 10px;
          font-size: 12px;
          color: #000000;
        }
        .sign-up-link {
          color: #1d4ed8;
          font-weight: bold;
          cursor: pointer;
          text-decoration: underline;
        }
        .buttons-container {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .google-login-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border-radius: 20px;
          font-size: 14px;
          cursor: pointer;
          border: 1px solid #1d4ed8;
          background: white;
          color: #000000;
        }
        .google-icon {
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default Login;
