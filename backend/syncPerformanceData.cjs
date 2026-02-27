// NMKRSPVLIDATA_XCEL_DOWNLOAD
// Script to sync performance data for all contests
// Run this after implementing the feature to populate performance data from existing submissions

const mongoose = require('mongoose');
require('dotenv').config();
const performanceTracker = require('./services/performanceTracker.cjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/acemyinterview';

async function syncAllData() {
  try {
    console.log('🔄 Starting performance data sync...');
    console.log('📦 Connecting to MongoDB:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB');
    console.log('');
    
    // Sync all existing data
    console.log('📊 Syncing all contest data...');
    const result = await performanceTracker.syncExistingData();
    
    console.log('');
    console.log('✅ Sync completed successfully!');
    console.log('📋 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error syncing data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('🔌 Disconnected from MongoDB');
    console.log('👋 Sync process completed');
    process.exit(0);
  }
}

// Run the sync
syncAllData();
