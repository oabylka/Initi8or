const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const aiService = require('../services/aiService');
const jiraService = require('../services/jiraService');

// Get all teams
router.get('/teams', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM team_ownership ORDER BY team_name');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create initiative
router.post('/initiatives', async (req, res) => {
    const { title, description, objectives } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO initiatives (title, description, objectives) VALUES ($1, $2, $3) RETURNING *',
            [title, description, JSON.stringify(objectives)]
        );
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate artifacts
router.post('/initiatives/:id/generate', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Get initiative
        const initiative = await pool.query('SELECT * FROM initiatives WHERE id = $1', [id]);
        if (initiative.rows.length === 0) {
            return res.status(404).json({ error: 'Initiative not found' });
        }
        
        const init = initiative.rows[0];
        
        // AI dependency mapping
        const teamsResponse = await aiService.mapTeamDependencies(
            init.title, 
            init.description, 
            init.objectives
        );
        
        // Parse AI response to get teams
        const teams = JSON.parse(teamsResponse.replace(/```json\n?|\n?```/g, ''));
        
        // Generate artifacts
        const onePager = await aiService.generateOnePager(
            init.title, 
            init.description, 
            init.objectives, 
            teams
        );
        
        const taskBreakdown = await aiService.generateTaskBreakdown(
            init.title, 
            init.description, 
            teams
        );
        
        // Update initiative
        await pool.query(
            'UPDATE initiatives SET one_pager = $1, task_breakdown = $2, team_assignments = $3 WHERE id = $4',
            [onePager, taskBreakdown, JSON.stringify(teams), id]
        );
        
        res.json({
            teams,
            onePager,
            taskBreakdown: JSON.parse(taskBreakdown.replace(/```json\n?|\n?```/g, ''))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Jira tickets
router.post('/initiatives/:id/launch', async (req, res) => {
    const { id } = req.params;
    
    try {
        // Get initiative and teams
        const initiative = await pool.query('SELECT * FROM initiatives WHERE id = $1', [id]);
        const teams = await pool.query('SELECT * FROM team_ownership');
        
        if (initiative.rows.length === 0) {
            return res.status(404).json({ error: 'Initiative not found' });
        }
        
        const init = initiative.rows[0];
        const teamMap = teams.rows.reduce((acc, team) => {
            acc[team.team_name] = team;
            return acc;
        }, {});
        
        const createdTickets = [];
        const teamAssignments = JSON.parse(init.team_assignments || '[]');
        
        // Create tickets for each assigned team
        for (const teamName of teamAssignments) {
            const team = teamMap[teamName];
            if (team && team.jira_project_code) {
                const ticketResult = await jiraService.createTicket(
                    team.jira_project_code,
                    `${init.title} - ${teamName} Implementation`,
                    `${init.description}\n\nThis ticket is part of the ${init.title} initiative.`
                );
                
                createdTickets.push({
                    team: teamName,
                    ...ticketResult
                });
            }
        }
        
        // Update initiative with created tickets
        await pool.query(
            'UPDATE initiatives SET created_tickets = $1, status = $2 WHERE id = $3',
            [JSON.stringify(createdTickets), 'launched', id]
        );
        
        res.json({ createdTickets });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get initiative
router.get('/initiatives/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query('SELECT * FROM initiatives WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Initiative not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;