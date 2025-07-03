const Anthropic = require('@anthropic-ai/sdk');
const { config } = require('../config/env');
const { AI_PROMPTS } = require('../config/constants');

class AIService {
    constructor() {
        this.anthropic = new Anthropic({
            apiKey: config.anthropic.apiKey,
        });

        this.defaultModel = 'claude-3-sonnet-20240229';
        this.maxTokens = 2000;
    }

    async makeRequest(prompt, maxTokens = this.maxTokens, systemMessage = null) {
        try {
            console.log('🤖 Sending request to Anthropic...');

            const requestConfig = {
                model: this.defaultModel,
                max_tokens: maxTokens,
                messages: [{ role: 'user', content: prompt }]
            };

            if (systemMessage) {
                requestConfig.system = systemMessage;
            }

            const response = await this.anthropic.messages.create(requestConfig);
            const content = response.content?.[0]?.text || '';
            
            console.log('✅ AI response received');
            return content;
        } catch (error) {
            console.error('❌ AI Service Error:', error.message);
            throw new Error(`AI request failed: ${error.message}`);
        }
    }

    // Parse team names from natural text response
    parseTeamsFromText(text) {
        const availableTeams = ['Frontend', 'Backend', 'Mobile', 'Data', 'DevOps', 'QA', 'Design', 'Security'];
        const foundTeams = [];
        
        // Look for team names in the text (case insensitive)
        availableTeams.forEach(team => {
            if (text.toLowerCase().includes(team.toLowerCase())) {
                foundTeams.push(team);
            }
        });
        
        // Remove duplicates and ensure we have at least some teams
        const uniqueTeams = [...new Set(foundTeams)];
        return uniqueTeams.length > 0 ? uniqueTeams : ['Frontend', 'Backend'];
    }

    // Parse tasks from natural text response
    parseTasksFromText(text, teams) {
        const tasks = [];
        const lines = text.split('\n').filter(line => line.trim());
        
        let currentTask = null;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            
            // Look for task indicators (numbers, bullets, "Task:", etc.)
            if (trimmed.match(/^(\d+\.|\*|-|•|Task\s*\d+:|Task:)/i)) {
                // Save previous task if exists
                if (currentTask) {
                    tasks.push(currentTask);
                }
                
                // Start new task
                const taskTitle = trimmed.replace(/^(\d+\.|\*|-|•|Task\s*\d+:|Task:)\s*/i, '');
                currentTask = {
                    title: taskTitle,
                    description: taskTitle,
                    team: this.findTeamInText(trimmed, teams) || teams[0] || 'Backend',
                    estimated_hours: this.extractHoursFromText(trimmed) || 24,
                    priority: this.extractPriorityFromText(trimmed) || 'Medium',
                    dependencies: []
                };
            } else if (currentTask && trimmed.length > 10) {
                // Extend description of current task
                currentTask.description += ' ' + trimmed;
                
                // Update other fields if found in this line
                const foundTeam = this.findTeamInText(trimmed, teams);
                if (foundTeam) currentTask.team = foundTeam;
                
                const foundHours = this.extractHoursFromText(trimmed);
                if (foundHours) currentTask.estimated_hours = foundHours;
                
                const foundPriority = this.extractPriorityFromText(trimmed);
                if (foundPriority) currentTask.priority = foundPriority;
            }
        });
        
        // Add the last task
        if (currentTask) {
            tasks.push(currentTask);
        }
        
        // If no tasks found, create a default one
        if (tasks.length === 0) {
            tasks.push({
                title: 'Initiative Implementation',
                description: 'Implement the main requirements of this initiative',
                team: teams[0] || 'Backend',
                estimated_hours: 40,
                priority: 'High',
                dependencies: []
            });
        }
        
        return tasks;
    }

    findTeamInText(text, availableTeams) {
        for (const team of availableTeams) {
            if (text.toLowerCase().includes(team.toLowerCase())) {
                return team;
            }
        }
        return null;
    }

    extractHoursFromText(text) {
        const hourMatches = text.match(/(\d+)\s*(hours?|hrs?|h\b)/i);
        if (hourMatches) {
            return parseInt(hourMatches[1]);
        }
        
        // Look for "X days" and convert to hours
        const dayMatches = text.match(/(\d+)\s*(days?|d\b)/i);
        if (dayMatches) {
            return parseInt(dayMatches[1]) * 8; // 8 hours per day
        }
        
        return null;
    }

    extractPriorityFromText(text) {
        const lower = text.toLowerCase();
        if (lower.includes('high') || lower.includes('critical') || lower.includes('urgent')) {
            return 'High';
        }
        if (lower.includes('low') || lower.includes('minor')) {
            return 'Low';
        }
        return 'Medium';
    }

    parseComplexityFromText(text) {
        // Look for complexity score
        const scoreMatch = text.match(/complexity[:\s]*(\d+)/i) || text.match(/score[:\s]*(\d+)/i);
        const complexity_score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
        
        // Look for timeline
        const weekMatch = text.match(/(\d+)\s*weeks?/i);
        const recommended_timeline_weeks = weekMatch ? parseInt(weekMatch[1]) : 8;
        
        // Extract reasoning (first sentence or paragraph)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const reasoning = sentences[0]?.trim() || "Medium complexity initiative";
        
        return {
            complexity_score: Math.min(Math.max(complexity_score, 1), 10), // Clamp between 1-10
            reasoning: reasoning.substring(0, 200), // Limit length
            recommended_timeline_weeks: Math.max(recommended_timeline_weeks, 1) // At least 1 week
        };
    }

    async mapTeamDependencies(title, description, objectives) {
        console.log('🔍 Mapping team dependencies...');

        const prompt = `Analyze this initiative and identify which teams should be involved:

Available teams: Frontend, Backend, Mobile, Data, DevOps, QA, Design, Security

Initiative Details:
Title: ${title}
Description: ${description}
Objectives:
${Array.isArray(objectives) ? objectives.map(o => `- ${o}`).join('\n') : objectives}

Which teams would be needed for this initiative? Consider the technical requirements, user-facing components, data needs, testing requirements, and infrastructure needs.`;

        try {
            const response = await this.makeRequest(prompt, 500);
            const teams = this.parseTeamsFromText(response);
            
            console.log('✅ Team dependencies identified:', teams);
            return teams;
        } catch (error) {
            console.error('❌ Error mapping dependencies, using defaults:', error.message);
            return ['Frontend', 'Backend'];
        }
    }

    async generateOnePager(title, description, objectives, teams) {
        console.log('📄 Generating one-pager...');

        const prompt = `Create a professional one-pager document for this initiative:

Title: ${title}
Description: ${description}
Objectives:
${Array.isArray(objectives) ? objectives.map(o => `- ${o}`).join('\n') : objectives}
Assigned Teams: ${Array.isArray(teams) ? teams.join(', ') : teams}

Please create a well-structured document with sections like:
- Executive Summary
- Objectives
- Team Responsibilities
- Success Metrics
- Timeline

Write in a professional, concise tone suitable for stakeholders.`;

        try {
            const onePager = await this.makeRequest(prompt, 3000);
            console.log('✅ One-pager generated.');
            return onePager;
        } catch (error) {
            console.error('❌ Failed to generate one-pager:', error.message);
            // Return a basic template as fallback
            return `# ${title}

## Executive Summary
${description}

## Objectives
${Array.isArray(objectives) ? objectives.map(o => `- ${o}`).join('\n') : objectives}

## Team Responsibilities
${Array.isArray(teams) ? teams.map(team => `- **${team}**: Implementation and delivery`).join('\n') : teams}

## Success Metrics
- Initiative completion within timeline
- All objectives met
- Stakeholder satisfaction

## Timeline
To be determined based on team capacity and requirements.`;
        }
    }

    async generateTaskBreakdown(title, description, objectives, teams) {
        console.log('📋 Generating task breakdown...');

        const prompt = `Break down this initiative into specific tasks:

Initiative: ${title}
Description: ${description}
Objectives:
${Array.isArray(objectives) ? objectives.map(o => `- ${o}`).join('\n') : objectives}
Teams available: ${Array.isArray(teams) ? teams.join(', ') : teams}

Create a list of 3-5 specific tasks that need to be completed. For each task, include:
- What needs to be done
- Which team should handle it
- Estimated time/effort
- Priority level

Make the tasks realistic and actionable.`;

        try {
            const response = await this.makeRequest(prompt, 2000);
            const tasks = this.parseTasksFromText(response, teams);
            
            console.log(`✅ Generated ${tasks.length} tasks.`);
            return tasks;
        } catch (error) {
            console.error('❌ Using fallback task set:', error.message);
            return [{
                title: `${title} - Implementation`,
                description: description,
                team: teams[0] || 'Backend',
                estimated_hours: 40,
                priority: 'High',
                dependencies: []
            }];
        }
    }

    async analyzeInitiativeComplexity(title, description, objectives) {
        console.log('📊 Analyzing initiative complexity...');

        const prompt = `Analyze the complexity of this initiative:

Title: ${title}
Description: ${description}
Objectives:
${Array.isArray(objectives) ? objectives.map(o => `- ${o}`).join('\n') : objectives}

Please provide:
1. A complexity score from 1-10 (1 = very simple, 10 = extremely complex)
2. Your reasoning for this score
3. Recommended timeline in weeks

Consider factors like technical difficulty, team coordination needs, dependencies, scope, and potential risks.`;

        try {
            const response = await this.makeRequest(prompt, 800);
            const analysis = this.parseComplexityFromText(response);
            
            console.log('✅ Complexity analysis completed:', analysis);
            return analysis;
        } catch (error) {
            console.error('❌ Using fallback complexity analysis:', error.message);
            return {
                complexity_score: 5,
                reasoning: "Unable to analyze automatically - defaulting to medium complexity",
                recommended_timeline_weeks: 8
            };
        }
    }
}

module.exports = new AIService();
