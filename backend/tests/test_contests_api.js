const axios = require('axios');

async function run() {
  const API = process.env.API_BASE || 'http://localhost:5000';
  const auth = { headers: { Authorization: 'Bearer dev-token' } };

  const contest = {
    id: `test-contest-${Date.now()}`,
    title: 'Automated Test Contest',
    description: 'Created by automated test',
    type: 'Algorithm',
    difficulty: 'Medium',
    startTime: new Date().toISOString(),
    duration: '1 hour',
    tags: ['test'],
    technology: ['Node.js', 'JavaScript'],
    problems: [
      {
        title: 'Sum Two Numbers',
        description: 'Return sum of two numbers',
        points: 100,
        difficulty: 'Easy',
        testCases: [
          { input: '1 2', output: '3', isHidden: false }
        ]
      }
    ]
  };

  try {
    console.log('Creating contest', contest.id);
    const createResp = await axios.post(`${API}/api/contests`, contest, auth);
    console.log('Create response:', createResp.status, createResp.data && createResp.data.success);

    const getResp = await axios.get(`${API}/api/contests/${encodeURIComponent(contest.id)}`);
    console.log('Get response status:', getResp.status);
    console.log('Contest read back title:', getResp.data.data.title);

    // Cleanup: delete contest
    const delResp = await axios.delete(`${API}/api/contests/${encodeURIComponent(contest.id)}`, auth);
    console.log('Deleted:', delResp.status, delResp.data.success);

    console.log('Test completed successfully');
  } catch (err) {
    console.error('Test failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

run();
