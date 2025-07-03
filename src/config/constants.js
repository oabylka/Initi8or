module.exports = {
    INITIATIVE_STATUS: {
        DRAFT: 'draft',
        ANALYZING: 'analyzing',
        READY: 'ready',
        LAUNCHED: 'launched',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },
    
    JIRA_ISSUE_TYPES: {
        TASK: 'Task',
        STORY: 'Story',
        BUG: 'Bug',
        EPIC: 'Epic'
    },
    
    TEAM_ROLES: {
        PM: 'Product Manager',
        TL: 'Tech Lead',
        EM: 'Engineering Manager'
    },
    
    AI_PROMPTS: {
        DEPENDENCY_MAPPING: `You are a technical analyst. Your task is to analyze an initiative and identify which teams should be involved.

Available teams: Frontend, Backend, Mobile, Data, DevOps, QA, Design, Security, Infrastructure.

Consider:
- Technical requirements and complexity
- Cross-team dependencies
- Timeline and resource constraints
- Risk factors

CRITICAL: You must respond with ONLY a valid JSON array of team names. Do not include any other text, explanations, or formatting.

Example response: ["Frontend", "Backend", "QA"]`,

        ONE_PAGER_TEMPLATE: `You are a technical writer. Create a professional one-pager document for this initiative.

Use this structure:
# [Initiative Title]

## Executive Summary
Brief overview and business impact

## Objectives
Clear, measurable goals

## Team Responsibilities
What each team will deliver

## Success Metrics
How success will be measured

## Timeline & Milestones
Key dates and deliverables

## Risk Mitigation
Potential challenges and solutions

Create a comprehensive, professional document that stakeholders can use to understand the initiative.`,

        TASK_BREAKDOWN: `You are a project manager. Create a detailed task breakdown for this initiative.

For each task, include:
- Clear, actionable title
- Detailed description
- Assigned team
- Estimated hours (be realistic)
- Priority level (High/Medium/Low)
- Dependencies on other tasks

CRITICAL: You must respond with ONLY a valid JSON array. Do not include any other text, explanations, or formatting.

Return as JSON array with this structure:
[{
  "title": "Task name",
  "description": "What needs to be done",
  "team": "Team name", 
  "estimated_hours": number,
  "priority": "High/Medium/Low",
  "dependencies": ["other task titles"]
}]`
    },
    
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        INTERNAL_ERROR: 500
    }
};