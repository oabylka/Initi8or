const { HTTP_STATUS } = require('../config/constants');

function validateInitiativeCreate(req, res, next) {
    const { title, description, objectives } = req.body;
    const errors = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        errors.push('Title is required and must be a non-empty string');
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
        errors.push('Description is required and must be a non-empty string');
    }

    if (!objectives || !Array.isArray(objectives) || objectives.length === 0) {
        errors.push('Objectives must be a non-empty array');
    } else {
        const validObjectives = objectives.filter(obj => 
            typeof obj === 'string' && obj.trim().length > 0
        );
        if (validObjectives.length === 0) {
            errors.push('At least one valid objective is required');
        }
    }

    if (title && title.length > 200) {
        errors.push('Title must be 200 characters or less');
    }

    if (description && description.length > 2000) {
        errors.push('Description must be 2000 characters or less');
    }

    if (errors.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
}

function validateTeamCreate(req, res, next) {
    const { team_name, jira_project_code } = req.body;
    const errors = [];

    if (!team_name || typeof team_name !== 'string' || team_name.trim().length === 0) {
        errors.push('Team name is required and must be a non-empty string');
    }

    if (jira_project_code && (typeof jira_project_code !== 'string' || !/^[A-Z0-9]+$/.test(jira_project_code))) {
        errors.push('Jira project code must contain only uppercase letters and numbers');
    }

    if (errors.length > 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
}

function validateId(req, res, next) {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: 'Invalid ID parameter'
        });
    }

    next();
}

module.exports = {
    validateInitiativeCreate,
    validateTeamCreate,
    validateId
};