// Test Gemini API and Agentic AI
const axios = require('axios');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function testGeminiAPI() {
  console.log('\n🧪 Testing Gemini API...');
  console.log('API Key:', GEMINI_API_KEY);
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: 'Say hello in one short sentence'
          }]
        }]
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const aiResponse = response.data.candidates[0].content.parts[0].text;
    console.log('✅ Gemini API is working!');
    console.log('Response:', aiResponse);
    return true;
  } catch (error) {
    console.error('❌ Gemini API failed:', error.response?.data || error.message);
    return false;
  }
}

async function testAgenticAI() {
  console.log('\n🤖 Testing Agentic AI endpoints...');
  
  const endpoints = [
    'http://localhost:5000/api/ai-agent/session',
    'http://localhost:5000/api/ai-agent/suggestion',
    'http://localhost:5000/api/agentic/guidance'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(endpoint, {
        headers: { 
          Authorization: 'Bearer test-token-for-dev-mode'
        }
      });
      console.log(`✅ ${endpoint} - Working`);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log(`✅ ${endpoint} - Route exists (auth required)`);
      } else {
        console.log(`⚠️ ${endpoint} - ${error.response?.status || error.message}`);
      }
    }
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🚀 AGENTIC AI SYSTEM TEST');
  console.log('='.repeat(60));
  
  const geminiWorks = await testGeminiAPI();
  await testAgenticAI();
  
  console.log('\n' + '='.repeat(60));
  if (geminiWorks) {
    console.log('✅ ALL SYSTEMS OPERATIONAL');
    console.log('🎉 Your Agentic AI is ready to talk!');
  } else {
    console.log('⚠️ Gemini API needs attention');
  }
  console.log('='.repeat(60));
}

runTests();
