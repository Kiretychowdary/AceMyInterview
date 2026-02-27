// NMKRSPVLIDATA_XCEL_DOWNLOAD
// Performance Tracking Service
const ContestPerformance = require('../models/ContestPerformance.cjs');
const Contest = require('../models/Contest.cjs');
const Registration = require('../models/Registration.cjs');
const Submission = require('../models/Submission.cjs');
const Problem = require('../models/Problem.cjs');

class PerformanceTracker {
  
  /**
   * Initialize or get performance record for a user in a contest
   */
  async initializePerformance(userId, contestId, userEmail, userName) {
    try {
      // Check if performance record exists
      let performance = await ContestPerformance.findOne({ userId, contestId });
      
      if (!performance) {
        // Get contest details
        const contest = await Contest.findById(contestId);
        if (!contest) {
          throw new Error('Contest not found');
        }
        
        // Get registration info
        const registration = await Registration.findOne({ userId, contestId });
        
        // Get all problems for this contest
        const problems = await Problem.find({ 
          _id: { $in: contest.problems } 
        });
        
        // Initialize question performances
        const questionPerformances = problems.map(problem => ({
          problemId: problem._id,
          problemTitle: problem.title,
          problemDifficulty: problem.difficulty,
          maxMarks: problem.maxMarks || 100,
          marksObtained: 0,
          status: 'not_attempted',
          totalAttempts: 0,
          totalTestCases: 0,
          passedTestCases: 0,
          failedTestCases: 0,
          successRate: 0,
          timeSpent: 0
        }));
        
        // Create new performance record
        performance = new ContestPerformance({
          userId,
          userEmail: userEmail || registration?.email || '',
          userName: userName || registration?.username || '',
          contestId,
          contestTitle: contest.title,
          contestDifficulty: contest.difficulty,
          registeredAt: registration?.registrationTime || new Date(),
          registrationStatus: 'registered',
          totalProblems: problems.length,
          questionPerformances
        });
        
        await performance.save();
      }
      
      return performance;
    } catch (error) {
      console.error('Error initializing performance:', error);
      throw error;
    }
  }
  
  /**
   * Update performance when user starts contest
   */
  async markContestStarted(userId, contestId) {
    try {
      const performance = await ContestPerformance.findOne({ userId, contestId });
      
      if (performance && !performance.startedAt) {
        performance.startedAt = new Date();
        performance.registrationStatus = 'started';
        performance.isActive = true;
        performance.lastActivityAt = new Date();
        await performance.save();
      }
      
      return performance;
    } catch (error) {
      console.error('Error marking contest started:', error);
      throw error;
    }
  }
  
  /**
   * Update performance after a submission
   */
  async updatePerformanceAfterSubmission(userId, contestId, problemId, submission) {
    try {
      let performance = await ContestPerformance.findOne({ userId, contestId });
      
      if (!performance) {
        // Initialize if not exists
        performance = await this.initializePerformance(userId, contestId);
      }
      
      // Mark as active and update activity time
      performance.isActive = true;
      performance.lastActivityAt = new Date();
      performance.registrationStatus = 'in_progress';
      
      // Update submission statistics
      performance.totalSubmissions = (performance.totalSubmissions || 0) + 1;
      
      if (submission.status === 'accepted' || submission.passedTestCases === submission.totalTestCases) {
        performance.successfulSubmissions = (performance.successfulSubmissions || 0) + 1;
      } else {
        performance.failedSubmissions = (performance.failedSubmissions || 0) + 1;
      }
      
      // Find the question performance
      const questionIndex = performance.questionPerformances.findIndex(
        q => q.problemId.toString() === problemId.toString()
      );
      
      if (questionIndex !== -1) {
        const question = performance.questionPerformances[questionIndex];
        
        // Update attempt count
        question.totalAttempts = (question.totalAttempts || 0) + 1;
        
        // Set first attempt time
        if (!question.firstAttemptAt) {
          question.firstAttemptAt = submission.submittedAt || new Date();
        }
        
        // Update last attempt time
        question.lastAttemptAt = submission.submittedAt || new Date();
        
        // Update test case stats
        question.totalTestCases = submission.totalTestCases || 0;
        question.passedTestCases = Math.max(question.passedTestCases || 0, submission.passedTestCases || 0);
        question.failedTestCases = question.totalTestCases - question.passedTestCases;
        
        // Calculate success rate
        if (question.totalTestCases > 0) {
          question.successRate = Math.round((question.passedTestCases / question.totalTestCases) * 100);
        }
        
        // Update marks - keep the best score
        const newMarks = submission.marksObtained || 0;
        if (newMarks > question.marksObtained) {
          question.marksObtained = newMarks;
          question.bestSubmissionId = submission._id;
        }
        
        // Update status
        if (question.successRate === 100) {
          question.status = 'fully_solved';
          if (!question.solvedAt) {
            question.solvedAt = submission.submittedAt || new Date();
          }
        } else if (question.successRate > 0) {
          question.status = 'partially_solved';
        } else if (question.totalAttempts > 0) {
          question.status = 'attempted';
        }
        
        // Update language and performance metrics
        question.language = submission.language;
        question.executionTime = submission.executionTime || 0;
        question.memoryUsed = submission.memory || 0;
      }
      
      // Recalculate all metrics
      performance.calculateMetrics();
      
      await performance.save();
      
      return performance;
    } catch (error) {
      console.error('Error updating performance after submission:', error);
      throw error;
    }
  }
  
  /**
   * Mark contest as completed for a user
   */
  async markContestCompleted(userId, contestId) {
    try {
      const performance = await ContestPerformance.findOne({ userId, contestId });
      
      if (performance && !performance.completedAt) {
        performance.completedAt = new Date();
        performance.registrationStatus = 'completed';
        performance.isActive = false;
        
        // Calculate total time spent
        if (performance.startedAt) {
          performance.totalTimeSpent = Math.floor(
            (performance.completedAt - performance.startedAt) / 1000
          );
        }
        
        // Recalculate metrics
        performance.calculateMetrics();
        
        await performance.save();
      }
      
      return performance;
    } catch (error) {
      console.error('Error marking contest completed:', error);
      throw error;
    }
  }
  
  /**
   * Calculate and update ranks for all participants in a contest
   */
  async calculateRanks(contestId) {
    try {
      const performances = await ContestPerformance.find({ contestId })
        .sort({ 
          finalScore: -1, 
          totalTimeSpent: 1,
          completedAt: 1 
        });
      
      let currentRank = 1;
      let previousScore = null;
      let sameRankCount = 0;
      
      for (let i = 0; i < performances.length; i++) {
        const performance = performances[i];
        
        // Skip if not started
        if (!performance.startedAt) {
          performance.rank = null;
          await performance.save();
          continue;
        }
        
        if (previousScore === null || performance.finalScore !== previousScore) {
          currentRank = i + 1;
          previousScore = performance.finalScore;
        }
        
        performance.rank = currentRank;
        await performance.save();
      }
      
      return performances;
    } catch (error) {
      console.error('Error calculating ranks:', error);
      throw error;
    }
  }
  
  /**
   * Get performance data for a specific contest
   */
  async getContestPerformanceData(contestId) {
    try {
      const performances = await ContestPerformance.find({ contestId })
        .sort({ rank: 1, finalScore: -1 })
        .lean();
      
      return performances;
    } catch (error) {
      console.error('Error getting contest performance data:', error);
      throw error;
    }
  }
  
  /**
   * Get performance data for a specific user across all contests
   */
  async getUserPerformanceData(userId) {
    try {
      const performances = await ContestPerformance.find({ userId })
        .populate('contestId', 'title startTime endTime')
        .sort({ registeredAt: -1 })
        .lean();
      
      return performances;
    } catch (error) {
      console.error('Error getting user performance data:', error);
      throw error;
    }
  }
  
  /**
   * Sync existing data to performance tracker
   */
  async syncExistingData(contestId = null) {
    try {
      const query = contestId ? { contestId } : {};
      const registrations = await Registration.find(query)
        .populate('contestId');
      
      console.log(`Syncing ${registrations.length} registrations...`);
      
      for (const registration of registrations) {
        try {
          // Initialize performance
          const performance = await this.initializePerformance(
            registration.userId,
            registration.contestId._id,
            registration.email,
            registration.username
          );
          
          // Get all submissions for this user-contest pair
          const submissions = await Submission.find({
            userId: registration.userId,
            contestId: registration.contestId._id
          }).sort({ submittedAt: 1 });
          
          // Process each submission
          for (const submission of submissions) {
            await this.updatePerformanceAfterSubmission(
              registration.userId,
              registration.contestId._id,
              submission.problemId,
              submission
            );
          }
          
          // Mark as completed if registration shows completed
          if (registration.status === 'completed' || registration.completedAt) {
            await this.markContestCompleted(
              registration.userId,
              registration.contestId._id
            );
          }
          
        } catch (error) {
          console.error(`Error syncing registration ${registration._id}:`, error);
        }
      }
      
      console.log('Sync completed!');
      
      // Calculate ranks for all contests
      const contests = contestId 
        ? [await Contest.findById(contestId)]
        : await Contest.find({ status: { $in: ['completed', 'ongoing'] } });
      
      for (const contest of contests) {
        if (contest) {
          await this.calculateRanks(contest._id);
        }
      }
      
      return { success: true, message: 'Data synced successfully' };
    } catch (error) {
      console.error('Error syncing existing data:', error);
      throw error;
    }
  }
}

module.exports = new PerformanceTracker();
