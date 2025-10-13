// Judge0 Connection Verification Utility
// Use this to test and verify Judge0 setup before using the compiler

export const testJudge0Connection = async () => {
  const results = {
    dockerRunning: false,
    apiReachable: false,
    languagesAvailable: false,
    testExecutionWorks: false,
    errors: [],
    details: {}
  };

  try {
    // Test 1: Check if API is reachable
    console.log('🔍 Testing Judge0 API connection...');
    const baseUrl = import.meta.env.VITE_JUDGE0_BASE_URL || 'http://localhost:2358';
    
    try {
      const response = await fetch(`${baseUrl}/languages`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        results.apiReachable = true;
        const languages = await response.json();
        results.languagesAvailable = Array.isArray(languages) && languages.length > 0;
        results.details.languageCount = languages.length;
        results.details.sampleLanguages = languages.slice(0, 5).map(l => l.name);
        console.log(`✅ Judge0 API reachable: ${languages.length} languages available`);
      } else {
        results.errors.push(`API responded with status ${response.status}`);
        console.error(`❌ Judge0 API error: ${response.status}`);
      }
    } catch (fetchError) {
      results.errors.push(`Cannot reach Judge0 API: ${fetchError.message}`);
      console.error('❌ Cannot reach Judge0 API:', fetchError.message);
      
      if (fetchError.message.includes('Failed to fetch')) {
        results.errors.push('Make sure Judge0 Docker containers are running');
        results.errors.push('Run: docker ps | findstr "judge0"');
      }
    }

    // Test 2: Try a simple code execution
    if (results.apiReachable) {
      console.log('🧪 Testing code execution...');
      try {
        const testCode = btoa('print("Hello from Judge0")');
        const submitResponse = await fetch(`${baseUrl}/submissions?base64_encoded=true&wait=false`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language_id: 71, // Python
            source_code: testCode,
            stdin: ''
          })
        });

        if (submitResponse.ok) {
          const { token } = await submitResponse.json();
          console.log(`📝 Submission created: ${token}`);

          // Poll for result
          let attempts = 0;
          let result = null;
          while (attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const resultResponse = await fetch(`${baseUrl}/submissions/${token}?base64_encoded=true`);
            result = await resultResponse.json();
            
            if (result.status?.id > 2) break;
            attempts++;
          }

          if (result && result.status?.id === 3) {
            results.testExecutionWorks = true;
            results.details.testOutput = atob(result.stdout || '');
            console.log('✅ Test execution successful!');
          } else {
            results.errors.push(`Test execution failed: ${result?.status?.description || 'Unknown'}`);
            console.error('❌ Test execution failed');
          }
        }
      } catch (execError) {
        results.errors.push(`Execution test failed: ${execError.message}`);
        console.error('❌ Execution test error:', execError.message);
      }
    }

    // Overall status
    results.dockerRunning = results.apiReachable;
    
  } catch (error) {
    results.errors.push(`Unexpected error: ${error.message}`);
    console.error('❌ Unexpected error:', error);
  }

  return results;
};

export const getJudge0Status = () => {
  const baseUrl = import.meta.env.VITE_JUDGE0_BASE_URL || 'http://localhost:2358';
  const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
  
  return {
    baseUrl,
    isLocalhost,
    isConfigured: !!baseUrl,
    expectedPort: isLocalhost ? '2358' : 'N/A',
    setupInstructions: isLocalhost 
      ? 'Run: npm run judge0:start or scripts/setup/setup-judge0.bat'
      : 'Using remote Judge0 instance'
  };
};

export const printConnectionReport = (results) => {
  console.log('\n========================================');
  console.log('   Judge0 Connection Report');
  console.log('========================================\n');
  
  console.log(`API Reachable:       ${results.apiReachable ? '✅' : '❌'}`);
  console.log(`Languages Available: ${results.languagesAvailable ? '✅' : '❌'} ${results.details.languageCount || 0} languages`);
  console.log(`Test Execution:      ${results.testExecutionWorks ? '✅' : '❌'}`);
  
  if (results.errors.length > 0) {
    console.log('\n🔴 Errors:');
    results.errors.forEach(err => console.log(`   - ${err}`));
  }
  
  if (results.details.sampleLanguages) {
    console.log('\n📋 Sample Languages:');
    results.details.sampleLanguages.forEach(lang => console.log(`   - ${lang}`));
  }
  
  console.log('\n========================================\n');
  
  return results.apiReachable && results.testExecutionWorks;
};
