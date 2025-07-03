const database = require('../config/database');
const { INITIATIVE_STATUS } = require('../config/constants');

class Initiative {
    static async create(data) {
        const { title, description, objectives } = data;
        
        const query = `
            INSERT INTO initiatives (title, description, objectives, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const result = await database.query(query, [
            title,
            description,
            JSON.stringify(objectives),
            INITIATIVE_STATUS.DRAFT
        ]);
        
        return result.rows[0];
    }

    static async findById(id) {
        const query = 'SELECT * FROM initiatives WHERE id = $1';
        const result = await database.query(query, [id]);
        
        if (result.rows.length === 0) {
            throw new Error('Initiative not found');
        }

        const initiative = result.rows[0];
        
        // Safely parse JSON fields with fallbacks
        initiative.objectives = this.safeParseJSON(initiative.objectives, []);
        initiative.task_breakdown = this.safeParseJSON(initiative.task_breakdown, []);
        initiative.created_tickets = this.safeParseJSON(initiative.created_tickets, []);
        initiative.team_assignments = this.safeParseJSON(initiative.team_assignments, []);

        return initiative;
    }

    // Helper method to safely parse JSON with fallbacks
    static safeParseJSON(jsonString, fallback = null) {
        if (!jsonString) {
            return fallback;
        }

        // If it's already an object/array, return it
        if (typeof jsonString === 'object') {
            return jsonString;
        }

        // If it's not a string, convert to fallback
        if (typeof jsonString !== 'string') {
            console.warn('⚠️ Expected JSON string but got:', typeof jsonString, jsonString);
            return fallback;
        }

        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('⚠️ Failed to parse JSON:', jsonString.substring(0, 100), 'Error:', error.message);
            
            // If it looks like a simple string that should be an array, try to convert it
            if (Array.isArray(fallback)) {
                // Try to split by common delimiters
                const cleaned = jsonString.trim();
                if (cleaned.includes(',')) {
                    return cleaned.split(',').map(item => item.trim()).filter(item => item);
                } else if (cleaned.includes('\n')) {
                    return cleaned.split('\n').map(item => item.trim()).filter(item => item);
                } else {
                    // Single item
                    return [cleaned];
                }
            }
            
            return fallback;
        }
    }

    static async update(id, data) {
        const allowedFields = [
            'one_pager', 'task_breakdown', 'status', 
            'created_tickets', 'team_assignments'
        ];
        
        const updates = [];
        const values = [];
        let paramCount = 1;

        Object.keys(data).forEach(key => {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = $${paramCount}`);
                
                // JSON stringify if needed
                const value = (typeof data[key] === 'object') 
                    ? JSON.stringify(data[key]) 
                    : data[key];
                    
                values.push(value);
                paramCount++;
            }
        });

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        // Add updated timestamp
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(id);

        const query = `
            UPDATE initiatives 
            SET ${updates.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await database.query(query, values);
        return result.rows[0];
    }

    static async findAll(limit = 50, offset = 0) {
        const query = `
            SELECT * FROM initiatives 
            ORDER BY created_at DESC 
            LIMIT $1 OFFSET $2
        `;
        
        const result = await database.query(query, [limit, offset]);
        
        return result.rows.map(initiative => {
            // Safely parse JSON fields for each initiative
            initiative.objectives = this.safeParseJSON(initiative.objectives, []);
            initiative.task_breakdown = this.safeParseJSON(initiative.task_breakdown, []);
            initiative.created_tickets = this.safeParseJSON(initiative.created_tickets, []);
            initiative.team_assignments = this.safeParseJSON(initiative.team_assignments, []);
            
            return initiative;
        });
    }

    static async updateStatus(id, status) {
        const query = `
            UPDATE initiatives 
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await database.query(query, [status, id]);
        return result.rows[0];
    }

    static async delete(id) {
        const query = 'DELETE FROM initiatives WHERE id = $1 RETURNING *';
        const result = await database.query(query, [id]);
        
        if (result.rows.length === 0) {
            throw new Error('Initiative not found');
        }
        
        return result.rows[0];
    }

    static async getStats() {
        const query = `
            SELECT 
                status,
                COUNT(*) as count
            FROM initiatives 
            GROUP BY status
        `;
        
        const result = await database.query(query);
        return result.rows;
    }

    // Clean up any corrupted data in the database
    static async cleanupCorruptedData() {
        console.log('🧹 Cleaning up corrupted JSON data...');
        
        const query = 'SELECT id, objectives, task_breakdown, created_tickets, team_assignments FROM initiatives';
        const result = await database.query(query);
        
        let cleanedCount = 0;
        
        for (const row of result.rows) {
            const updates = {};
            let needsUpdate = false;
            
            // Check each JSON field
            ['objectives', 'task_breakdown', 'created_tickets', 'team_assignments'].forEach(field => {
                if (row[field] && typeof row[field] === 'string') {
                    try {
                        JSON.parse(row[field]);
                    } catch (error) {
                        console.log(`🔧 Fixing corrupted ${field} in initiative ${row.id}:`, row[field]);
                        
                        if (field === 'objectives') {
                            // Convert string to array
                            updates[field] = JSON.stringify([row[field]]);
                        } else {
                            // Set to empty array/object as appropriate
                            updates[field] = field === 'task_breakdown' || field === 'created_tickets' || field === 'team_assignments' 
                                ? JSON.stringify([]) 
                                : JSON.stringify({});
                        }
                        needsUpdate = true;
                    }
                }
            });
            
            if (needsUpdate) {
                const updateFields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
                const updateValues = [row.id, ...Object.values(updates)];
                
                await database.query(
                    `UPDATE initiatives SET ${updateFields} WHERE id = $1`,
                    updateValues
                );
                cleanedCount++;
            }
        }
        
        console.log(`✅ Cleaned up ${cleanedCount} corrupted records`);
        return cleanedCount;
    }
}

module.exports = Initiative;