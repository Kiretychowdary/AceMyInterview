#!/usr/bin/env node
/**
 * Judge0 Health Check Script
 * Verifies that self-hosted Judge0 is running and functional
 */

import https from 'https';
import http from 'http';

const BASE_URL = process.env.JUDGE0_BASE_URL || 'http://localhost:2358';
const isHTTPS = BASE_URL.startsWith('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = isHTTPS ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function checkJudge0Health() {
  console.log('🔍 Checking Judge0 Health...');
  console.log(`📍 Base URL: ${BASE_URL}`);
  
  try {
    // 1. Check languages endpoint
    console.log('\n1️⃣ Testing /languages endpoint...');
    const langResult = await makeRequest(`${BASE_URL}/languages`);
    
    if (langResult.status !== 200) {
      throw new Error(`Languages endpoint failed: HTTP ${langResult.status}`);
    }
    
    const languages = langResult.data;
    console.log(`✅ Found ${languages.length} supported languages`);
    
    // 2. Test submission
    console.log('\n2️⃣ Testing code submission...');
    const testCode = {
      language_id: 71, // Python
      source_code: "print('Judge0 Health Check: OK')",
      base64_encoded: false
    };
    
    const submitResult = await makeRequest(`${BASE_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCode)
    });
    
    if (submitResult.status !== 201 && submitResult.status !== 200) {
      throw new Error(`Submission failed: HTTP ${submitResult.status}`);
    }
    
    const result = submitResult.data;
    const success = result.status?.id === 3; // Accepted
    
    console.log(`📊 Status ID: ${result.status?.id} (${result.status?.description})`);
    console.log(`📤 Output: "${result.stdout?.trim() || 'No output'}"`);
    console.log(`⚡ Time: ${result.time || 'N/A'}s`);
    console.log(`💾 Memory: ${result.memory || 'N/A'} KB`);
    
    if (success) {
      console.log('\n🎉 Judge0 is healthy and fully functional!');
      return true;
    } else {
      console.log(`\n❌ Execution failed - Status: ${result.status?.description}`);
      if (result.stderr) console.log(`🔥 Error: ${result.stderr}`);
      return false;
    }
    
  } catch (error) {
    console.log(`\n❌ Health check failed: ${error.message}`);
    console.log('\n💡 Troubleshooting:');
    console.log('   • Is Docker Desktop running?');
    console.log('   • Run: scripts/setup/start-judge0.bat');
    console.log('   • Check: docker ps');
    return false;
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  checkJudge0Health().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { checkJudge0Health };