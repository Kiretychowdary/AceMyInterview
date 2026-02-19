// NMKRSPVLIDATA - Ollama Service for Local LLM Integration
const axios = require('axios');

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:7b';

/**
 * Generate text completion using Ollama
 * @param {string} prompt - The prompt to send to the model
 * @param {Object} options - Additional options (temperature, max_tokens, etc.)
 * @returns {Promise<string>} Generated text response
 */
async function generateCompletion(prompt, options = {}) {
  try {
    const {
      model = OLLAMA_MODEL,
      temperature = 0.7,
      maxTokens = 4000,
      stream = false,
      format = null // Can be "json" to force JSON output
    } = options;

    const requestBody = {
      model: model,
      prompt: prompt,
      stream: stream,
      options: {
        temperature: temperature,
        num_predict: maxTokens,
      }
    };

    // Add format if specified (forces structured output)
    if (format === 'json') {
      requestBody.format = 'json';
      console.log('🔧 Enforcing JSON format in Ollama request');
    }

    const response = await axios.post(
      `${OLLAMA_API_URL}/api/generate`,
      requestBody,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000 // 2 minutes timeout for local processing
      }
    );

    let responseText = response.data.response;
    
    console.log('📥 Ollama raw response length:', responseText.length, 'characters');
    
    // Validate JSON is complete - if not, try to complete it
    const trimmed = responseText.trim();
    if (trimmed.startsWith('{') && !trimmed.endsWith('}')) {
      console.log('⚠️ Incomplete JSON detected, attempting to complete...');
      
      // Count opening and closing braces  
      const openBraces = (responseText.match(/{/g) || []).length;
      const closeBraces = (responseText.match(/}/g) || []).length;
      const missingBraces = openBraces - closeBraces;
      
      if (missingBraces > 0) {
        // Add missing closing braces
        responseText += '}'.repeat(missingBraces);
        console.log(`✅ Added ${missingBraces} closing brace(s) to complete JSON`);
      }
      
      // Also check for unclosed strings or arrays
      if (responseText.includes('"') && (responseText.match(/"/g) || []).length % 2 !== 0) {
        console.log('⚠️ Unclosed string detected, adding closing quote');
        responseText += '"';
      }
      
      if (responseText.includes('[') && (responseText.match(/\[/g) || []).length > (responseText.match(/]/g) || []).length) {
        const missingBrackets = (responseText.match(/\[/g) || []).length - (responseText.match(/]/g) || []).length;
        console.log(`⚠️ Unclosed array detected, adding ${missingBrackets} closing bracket(s)`);
        responseText += ']'.repeat(missingBrackets);
      }
    }
    
    return responseText;
  } catch (error) {
    console.error('Ollama API Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama service is not running. Please start it with: ollama serve');
    }
    throw error;
  }
}

/**
 * Chat completion with conversation context
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Generated response
 */
async function chatCompletion(messages, options = {}) {
  try {
    const {
      model = OLLAMA_MODEL,
      temperature = 0.7,
      maxTokens = 2000
    } = options;

    const response = await axios.post(
      `${OLLAMA_API_URL}/api/chat`,
      {
        model: model,
        messages: messages,
        stream: false,
        options: {
          temperature: temperature,
          num_predict: maxTokens,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120000
      }
    );

    return response.data.message.content;
  } catch (error) {
    console.error('Ollama Chat API Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama service is not running. Please start it with: ollama serve');
    }
    throw error;
  }
}

/**
 * Check if Ollama service is available
 * @returns {Promise<boolean>} True if service is running
 */
async function checkHealth() {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * List available models
 * @returns {Promise<Array>} List of installed models
 */
async function listModels() {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, {
      timeout: 5000
    });
    return response.data.models || [];
  } catch (error) {
    console.error('Error listing models:', error.message);
    return [];
  }
}

/**
 * Parse JSON response from LLM (handles markdown code blocks)
 * @param {string} text - Raw text response from LLM
 * @returns {Object} Parsed JSON object
 */
function parseJsonResponse(text) {
  try {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('🔍 parseJsonResponse input (first 300 chars):', cleaned.substring(0, 300));
    
    // ALWAYS try to find and extract object first (highest priority)
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace !== -1) {
      console.log('🔎 Found opening brace at position:', firstBrace);
      // Find matching closing brace by counting braces
      let braceCount = 0;
      let matchingBrace = -1;
      for (let i = firstBrace; i < cleaned.length; i++) {
        if (cleaned[i] === '{') braceCount++;
        else if (cleaned[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            matchingBrace = i;
            break;
          }
        }
      }
      
      console.log('🔎 Matching closing brace at position:', matchingBrace);
      
      if (matchingBrace !== -1) {
        const jsonStr = cleaned.substring(firstBrace, matchingBrace + 1);
        console.log('🎯 Extracted object (first 200 chars):', jsonStr.substring(0, 200));
        console.log('🎯 Full extracted length:', jsonStr.length);
        try {
          const parsed = JSON.parse(jsonStr);
          console.log('✅ Object parsed successfully! Type:', typeof parsed, 'Keys:', Object.keys(parsed).join(', '));
          return parsed; // Return object immediately - highest priority
        } catch (e) {
          console.error('❌ Failed to parse extracted object. Error:', e.message);
          console.error('   JSON substring that failed:', jsonStr.substring(0, 500));
        }
      } else {
        console.warn('⚠️ Could not find matching closing brace');
      }
    } else {
      console.warn('⚠️ No opening brace found in response');
    }
    
    // Try parsing as-is (might be clean JSON already)
    try {
      const direct = JSON.parse(cleaned);
      console.log('✅ Direct JSON.parse succeeded, type:', Array.isArray(direct) ? 'array' : 'object');
      // If it's an object (not array), return it
      if (!Array.isArray(direct)) {
        return direct;
      }
      // If it's an array, continue to see if we can find object
      console.log('⚠️ Direct parse returned array, looking for object...');
    } catch (e) {
      // Continue to other methods
    }
    
    // Last resort: If no object found, try array
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const jsonStr = cleaned.substring(firstBracket, lastBracket + 1);
      console.log('📋 Extracted array (first 200 chars):', jsonStr.substring(0, 200));
      try {
        const parsed = JSON.parse(jsonStr);
        console.log('✅ Array parsed successfully, length:', parsed.length);
        return parsed;
      } catch (e) {
        console.warn('⚠️ Failed to parse extracted array:', e.message);
      }
    }
    
    // Last last resort: try parsing cleaned text
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('❌ Error parsing JSON response:', error.message);
    console.error('   Error name:', error.name);
    console.error('   Full raw text length:', text.length, 'characters');
    console.error('   First 1000 chars of raw text:');
    console.error(text.substring(0, 1000));
    console.error('   Last 1000 chars of raw text:');
    console.error(text.substring(Math.max(0, text.length - 1000)));
    
    // Try to extract partial JSON for debugging
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.error('   Extracted JSON candidate:', jsonMatch[0].substring(0, 500));
      }
    } catch (e) {
      // Ignore extraction errors
    }
    
    throw new Error(`Failed to parse LLM response as JSON: ${error.message}`);
  }
}

/**
 * Parse plain text response and convert to JSON structure
 * FALLBACK for when LLM returns plain text instead of JSON
 * @param {string} text - Plain text response
 * @param {string} type - Expected response type ('evaluation', 'question', 'report')
 * @returns {Object} Structured object
 */
function parsePlainTextToJson(text, type = 'evaluation') {
  console.log('🔄 Attempting to parse plain text response as', type);
  
  if (type === 'evaluation') {
    // Extract score from text (look for numbers out of 10)
    const scoreMatch = text.match(/(\d+)\s*(?:\/|out of)\s*10/i) || text.match(/score[:\s]+(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 5; // Default to middle score
    
    // Try to find strengths and improvements
    const strengthsMatch = text.match(/strength[s]?[:\s]+(.*?)(?=improvement|weakness|$)/is);
    const improvementsMatch = text.match(/(?:improvement|weakness)[s]?[:\s]+(.*?)(?=feedback|$)/is);
    
    const strengths = strengthsMatch ? 
      [strengthsMatch[1].trim().split(/[.,;]\s*/)[0]] : 
      ['Shows understanding of the topic'];
    
    const improvements = improvementsMatch ? 
      [improvementsMatch[1].trim().split(/[.,;]\s*/)[0]] : 
      ['Could provide more specific examples'];
    
    const feedback = text.substring(0, 200).trim();
    
    return {
      score,
      strengths: strengths.slice(0, 2),
      improvements: improvements.slice(0, 2),
      feedback
    };
  }
  
  return {};
}

module.exports = {
  generateCompletion,
  chatCompletion,
  checkHealth,
  listModels,
  parseJsonResponse,
  parsePlainTextToJson,
  OLLAMA_API_URL,
  OLLAMA_MODEL
};
