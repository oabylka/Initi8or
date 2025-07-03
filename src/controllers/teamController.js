const Team = require('../models/Team');
const { HTTP_STATUS } = require('../config/constants');

class TeamController {
    static async getAll(req, res) {
        try {
            const teams = await Team.findAll();
            
            res.json({
                success: true,
                data: teams
            });

        } catch (error) {
            console.error('❌ Error getting teams:', error.message);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                error: 'Failed to get teams',
                details: error.message
            });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const team = await Team.findById(id);
            
            res.json({
                success: true,
                data: team
            });

        } catch (error) {
            console.error('❌ Error getting team:', error.message);
            
            if (error.message.includes('not found')) {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: 'Team not found'
                });
            } else {
                res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                    error: 'Failed to get team',
                    details: error.message
                });
            }
        }
    }

    static async create(req, res) {
        try {
            const { team_name, pm, tl, em, jira_project_code, slack_channel } = req.body;
            
            // Validation
            if (!team_name) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    error: 'Team name is required'
                });
            }

            const team = await Team.create({
                team_name: team_name.trim(),
                pm: pm?.trim(),
                tl: tl?.trim(),
                em: em?.trim(),
                jira_project_code: jira_project_code?.trim(),
                slack_channel: slack_channel?.trim()
            });

            console.log('✅ Team created:', team.team_name);

            res.status(HTTP_STATUS.CREATED).json({
                success: true,
                data: team
            });

        } catch (error) {
            console.error('❌ Error creating team:', error.message);
            res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                error: 'Failed to create team',
                details: error.message
            });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const team = await Team.update(id, updateData);
            
            console.log('✅ Team updated:', team.team_name);

            res.json({
                success: true,
                data: team
            });

        } catch (error) {
            console.error('❌ Error updating team:', error.message);
            
            if (error.message === 'Team not found') {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: 'Team not found'
                });
            } else {
                res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                    error: 'Failed to update team',
                    details: error.message
                });
            }
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const team = await Team.delete(id);
            
            console.log('✅ Team deleted:', team.team_name);

            res.json({
                success: true,
                message: 'Team deleted successfully',
                data: team
            });

        } catch (error) {
            console.error('❌ Error deleting team:', error.message);
            
            if (error.message === 'Team not found') {
                res.status(HTTP_STATUS.NOT_FOUND).json({
                    error: 'Team not found'
                });
            } else {
                res.status(HTTP_STATUS.INTERNAL_ERROR).json({
                    error: 'Failed to delete team',
                    details: error.message
                });
            }
        }
    }
}

module.exports = TeamController;