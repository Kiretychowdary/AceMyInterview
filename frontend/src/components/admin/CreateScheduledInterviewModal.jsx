import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Users, BookOpen, Building2, Plus, Trash2 } from 'lucide-react';

const CreateScheduledInterviewModal = ({ show, onClose, onSuccess, interview = null }) => {
  const [formData, setFormData] = useState({
    interviewName: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
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
      const date = new Date(interview.scheduledDate);
      const formattedDate = date.toISOString().split('T')[0];
      
      setFormData({
        interviewName: interview.interviewName || '',
        scheduledDate: formattedDate,
        startTime: interview.startTime || '',
        endTime: interview.endTime || '',
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
      scheduledDate: '',
      startTime: '',
      endTime: '',
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

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'Date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
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

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert(interview ? 'Interview updated successfully!' : 'Interview created successfully!');
        resetForm();
        onSuccess();
        onClose();
      } else {
        alert('Error: ' + (data.error || 'Failed to save interview'));
      }
    } catch (error) {
      console.error('Error saving interview:', error);
      alert('Failed to save interview: ' + error.message);
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
          className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-500/30">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              {interview ? 'Edit Scheduled Interview' : 'Create Scheduled Interview'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Interview Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interview Name *
              </label>
              <input
                type="text"
                value={formData.interviewName}
                onChange={(e) => setFormData({ ...formData, interviewName: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Full Stack Developer Interview"
              />
              {errors.interviewName && (
                <p className="text-red-400 text-sm mt-1">{errors.interviewName}</p>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.scheduledDate && (
                  <p className="text-red-400 text-sm mt-1">{errors.scheduledDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.startTime && (
                  <p className="text-red-400 text-sm mt-1">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.endTime && (
                  <p className="text-red-400 text-sm mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interview Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInterviewTypeChange('topic-based')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.interviewType === 'topic-based'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-purple-500/30 bg-slate-800/50 hover:border-purple-500/50'
                  }`}
                >
                  <BookOpen className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <span className="text-white font-medium">Topic Based</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleInterviewTypeChange('company-based')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.interviewType === 'company-based'
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-purple-500/30 bg-slate-800/50 hover:border-purple-500/50'
                  }`}
                >
                  <Building2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <span className="text-white font-medium">Company Based</span>
                </button>
              </div>
            </div>

            {/* Topic-based input */}
            {formData.interviewType === 'topic-based' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Topics *
                </label>
                <div className="space-y-2">
                  {formData.topics.map((topic, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => handleTopicChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder={`Topic ${index + 1}`}
                      />
                      {formData.topics.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(index)}
                          className="p-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="w-full px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Topic
                  </button>
                </div>
                {errors.topics && (
                  <p className="text-red-400 text-sm mt-1">{errors.topics}</p>
                )}
              </div>
            )}

            {/* Company-based input */}
            {formData.interviewType === 'company-based' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Google, Amazon, Microsoft"
                />
                {errors.companyName && (
                  <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>
                )}
              </div>
            )}

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration (min)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="10"
                  max="180"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Questions
                </label>
                <input
                  type="number"
                  value={formData.numberOfQuestions}
                  onChange={(e) => setFormData({ ...formData, numberOfQuestions: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="20"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
                placeholder="Additional information about the interview..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
