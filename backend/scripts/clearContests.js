// Script to clear all contests from database
const mongoose = require('mongoose');
require('dotenv').config();

const Contest = require('../models/Contest.cjs');
const Registration = require('../models/Registration.cjs');

async function clearAllContests() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Delete all contests
    const contestResult = await Contest.deleteMany({});
    console.log(`🗑️  Deleted ${contestResult.deletedCount} contests`);

    // Delete all registrations
    const registrationResult = await Registration.deleteMany({});
    console.log(`🗑️  Deleted ${registrationResult.deletedCount} registrations`);

    console.log('✅ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearAllContests();
