// Unified Judge0 Client
// Provides high-level functions: runOnce (single execution) and runBatch (multiple test cases)
// Automatically handles base64 encoding and polling with optional timeout.

import { getJudge0Headers, getJudge0Urls } from '../utils/judge0Config';

// Basic in-memory throttle (avoid spamming Judge0). Allows N submissions per window.
const THROTTLE_WINDOW_MS = 4000;
const THROTTLE_MAX = 8;
let submissionTimestamps = [];

const enforceThrottle = () => {
  const now = Date.now();
  submissionTimestamps = submissionTimestamps.filter(t => now - t < THROTTLE_WINDOW_MS);
  if (submissionTimestamps.length >= THROTTLE_MAX) {
    throw new Error('Too many executions. Please wait a moment.');
  }
  submissionTimestamps.push(now);
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const submit = async ({ source, languageId, stdin = '', enableBase64 = true }) => {
  enforceThrottle();
  const urls = getJudge0Urls();
  const headers = getJudge0Headers();
  const payload = {
    language_id: languageId,
    source_code: enableBase64 ? btoa(source) : source,
    stdin: enableBase64 ? btoa(stdin) : stdin,
  };
  let res;
  try {
    res = await fetch(urls.submit + '?base64_encoded=true&wait=false', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
  } catch (e) {
    if (e.message.includes('Failed to fetch')) {
      throw new Error('Cannot reach Judge0 server (network error / connection refused).');
    }
    throw e;
  }
  if(!res.ok) throw new Error('Submission failed: ' + res.status);
  return res.json();
};

const getResult = async (token) => {
  const { getResult } = getJudge0Urls();
  const headers = getJudge0Headers();
  let res;
  try {
    res = await fetch(getResult(token) + '?base64_encoded=true', { headers });
  } catch (e) {
    if (e.message.includes('Failed to fetch')) {
      throw new Error('Lost connection to Judge0 while polling.');
    }
    throw e;
  }
  if(!res.ok) throw new Error('Result fetch failed: ' + res.status);
  return res.json();
};

// Poll until status.id > 2 or timeout
const waitForCompletion = async (token, { interval=750, timeout=15000 } = {}) => {
  const start = Date.now();
  while(Date.now() - start < timeout) {
    const r = await getResult(token);
    if(r.status?.id > 2) return r;
    await sleep(interval);
  }
  throw new Error('Execution timeout');
};

const classifyError = (result) => {
  if (!result) return null;
  const id = result.status?.id;
  // Judge0 status IDs: 1-2 queued/processing, 3 Accepted, 4 WA, 5 TLE, 6 Compilation Error, 7 RE, 8- runtime, 11 Canceled, etc.
  if (id === 6) return 'Compilation Error';
  if (id === 5) return 'Time Limit Exceeded';
  if (id === 7 || id === 8 || id === 9 || id === 10 || id === 13) return 'Runtime Error';
  if (id === 4) return 'Wrong Answer';
  return null;
};

export const runOnce = async ({ code, languageId, stdin='' }) => {
  const { token } = await submit({ source: code, languageId, stdin });
  const result = await waitForCompletion(token, {});
  const decode = (v) => v ? atob(v) : '';
  const classification = classifyError(result);
  return {
    status: result.status,
    stdout: decode(result.stdout)?.trim(),
    stderr: decode(result.stderr)?.trim(),
    compile_output: decode(result.compile_output)?.trim(),
    time: result.time,
    memory: result.memory,
    classification
  };
};

export const runBatch = async ({ code, languageId, testCases=[] }) => {
  const outputs = [];
  let totalTime = 0;
  let maxMemory = 0;
  for (const tc of testCases) {
    try {
      const single = await runOnce({ code, languageId, stdin: tc.input || '' });
      const actual = single.stdout || (single.stderr ? single.stderr : '');
      const expected = (tc.output || tc.expected || '').trim();
      const passed = expected === (actual || '').trim();
      const timeNum = Number(single.time) || 0;
      const memNum = Number(single.memory) || 0;
      totalTime += timeNum;
      if (memNum > maxMemory) maxMemory = memNum;
      outputs.push({
        input: tc.input || '',
        expected,
        actual: (actual || '').trim(),
        passed,
        stderr: single.stderr,
        compile_output: single.compile_output,
        time: single.time,
        memory: single.memory,
        classification: single.classification
      });
    } catch (e) {
      outputs.push({
        input: tc.input || '',
        expected: tc.output || tc.expected || '',
        actual: '',
        passed: false,
        error: e.message,
        classification: 'Infrastructure Error'
      });
    }
  }
  const passed = outputs.filter(o => o.passed).length;
  const avgTime = outputs.length ? (totalTime / outputs.length) : 0;
  return { passed, total: outputs.length, details: outputs, metrics: { avgTime, maxMemory } };
};

export default { runOnce, runBatch };
