// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React, { useState } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../components/AuthContext';
import "tailwindcss/tailwind.css";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, signInWithGoogle, signUpWithEmail } = useAuth();

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUpWithEmail(email, password);

      if (error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          toast.error('This email is already registered. Please login instead.', {
            position: "top-right",
            autoClose: 4000,
          });
        } else {
          toast.error(`Registration failed: ${error.message}`, {
            position: "top-right",
            autoClose: 4000,
          });
        }
        return;
      }

      toast.success(
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🎉</span>
            <span>Welcome to AceMyInterview!</span>
          </div>
          <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#166534' }}>
            Your account has been created successfully.<br/>
            <span style={{ fontWeight: '600' }}>Redirecting to dashboard...</span>
          </div>
        </div>,
        {
          autoClose: 3000,
          position: "top-center",
          style: {
            backgroundColor: '#f0fdf4',
            color: '#14532d',
            padding: '20px',
            borderRadius: '16px',
            border: '3px solid #22c55e',
            boxShadow: '0 10px 40px rgba(34, 197, 94, 0.3)',
            maxWidth: '450px'
          },
          icon: false
        }
      );
      
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.', {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        toast.error(`Google Sign-In failed: ${error.message}`, {
          autoClose: 4000,
          position: "top-right",
        });
      }
    } catch (error) {
      toast.error("Google Sign-In failed. Please try again.", {
        autoClose: 4000,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-4">
      {/* Decorative corner accents matching home page */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-16 w-44 h-44 rounded-full bg-gradient-to-br from-blue-100 to-transparent opacity-60 blur-2xl transform -rotate-12 sm:-left-32 sm:-top-24 sm:w-72 sm:h-72 sm:opacity-50"></div>
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-12 w-52 h-52 rounded-full bg-gradient-to-tr from-blue-100 to-transparent opacity-55 blur-2xl transform rotate-12 sm:-right-40 sm:-bottom-24 sm:w-96 sm:h-96 sm:opacity-45"></div>
      
      <motion.div 
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div 
          className="bg-white rounded-2xl shadow-2xl p-8 space-y-6 border border-blue-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Start your interview preparation journey
            </p>
          </motion.div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? 'Signing up...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Re-enter your password"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
