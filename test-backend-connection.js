// Backend Connection Test
// Run this in browser console to test connection

const testBackendConnection = async () => {
  const backendUrl = 'https://acemyinterview-production.up.railway.app';
  
  console.log('🔍 Testing Backend Connection...');
  console.log('Backend URL:', backendUrl);
  
  try {
    // Test basic connectivity
    const response = await fetch(backendUrl + '/api/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ Connection Status:', response.status);
    console.log('✅ Response OK:', response.ok);
    
    if (response.ok) {
      const data = await response.text();
      console.log('✅ Response Data:', data);
    } else {
      console.log('⚠️ Response not OK, but server is reachable');
    }
    
    // Test MCQ endpoint
    console.log('\n🎯 Testing MCQ Questions Endpoint...');
    const mcqResponse = await fetch(backendUrl + '/api/mcq-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'JavaScript',
        difficulty: 'medium',
        count: 3
      })
    });
    
    console.log('MCQ Response Status:', mcqResponse.status);
    if (mcqResponse.ok) {
      const mcqData = await mcqResponse.json();
      console.log('✅ MCQ Data received:', mcqData);
    } else {
      console.log('❌ MCQ endpoint error:', mcqResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ Connection Failed:', error.message);
    console.error('❌ Full Error:', error);
  }
};

// Auto-run the test
testBackendConnection();

// Export for manual testing
window.testBackend = testBackendConnection;
