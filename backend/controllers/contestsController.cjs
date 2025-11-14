const Contest = require('../models/Contest.cjs');
const Problem = require('../models/Problem.cjs');
const Registration = require('../models/Registration.cjs');
const mongoose = require('mongoose');

function ensureDbConnected(res) {
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState !== 1) {
    console.error('MongoDB not connected (readyState=' + mongoose.connection.readyState + ')');
    if (res && typeof res.status === 'function') {
      return res.status(503).json({ success: false, error: 'Database not connected', details: `Mongoose readyState=${mongoose.connection.readyState}` });
    }
    return false;
  }
  return true;
}

// Create a new contest with problems
exports.createContest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const payload = req.body || {};
    const now = new Date();

    // Server-side validation
    if (!payload.title || typeof payload.title !== 'string' || !payload.title.trim()) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'Contest title is required' });
    }

    if (!payload.startTime || !payload.endTime) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'Start time and end time are required' });
    }

    const startTime = new Date(payload.startTime);
    const endTime = new Date(payload.endTime);
    const registrationDeadline = payload.registrationDeadline 
      ? new Date(payload.registrationDeadline) 
      : new Date(startTime.getTime() - 5 * 60000); // 5 minutes before start by default

    // Validation
    if (endTime <= startTime) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'End time must be after start time' });
    }

    if (registrationDeadline > startTime) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, error: 'Registration deadline must be before or equal to start time' });
    }

    // Extract problems from payload
    const problemsData = payload.problems || [];
    const problemIds = [];

    // Create contest document
    const contestDoc = new Contest({
      title: payload.title,
      description: payload.description || '',
      startTime,
      endTime,
      registrationDeadline,
      duration: Math.floor((endTime - startTime) / 60000), // duration in minutes
      createdBy: payload.createdBy || req.user?.id || 'admin',
      maxParticipants: payload.maxParticipants || null,
      rules: payload.rules || '',
      prizes: payload.prizes || '',
      difficulty: payload.difficulty || 'mixed',
      tags: payload.tags || [],
      status: 'draft',
      isPublished: false
    });

    const savedContest = await contestDoc.save({ session });

    // Create problems if provided
    if (problemsData.length > 0) {
      for (let i = 0; i < problemsData.length; i++) {
        const p = problemsData[i];
        
        // Validate problem structure
        if (!p.title || !p.description || !p.difficulty) {
          await session.abortTransaction();
          return res.status(400).json({ success: false, error: `Problem at index ${i} is missing required fields` });
        }

        if (!p.testCases || !Array.isArray(p.testCases) || p.testCases.length === 0) {
          await session.abortTransaction();
          return res.status(400).json({ success: false, error: `Problem at index ${i} must have at least one test case` });
        }

        const problemDoc = new Problem({
          contestId: savedContest._id,
          title: p.title,
          description: p.description,
          difficulty: p.difficulty,
          tags: p.tags || [],
          inputFormat: p.inputFormat || '',
          outputFormat: p.outputFormat || '',
          constraints: p.constraints || '',
          examples: p.examples || [],
          testCases: p.testCases,
          timeLimit: p.timeLimit || 2,
          memoryLimit: p.memoryLimit || 256,
          points: p.points || 100,
          order: i,
          hints: p.hints || [],
          solutionTemplate: p.solutionTemplate || {}
        });

        const savedProblem = await problemDoc.save({ session });
        problemIds.push(savedProblem._id);
      }

      // Update contest with problem IDs
      savedContest.problems = problemIds;
      await savedContest.save({ session });
    }

    await session.commitTransaction();
    
    // Populate problems in response
    const populatedContest = await Contest.findById(savedContest._id).populate('problems');
    
    return res.json({ success: true, data: populatedContest });
  } catch (err) {
    await session.abortTransaction();
    console.error('contestsController.createContest error:', err.message || err);
    
    if (err.code === 11000) {
      return res.status(409).json({ success: false, error: 'Contest with this ID already exists', details: err.message });
    }
    return res.status(500).json({ success: false, error: 'Failed to create contest', details: err.message });
  } finally {
    session.endSession();
  }
};

// Check if a given contest ID exists
exports.checkId = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ success: false, error: 'Missing id query parameter' });
    const exists = await Contest.findOne({ id }).lean();
    return res.json({ success: true, exists: !!exists });
  } catch (err) {
    console.error('contestsController.checkId error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to check id', details: err.message });
  }
};

// List contests
exports.listContests = async (req, res) => {
  try {
    const ok = ensureDbConnected(res);
    if (ok !== true) return; // response already sent with 503
    const contests = await Contest.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: contests });
  } catch (err) {
    console.error('contestsController.listContests error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to list contests', details: err.message });
  }
};

// Get contest by ID
exports.getContest = async (req, res) => {
  try {
    const { id } = req.params;
    // Accept either custom string `id` or Mongo _id. Only include _id match when id is a valid ObjectId.
    const queryOr = [{ id }];
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryOr.push({ _id: id });
    }
    const contest = await Contest.findOne({ $or: queryOr }).lean();
    if (!contest) return res.status(404).json({ success: false, error: 'Contest not found' });
    
    // Populate problems for this contest
    const problems = await Problem.find({ contestId: contest._id }).lean();
    contest.problems = problems;
    
    return res.json({ success: true, data: contest });
  } catch (err) {
    console.error('contestsController.getContest error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to get contest', details: err.message });
  }
};

// Get contest with full problem details (for users who joined)
exports.getContestWithProblems = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    // Find contest
    const queryOr = [{ id }];
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryOr.push({ _id: id });
    }
    const contest = await Contest.findOne({ $or: queryOr }).lean();
    if (!contest) return res.status(404).json({ success: false, error: 'Contest not found' });
    
    // Check if user is registered (optional check)
    if (userId) {
      const registration = await Registration.findOne({ 
        contestId: contest._id, 
        userId: userId 
      }).lean();
      
      if (!registration) {
        return res.status(403).json({ 
          success: false, 
          error: 'You must register for this contest to view problems' 
        });
      }
    }
    
    // Get all problems for this contest
    const problems = await Problem.find({ contestId: contest._id })
      .select('_id title description difficulty tags inputFormat outputFormat constraints testCases examples')
      .lean();
    
    contest.problems = problems;
    
    return res.json({ success: true, data: contest });
  } catch (err) {
    console.error('contestsController.getContestWithProblems error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to get contest with problems', details: err.message });
  }
};

// Get single problem by ID
exports.getProblem = async (req, res) => {
  try {
    const { problemId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({ success: false, error: 'Invalid problem ID' });
    }
    
    const problem = await Problem.findById(problemId).lean();
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }
    
    return res.json({ success: true, data: problem });
  } catch (err) {
    console.error('contestsController.getProblem error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to get problem', details: err.message });
  }
};

// Update contest
exports.updateContest = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    payload.updatedAt = new Date();
    const queryOr = [{ id }];
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) queryOr.push({ _id: id });
    const updated = await Contest.findOneAndUpdate({ $or: queryOr }, { $set: payload }, { new: true, upsert: false }).lean();
    if (!updated) return res.status(404).json({ success: false, error: 'Contest not found' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('contestsController.updateContest error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to update contest', details: err.message });
  }
};

// Delete contest
exports.deleteContest = async (req, res) => {
  try {
    const { id } = req.params;
    const queryOr = [{ id }];
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) queryOr.push({ _id: id });
    await Contest.deleteOne({ $or: queryOr });
    return res.json({ success: true });
  } catch (err) {
    console.error('contestsController.deleteContest error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to delete contest', details: err.message });
  }
};

// Update problems array for a contest
exports.updateProblems = async (req, res) => {
  try {
    const { id } = req.params;
    const { problems } = req.body;
    const queryOr = [{ id }];
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(id)) queryOr.push({ _id: id });
    const updated = await Contest.findOneAndUpdate({ $or: queryOr }, { $set: { problems, updatedAt: new Date() } }, { new: true }).lean();
    if (!updated) return res.status(404).json({ success: false, error: 'Contest not found' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('contestsController.updateProblems error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to update problems', details: err.message });
  }
};

// Get upcoming contests
exports.getUpcomingContests = async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({
      startTime: { $gt: now },
      isPublished: true,
      status: { $ne: 'cancelled' }
    })
    .sort({ startTime: 1 })
    .populate('problems')
    .lean();
    
    return res.json({ success: true, data: contests });
  } catch (err) {
    console.error('contestsController.getUpcomingContests error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to get upcoming contests', details: err.message });
  }
};

// Get ongoing contests
exports.getOngoingContests = async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({
      startTime: { $lte: now },
      endTime: { $gte: now },
      isPublished: true,
      status: 'ongoing'
    })
    .sort({ startTime: 1 })
    .populate('problems')
    .lean();
    
    return res.json({ success: true, data: contests });
  } catch (err) {
    console.error('contestsController.getOngoingContests error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to get ongoing contests', details: err.message });
  }
};

// Publish/unpublish contest
exports.publishContest = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, error: 'Contest not found' });
    }
    
    contest.isPublished = isPublished;
    if (isPublished && contest.status === 'draft') {
      contest.status = 'scheduled';
    }
    
    await contest.save();
    
    return res.json({ success: true, data: contest });
  } catch (err) {
    console.error('contestsController.publishContest error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to publish contest', details: err.message });
  }
};

// Register for contest (protected - requires Supabase auth)
exports.registerForContest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user from Supabase auth middleware
    const supabaseUser = req.supabaseUser;
    if (!supabaseUser || !supabaseUser.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = supabaseUser.id;
    const userEmail = supabaseUser.email || '';
    const displayName = supabaseUser.user_metadata?.full_name || 
                       supabaseUser.user_metadata?.name || 
                       userEmail.split('@')[0] || 'User';
    
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, error: 'Contest not found' });
    }
    
    // Check if registration is open
    if (!contest.isRegistrationOpen()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Registration is closed for this contest',
        registrationDeadline: contest.registrationDeadline
      });
    }
    
    // Check if user is already registered (in participants array)
    if (contest.isUserRegistered(userId)) {
      return res.status(400).json({ success: false, error: 'Already registered for this contest' });
    }
    
    // Check if contest is full
    if (contest.isFull()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contest is full',
        maxParticipants: contest.maxParticipants 
      });
    }
    
    // Add participant to contest
    contest.participants.push({
      userId,
      email: userEmail,
      displayName,
      registeredAt: new Date(),
      score: 0,
      submissions: []
    });
    
    // Also create Registration entry for backward compatibility
    const registration = new Registration({
      userId,
      contestId: id,
      status: 'registered'
    });
    
    await registration.save();
    contest.registrations.push(registration._id);
    
    await contest.save();
    
    return res.json({ 
      success: true, 
      data: {
        contestId: contest._id,
        userId,
        email: userEmail,
        displayName,
        registeredAt: new Date()
      }
    });
  } catch (err) {
    console.error('contestsController.registerForContest error:', err.message || err);
    
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Already registered for this contest' });
    }
    
    return res.status(500).json({ success: false, error: 'Failed to register for contest', details: err.message });
  }
};

// Unregister from contest (protected - requires Supabase auth)
exports.unregisterFromContest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user from Supabase auth middleware
    const supabaseUser = req.supabaseUser;
    if (!supabaseUser || !supabaseUser.id) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const userId = supabaseUser.id;
    
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, error: 'Contest not found' });
    }
    
    // Check if contest has started
    if (new Date() >= contest.startTime) {
      return res.status(400).json({ success: false, error: 'Cannot unregister after contest has started' });
    }
    
    // Remove from participants array
    const initialLength = contest.participants.length;
    contest.participants = contest.participants.filter(p => p.userId !== userId);
    
    if (contest.participants.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Not registered for this contest' });
    }
    
    // Also remove Registration entry
    const registration = await Registration.findOneAndDelete({ userId, contestId: id });
    if (registration) {
      contest.registrations = contest.registrations.filter(r => r.toString() !== registration._id.toString());
    }
    
    await contest.save();
    
    return res.json({ success: true, message: 'Successfully unregistered from contest' });
  } catch (err) {
    console.error('contestsController.unregisterFromContest error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to unregister from contest', details: err.message });
  }
};

// Get user registrations
exports.getUserRegistrations = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const registrations = await Registration.find({ userId })
      .populate({
        path: 'contestId',
        populate: { path: 'problems' }
      })
      .sort({ registrationTime: -1 })
      .lean();
    
    return res.json({ success: true, data: registrations });
  } catch (err) {
    console.error('contestsController.getUserRegistrations error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to get user registrations', details: err.message });
  }
};

// Check registration status
exports.checkRegistrationStatus = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const registration = await Registration.findOne({ userId, contestId: id }).lean();
    
    return res.json({ 
      success: true, 
      isRegistered: !!registration,
      registration: registration || null
    });
  } catch (err) {
    console.error('contestsController.checkRegistrationStatus error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to check registration status', details: err.message });
  }
};

// Get contest leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { id } = req.params;
    
    const leaderboard = await Registration.find({ 
      contestId: id,
      status: { $in: ['participated', 'completed'] }
    })
      .sort({ score: -1, completedAt: 1 })
      .limit(100)
      .lean();
    
    // Add ranks
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
    
    return res.json({ success: true, data: rankedLeaderboard });
  } catch (err) {
    console.error('contestsController.getLeaderboard error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to get leaderboard', details: err.message });
  }
};

// Get contest current status with time info
exports.getContestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ success: false, error: 'Contest not found' });
    }

    // Update status based on current time
    const oldStatus = contest.status;
    contest.updateStatus();
    
    // Save if status changed
    if (oldStatus !== contest.status) {
      await contest.save();
    }

    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    return res.json({
      success: true,
      data: {
        contestId: contest._id,
        status: contest.status,
        startTime: contest.startTime,
        endTime: contest.endTime,
        currentTime: now,
        isRegistrationOpen: contest.isRegistrationOpen(),
        isActive: contest.isActive(),
        canSubmitForScore: now >= startTime && now <= endTime && contest.status === 'ongoing',
        canPractice: now > endTime || contest.status === 'completed',
        timeUntilStart: startTime > now ? startTime - now : 0,
        timeRemaining: endTime > now && startTime <= now ? endTime - now : 0
      }
    });
  } catch (err) {
    console.error('contestsController.getContestStatus error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to get contest status', details: err.message });
  }
};

// Get user's progress in a contest
exports.getUserProgress = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const contest = await Contest.findById(id).populate('problems');
    if (!contest) {
      return res.status(404).json({ success: false, error: 'Contest not found' });
    }

    // Find participant
    const participant = contest.participants.find(p => p.userId === userId);
    
    if (!participant) {
      return res.json({
        success: true,
        data: {
          registered: false,
          solved: 0,
          partial: 0,
          totalProblems: Array.isArray(contest.problems) ? contest.problems.length : 0,
          score: 0,
          submissions: []
        }
      });
    }

    // Count solved and partial
    const solved = participant.submissions.filter(s => s.passed).length;
    const partial = participant.submissions.filter(s => !s.passed && s.score > 0).length;
    const totalProblems = Array.isArray(contest.problems) ? contest.problems.length : 0;

    return res.json({
      success: true,
      data: {
        registered: true,
        solved,
        partial,
        totalProblems,
        score: participant.score || 0,
        submissions: participant.submissions,
        registeredAt: participant.registeredAt
      }
    });
  } catch (err) {
    console.error('contestsController.getUserProgress error:', err.message || err);
    return res.status(500).json({ success: false, error: 'Failed to get user progress', details: err.message });
  }
};
