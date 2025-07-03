const { Pool } = require('pg');
const { config } = require('./env');

class DatabaseConnection {
    constructor() {
        this.pool = new Pool({
            connectionString: config.database.url,
            ssl: {
                rejectUnauthorized: false
            },
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Test connection on startup
        this.testConnection();
    }

    async testConnection() {
        try {
            const client = await this.pool.connect();
            const result = await client.query('SELECT NOW()');
            console.log('✅ Database connected successfully at:', result.rows[0].now);
            client.release();
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            process.exit(1);
        }
    }

    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            
            if (config.server.nodeEnv === 'development') {
                console.log('📊 Query executed:', { 
                    text: text.substring(0, 100) + '...', 
                    duration: `${duration}ms`, 
                    rows: result.rowCount 
                });
            }
            
            return result;
        } catch (error) {
            console.error('❌ Database query error:', error.message);
            throw error;
        }
    }

    async getClient() {
        return await this.pool.connect();
    }

    async close() {
        await this.pool.end();
        console.log('🔌 Database connection closed');
    }

    async initializeDatabase() {
        try {
            console.log('🚀 Initializing database schema...');
            
            const fs = require('fs');
            const path = require('path');
            
            // Read the schema file
            const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            // Execute the schema
            await this.query(schema);
            
            console.log('✅ Database schema initialized successfully!');
            console.log('📋 Tables created:');
            console.log('   - team_ownership');
            console.log('   - initiatives');
            console.log('   - Sample team data inserted');
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error.message);
            throw error;
        }
    }
}

// Create singleton instance
const database = new DatabaseConnection();

module.exports = database;