import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, BookOpen, Building2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

const CreateScheduledInterviewModal = ({ show, onClose, onSuccess, interview = null }) => {
  const [formData, setFormData] = useState({
    interviewName: '',
    availableFromDate: '',
    availableFromTime: '',
    availableToDate: '',
    availableToTime: '',
    duration: 30,
    interviewType: 'topic-based',
    topics: [''],
    companyName: '',
    difficulty: 'medium',
    numberOfQuestions: 5,
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (interview) {
      // Edit mode
      let availableFromDate = '', availableToDate = '';
      
      if (interview.availableFromDate) {
        availableFromDate = new Date(interview.availableFromDate).toISOString().split('T')[0];
      } else if (interview.scheduledDate) {
        // Legacy support
        availableFromDate = new Date(interview.scheduledDate).toISOString().split('T')[0];
      }
      
      if (interview.availableToDate) {
        availableToDate = new Date(interview.availableToDate).toISOString().split('T')[0];
      } else if (interview.scheduledDate) {
        // Legacy support
        availableToDate = new Date(interview.scheduledDate).toISOString().split('T')[0];
      }
      
      setFormData({
        interviewName: interview.interviewName || '',
        availableFromDate: availableFromDate,
        availableFromTime: interview.availableFromTime || interview.startTime || '',
        availableToDate: availableToDate,
        availableToTime: interview.availableToTime || interview.endTime || '',
        duration: interview.duration || 30,
        interviewType: interview.interviewType || 'topic-based',
        topics: interview.topics || [''],
        companyName: interview.companyName || '',
        difficulty: interview.difficulty || 'medium',
        numberOfQuestions: interview.numberOfQuestions || 5,
        description: interview.description || ''
      });
    } else {
      resetForm();
    }
  }, [interview, show]);

  const resetForm = () => {
    setFormData({
      interviewName: '',
      availableFromDate: '',
      availableFromTime: '',
      availableToDate: '',
      availableToTime: '',
      duration: 30,
      interviewType: 'topic-based',
      topics: [''],
      companyName: '',
      difficulty: 'medium',
      numberOfQuestions: 5,
      description: ''
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.interviewName.trim()) {
      newErrors.interviewName = 'Interview name is required';
    }

    if (!formData.availableFromDate) {
      newErrors.availableFromDate = 'Start date is required';
    }

    if (!formData.availableFromTime) {
      newErrors.availableFromTime = 'Start time is required';
    }

    if (!formData.availableToDate) {
      newErrors.availableToDate = 'End date is required';
    }

    if (!formData.availableToTime) {
      newErrors.availableToTime = 'End time is required';
    }

    // Validate that end datetime is after start datetime
    if (formData.availableFromDate && formData.availableFromTime && 
        formData.availableToDate && formData.availableToTime) {
      const startDateTime = new Date(`${formData.availableFromDate}T${formData.availableFromTime}`);
      const endDateTime = new Date(`${formData.availableToDate}T${formData.availableToTime}`);
      
      if (endDateTime <= startDateTime) {
        newErrors.availableToDate = 'End date/time must be after start date/time';
      }
    }

    if (formData.interviewType === 'topic-based') {
      const validTopics = formData.topics.filter(t => t.trim());
      if (validTopics.length === 0) {
        newErrors.topics = 'At least one topic is required';
      }
    } else if (formData.interviewType === 'company-based') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      
      // Clean up topics (remove empty entries)
      const cleanedTopics = formData.topics.filter(t => t.trim());

      const payload = {
        ...formData,
        topics: cleanedTopics,
        duration: parseInt(formData.duration),
        numberOfQuestions: parseInt(formData.numberOfQuestions)
      };

      const url = interview
        ? `${API_BASE_URL}/api/admin/scheduled-interviews/${interview.interviewId}`
        : `${API_BASE_URL}/api/admin/scheduled-interviews`;

      const method = interview ? 'PUT' : 'POST';

      // Get admin token from localStorage
      const adminToken = localStorage.getItem('ace_admin_token');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          interview ? '✅ Interview updated successfully!' : '🎉 Interview created successfully!',
          {
            position: 'top-center',
            autoClose: 3000
          }
        );
        resetForm();
        onSuccess();
        onClose();
      } else {
        toast.error('Error: ' + (data.error || 'Failed to save interview'), {
          position: 'top-right',
          autoClose: 4000
        });
      }
    } catch (error) {
      console.error('Error saving interview:', error);
      toast.error('Failed to save interview: ' + error.message, {
        position: 'top-right',
        autoClose: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = () => {
    setFormData({
      ...formData,
      topics: [...formData.topics, '']
    });
  };

  const handleRemoveTopic = (index) => {
    const newTopics = formData.topics.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      topics: newTopics.length > 0 ? newTopics : ['']
    });
  };

  const handleTopicChange = (index, value) => {
    const newTopics = [...formData.topics];
    newTopics[index] = value;
    setFormData({
      ...formData,
      topics: newTopics
    });
  };

  const handleInterviewTypeChange = (type) => {
    setFormData({
      ...formData,
      interviewType: type,
      topics: type === 'topic-based' ? [''] : [],
      companyName: type === 'company-based' ? formData.companyName : ''
    });
    setErrors({});
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-blue-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-200 bg-gradient-to-r from-blue-50 to-white">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              {interview ? 'Edit Scheduled Interview' : 'Create Scheduled Interview'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)] bg-white">
            {/* Interview Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Name *
              </label>
              <input
                type="text"
                value={formData.interviewName}
                onChange={(e) => setFormData({ ...formData, interviewName: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Full Stack Developer Interview"
              />
              {errors.interviewName && (
                <p className="text-red-400 text-sm mt-1">{errors.interviewName}</p>
              )}
            </div>

            {/* Availability Window */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  💡 <strong>Flexible Timing:</strong> Users can start the interview anytime during this window
                </p>
              </div>

              {/* Available From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={formData.availableFromDate}
                      onChange={(e) => setFormData({ ...formData, availableFromDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.availableFromDate && (
                      <p className="text-red-400 text-sm mt-1">{errors.availableFromDate}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="time"
                      value={formData.availableFromTime}
                      onChange={(e) => setFormData({ ...formData, availableFromTime: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.availableFromTime && (
                      <p className="text-red-600 text-sm mt-1">{errors.availableFromTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Available To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Until *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={formData.availableToDate}
                      onChange={(e) => setFormData({ ...formData, availableToDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.availableToDate && (
                      <p className="text-red-600 text-sm mt-1">{errors.availableToDate}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="time"
                      value={formData.availableToTime}
                      onChange={(e) => setFormData({ ...formData, availableToTime: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {errors.availableToTime && (
                      <p className="text-red-600 text-sm mt-1">{errors.availableToTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration per user */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Duration (per user) - Minutes *
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 30"
                  min="3"
                  max="240"
                />
                <p className="text-gray-600 text-xs mt-1">Each user will have this many minutes to complete the interview</p>
              </div>
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInterviewTypeChange('topic-based')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.interviewType === 'topic-based'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-blue-300'
                  }`}
                >
                  <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-gray-900 font-medium">Topic Based</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInterviewTypeChange('company-based')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.interviewType === 'company-based'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-blue-300'
                  }`}
                >
                  <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <span className="text-gray-900 font-medium">Company Based</span>
                </button>
              </div>
            </div>

            {/* Topic-based input */}
            {formData.interviewType === 'topic-based' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topics *
                </label>
                <div className="space-y-2">
                  {formData.topics.map((topic, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => handleTopicChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Topic ${index + 1}`}
                      />
                      {formData.topics.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(index)}
                          className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="w-full px-4 py-2 bg-blue-50 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Topic
                  </button>
                </div>
                {errors.topics && (
                  <p className="text-red-600 text-sm mt-1">{errors.topics}</p>
                )}
              </div>
            )}

            {/* Company-based input */}
            {formData.interviewType === 'company-based' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Google, Amazon, Microsoft"
                />
                {errors.companyName && (
                  <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>
                )}
              </div>
            )}

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questions
                </label>
                <input
                  type="number"
                  value={formData.numberOfQuestions}
                  onChange={(e) => setFormData({ ...formData, numberOfQuestions: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="20"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                placeholder="Additional information about the interview..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                disabled={loading}
              >
                {loading ? 'Saving...' : interview ? 'Update Interview' : 'Create Interview'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateScheduledInterviewModal;
