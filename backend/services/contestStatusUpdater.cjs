const Contest = require('../models/Contest.cjs');

/**
 * Service to automatically update contest statuses based on current time
 * This should be called periodically (e.g., every minute) via cron or polling
 */

class ContestStatusUpdater {
  /**
   * Update all contest statuses based on current time
   */
  static async updateAllContestStatuses() {
    try {
      const now = new Date();
      
      // Find all contests that are not cancelled
      const contests = await Contest.find({
        status: { $ne: 'cancelled' }
      });

      let updatedCount = 0;

      for (const contest of contests) {
        const oldStatus = contest.status;
        contest.updateStatus(); // Call the model method
        
        if (oldStatus !== contest.status) {
          await contest.save();
          updatedCount++;
          console.log(`Contest "${contest.title}" status updated: ${oldStatus} → ${contest.status}`);
        }
      }

      if (updatedCount > 0) {
        console.log(`✓ Updated ${updatedCount} contest(s) status at ${now.toISOString()}`);
      }

      return { success: true, updatedCount };
    } catch (error) {
      console.error('Error updating contest statuses:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a single contest status
   */
  static async updateContestStatus(contestId) {
    try {
      const contest = await Contest.findById(contestId);
      if (!contest) {
        return { success: false, error: 'Contest not found' };
      }

      const oldStatus = contest.status;
      contest.updateStatus();
      
      if (oldStatus !== contest.status) {
        await contest.save();
        console.log(`Contest "${contest.title}" status updated: ${oldStatus} → ${contest.status}`);
      }

      return { success: true, status: contest.status, changed: oldStatus !== contest.status };
    } catch (error) {
      console.error('Error updating contest status:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start automatic status update polling
   * Updates contest statuses every minute
   */
  static startPolling(intervalMs = 60000) {
    console.log('🕐 Starting contest status updater (polling every 60 seconds)...');
    
    // Run immediately on start
    this.updateAllContestStatuses();

    // Then run every minute
    const intervalId = setInterval(() => {
      this.updateAllContestStatuses();
    }, intervalMs);

    return intervalId;
  }

  /**
   * Stop automatic polling
   */
  static stopPolling(intervalId) {
    if (intervalId) {
      clearInterval(intervalId);
      console.log('⏸️ Stopped contest status updater');
    }
  }
}

module.exports = ContestStatusUpdater;
