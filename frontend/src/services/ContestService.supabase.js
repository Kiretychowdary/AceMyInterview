// Supabase Contest Service - replaces Firestore logic
import { supabase } from '../config/supabaseClient';

const CONTESTS_TABLE = 'contests';

// Create a new contest
export const createContest = async (contestData) => {
  try {
    const { id, ...dataWithoutId } = contestData;
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from(CONTESTS_TABLE)
      .insert([
        {
          ...dataWithoutId,
          createdAt: now,
          updatedAt: now,
          participants: contestData.participants || 0,
          problems: contestData.problems || []
        }
      ])
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error creating contest:', error);
    throw error;
  }
};

// Get all contests
export const getAllContests = async () => {
  try {
    const { data, error } = await supabase
      .from(CONTESTS_TABLE)
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting contests:', error);
    throw error;
  }
};

// Get upcoming contests
export const getUpcomingContests = async () => {
  try {
    const allContests = await getAllContests();
    const now = new Date();
    return allContests.filter(contest => {
      const startTime = new Date(contest.startTime);
      return startTime > now && contest.status !== 'ended';
    });
  } catch (error) {
    console.error('Error getting upcoming contests:', error);
    throw error;
  }
};

// Get past contests
export const getPastContests = async () => {
  try {
    const allContests = await getAllContests();
    const now = new Date();
    return allContests.filter(contest => {
      const startTime = new Date(contest.startTime);
      return startTime <= now || contest.status === 'ended';
    });
  } catch (error) {
    console.error('Error getting past contests:', error);
    throw error;
  }
};

// Get active contests
export const getActiveContests = async () => {
  try {
    const { data, error } = await supabase
      .from(CONTESTS_TABLE)
      .select('*')
      .eq('status', 'active');
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting active contests:', error);
    throw error;
  }
};

// Get a single contest by ID
export const getContestById = async (contestId) => {
  try {
    const { data, error } = await supabase
      .from(CONTESTS_TABLE)
      .select('*')
      .eq('id', contestId)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting contest:', error);
    throw error;
  }
};

// Export a contest report (basic metadata + problems) as JSON-friendly object
export const getContestReport = async (contestId) => {
  try {
    const contest = await getContestById(contestId);
    // Build a simple report structure. Submissions are not stored in this service,
    // so the report contains contest metadata and the problems payload.
    // Try to fetch submissions for this contest (if the table exists)
    let submissions = [];
    try {
      const { data: subsData, error: subsErr } = await supabase
        .from('submissions')
        .select('*')
        .eq('contestId', contestId)
        .order('createdAt', { ascending: true });
      if (subsErr) {
        // If the table doesn't exist or query fails, continue without submissions
        console.warn('Could not fetch submissions for report:', subsErr.message || subsErr);
      } else {
        submissions = subsData || [];
      }
    } catch (err) {
      console.warn('Submissions fetch threw:', err);
    }

    const report = {
      id: contest.id,
      title: contest.title,
      description: contest.description || '',
      type: contest.type || '',
      difficulty: contest.difficulty || '',
      status: contest.status || '',
      startTime: contest.startTime || '',
      duration: contest.duration || '',
      participants: contest.participants || 0,
      createdAt: contest.createdAt || '',
      updatedAt: contest.updatedAt || '',
      problems: contest.problems || [],
      submissions
    };
    return report;
  } catch (error) {
    console.error('Error creating contest report:', error);
    throw error;
  }
};

// Update a contest
export const updateContest = async (contestId, contestData) => {
  try {
    const { id, createdAt, ...dataWithoutId } = contestData;
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from(CONTESTS_TABLE)
      .update({ ...dataWithoutId, updatedAt: now })
      .eq('id', contestId)
      .select();
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating contest:', error);
    throw error;
  }
};

// Delete a contest
export const deleteContest = async (contestId) => {
  try {
    const { error } = await supabase
      .from(CONTESTS_TABLE)
      .delete()
      .eq('id', contestId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting contest:', error);
    throw error;
  }
};

// Update contest problems
export const updateContestProblems = async (contestId, problems) => {
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from(CONTESTS_TABLE)
      .update({ problems, updatedAt: now })
      .eq('id', contestId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating contest problems:', error);
    throw error;
  }
};

// Increment participant count
export const incrementParticipants = async (contestId) => {
  try {
    const contest = await getContestById(contestId);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from(CONTESTS_TABLE)
      .update({ participants: (contest.participants || 0) + 1, updatedAt: now })
      .eq('id', contestId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error incrementing participants:', error);
    throw error;
  }
};

// Get contest statistics
export const getContestStatistics = async () => {
  try {
    const allContests = await getAllContests();
    const activeContests = allContests.filter(c => c.status === 'active');
    const upcomingContests = allContests.filter(c => {
      const startTime = new Date(c.startTime);
      return startTime > new Date() && c.status !== 'ended';
    });
    const totalProblems = allContests.reduce((sum, c) => sum + (c.problems?.length || 0), 0);
    const difficultyCount = {
      Easy: allContests.filter(c => c.difficulty === 'Easy').length,
      Medium: allContests.filter(c => c.difficulty === 'Medium').length,
      Hard: allContests.filter(c => c.difficulty === 'Hard').length,
      Expert: allContests.filter(c => c.difficulty === 'Expert').length
    };
    return {
      total: allContests.length,
      active: activeContests.length,
      upcoming: upcomingContests.length,
      totalProblems,
      avgProblemsPerContest: allContests.length > 0 ? (totalProblems / allContests.length).toFixed(1) : 0,
      byDifficulty: difficultyCount
    };
  } catch (error) {
    console.error('Error getting contest statistics:', error);
    throw error;
  }
};
