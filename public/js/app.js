class InitiativeApp {
    constructor() {
        this.currentInitiative = null;
        this.init();
    }

    init() {
        this.renderNavBar();
        this.showAllInitiatives();
    }

    renderNavBar() {
        // Remove existing nav if present
        const existingNav = document.getElementById('global-nav');
        if (existingNav) {
            existingNav.remove();
        }

        // Create new nav bar
        const nav = document.createElement('nav');
        nav.id = 'global-nav';
        nav.innerHTML = `
            <div class="nav-container">
                <div class="nav-brand">
                    <span class="brand-text">Intersect</span>
                </div>
                <div class="nav-menu">
                    <button id="nav-initiatives" class="nav-item active">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 11H1l8-8 8 8h-8v8z"/>
                        </svg>
                        <span>Initiatives</span>
                    </button>
                    <button id="nav-teams" class="nav-item">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <span>Teams</span>
                    </button>
                </div>
                <div class="nav-actions">
                    <button id="nav-create" class="create-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        <span>Create</span>
                    </button>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            #global-nav {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                background: linear-gradient(135deg, #1a1d24 0%, #2d3748 100%);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            }
            
            .nav-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 2rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 64px;
            }
            
            .nav-brand {
                display: flex;
                align-items: center;
            }
            
            .brand-text {
                color: #fff;
                font-size: 1.5rem;
                font-weight: 700;
                letter-spacing: 1px;
                background: linear-gradient(135deg, #00E0C6 0%, #00B4D8 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            
            .nav-menu {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .nav-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: none;
                border: none;
                color: #a0aec0;
                font-size: 0.95rem;
                font-weight: 500;
                padding: 0.75rem 1.25rem;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }
            
            .nav-item:hover {
                color: #fff;
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-1px);
            }
            
            .nav-item.active {
                color: #00E0C6;
                background: rgba(0, 224, 198, 0.1);
                border: 1px solid rgba(0, 224, 198, 0.2);
            }
            
            .nav-item.active::after {
                content: '';
                position: absolute;
                bottom: -1px;
                left: 50%;
                transform: translateX(-50%);
                width: 20px;
                height: 2px;
                background: #00E0C6;
                border-radius: 1px;
            }
            
            .nav-item svg {
                transition: transform 0.2s ease;
            }
            
            .nav-item:hover svg {
                transform: scale(1.1);
            }
            
            .nav-actions {
                display: flex;
                align-items: center;
            }
            
            .create-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: linear-gradient(135deg, #00E0C6 0%, #00B4D8 100%);
                color: #1a1d24;
                font-weight: 600;
                font-size: 0.9rem;
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 4px 15px rgba(0, 224, 198, 0.3);
            }
            
            .create-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 224, 198, 0.4);
            }
            
            .create-btn:active {
                transform: translateY(0);
            }
            
            @media (max-width: 768px) {
                .nav-container {
                    padding: 0 1rem;
                }
                
                .nav-item span {
                    display: none;
                }
                
                .nav-item {
                    padding: 0.75rem;
                }
                
                .create-btn span {
                    display: none;
                }
                
                .create-btn {
                    padding: 0.75rem;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.prepend(nav);

        // Add event listeners
        document.getElementById('nav-initiatives').onclick = () => {
            this.setActiveNav('initiatives');
            this.showAllInitiatives();
        };
        
        document.getElementById('nav-teams').onclick = () => {
            this.setActiveNav('teams');
            this.showAllTeams();
        };
        
        document.getElementById('nav-create').onclick = () => {
            this.showCreateOptions();
        };
    }

    setActiveNav(section) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current section
        if (section === 'initiatives') {
            document.getElementById('nav-initiatives').classList.add('active');
        } else if (section === 'teams') {
            document.getElementById('nav-teams').classList.add('active');
        }
    }

    showCreateOptions() {
        // Create a dropdown menu for create options
        const dropdown = document.createElement('div');
        dropdown.id = 'create-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-content">
                <button class="dropdown-item" onclick="app.showCreateForm()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11H1l8-8 8 8h-8v8z"/>
                    </svg>
                    <span>New Initiative</span>
                </button>
                <button class="dropdown-item" onclick="app.showCreateTeam()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                    </svg>
                    <span>New Team</span>
                </button>
            </div>
        `;
        
        // Add dropdown styles
        const dropdownStyle = document.createElement('style');
        dropdownStyle.textContent = `
            #create-dropdown {
                position: absolute;
                top: 100%;
                right: 2rem;
                margin-top: 0.5rem;
                z-index: 1001;
            }
            
            .dropdown-content {
                background: #2d3748;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                backdrop-filter: blur(10px);
                overflow: hidden;
                min-width: 180px;
            }
            
            .dropdown-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                width: 100%;
                padding: 0.75rem 1rem;
                background: none;
                border: none;
                color: #a0aec0;
                font-size: 0.9rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .dropdown-item:hover {
                background: rgba(255, 255, 255, 0.1);
                color: #fff;
            }
            
            .dropdown-item:not(:last-child) {
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
        `;
        
        document.head.appendChild(dropdownStyle);
        
        // Position the dropdown
        const createBtn = document.getElementById('nav-create');
        createBtn.appendChild(dropdown);
        
        // Close dropdown when clicking outside
        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && !createBtn.contains(e.target)) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeDropdown);
        }, 100);
    }

    showCreateForm() {
        this.setActiveNav('initiatives');
        const content = `
            <div class="card" style="margin-top:90px;">
                <h2>Create New Initiative</h2>
                <form id="initiative-form">
                    <div class="form-group">
                        <label for="title">Initiative Title</label>
                        <input type="text" id="title" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" class="form-control" rows="4" required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="objectives">Objectives (one per line)</label>
                        <textarea id="objectives" class="form-control" rows="3" required></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Create Initiative</button>
                </form>
            </div>
        `;
        
        document.getElementById('main-content').innerHTML = content;
        document.getElementById('initiative-form').addEventListener('submit', this.handleCreateInitiative.bind(this));
    }

    async handleCreateInitiative(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const objectives = document.getElementById('objectives').value.split('\n').filter(obj => obj.trim());
        
        try {
            const response = await fetch('/api/initiatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, objectives })
            });
            
            if (!response.ok) throw new Error('Failed to create initiative');
            
            const result = await response.json();
            this.currentInitiative = result.data;
            this.showAIProcessing();
        } catch (error) {
            this.showError('Failed to create initiative: ' + error.message);
        }
    }

    showAIProcessing() {
        const content = `
            <div class="card">
                <h2>Processing Initiative</h2>
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>AI is analyzing dependencies and generating artifacts...</p>
                    <p>This may take a moment.</p>
                </div>
            </div>
        `;
        
        document.getElementById('main-content').innerHTML = content;
        this.generateArtifacts();
    }

    async generateArtifacts() {
        try {
            const response = await fetch(`/api/initiatives/${this.currentInitiative.id}/generate`, {
                method: 'POST'
            });
            
            if (!response.ok) throw new Error('Failed to generate artifacts');
            
            const result = await response.json();
            this.showArtifactReview(result.data);
        } catch (error) {
            this.showError('Failed to generate artifacts: ' + error.message);
        }
    }

    showArtifactReview(artifacts) {
        // Store the original onePager for editing
        this._onePagerContent = artifacts.onePager;
        this._initiativeId = this.currentInitiative?.id || artifacts.initiativeId || artifacts.id;
        
        const content = `
            <div class="card">
                <h2>Review Generated Artifacts</h2>
                
                <h3>Team Dependencies</h3>
                <div class="team-list">
                    ${artifacts.teams.map(team => `<span class="team-tag assigned">${team}</span>`).join('')}
                </div>
                
                <h3>One-Pager</h3>
                <div id="one-pager-container" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <div id="one-pager-editable" contenteditable="true" style="outline: none; min-height: 200px; font-size: 1.1rem; line-height: 1.7;">
                        ${this._formatOnePagerForEdit(this._onePagerContent)}
                    </div>
                    <button id="save-one-pager" class="btn btn-secondary" style="margin-top: 1rem;">Save</button>
                    <span id="one-pager-save-status" style="margin-left:1em;font-size:1em;"></span>
                </div>
                
                <h3>Task Breakdown</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Task</th>
                            <th>Team</th>
                            <th>Priority</th>
                            <th>Estimated Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${artifacts.taskBreakdown.map(task => `
                            <tr>
                                <td>${task.title}</td>
                                <td><span class="team-tag">${task.team}</span></td>
                                <td><span class="status status-${task.priority.toLowerCase()}">${task.priority}</span></td>
                                <td>${task.estimated_hours}h</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="card-actions">
                    <button class="btn btn-success" onclick="app.launchInitiative()">
                        <i class="fas fa-rocket"></i> Launch Initiative (Create Jira Tickets)
                    </button>
                    <button class="btn btn-secondary" onclick="app.showCreateForm()">Start Over</button>
                </div>
            </div>
        `;
        
        document.getElementById('main-content').innerHTML = content;
        document.getElementById('save-one-pager').addEventListener('click', async () => {
            const editableDiv = document.getElementById('one-pager-editable');
            this._onePagerContent = editableDiv.innerHTML;
            const statusSpan = document.getElementById('one-pager-save-status');
            statusSpan.textContent = 'Saving...';
            try {
                const response = await fetch(`/api/initiatives/${this._initiativeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ one_pager: this._onePagerContent })
                });
                if (!response.ok) throw new Error('Failed to save');
                statusSpan.textContent = 'Saved!';
                statusSpan.style.color = 'green';
                editableDiv.style.background = '#e6ffe6';
                setTimeout(() => { editableDiv.style.background = ''; statusSpan.textContent = ''; }, 1200);
            } catch (err) {
                statusSpan.textContent = 'Error saving!';
                statusSpan.style.color = 'red';
            }
        });
    }

    _formatOnePagerForEdit(onePager) {
        let html = onePager
            .replace(/(Persona: [^\n]+)/g, '<div style="font-weight: bold; font-size: 1.15em; margin-top: 1.2em; margin-bottom: 0.3em;">$1</div>')
            .replace(/\n\s*\u2022\s*(.+)/g, '<ul style="margin-left:2em; margin-bottom:0.7em;"><li style="margin-bottom:0.5em;">$1</li></ul>')
            .replace(/\n/g, '<br>');
        
        if (!/^<div style="font-weight: bold; font-size: 2em;/.test(html)) {
            html = '<div style="font-weight: bold; font-size: 2em; margin-bottom: 1em;">Initiative Overview</div>' + html;
        }
        return html;
    }

    async launchInitiative() {
        try {
            const content = `
                <div class="card">
                    <h2>Launching Initiative</h2>
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <p>Creating Jira tickets...</p>
                    </div>
                </div>
            `;
            document.getElementById('main-content').innerHTML = content;
            
            const response = await fetch(`/api/initiatives/${this.currentInitiative.id}/launch`, {
                method: 'POST'
            });
            
            if (!response.ok) throw new Error('Failed to launch initiative');
            
            const result = await response.json();
            this.showDashboard(result.data.createdTickets);
        } catch (error) {
            this.showError('Failed to launch initiative: ' + error.message);
        }
    }

    showDashboard(createdTickets) {
        const content = `
            <div class="card">
                <h2>Initiative Dashboard</h2>
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    Initiative launched successfully!
                </div>
                
                <h3>Created Jira Tickets</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Team</th>
                            <th>Status</th>
                            <th>Ticket</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${createdTickets.map(ticket => `
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
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="app.showCreateForm()">Create Another Initiative</button>
                </div>
            </div>
        `;
        
        document.getElementById('main-content').innerHTML = content;
    }

    showError(message) {
        const content = `
            <div class="card">
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${message}
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="app.showCreateForm()">Try Again</button>
                </div>
            </div>
        `;
        
        document.getElementById('main-content').innerHTML = content;
    }

    async showAllInitiatives() {
        this.setActiveNav('initiatives');
        this.renderNavBar();
        
        document.getElementById('main-content').innerHTML = `
            <div style="background:#181A20;min-height:100vh;padding:2rem;margin-top:90px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;">
                    <h1 style="color:#fff;font-size:2rem;font-weight:700;">P&E Initiatives</h1>
                    <button onclick="app.showCreateForm()" class="btn btn-primary">+ Create initiative</button>
                </div>
                <div id="initiatives-list">
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <p style="color:#fff;">Loading initiatives...</p>
                    </div>
                </div>
            </div>
        `;
        
        const listEl = document.getElementById('initiatives-list');
        
        try {
            const response = await fetch('/api/initiatives');
            if (!response.ok) throw new Error('Failed to fetch initiatives');
            
            const result = await response.json();
            const initiatives = result.data || result;
            
            if (!initiatives.length) {
                listEl.innerHTML = `
                    <div style='color:#fff;text-align:center;padding:2em;'>
                        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3>No initiatives found</h3>
                        <p>Get started by creating your first initiative.</p>
                        <button onclick="app.showCreateForm()" class="btn btn-primary">Create First Initiative</button>
                    </div>
                `;
                return;
            }
            
            listEl.innerHTML = initiatives.map((initiative, idx) => {
                const progress = initiative.progress || Math.floor(Math.random()*60+20);
                return `
                    <div class="initiative-row" style="background:#23242A;border-radius:16px;margin-bottom:1.5rem;padding:1.5rem 2rem;box-shadow:0 2px 12px #0003;cursor:pointer;transition:box-shadow .2s;position:relative;" onclick="app.toggleInitiativeExpand(${idx})" id="initiative-row-${idx}">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div>
                                <div style="color:#fff;font-size:1.3rem;font-weight:600;">${initiative.title}</div>
                                <div style="color:#b0b3b8;font-size:1rem;margin-top:0.2em;">${initiative.created_at ? new Date(initiative.created_at).toLocaleDateString() : ''}</div>
                            </div>
                            <div style="flex:1;margin:0 2em;max-width:300px;">
                                <div style="background:#23242A;border-radius:8px;height:8px;width:100%;overflow:hidden;">
                                    <div style="background:#00E0C6;height:100%;width:${progress}%;transition:width .4s;"></div>
                                </div>
                                <div style="color:#b0b3b8;font-size:0.95em;margin-top:0.2em;">${progress}%</div>
                            </div>
                            <div style="color:#b0b3b8;font-size:1em;">&#8964;</div>
                            <button onclick="event.stopPropagation();app.deleteInitiative('${initiative.id}')" title="Delete" class="btn btn-sm btn-danger" style="margin-left:1.5em;">Delete</button>
                        </div>
                        <div class="initiative-expand" id="initiative-expand-${idx}" style="display:none;margin-top:2em;">
                            <div style="color:#b0b3b8;font-size:1.1em;margin-bottom:1em;">Collaboration teams</div>
                            <div style="display:flex;gap:1em;margin-bottom:1.5em;">
                                ${(initiative.team_assignments||[]).map(team => `
                                    <div style="background:#181A20;border-radius:10px;padding:1em 1.5em;min-width:120px;display:flex;flex-direction:column;align-items:center;box-shadow:0 1px 4px #0002;">
                                        <div style="font-weight:700;color:#fff;font-size:1.1em;margin-bottom:0.3em;">${team}</div>
                                        <div style="color:#b0b3b8;font-size:0.95em;">Team</div>
                                    </div>
                                `).join('') || '<span style="color:#b0b3b8;">No teams assigned</span>'}
                            </div>
                            <button onclick="event.stopPropagation();app.showPRDLink('${initiative.id}')" class="btn btn-outline">View PRD</button>
                        </div>
                    </div>
                `;
            }).join('');
            
            this._initiatives = initiatives;
            this._expanded = Array(initiatives.length).fill(false);
            
        } catch (err) {
            listEl.innerHTML = `<div style='color:#fff;text-align:center;padding:2em;'>Failed to load initiatives: ${err.message}</div>`;
        }
    }

    toggleInitiativeExpand(idx) {
        this._expanded = this._expanded || [];
        this._expanded[idx] = !this._expanded[idx];
        const expandEl = document.getElementById(`initiative-expand-${idx}`);
        if (expandEl) {
            expandEl.style.display = this._expanded[idx] ? 'block' : 'none';
        }
        const rowEl = document.getElementById(`initiative-row-${idx}`);
        if (rowEl) {
            rowEl.querySelector('div[style*="color:#b0b3b8;font-size:1em;"]').innerHTML = this._expanded[idx] ? '&#8963;' : '&#8964;';
        }
    }

    async showPRDLink(id) {
        try {
            const response = await fetch(`/api/initiatives/${id}`);
            if (!response.ok) throw new Error('Failed to fetch initiative');
            const result = await response.json();
            const initiative = result.data || result;
            if (initiative.one_pager) {
                alert('PRD/One Pager:\n\n' + initiative.one_pager.replace(/<[^>]+>/g, ''));
            } else {
                alert('No PRD/One Pager found for this initiative.');
            }
        } catch (err) {
            alert('Failed to load PRD: ' + err.message);
        }
    }

    async deleteInitiative(id) {
        if (!confirm('Are you sure you want to delete this initiative? This action cannot be undone.')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/initiatives/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete initiative');
            }
            
            this.showAllInitiatives();
            alert('Initiative deleted successfully!');
            
        } catch (error) {
            alert('Failed to delete initiative: ' + error.message);
        }
    }

    async showAllTeams() {
        this.setActiveNav('teams');
        this.renderNavBar();
        
        document.getElementById('main-content').innerHTML = `
            <div style='background:#181A20;min-height:calc(100vh - 120px);padding:2rem;margin-top:120px;'>
                <div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;'>
                    <h1 style='color:#fff;font-size:2rem;font-weight:700;'>Teams</h1>
                    <button onclick='app.showCreateTeam()' class='btn btn-primary'>+ Create Team</button>
                </div>
                <div id='teams-list'>
                    <div class="loading-container">
                        <div class="loading-spinner"></div>
                        <p style="color:#fff;">Loading teams...</p>
                    </div>
                </div>
            </div>
        `;
        
        const listEl = document.getElementById('teams-list');
        
        try {
            const response = await fetch('/api/teams');
            if (!response.ok) throw new Error('Failed to fetch teams');
            
            const result = await response.json();
            const teams = result.data || result;
            
            if (!teams.length) {
                listEl.innerHTML = `<div style='color:#fff;text-align:center;padding:2em;'>No teams found.</div>`;
                return;
            }
            
            listEl.innerHTML = `
                <table style='width:100%;background:#23242A;border-radius:12px;color:#fff;'>
                    <thead>
                        <tr>
                            <th style='padding:1em;'>Name</th>
                            <th>PM</th>
                            <th>PM Email</th>
                            <th>TL</th>
                            <th>TL Email</th>
                            <th>EM</th>
                            <th>EM Email</th>
                            <th>Jira Project</th>
                            <th>Slack</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${teams.map(team => {
                            if (this._editingTeam === team.id) {
                                return `
                                    <tr style='border-bottom:1px solid #333;'>
                                        <td style='padding:1em;'><input id='edit_team_name' value='${team.team_name||''}' class='form-control'/></td>
                                        <td><input id='edit_pm' value='${team.pm||''}' class='form-control'/></td>
                                        <td><input id='edit_pm_email' value='${team.pm_email||''}' class='form-control'/></td>
                                        <td><input id='edit_tl' value='${team.tl||''}' class='form-control'/></td>
                                        <td><input id='edit_tl_email' value='${team.tl_email||''}' class='form-control'/></td>
                                        <td><input id='edit_em' value='${team.em||''}' class='form-control'/></td>
                                        <td><input id='edit_em_email' value='${team.em_email||''}' class='form-control'/></td>
                                        <td><input id='edit_jira_project_code' value='${team.jira_project_code||''}' class='form-control'/></td>
                                        <td><input id='edit_slack_channel' value='${team.slack_channel||''}' class='form-control'/></td>
                                        <td style='white-space:nowrap;'>
                                            <button onclick="app.saveTeamEdit('${team.id}')" class='btn btn-sm btn-success' style='margin-right:0.5em;'>Save</button>
                                            <button onclick="app.cancelTeamEdit()" class='btn btn-sm btn-secondary'>Cancel</button>
                                        </td>
                                    </tr>
                                `;
                            } else {
                                return `
                                    <tr style='border-bottom:1px solid #333;'>
                                        <td style='padding:1em;'>${team.team_name}</td>
                                        <td>${team.pm||''}</td>
                                        <td>${team.pm_email||''}</td>
                                        <td>${team.tl||''}</td>
                                        <td>${team.tl_email||''}</td>
                                        <td>${team.em||''}</td>
                                        <td>${team.em_email||''}</td>
                                        <td>${team.jira_project_code||''}</td>
                                        <td>${team.slack_channel||''}</td>
                                        <td style='white-space:nowrap;'>
                                            <button onclick="app.editTeamRow('${team.id}')" class='btn btn-sm btn-primary' style='margin-right:0.5em;'>Edit</button>
                                            <button onclick="app.deleteTeam('${team.id}', '${team.team_name}')" class='btn btn-sm btn-danger'>Delete</button>
                                        </td>
                                    </tr>
                                `;
                            }
                        }).join('')}
                    </tbody>
                </table>
            `;
        } catch (err) {
            listEl.innerHTML = `<div style='color:#fff;text-align:center;padding:2em;'>Failed to load teams: ${err.message}</div>`;
        }
    }

    editTeamRow(id) {
        this._editingTeam = id;
        this.showAllTeams();
    }

    cancelTeamEdit() {
        this._editingTeam = null;
        this.showAllTeams();
    }

    async saveTeamEdit(id) {
        const payload = {
            team_name: document.getElementById('edit_team_name').value,
            pm: document.getElementById('edit_pm').value,
            pm_email: document.getElementById('edit_pm_email').value,
            tl: document.getElementById('edit_tl').value,
            tl_email: document.getElementById('edit_tl_email').value,
            em: document.getElementById('edit_em').value,
            em_email: document.getElementById('edit_em_email').value,
            jira_project_code: document.getElementById('edit_jira_project_code').value,
            slack_channel: document.getElementById('edit_slack_channel').value
        };
        
        try {
            const resp = await fetch(`/api/teams/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!resp.ok) throw new Error('Failed to save');
            this._editingTeam = null;
            this.showAllTeams();
        } catch (err) {
            alert('Error saving: ' + err.message);
        }
    }

    async deleteTeam(id, teamName) {
        if (!confirm(`Are you sure you want to delete the team "${teamName}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const response = await fetch(`/api/teams/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete team');
            }
            
            this.showAllTeams();
            alert('Team deleted successfully!');
            
        } catch (error) {
            alert('Failed to delete team: ' + error.message);
        }
    }

    async showCreateTeam() {
        this.setActiveNav('teams');
        this.renderNavBar();
        
        document.getElementById('main-content').innerHTML = `
            <div style='background:#181A20;min-height:100vh;padding:2rem;margin-top:90px;'>
                <h1 style='color:#fff;font-size:2rem;font-weight:700;margin-bottom:2rem;'>Create Team</h1>
                <form id='team-create-form' style='background:#23242A;padding:2em;border-radius:12px;max-width:500px;margin:auto;color:#fff;'>
                    <div style='margin-bottom:1em;'>
                        <label>Name<br>
                        <input type='text' id='team_name' class='form-control' required/>
                        </label>
                    </div>
                    <div style='margin-bottom:1em;'>
                        <label>PM<br>
                        <input type='text' id='pm' class='form-control'/>
                        </label>
                    </div>
                    <div style='margin-bottom:1em;'>
                        <label>PM Email<br>
                        <input type='email' id='pm_email' class='form-control'/>
                        </label>
                    </div>
                    <div style='margin-bottom:1em;'>
                        <label>TL<br>
                        <input type='text' id='tl' class='form-control'/>
                        </label>
                    </div>
                    <div style='margin-bottom:1em;'>
                        <label>TL Email<br>
                        <input type='email' id='tl_email' class='form-control'/>
                        </label>
                    </div>
                    <div style='margin-bottom:1em;'>
                        <label>EM<br>
                        <input type='text' id='em' class='form-control'/>
                        </label>
                    </div>
                    <div style='margin-bottom:1em;'>
                        <label>EM Email<br>
                        <input type='email' id='em_email' class='form-control'/>
                        </label>
                    </div>
                    <div style='margin-bottom:1em;'>
                        <label>Jira Project Code<br>
                        <input type='text' id='jira_project_code' class='form-control'/>
                        </label>
                    </div>
                    <div style='margin-bottom:1em;'>
                        <label>Slack Channel<br>
                        <input type='text' id='slack_channel' class='form-control'/>
                        </label>
                    </div>
                    <button type='submit' class='btn btn-primary btn-block'>Create Team</button>
                </form>
            </div>
        `;
        
        document.getElementById('team-create-form').addEventListener('submit', this.handleCreateTeam.bind(this));
    }

    async handleCreateTeam(e) {
        e.preventDefault();
        
        const team_name = document.getElementById('team_name').value;
        const pm = document.getElementById('pm').value;
        const pm_email = document.getElementById('pm_email').value;
        const tl = document.getElementById('tl').value;
        const tl_email = document.getElementById('tl_email').value;
        const em = document.getElementById('em').value;
        const em_email = document.getElementById('em_email').value;
        const jira_project_code = document.getElementById('jira_project_code').value;
        const slack_channel = document.getElementById('slack_channel').value;
        
        try {
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    team_name, pm, pm_email, tl, tl_email, em, em_email, 
                    jira_project_code, slack_channel 
                })
            });
            
            if (!response.ok) throw new Error('Failed to create team');
            
            this.showAllTeams();
        } catch (error) {
            this.showError('Failed to create team: ' + error.message);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Initiative Management System...');
    window.app = new InitiativeApp();
});

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
    if (window.app) {
        window.app.showError('An unexpected error occurred: ' + event.error.message);
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    if (window.app) {
        window.app.showError('Network error: ' + event.reason.message);
    }
});