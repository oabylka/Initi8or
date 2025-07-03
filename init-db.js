const database = require('./src/config/database');

async function initializeDatabase() {
    try {
        await database.initializeDatabase();
        console.log('🎉 Database setup completed!');
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    } finally {
        await database.close();
    }
}

// Run the initialization
initializeDatabase(); 