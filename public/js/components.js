// Reusable UI components

class Components {
    static createInitiativeForm() {
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-plus-circle"></i> Create New Initiative
                    </h2>
                </div>

                <form id="initiative-form">
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="title" class="required">Initiative Title</label>
                            <input type="text" id="title" class="form-control" 
                                   placeholder="Enter a clear, descriptive title" 
                                   maxlength="200" required>
                            <div class="form-help">
                                Choose a title that clearly describes the initiative's purpose
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="description" class="required">Description</label>
                            <textarea id="description" class="form-control" rows="4" 
                                      placeholder="Describe what this initiative aims to achieve..."
                                      maxlength="2000" required></textarea>
                            <div class="form-help">
                                Provide context, goals, and expected outcomes
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="objectives" class="required">Objectives</label>
                            <textarea id="objectives" class="form-control" rows="4" 
                                      placeholder="• First objective&#10;• Second objective&#10;• Third objective"
                                      required></textarea>
                            <div class="form-help">
                                List specific, measurable objectives (one per line)
                            </div>
                        </div>
                    </div>

                    <div class="card-actions">
                        <button type="submit" class="btn btn-primary btn-lg">
                            <i class="fas fa-magic"></i> Create & Analyze Initiative
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="app.showAllInitiatives()">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    static createArtifactReview(data) {
        const { teams, onePager, taskBreakdown, complexityAnalysis, teamDetails } = data;
        
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-cog"></i> AI Analysis Complete
                    </h2>
                    <div class="card-actions">
                        <span class="alert alert-success">
                            <i class="fas fa-check"></i> Artifacts generated successfully!
                        </span>
                    </div>
                </div>

                ${complexityAnalysis ? `
                    <div class="alert alert-info">
                        <i class="fas fa-chart-line"></i>
                        <strong>Complexity Score:</strong> ${complexityAnalysis.complexity_score}/10 - 
                        ${complexityAnalysis.reasoning}
                        <br><strong>Recommended Timeline:</strong> ${complexityAnalysis.recommended_timeline_weeks} weeks
                    </div>
                ` : ''}

                <div class="form-grid two-col">
                    <div>
                        <h3><i class="fas fa-users"></i> Team Dependencies</h3>
                        <div class="team-list">
                            ${teams.map(team => `<span class="team-tag assigned">${team}</span>`).join('')}
                        </div>
                        
                        <h4>Team Details</h4>
                        <div class="team-grid">
                            ${teamDetails.map(team => `
                                <div class="team-card">
                                    <div class="team-name">${team.team_name}</div>
                                    <div class="team-details">
                                        <div><strong>PM:</strong> ${team.pm || 'Not assigned'}</div>
                                        <div><strong>TL:</strong> ${team.tl || 'Not assigned'}</div>
                                        <div><strong>EM:</strong> ${team.em || 'Not assigned'}</div>
                                        <div><strong>Jira:</strong> ${team.jira_project_code || 'Not configured'}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div>
                        <h3><i class="fas fa-tasks"></i> Task Breakdown</h3>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Task</th>
                                        <th>Team</th>
                                        <th>Priority</th>
                                        <th>Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${taskBreakdown.map(task => `
                                        <tr>
                                            <td>
                                                <strong>${task.title}</strong>
                                                <br><small class="text-muted">${task.description}</small>
                                            </td>
                                            <td><span class="team-tag">${task.team}</span></td>
                                            <td>
                                                <span class="status status-${task.priority.toLowerCase()}">
                                                    ${task.priority}
                                                </span>
                                            </td>
                                            <td>${task.estimated_hours}h</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div>
                    <h3><i class="fas fa-file-alt"></i> One-Pager Document</h3>
                    <div class="card" style="background: #f8f9fa; max-height: 400px; overflow-y: auto;">
                        <pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${onePager}</pre>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn btn-success btn-lg" onclick="app.launchInitiative()">
                        <i class="fas fa-rocket"></i> Launch Initiative (Create Jira Tickets)
                    </button>
                    <button class="btn btn-primary" onclick="Utils.copyToClipboard(\`${onePager.replace(/`/g, '\\`')}\`)">
                        <i class="fas fa-copy"></i> Copy One-Pager
                    </button>
                    <button class="btn btn-secondary" onclick="app.showCreateForm()">
                        <i class="fas fa-edit"></i> Create Another
                    </button>
                </div>
            </div>
        `;
    }

    static createDashboard(data) {
        const { initiative, teamDetails, ticketStatuses, summary } = data;
        
        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-tachometer-alt"></i> Initiative Dashboard
                    </h2>
                    <div class="card-actions">
                        <span class="status status-${initiative.status}">
                            <i class="fas ${Utils.getStatusIcon(initiative.status)}"></i>
                            ${Utils.capitalizeFirst(initiative.status)}
                        </span>
                    </div>
                </div>

                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <strong>Initiative "${initiative.title}" has been launched successfully!</strong>
                    All Jira tickets have been created and teams have been notified.
                </div>

                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-number">${summary.teamsAssigned}</span>
                        <span class="stat-label">Teams Assigned</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${summary.ticketsCreated}</span>
                        <span class="stat-label">Tickets Created</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${summary.totalTasks}</span>
                        <span class="stat-label">Total Tasks</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${Utils.formatDateShort(initiative.created_at)}</span>
                        <span class="stat-label">Created</span>
                    </div>
                </div>

                <div class="form-grid">
                    <div>
                        <h3><i class="fas fa-ticket-alt"></i> Created Jira Tickets</h3>
                        <div class="table-container">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Team</th>
                                        <th>Status</th>
                                        <th>Ticket</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ticketStatuses.map(ticket => `
                                        <tr>
                                            <td><span class="team-tag">${ticket.team}</span></td>
                                            <td>
                                                ${ticket.success ? 
                                                    `<span class="status status-launched">
                                                        <i class="fas fa-check"></i> Created
                                                    </span>` :
                                                    `<span class="status status-draft">
                                                        <i class="fas fa-times"></i> Failed
                                                    </span>`
                                                }
                                            </td>
                                            <td>
                                                ${ticket.success ? 
                                                    `<a href="${ticket.ticketUrl}" target="_blank" class="btn btn-sm btn-outline">
                                                        <i class="fas fa-external-link-alt"></i> ${ticket.ticketKey}
                                                    </a>` : 
                                                    `<span class="text-muted">N/A</span>`
                                                }
                                            </td>
                                            <td>
                                                ${ticket.success ? 
                                                    `<button class="btn btn-sm btn-secondary" onclick="Utils.copyToClipboard('${ticket.ticketUrl}')">
                                                        <i class="fas fa-copy"></i> Copy Link
                                                    </button>` : 
                                                    `<span class="text-error">${ticket.error || 'Failed to create'}</span>`
                                                }
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h3><i class="fas fa-users"></i> Team Information</h3>
                        <div class="team-grid">
                            ${teamDetails.map(team => `
                                <div class="team-card">
                                    <div class="team-name">${team.team_name}</div>
                                    <div class="team-details">
                                        <div><strong>PM:</strong> ${team.pm || 'Not assigned'}</div>
                                        <div><strong>TL:</strong> ${team.tl || 'Not assigned'}</div>
                                        <div><strong>EM:</strong> ${team.em || 'Not assigned'}</div>
                                        <div><strong>Slack:</strong> ${team.slack_channel || 'Not configured'}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <div>
                    <h3><i class="fas fa-file-alt"></i> Initiative Details</h3>
                    <div class="card" style="background: #f8f9fa;">
                        <p><strong>Description:</strong> ${initiative.description}</p>
                        <p><strong>Objectives:</strong></p>
                        <ul>
                            ${initiative.objectives.map(obj => `<li>${obj}</li>`).join('')}
                        </ul>
                    </div>
                </div>

                <div class="card-actions">
                    <button class="btn btn-primary" onclick="app.showCreateForm()">
                        <i class="fas fa-plus"></i> Create Another Initiative
                    </button>
                    <button class="btn btn-secondary" onclick="app.showAllInitiatives()">
                        <i class="fas fa-list"></i> View All Initiatives
                    </button>
                    <button class="btn btn-outline" onclick="Utils.exportToCSV(${JSON.stringify(ticketStatuses)}, 'initiative-tickets.csv')">
                        <i class="fas fa-download"></i> Export Tickets
                    </button>
                </div>
            </div>
        `;
    }

    static createAllInitiatives(initiatives) {
        if (!initiatives || initiatives.length === 0) {
            return `
                <div class="card text-center">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 1rem;"></i>
                    <h2>No Initiatives Found</h2>
                    <p class="text-muted">Get started by creating your first initiative.</p>
                    <button class="btn btn-primary btn-lg" onclick="app.showCreateForm()">
                        <i class="fas fa-plus"></i> Create First Initiative
                    </button>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">
                        <i class="fas fa-list"></i> All Initiatives
                    </h2>
                    <div class="card-actions">
                        <button class="btn btn-primary" onclick="app.showCreateForm()">
                            <i class="fas fa-plus"></i> New Initiative
                        </button>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Teams</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${initiatives.map(initiative => `
                                <tr>
                                    <td>
                                        <strong>${initiative.title}</strong>
                                        <br><small class="text-muted">
                                            ${Utils.truncateText(initiative.description, 60)}
                                        </small>
                                    </td>
                                    <td>
                                        <span class="status status-${initiative.status}">
                                            <i class="fas ${Utils.getStatusIcon(initiative.status)}"></i>
                                            ${Utils.capitalizeFirst(initiative.status)}
                                        </span>
                                    </td>
                                    <td>
                                        ${initiative.team_assignments ? 
                                            initiative.team_assignments.slice(0, 3).map(team => 
                                                `<span class="team-tag">${team}</span>`
                                            ).join('') + 
                                            (initiative.team_assignments.length > 3 ? 
                                                `<span class="text-muted">+${initiative.team_assignments.length - 3} more</span>` : ''
                                            ) :
                                            '<span class="text-muted">No teams assigned</span>'
                                        }
                                    </td>
                                    <td>${Utils.formatDateShort(initiative.created_at)}</td>
                                    <td>
                                        ${initiative.status === 'launched' ? 
                                            `<button class="btn btn-sm btn-primary" onclick="app.showDashboard(${initiative.id})">
                                                <i class="fas fa-tachometer-alt"></i> Dashboard
                                            </button>` :
                                            `<button class="btn btn-sm btn-outline" onclick="app.continueInitiative(${initiative.id})">
                                                <i class="fas fa-play"></i> Continue
                                            </button>`
                                        }
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static createLoadingState(message = 'Processing...') {
        return `
            <div class="card text-center">
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <h3>${message}</h3>
                    <p class="text-muted">This may take a moment while AI analyzes your initiative.</p>
                </div>
            </div>
        `;
    }

    static createErrorState(error, retry = null) {
        return `
            <div class="card text-center">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--error-color); margin-bottom: 1rem;"></i>
                <h2>Something went wrong</h2>
                <p class="text-error">${error}</p>
                ${retry ? `
                    <div style="margin-top: 1.5rem;">
                        <button class="btn btn-primary" onclick="${retry}">
                            <i class="fas fa-redo"></i> Try Again
                        </button>
                        <button class="btn btn-secondary" onclick="app.showCreateForm()">
                            <i class="fas fa-home"></i> Start Over
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
}