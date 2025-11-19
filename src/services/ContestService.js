// Use Vite env var VITE_API_BASE_URL when available, otherwise default to localhost:5000 for dev.
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function apiFetch(path, options = {}) {
	const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
	const res = await fetch(`${API_BASE}/api${path}`, {
		headers,
		credentials: 'include',
		...options
	});
	if (!res.ok) {
		const text = await res.text().catch(() => '');
		const err = new Error('API request failed: ' + res.status);
		err.status = res.status;
		err.body = text;
		throw err;
	}
	return res.json();
}

export const getAllContests = async () => {
	const resp = await apiFetch('/contests');
	return resp.data || [];
};

export const getUpcomingContests = async () => {
	const all = await getAllContests();
	const now = new Date();
	return all.filter(c => c.startTime && new Date(c.startTime) > now && c.status !== 'ended');
};

export const getPastContests = async () => {
	const all = await getAllContests();
	const now = new Date();
	return all.filter(c => !c.startTime || new Date(c.startTime) <= now || c.status === 'ended');
};

export const createContest = async (contest) => {
	const resp = await apiFetch('/contests', { method: 'POST', body: JSON.stringify(contest) });
	return resp.data;
};

export const checkContestId = async (id) => {
  const resp = await apiFetch(`/contests/check-id?id=${encodeURIComponent(id)}`);
  return resp.exists;
};

export const updateContest = async (id, contest) => {
	const resp = await apiFetch(`/contests/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(contest) });
	return resp.data;
};

export const deleteContest = async (id) => {
	const resp = await apiFetch(`/contests/${encodeURIComponent(id)}`, { method: 'DELETE' });
	return resp.success;
};

export const updateContestProblems = async (id, problems) => {
	const resp = await apiFetch(`/contests/${encodeURIComponent(id)}/problems`, { method: 'PUT', body: JSON.stringify({ problems }) });
	return resp.data;
};

export const getContestStatistics = async () => {
	const contests = await getAllContests();
	const totalProblems = contests.reduce((sum, c) => sum + (c.problems?.length || 0), 0);
	const active = contests.filter(c => c.status === 'active').length;
	const upcoming = contests.filter(c => new Date(c.startTime) > new Date() && c.status !== 'ended').length;
	const difficultyCount = {
		Easy: contests.filter(c => c.difficulty === 'Easy').length,
		Medium: contests.filter(c => c.difficulty === 'Medium').length,
		Hard: contests.filter(c => c.difficulty === 'Hard').length,
		Expert: contests.filter(c => c.difficulty === 'Expert').length
	};
	return {
		total: contests.length,
		active,
		upcoming,
		totalProblems,
		avgProblemsPerContest: contests.length > 0 ? (totalProblems / contests.length).toFixed(1) : 0,
		byDifficulty: difficultyCount
	};
};

export const getContestReport = async (contestId) => {
		const resp = await apiFetch(`/contests/${encodeURIComponent(contestId)}`);
	const contest = resp.data;
	return {
		...contest,
		problems: contest.problems || [],
		submissions: []
	};
};

export const registerForContest = async (contestId, userId) => {
	const resp = await apiFetch(`/contests/${encodeURIComponent(contestId)}/register`, {
		method: 'POST',
		body: JSON.stringify({ userId })
	});
	return resp.data;
};

export const checkRegistrationStatus = async (contestId, userId) => {
	const resp = await apiFetch(`/contests/${encodeURIComponent(contestId)}/registration-status?userId=${encodeURIComponent(userId)}`);
	return resp.data;
};

// Get contest with all problems (for registered users)
export const getContestWithProblems = async (contestId, userId = null) => {
	const url = userId 
		? `/contests/${encodeURIComponent(contestId)}/problems?userId=${encodeURIComponent(userId)}`
		: `/contests/${encodeURIComponent(contestId)}/problems`;
	const resp = await apiFetch(url);
	return resp.data;
};

// Get single problem by ID
export const getProblemById = async (problemId) => {
	const resp = await apiFetch(`/contests/problem/${encodeURIComponent(problemId)}`);
	return resp.data;
};

// Get user's progress in a contest
export const getUserProgress = async (contestId, userId) => {
	const resp = await apiFetch(`/contests/${encodeURIComponent(contestId)}/progress/${encodeURIComponent(userId)}`);
	return resp.data;
};
	
// Update contest progress
export const updateContestProgress = async (contestId, progressData) => {
	const resp = await apiFetch(`/contests/${encodeURIComponent(contestId)}/progress`, {
		method: 'POST',
		body: JSON.stringify(progressData)
	});
	return resp.data;
};

// Send heartbeat to track active participation
export const sendHeartbeat = async (contestId, userData) => {
	const resp = await apiFetch(`/contests/${encodeURIComponent(contestId)}/heartbeat`, {
		method: 'POST',
		body: JSON.stringify(userData)
	});
	return resp.data;
};

// Get active participants count
export const getActiveParticipants = async (contestId) => {
	const resp = await apiFetch(`/contests/${encodeURIComponent(contestId)}/active-count`);
	return resp.data;
};

