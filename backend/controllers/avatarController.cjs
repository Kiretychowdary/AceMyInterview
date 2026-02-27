/**
 * Avatar Controller - Handles AI Avatar Generation with SadTalker
 * Provides endpoints for real-time avatar video generation with lip sync
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

// SadTalker Python Service Configuration
const SADTALKER_SERVICE_URL = process.env.SADTALKER_SERVICE_URL || 'http://localhost:5001';
const TEMP_DIR = path.join(__dirname, '..', 'temp', 'avatars');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Initialize avatar with custom image
 */
exports.initializeAvatar = async (req, res) => {
  try {
    const { avatarImage } = req.body;

    const response = await axios.post(`${SADTALKER_SERVICE_URL}/api/avatar/initialize`, {
      avatarImage: avatarImage || null
    });

    res.json({
      success: true,
      message: 'Avatar initialized successfully',
      data: response.data
    });

  } catch (error) {
    console.error('❌ Error initializing avatar:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize avatar',
      details: error.response?.data || error.message
    });
  }
};

/**
 * Generate talking head video from text
 * Converts text to speech and generates lip-synced video
 */
exports.generateAvatarVideo = async (req, res) => {
  try {
    const { text, audio, options = {} } = req.body;

    if (!text && !audio) {
      return res.status(400).json({
        success: false,
        error: 'Either text or audio is required'
      });
    }

    console.log('🎬 Generating avatar video for text:', text?.substring(0, 50) + '...');

    const response = await axios.post(`${SADTALKER_SERVICE_URL}/api/avatar/generate`, {
      text,
      audio,
      preprocess: options.preprocess || 'crop',
      stillMode: options.stillMode !== undefined ? options.stillMode : false,
      useEnhancer: options.useEnhancer !== undefined ? options.useEnhancer : true,
      returnBase64: options.returnBase64 !== undefined ? options.returnBase64 : true
    }, {
      timeout: 120000 // 2 minutes timeout for video generation
    });

    res.json({
      success: true,
      message: 'Avatar video generated successfully',
      data: response.data
    });

  } catch (error) {
    console.error('❌ Error generating avatar video:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate avatar video',
      details: error.response?.data || error.message
    });
  }
};

/**
 * Quick generation optimized for real-time interviews
 * Uses faster settings with acceptable quality
 */
exports.quickGenerateAvatar = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Text is required'
      });
    }

    console.log('⚡ Quick generating avatar for:', text.substring(0, 50) + '...');

    const startTime = Date.now();

    const response = await axios.post(`${SADTALKER_SERVICE_URL}/api/avatar/quick-generate`, {
      text
    }, {
      timeout: 60000 // 1 minute timeout for quick generation
    });

    const generationTime = Date.now() - startTime;
    console.log(`✅ Avatar generated in ${generationTime}ms`);

    res.json({
      success: true,
      message: 'Avatar video generated successfully',
      generationTime,
      data: response.data
    });

  } catch (error) {
    console.error('❌ Error in quick generate:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate avatar video',
      details: error.response?.data || error.message
    });
  }
};

/**
 * Stream avatar video frames
 */
exports.streamAvatarVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream from Python service
    const response = await axios.get(`${SADTALKER_SERVICE_URL}/api/avatar/stream/${videoId}`, {
      responseType: 'stream'
    });

    response.data.pipe(res);

  } catch (error) {
    console.error('❌ Error streaming avatar:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to stream avatar video'
    });
  }
};

/**
 * Health check for SadTalker service
 * Returns availability status and service information
 */
exports.avatarServiceHealth = async (req, res) => {
  try {
    // Try to ping the SadTalker service
    const response = await axios.get(`${SADTALKER_SERVICE_URL}/health`, {
      timeout: 3000 // 3 second timeout
    });

    res.json({
      success: true,
      message: 'SadTalker service is available',
      service: {
        name: 'SadTalker Avatar Service',
        url: SADTALKER_SERVICE_URL,
        status: 'online',
        version: response.data.version || '1.0.0',
        features: {
          lipSync: true,
          multiLanguage: true,
          expressiveness: true,
          videoEnhancer: true,
          realTimeGeneration: true
        }
      }
    });

  } catch (error) {
    console.log('ℹ️ SadTalker service not available:', error.message);
    res.status(503).json({
      success: false,
      message: 'SadTalker service is not available',
      service: {
        name: 'SadTalker Avatar Service',
        url: SADTALKER_SERVICE_URL,
        status: 'offline',
        fallbackAvailable: true,
        error: error.message
      }
    });
  }
};

/**
 * Batch generate multiple avatar videos for questions
 * Useful for pre-generating interview questions
 */
exports.batchGenerateAvatars = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        error: 'Questions array is required'
      });
    }

    console.log(`📦 Batch generating ${questions.length} avatar videos...`);

    const results = [];
    const errors = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      try {
        console.log(`🎬 Generating ${i + 1}/${questions.length}: ${question.text?.substring(0, 40)}...`);

        const response = await axios.post(`${SADTALKER_SERVICE_URL}/api/avatar/quick-generate`, {
          text: question.text
        }, {
          timeout: 60000
        });

        results.push({
          index: i,
          questionId: question.id,
          success: true,
          data: response.data
        });

      } catch (error) {
        console.error(`❌ Failed to generate #${i + 1}:`, error.message);
        errors.push({
          index: i,
          questionId: question.id,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Generated ${results.length} of ${questions.length} videos`,
      results,
      errors,
      stats: {
        total: questions.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('❌ Error in batch generation:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to batch generate avatars',
      details: error.message
    });
  }
};

/**
 * Get default avatar image
 */
exports.getDefaultAvatar = async (req, res) => {
  try {
    const defaultAvatarPath = path.join(__dirname, '..', 'assets', 'default_avatar.png');
    
    if (fs.existsSync(defaultAvatarPath)) {
      res.sendFile(defaultAvatarPath);
    } else {
      res.status(404).json({
        success: false,
        error: 'Default avatar not found'
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get default avatar'
    });
  }
};

/**
 * Upload custom avatar image
 */
exports.uploadAvatarImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }

    const avatarPath = req.file.path;
    
    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(avatarPath);
    const imageBase64 = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

    // Initialize avatar with this image
    const response = await axios.post(`${SADTALKER_SERVICE_URL}/api/avatar/initialize`, {
      avatarImage: imageBase64
    });

    // Clean up temp file
    await unlink(avatarPath);

    res.json({
      success: true,
      message: 'Avatar image uploaded successfully',
      data: response.data
    });

  } catch (error) {
    console.error('❌ Error uploading avatar:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to upload avatar image',
      details: error.message
    });
  }
};

module.exports = exports;
