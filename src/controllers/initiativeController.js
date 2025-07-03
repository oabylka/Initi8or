const Initiative = require('../models/Initiative');
const Team = require('../models/Team');
const aiService = require('../services/aiService');
const jiraService = require('../services/jiraService');
const { INITIATIVE_STATUS, HTTP_STATUS } = require('../config/constants');

class InitiativeController {
    static async create(req, res) {
        try {
            const { title, description, objectives } = req.body;
            
            // Validation
            if (!title || !description || !objectives) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Missing required fields: title, description, objectives'
                });
            }

            if (!Array.isArray(objectives) || objectives.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Objectives must be a non-empty array'
                });
            }

            console.log('📝 Creating new initiative:', title);

            const initiative = await Initiative.create({
                title: title.trim(),
                description: description.trim(),
                objectives: objectives.map(obj => obj.trim()).filter(obj => obj)
            });

            console.log('✅ Initiative created with ID:', initiative.id);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                data: initiative
            });

        } catch (error) {
            console.error('❌ Error creating initiative:', error.message);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                error: 'Failed to create initiative',
                details: error.message
            });
        }
    }

    static async generateArtifacts(req, res) {
        try {
            const { id } = req.params;
            
            console.log('🤖 Generating artifacts for initiative:', id);

            // Get initiative
            const initiative = await Initiative.findById(id);
            
            // Update status to analyzing
            await Initiative.updateStatus(id, INITIATIVE_STATUS.ANALYZING);

            // AI dependency mapping - now returns array directly
            const teams = await aiService.mapTeamDependencies(
                initiative.title,
                initiative.description,
                initiative.objectives
            );

            console.log('🔍 Teams identified:', teams);

            // Validate teams exist in database
            const validTeams = await Team.findByNames(teams);
            const validTeamNames = validTeams.map(team => team.team_name);

            if (validTeamNames.length === 0) {
                console.warn('⚠️ No valid teams found, using fallback');
                validTeamNames.push('Frontend', 'Backend');
                // Get fallback team data
                const fallbackTeams = await Team.findByNames(['Frontend', 'Backend']);
                validTeams.push(...fallbackTeams);
            }

            console.log('✅ Valid teams confirmed:', validTeamNames);

            // Generate artifacts - these now return structured data directly
            console.log('📄 Generating one-pager...');
            const onePager = await aiService.generateOnePager(
                initiative.title,
                initiative.description,
                initiative.objectives,
                validTeamNames
            );

            console.log('📋 Generating task breakdown...');
            const taskBreakdown = await aiService.generateTaskBreakdown(
                initiative.title,
                initiative.description,
                initiative.objectives,
                validTeamNames
            );

            console.log('📊 Analyzing complexity...');
            const complexityAnalysis = await aiService.analyzeInitiativeComplexity(
                initiative.title,
                initiative.description,
                initiative.objectives
            );

            console.log('💾 Updating initiative with generated content...');

            // Update initiative with generated content
            const updatedInitiative = await Initiative.update(id, {
                one_pager: onePager,
                task_breakdown: taskBreakdown,
                team_assignments: validTeamNames,
                status: INITIATIVE_STATUS.READY
            });

            console.log('✅ Artifacts generated successfully');

            res.json({
                success: true,
                data: {
                    initiative: updatedInitiative,
                    teams: validTeamNames,
                    onePager,
                    taskBreakdown,
                    complexityAnalysis,
                    teamDetails: validTeams
                }
            });

        } catch (error) {
            console.error('❌ Error generating artifacts:', error.message);
            console.error('❌ Error stack:', error.stack);
            
            // Update status back to draft if failed
            try {
                await Initiative.updateStatus(req.params.id, INITIATIVE_STATUS.DRAFT);
            } catch (updateError) {
                console.error('❌ Failed to update status after error:', updateError.message);
            }

            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                error: 'Failed to generate artifacts',
                details: error.message
            });
        }
    }

    static async launch(req, res) {
        try {
            const { id } = req.params;
            
            console.log('🚀 Launching initiative:', id);

            // Get initiative and validate it's ready
            const initiative = await Initiative.findById(id);
            
            if (initiative.status !== INITIATIVE_STATUS.READY) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Initiative must be in ready status to launch'
                });
            }

            if (!initiative.team_assignments || initiative.team_assignments.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Initiative must have team assignments to launch'
                });
            }

            // Get team details for Jira project codes
            const teams = await Team.findByNames(initiative.team_assignments);
            const taskBreakdown = initiative.task_breakdown || [];

            // Prepare ticket requests
            const ticketRequests = [];

            if (taskBreakdown.length > 0) {
                // Create tickets based on task breakdown
                taskBreakdown.forEach(task => {
                    const team = teams.find(t => t.team_name === task.team);
                    if (team && team.jira_project_code) {
                        ticketRequests.push({
                            projectKey: team.jira_project_code,
                            summary: jiraService.formatTicketSummary(
                                initiative.title,
                                task.team,
                                task.title
                            ),
                            description: jiraService.formatTicketDescription(initiative, task),
                            issueType: 'Task',
                            priority: task.priority || 'Medium',
                            team: task.team
                        });
                    }
                });
            } else {
                // Create one ticket per team if no task breakdown
                teams.forEach(team => {
                    if (team.jira_project_code) {
                        ticketRequests.push({
                            projectKey: team.jira_project_code,
                            summary: jiraService.formatTicketSummary(
                                initiative.title,
                                team.team_name
                            ),
                            description: jiraService.formatTicketDescription(initiative),
                            issueType: 'Task',
                            priority: 'Medium',
                            team: team.team_name
                        });
                    }
                });
            }

            if (ticketRequests.length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'No teams have valid Jira project codes configured'
                });
            }

            // Create Jira tickets
            const createdTickets = await jiraService.createMultipleTickets(ticketRequests);

            // Update initiative with created tickets
            await Initiative.update(id, {
                created_tickets: createdTickets,
                status: INITIATIVE_STATUS.LAUNCHED
            });

            const successCount = createdTickets.filter(ticket => ticket.success).length;
            console.log(`✅ Initiative launched: ${successCount}/${createdTickets.length} tickets created`);

            res.json({
                success: true,
                data: {
                    createdTickets,
                    summary: {
                        total: createdTickets.length,
                        successful: successCount,
                        failed: createdTickets.length - successCount
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error launching initiative:', error.message);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                error: 'Failed to launch initiative',
                details: error.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const initiative = await Initiative.findById(id);
            
            res.json({
                success: true,
                data: initiative
            });

        } catch (error) {
            console.error('❌ Error getting initiative:', error.message);
            
            if (error.message === 'Initiative not found') {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: 'Initiative not found'
                });
            } else {
                res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                    error: 'Failed to get initiative',
                    details: error.message
                });
            }
        }
    }

    static async getAll(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            
            const initiatives = await Initiative.findAll(limit, offset);
            
            res.json({
                success: true,
                data: initiatives,
                pagination: {
                    limit,
                    offset,
                    count: initiatives.length
                }
            });

        } catch (error) {
            console.error('❌ Error getting initiatives:', error.message);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                error: 'Failed to get initiatives',
                details: error.message
            });
        }
    }

    static async getDashboard(req, res) {
        try {
            const { id } = req.params;
            
            // Get initiative with full details
            const initiative = await Initiative.findById(id);
            
            // Get team details
            let teamDetails = [];
            if (initiative.team_assignments) {
                teamDetails = await Team.findByNames(initiative.team_assignments);
            }

            // Get ticket statuses if tickets were created
            const ticketStatuses = [];
            if (initiative.created_tickets) {
                for (const ticket of initiative.created_tickets) {
                    if (ticket.success && ticket.ticketKey) {
                        const status = await jiraService.getTicketStatus(ticket.ticketKey);
                        ticketStatuses.push({
                            ...ticket,
                            currentStatus: status.success ? status.status : 'Unknown'
                        });
                    } else {
                        ticketStatuses.push(ticket);
                    }
                }
            }

            res.json({
                success: true,
                data: {
                    initiative,
                    teamDetails,
                    ticketStatuses,
                    summary: {
                        status: initiative.status,
                        teamsAssigned: initiative.team_assignments?.length || 0,
                        ticketsCreated: ticketStatuses.filter(t => t.success).length,
                        totalTasks: initiative.task_breakdown?.length || 0
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error getting dashboard:', error.message);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                error: 'Failed to get dashboard data',
                details: error.message
            });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            console.log('🗑️ Deleting initiative:', id);
            
            const deletedInitiative = await Initiative.delete(id);
            
            console.log('✅ Initiative deleted:', deletedInitiative.title);

            res.json({
                success: true,
                message: 'Initiative deleted successfully',
                data: deletedInitiative
            });

        } catch (error) {
            console.error('❌ Error deleting initiative:', error.message);
            
            if (error.message === 'Initiative not found') {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: 'Initiative not found'
                });
            } else {
                res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                    error: 'Failed to delete initiative',
                    details: error.message
                });
            }
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            console.log('📝 Updating initiative:', id, 'with data:', Object.keys(updateData));
            
            const updatedInitiative = await Initiative.update(id, updateData);
            
            console.log('✅ Initiative updated successfully');

            res.json({
                success: true,
                data: updatedInitiative
            });

        } catch (error) {
            console.error('❌ Error updating initiative:', error.message);
            
            if (error.message === 'Initiative not found') {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: 'Initiative not found'
                });
            } else {
                res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                    error: 'Failed to update initiative',
                    details: error.message
                });
            }
        }
    }
}

module.exports = InitiativeController;