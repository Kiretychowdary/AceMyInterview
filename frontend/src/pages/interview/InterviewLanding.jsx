import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const InterviewLanding = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadInterview = async () => {
      try {
        setLoading(true);
        
        // Fetch interview details from backend (public endpoint)
        const response = await axios.get(`${API_BASE_URL}/api/public/custom-interviews/${interviewId}`);
        
        if (response.data.success) {
          const interview = response.data.interview;
          
          // Check if interview has expired
          if (interview.expiresAt) {
            const expiryDate = new Date(interview.expiresAt);
            const currentDate = new Date();
            
            if (currentDate > expiryDate) {
              setError(`This interview has expired. The deadline was ${expiryDate.toLocaleString()}.`);
              setLoading(false);
              return;
            }
          }
          
          // Check if user has already participated (if logged in)
          if (user?.uid) {
            try {
              const participationCheck = await axios.get(
                `${API_BASE_URL}/api/public/custom-interviews/${interviewId}/check-participation/${user.uid}`
              );
              
              if (participationCheck.data.hasParticipated) {
                setError('You have already completed this interview. Each user can only take this interview once.');
                setLoading(false);
                return;
              }
            } catch (err) {
              console.error('Error checking participation:', err);
              // Continue even if check fails
            }
          }
          
          // Navigate to face-to-face interview with interview data
          // KEEP interviewId in URL for tracking and persistence
          navigate(`/interview/${interviewId}/start`, {
            replace: true,
            state: {
              subject: interview.role,
              topic: interview.title,
              jobRole: interview.role,
              difficulty: interview.difficulty,
              numberOfQuestions: interview.numberOfQuestions,
              duration: interview.duration,
              subTopicDescription: interview.description || `${interview.title} - ${interview.role}`,
              customInterview: true,
              interviewId: interview.interviewId,
              interviewTitle: interview.title,
              settings: interview.settings
            }
          });
        } else {
          setError('Interview not found or is no longer available');
        }
      } catch (err) {
        console.error('Error loading interview:', err);
        setError(
          err.response?.data?.error || 
          'Failed to load interview. The interview may not exist or has expired.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      loadInterview();
    } else {
      setError('Invalid interview link');
      setLoading(false);
    }
  }, [interviewId, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Interview...</h2>
          <p className="text-gray-400">Please wait while we prepare your interview</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-4">Interview Not Available</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default InterviewLanding;
