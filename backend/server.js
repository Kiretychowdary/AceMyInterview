// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const JUDGE0_API = "https://judge0-ce.p.rapidapi.com";
const headers = {
  "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
  "x-rapidapi-key": "c9ee336ebfmsh2b925febac48019p1df49ajsn7c352d811556", // Replace with your actual key
  "content-type": "application/json",
};

const testCases = [
  { input: "2\n3", expected: "5" },
  { input: "10\n20", expected: "30" },
];

app.post("/submit", async (req, res) => {
  const { code, language_id } = req.body;
  let score = 0;
  let total = testCases.length;
  let results = [];

  for (const test of testCases) {
    try {
      const submissionRes = await axios.post(
        `${JUDGE0_API}/submissions?base64_encoded=false&wait=true`,
        {
          source_code: code,
          language_id: language_id,
          stdin: test.input,
        },
        { headers }
      );
      const output = submissionRes.data.stdout?.trim() || "";
      if (output === test.expected) score++;
      results.push({
        description: test.description,
        input: test.input, // <-- Add this line
        score: output === test.expected ? 1 : 0,
        total: 1,
        output: output,
      });
    } catch (err) {
      results.push({
        description: test.description,
        score: 0,
        total: 1,
        output: "Error running code.",
      });
    }
  }
  res.json({ score, total, results }); // <-- Make sure to send results array
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
