// AvatarSelector.jsx
// Interactive avatar selection component inspired by SadTalker.org UI
// Allows users to upload custom avatars or choose from presets

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Upload, User, Sparkles, X, Check, Image as ImageIcon } from 'lucide-react';

const AvatarSelector = ({ onAvatarSelect, currentAvatar = null, onClose }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Preset professional avatars
  const presetAvatars = [
    {
      id: 'professional-1',
      name: 'Professional Male',
      url: '/avatars/professional-male.jpg',
      description: 'Professional business interviewer'
    },
    {
      id: 'professional-2',
      name: 'Professional Female',
      url: '/avatars/professional-female.jpg',
      description: 'Friendly HR interviewer'
    },
    {
      id: 'tech-interviewer',
      name: 'Tech Expert',
      url: '/avatars/tech-expert.jpg',
      description: 'Technical interviewer'
    },
    {
      id: 'default',
      name: 'AI Avatar',
      url: null,
      description: 'Animated emoji avatar (fast, no setup needed)',
      isDefault: true
    }
  ];

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG or PNG image');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
      setUploadedImage(file);
      setSelectedAvatar({
        id: 'custom',
        name: 'Custom Avatar',
        url: e.target.result,
        file: file,
        isCustom: true
      });
      toast.success('✅ Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const selectPresetAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    setUploadedImage(null);
    setPreviewUrl(avatar.url);
  };

  const handleConfirm = () => {
    if (!selectedAvatar) {
      toast.warning('Please select an avatar first');
      return;
    }
    onAvatarSelect(selectedAvatar);
    toast.success('Avatar selected! 🎭');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white px-8 py-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                Choose Your AI Interviewer
              </h2>
              <p className="text-white/90 mt-2">Upload a custom image or select from our professional avatars</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Upload Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Custom Avatar
            </h3>
            
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                ${isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileInput}
                className="hidden"
              />

              {previewUrl && uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-48 h-48 object-cover rounded-full mx-auto border-4 border-blue-500 shadow-xl"
                  />
                  <p className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Image uploaded successfully!
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                      Drop your image here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Supports: JPG, PNG • Max size: 10MB
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      💡 Tip: Use a clear front-facing photo for best results
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preset Avatars */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Or Choose a Preset Avatar
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {presetAvatars.map((avatar) => (
                <motion.button
                  key={avatar.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => selectPresetAvatar(avatar)}
                  className={`
                    relative p-4 rounded-2xl border-2 transition-all
                    ${selectedAvatar?.id === avatar.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }
                  `}
                >
                  {avatar.isDefault ? (
                    <div className="w-full aspect-square bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                      <span className="text-5xl">🧑‍💼</span>
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                      {/* Replace with actual avatar images */}
                    </div>
                  )}
                  
                  <div className="mt-3 text-center">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">
                      {avatar.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {avatar.description}
                    </p>
                  </div>

                  {selectedAvatar?.id === avatar.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Avatar Features Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              AI Avatar Features
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Realistic Lip Sync:</strong> Perfect synchronization with speech</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Natural Expressions:</strong> Dynamic facial movements and eye blinking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Multi-language Support:</strong> Works with multiple languages seamlessly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">✓</span>
                <span><strong>Real-time Generation:</strong> Fast video creation for smooth interviews</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedAvatar}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Confirm Selection
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AvatarSelector;
