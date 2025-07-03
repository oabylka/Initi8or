const aiService = require('./src/services/aiService');

async function testAI() {
    console.log('🧪 Testing AI Service...\n');
    
    try {
        // Test team dependency mapping
        console.log('1. Testing team dependency mapping...');
        const teams = await aiService.mapTeamDependencies(
            'Implement OTP Authentication',
            'Add two-factor authentication using SMS OTP for enhanced security',
            ['Improve user security', 'Comply with security standards', 'Reduce unauthorized access']
        );
        console.log('✅ Teams:', teams);
        
        // Test task breakdown
        console.log('\n2. Testing task breakdown...');
        const tasks = await aiService.generateTaskBreakdown(
            'Implement OTP Authentication',
            'Add two-factor authentication using SMS OTP for enhanced security',
            ['Improve user security', 'Comply with security standards', 'Reduce unauthorized access'],
            ['Backend', 'Frontend', 'Security']
        );
        console.log('✅ Tasks:', tasks.length, 'tasks generated');
        
        // Test complexity analysis
        console.log('\n3. Testing complexity analysis...');
        const complexity = await aiService.analyzeInitiativeComplexity(
            'Implement OTP Authentication',
            'Add two-factor authentication using SMS OTP for enhanced security',
            ['Improve user security', 'Comply with security standards', 'Reduce unauthorized access']
        );
        console.log('✅ Complexity:', complexity);
        
        console.log('\n🎉 All AI tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testAI(); 