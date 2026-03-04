const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import database connection
const { connect } = require('./config/database.cjs');

async function clearDatabase() {
  try {
    console.log('🔌 Connecting to database...');
    await connect();
    
    console.log('✅ Connected successfully!');
    console.log('⚠️  WARNING: This will delete ALL data from your database!');
    
    // Get all collections
    const collections = await mongoose.connection.db.collections();
    
    console.log(`\n📦 Found ${collections.length} collections to clear:`);
    collections.forEach(col => console.log(`   - ${col.collectionName}`));
    
    console.log('\n🗑️  Dropping all collections...\n');
    
    // Drop each collection
    for (const collection of collections) {
      try {
        await collection.drop();
        console.log(`   ✓ Dropped: ${collection.collectionName}`);
      } catch (error) {
        // Ignore "ns not found" errors (collection already doesn't exist)
        if (error.message !== 'ns not found') {
          console.log(`   ⚠  Warning dropping ${collection.collectionName}: ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Database cleared successfully!');
    console.log('💡 All collections have been dropped. You can now start fresh.\n');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run the script
clearDatabase();
