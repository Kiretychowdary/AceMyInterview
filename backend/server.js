// NMKRSPVLIDATAPERMAENENT
// filepath: c:\Users\kiret\Downloads\AceMyInterview\backend\server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors()); // Enable CORS for all routes

app.get('/fetchProblem', async (req, res) => {
  const { contestId, index } = req.query;
  const url = `https://codeforces.com/contest/${contestId}/problem/${index}`;

  try {
    const response = await axios.get(url);
    res.send(response.data); // Send the HTML content back to the client
  } catch (error) {
    console.error('Error fetching problem details:', error);
    res.status(500).send('Failed to fetch problem details');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});