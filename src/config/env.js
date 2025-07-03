require('dotenv').config();

const requiredEnvVars = [
    'DATABASE_URL',
    'ANTHROPIC_API_KEY',
    'JIRA_BASE_URL',
    'JIRA_EMAIL',
    'JIRA_API_TOKEN'
];

function validateEnvironment() {
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPlease check your .env file and ensure all variables are set.');
        process.exit(1);
    }
    
    console.log('✅ All required environment variables are set');
}

module.exports = {
    validateEnvironment,
    config: {
        database: {
            url: process.env.DATABASE_URL
        },
        anthropic: {
            apiKey: process.env.ANTHROPIC_API_KEY
        },
        jira: {
            baseUrl: process.env.JIRA_BASE_URL,
            email: process.env.JIRA_EMAIL,
            apiToken: process.env.JIRA_API_TOKEN
        },
        server: {
            port: process.env.PORT || 3000,
            nodeEnv: process.env.NODE_ENV || 'development'
        },
        logging: {
            level: process.env.LOG_LEVEL || 'info'
        }
    }
};