// NMKRSPVLIDATA
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    secretKey: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Prefer Vite env variable VITE_ADMIN_SECRET for production; fallback keeps compatibility
  const ADMIN_SECRET = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ADMIN_SECRET) || 'ACE-ADMIN-SECRET-KEY-2025';

  const handleSubmit = (e) => {
    e.preventDefault();
    // Post secret to server which will set an HttpOnly admin cookie on success
    (async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
        const res = await fetch(`${API_BASE}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ secret: credentials.secretKey })
        });
        const body = await res.json().catch(() => ({}));
        if (res.ok && body && body.success) {
          toast.success('🎉 Admin login successful!');
          navigate('/admin-dashboard');
        } else {
          toast.error(body.error || 'Invalid admin secret');
        }
      } catch (err) {
        console.error('Admin login error', err);
        toast.error('Login failed: ' + (err.message || 'Unknown'));
      }
    })();
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Decorative corner accents */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-20 w-56 h-56 rounded-full bg-gradient-to-br from-blue-200 to-transparent opacity-70 blur-3xl transform -rotate-12 sm:-left-32 sm:-top-24 sm:w-80 sm:h-80 sm:opacity-60"></div>
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-100 to-transparent opacity-60 blur-3xl transform rotate-12 sm:-right-40 sm:-bottom-24 sm:w-96 sm:h-96 sm:opacity-50"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Warning Banner */}
        <div className="bg-blue-100 border-2 border-blue-400 rounded-2xl p-4 mb-6 backdrop-blur-md">
          <div className="flex items-center gap-3 text-blue-700">
            <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-bold text-sm">RESTRICTED ACCESS</div>
              <div className="text-xs">Authorized Personnel Only</div>
            </div>
          </div>
        </div>

        {/* Login Card */}
  <div className="bg-white rounded-3xl p-8 shadow-2xl border border-blue-200">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
              🔐
            </div>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Admin Portal</h1>
            <p className="text-blue-600 text-sm">Secure Contest Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-blue-900 text-sm font-semibold mb-2">
                Admin Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:outline-none transition-all"
                placeholder="Enter admin username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-blue-900 text-sm font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/30 rounded-xl text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-all"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-700 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-blue-900 text-sm font-semibold mb-2">
                Secret Admin Key
              </label>
              <input
                type="password"
                value={credentials.secretKey}
                onChange={(e) => setCredentials({ ...credentials, secretKey: e.target.value })}
                className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl text-blue-900 placeholder-blue-400 focus:border-blue-400 focus:outline-none transition-all font-mono"
                placeholder="Enter secret key"
                required
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              🔓 Access Admin Panel
            </motion.button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-3 bg-blue-100 hover:bg-blue-200 text-blue-900 font-semibold rounded-xl transition-all border border-blue-200"
            >
              ← Back to Home
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-2 text-blue-700 text-xs">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <strong>Security Notice:</strong> All login attempts are monitored and logged. Unauthorized access attempts will be reported.
              </div>
            </div>
          </div>
        </div>

        {/* Note: remove demo credentials and use VITE_ADMIN_SECRET for production */}
        <div className="mt-4 text-center text-blue-400 text-xs">
          <div className="bg-blue-50 rounded-lg p-3">Use an environment-provided secret (VITE_ADMIN_SECRET) for admin access in production.</div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
