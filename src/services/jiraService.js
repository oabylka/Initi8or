const axios = require('axios');
const { config } = require('../config/env');
const { JIRA_ISSUE_TYPES, HTTP_STATUS } = require('../config/constants');

class JiraService {
    constructor() {
        this.baseURL = config.jira.baseUrl;
        this.auth = {
            username: config.jira.email,
            password: config.jira.apiToken
        };
        
        // Test connection on startup
        this.testConnection();
    }

    async testConnection() {
        try {
            const response = await axios.get(
                `${this.baseURL}/rest/api/3/myself`,
                { auth: this.auth, timeout: 5000 }
            );
            console.log('✅ Jira connected successfully as:', response.data.displayName);
        } catch (error) {
            console.error('❌ Jira connection failed:', error.message);
            console.error('   Check your JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN');
        }
    }

    async getProjectInfo(projectKey) {
        try {
            const response = await axios.get(
                `${this.baseURL}/rest/api/3/project/${projectKey}`,
                { auth: this.auth }
            );
            return response.data;
        } catch (error) {
            console.error(`❌ Failed to get project info for ${projectKey}:`, error.message);
            return null;
        }
    }

    async createTicket(projectKey, summary, description, issueType = JIRA_ISSUE_TYPES.TASK, priority = 'Medium') {
        console.log(`🎫 Creating Jira ticket in ${projectKey}:`, summary);
        
        try {
            // First, verify the project exists
            const projectInfo = await this.getProjectInfo(projectKey);
            if (!projectInfo) {
                return {
                    success: false,
                    error: `Project ${projectKey} not found or not accessible`
                };
            }

            const ticketData = {
                fields: {
                    project: { key: projectKey },
                    summary: summary,
                    description: {
                        type: 'doc',
                        version: 1,
                        content: [{
                            type: 'paragraph',
                            content: [{
                                type: 'text',
                                text: description
                            }]
                        }]
                    },
                    issuetype: { name: issueType }
                }
            };

            // Add priority if supported by project
            if (priority) {
                ticketData.fields.priority = { name: priority };
            }

            const response = await axios.post(
                `${this.baseURL}/rest/api/3/issue`,
                ticketData,
                { 
                    auth: this.auth,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const ticketKey = response.data.key;
            const ticketUrl = `${this.baseURL}/browse/${ticketKey}`;
            
            console.log('✅ Jira ticket created:', ticketKey);
            
            return {
                success: true,
                ticketKey,
                ticketUrl,
                ticketId: response.data.id
            };
        } catch (error) {
            console.error('❌ Failed to create Jira ticket:', error.response?.data || error.message);
            
            let errorMessage = 'Unknown error occurred';
            if (error.response?.data?.errors) {
                errorMessage = Object.values(error.response.data.errors).join(', ');
            } else if (error.response?.data?.errorMessages) {
                errorMessage = error.response.data.errorMessages.join(', ');
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            return {
                success: false,
                error: errorMessage,
                statusCode: error.response?.status
            };
        }
    }

    async createMultipleTickets(ticketRequests) {
        console.log(`🎫 Creating ${ticketRequests.length} Jira tickets...`);
        
        const results = [];
        
        for (const request of ticketRequests) {
            const result = await this.createTicket(
                request.projectKey,
                request.summary,
                request.description,
                request.issueType,
                request.priority
            );
            
            results.push({
                ...result,
                projectKey: request.projectKey,
                team: request.team
            });
            
            // Add small delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const successful = results.filter(r => r.success).length;
        console.log(`✅ Created ${successful}/${ticketRequests.length} Jira tickets successfully`);
        
        return results;
    }

    async getTicketStatus(ticketKey) {
        try {
            const response = await axios.get(
                `${this.baseURL}/rest/api/3/issue/${ticketKey}?fields=status,summary`,
                { auth: this.auth }
            );
            
            return {
                success: true,
                status: response.data.fields.status.name,
                summary: response.data.fields.summary
            };
        } catch (error) {
            console.error(`❌ Failed to get ticket status for ${ticketKey}:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async addComment(ticketKey, comment) {
        try {
            await axios.post(
                `${this.baseURL}/rest/api/3/issue/${ticketKey}/comment`,
                {
                    body: {
                        type: 'doc',
                        version: 1,
                        content: [{
                            type: 'paragraph',
                            content: [{
                                type: 'text',
                                text: comment
                            }]
                        }]
                    }
                },
                { auth: this.auth }
            );
            
            console.log(`✅ Comment added to ${ticketKey}`);
            return { success: true };
        } catch (error) {
            console.error(`❌ Failed to add comment to ${ticketKey}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    formatTicketSummary(initiativeTitle, teamName, taskTitle = null) {
        if (taskTitle) {
            return `${initiativeTitle} - ${teamName}: ${taskTitle}`;
        }
        return `${initiativeTitle} - ${teamName} Implementation`;
    }

    formatTicketDescription(initiative, task = null) {
        let description = `Initiative: ${initiative.title}\n\n`;
        description += `Description: ${initiative.description}\n\n`;
        
        if (initiative.objectives && initiative.objectives.length > 0) {
            description += `Objectives:\n`;
            initiative.objectives.forEach(obj => {
                description += `• ${obj}\n`;
            });
            description += '\n';
        }

        if (task) {
            description += `Task Details:\n`;
            description += `• ${task.description}\n`;
            description += `• Estimated Hours: ${task.estimated_hours}\n`;
            description += `• Priority: ${task.priority}\n`;
        }

        description += `\nThis ticket is part of the "${initiative.title}" initiative.`;
        return description;
    }
}

module.exports = new JiraService();