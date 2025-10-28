// Judge0 config for web app
// Reads from VITE_JUDGE0_BASE_URL env variable

const JUDGE0_BASE_URL = import.meta.env.VITE_JUDGE0_BASE_URL || 'http://31.97.203.93:2358';

export default JUDGE0_BASE_URL;
