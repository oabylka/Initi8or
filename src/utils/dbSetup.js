const database = require('../config/database');

async function createTables() {
    try {
        console.log('📊 Setting up database tables...');

        // Create team_ownership table
        await database.query(`
            CREATE TABLE IF NOT EXISTS team_ownership (
                id SERIAL PRIMARY KEY,
                team_name VARCHAR(100) NOT NULL UNIQUE,
                pm VARCHAR(100),
                tl VARCHAR(100),
                em VARCHAR(100),
                jira_project_code VARCHAR(20),
                slack_channel VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create initiatives table
        await database.query(`
            CREATE TABLE IF NOT EXISTS initiatives (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                description TEXT NOT NULL,
                objectives JSONB,
                one_pager TEXT,
                task_breakdown JSONB,
                status VARCHAR(50) DEFAULT 'draft',
                created_tickets JSONB,
                team_assignments JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database tables created successfully');
    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        throw error;
    }
}

async function seedDatabase() {
    try {
        console.log('🌱 Seeding database with sample data...');

        // Check if teams already exist
        const existingTeams = await database.query('SELECT COUNT(*) FROM team_ownership');
        
        if (parseInt(existingTeams.rows[0].count) === 0) {
            // Insert sample teams
            const teams = [
                ['Frontend', 'Alice Johnson', 'Bob Smith', 'Carol Wilson', 'FE', '#frontend-team'],
                ['Backend', 'David Brown', 'Eve Davis', 'Frank Miller', 'BE', '#backend-team'],
                ['Mobile', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'MOB', '#mobile-team'],
                ['Data', 'Jack Wilson', 'Kate Anderson', 'Liam Johnson', 'DATA', '#data-team'],
                ['DevOps', 'Maya Patel', 'Noah Kim', 'Olivia Garcia', 'DEVOPS', '#devops-team'],
                ['QA', 'Peter Zhang', 'Quinn Rodriguez', 'Rachel Singh', 'QA', '#qa-team'],
                ['Design', 'Sam Thompson', 'Tara Mohammed', 'Uma Patel', 'DESIGN', '#design-team'],
                ['Security', 'Victor Chen', 'Wendy Liu', 'Xavier Brown', 'SEC', '#security-team']
            ];

            for (const team of teams) {
                await database.query(`
                    INSERT INTO team_ownership (team_name, pm, tl, em, jira_project_code, slack_channel)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, team);
            }

            console.log('✅ Sample teams inserted successfully');
        } else {
            console.log('ℹ️ Teams already exist, skipping seed data');
        }

    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        throw error;
    }
}

async function setupDatabase() {
    try {
        await createTables();
        await seedDatabase();
        console.log('🎉 Database setup completed successfully!');
    } catch (error) {
        console.error('💥 Database setup failed:', error.message);
        process.exit(1);
    }
}

module.exports = {
    createTables,
    seedDatabase,
    setupDatabase
};