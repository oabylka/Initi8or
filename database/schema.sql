CREATE TABLE team_ownership (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    pm VARCHAR(100),
    tl VARCHAR(100),
    em VARCHAR(100),
    jira_project_code VARCHAR(20),
    slack_channel VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initiatives table
CREATE TABLE initiatives (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    objectives JSONB,
    one_pager TEXT,
    task_breakdown JSONB,
    status VARCHAR(50) DEFAULT 'draft',
    created_tickets JSONB,
    team_assignments JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample team data
INSERT INTO team_ownership (team_name, pm, tl, em, jira_project_code, slack_channel) VALUES
('Frontend', 'Alice Johnson', 'Bob Smith', 'Carol Wilson', 'FE', '#frontend-team'),
('Backend', 'David Brown', 'Eve Davis', 'Frank Miller', 'BE', '#backend-team'),
('Mobile', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'MOB', '#mobile-team'),
('Data', 'Jack Wilson', 'Kate Anderson', 'Liam Johnson', 'DATA', '#data-team'),
('DevOps', 'Maya Patel', 'Noah Kim', 'Olivia Garcia', 'DEVOPS', '#devops-team');