const { validateEnvironment } = require('./src/config/env');
const Initiative = require('./src/models/Initiative');

async function cleanupDatabase() {
    try {
        console.log('🚀 Starting database cleanup...');
        
        // Validate environment
        validateEnvironment();
        
        // Clean up corrupted data
        const cleanedCount = await Initiative.cleanupCorruptedData();
        
        console.log(`\n✅ Database cleanup completed!`);
        console.log(`📊 Fixed ${cleanedCount} corrupted records`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database cleanup failed:', error.message);
        process.exit(1);
    }
}

cleanupDatabase();