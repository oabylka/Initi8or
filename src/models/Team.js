const database = require('../config/database');

class Team {
    static async findAll() {
        const query = 'SELECT * FROM team_ownership ORDER BY team_name';
        const result = await database.query(query);
        return result.rows;
    }

    static async findById(id) {
        const query = 'SELECT * FROM team_ownership WHERE id = $1';
        const result = await database.query(query, [id]);
        
        if (result.rows.length === 0) {
            throw new Error(`Team with ID ${id} not found`);
        }
        
        return result.rows[0];
    }

    static async findByName(teamName) {
        const query = 'SELECT * FROM team_ownership WHERE team_name = $1';
        const result = await database.query(query, [teamName]);
        
        if (result.rows.length === 0) {
            throw new Error(`Team ${teamName} not found`);
        }
        
        return result.rows[0];
    }

    static async findByNames(teamNames) {
        if (!Array.isArray(teamNames) || teamNames.length === 0) {
            return [];
        }
        
        const placeholders = teamNames.map((_, index) => `$${index + 1}`).join(',');
        const query = `SELECT * FROM team_ownership WHERE team_name IN (${placeholders})`;
        const result = await database.query(query, teamNames);
        return result.rows;
    }

    static async create(data) {
        // Check if team already exists
        try {
            await this.findByName(data.team_name);
            throw new Error(`Team ${data.team_name} already exists`);
        } catch (error) {
            if (!error.message.includes('not found')) {
                throw error;
            }
        }

        const { 
            team_name, pm, pm_email, tl, tl_email, em, em_email, 
            jira_project_code, slack_channel 
        } = data;
        
        const query = `
            INSERT INTO team_ownership (
                team_name, pm, pm_email, tl, tl_email, em, em_email, 
                jira_project_code, slack_channel
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        
        const result = await database.query(query, [
            team_name, pm, pm_email, tl, tl_email, em, em_email,
            jira_project_code, slack_channel
        ]);
        
        return result.rows[0];
    }

    static async update(id, data) {
        const allowedFields = [
            'team_name', 'pm', 'pm_email', 'tl', 'tl_email', 
            'em', 'em_email', 'jira_project_code', 'slack_channel'
        ];
        
        const updates = [];
        const values = [];
        let paramCount = 1;

        Object.keys(data).forEach(key => {
            if (allowedFields.includes(key) && data[key] !== undefined) {
                updates.push(`${key} = $${paramCount}`);
                values.push(data[key] || null); // Convert empty strings to null
                paramCount++;
            }
        });

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        values.push(id);
        const query = `
            UPDATE team_ownership 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await database.query(query, values);
        
        if (result.rows.length === 0) {
            throw new Error('Team not found');
        }
        
        return result.rows[0];
    }

    static async delete(id) {
        // Check if team is being used in any initiatives
        const usageCheck = await database.query(
            `SELECT id, title FROM initiatives 
             WHERE team_assignments::text LIKE $1`,
            [`%"${id}"%`]
        );

        if (usageCheck.rows.length > 0) {
            const initiativeTitles = usageCheck.rows.map(row => row.title).join(', ');
            throw new Error(`Cannot delete team: it is assigned to initiatives: ${initiativeTitles}`);
        }

        const query = 'DELETE FROM team_ownership WHERE id = $1 RETURNING *';
        const result = await database.query(query, [id]);
        
        if (result.rows.length === 0) {
            throw new Error('Team not found');
        }
        
        return result.rows[0];
    }

    static async getTeamStats() {
        const query = `
            SELECT 
                COUNT(*) as total_teams,
                COUNT(CASE WHEN jira_project_code IS NOT NULL AND jira_project_code != '' THEN 1 END) as teams_with_jira,
                COUNT(CASE WHEN slack_channel IS NOT NULL AND slack_channel != '' THEN 1 END) as teams_with_slack
            FROM team_ownership
        `;
        
        const result = await database.query(query);
        return result.rows[0];
    }
}

module.exports = Team;