// Utility functions for the application

class Utils {
    static formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    static formatDateShort(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    static capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static truncateText(text, maxLength = 100) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static showToast(message, type = 'info', duration = 5000) {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        toastContainer.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    }

    static getToastIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    static showModal(title, content, actions = []) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        let actionButtons = '';
        actions.forEach(action => {
            actionButtons += `<button class="btn ${action.class || 'btn-primary'}" onclick="${action.onclick}">${action.text}</button>`;
        });

        modalBody.innerHTML = `
            <h2>${title}</h2>
            <div class="modal-content-body">
                ${content}
            </div>
            <div class="modal-actions" style="margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                ${actionButtons}
                <button class="btn btn-secondary" onclick="Utils.closeModal()">Cancel</button>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    static closeModal() {
        const modal = document.getElementById('modal');
        modal.classList.add('hidden');
    }

    static showLoading(show = true) {
        const loading = document.getElementById('loading');
        if (show) {
            loading.classList.remove('hidden');
        } else {
            loading.classList.add('hidden');
        }
    }

    static setButtonLoading(button, loading = true, originalText = null) {
        if (loading) {
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.innerHTML;
            }
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
            if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
                delete button.dataset.originalText;
            } else if (originalText) {
                button.innerHTML = originalText;
            }
        }
    }

    static validateForm(formData, rules) {
        const errors = {};
        
        Object.keys(rules).forEach(field => {
            const rule = rules[field];
            const value = formData[field];
            
            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = `${rule.label || field} is required`;
                return;
            }
            
            if (value && rule.minLength && value.length < rule.minLength) {
                errors[field] = `${rule.label || field} must be at least ${rule.minLength} characters`;
                return;
            }
            
            if (value && rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `${rule.label || field} must be no more than ${rule.maxLength} characters`;
                return;
            }
            
            if (value && rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.patternMessage || `${rule.label || field} format is invalid`;
                return;
            }
        });
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    static displayFormErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.form-error').forEach(el => el.remove());
        document.querySelectorAll('.form-control.error').forEach(el => {
            el.classList.remove('error');
        });

        // Display new errors
        Object.keys(errors).forEach(field => {
            const input = document.getElementById(field);
            if (input) {
                input.classList.add('error');
                
                const errorElement = document.createElement('div');
                errorElement.className = 'form-error';
                errorElement.textContent = errors[field];
                
                input.parentElement.appendChild(errorElement);
            }
        });
    }

    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    static parseJSON(str, fallback = null) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return fallback;
        }
    }

    static copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard!', 'success', 2000);
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    static fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Copied to clipboard!', 'success', 2000);
        } catch (err) {
            this.showToast('Failed to copy to clipboard', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    static updateBreadcrumb(items) {
        const breadcrumb = document.getElementById('breadcrumb');
        const breadcrumbContent = breadcrumb.querySelector('.breadcrumb-content') || 
            document.createElement('div');
        
        if (!breadcrumb.querySelector('.breadcrumb-content')) {
            breadcrumbContent.className = 'breadcrumb-content';
            breadcrumb.appendChild(breadcrumbContent);
        }

        const breadcrumbList = document.createElement('ul');
        breadcrumbList.className = 'breadcrumb-list';

        items.forEach((item, index) => {
            const listItem = document.createElement('li');
            listItem.className = 'breadcrumb-item';

            if (item.href && index < items.length - 1) {
                const link = document.createElement('a');
                link.href = item.href;
                link.className = 'breadcrumb-link';
                link.textContent = item.text;
                link.onclick = (e) => {
                    e.preventDefault();
                    if (item.onclick) {
                        item.onclick();
                    }
                };
                listItem.appendChild(link);
            } else {
                listItem.textContent = item.text;
            }

            breadcrumbList.appendChild(listItem);
        });

        breadcrumbContent.innerHTML = '';
        breadcrumbContent.appendChild(breadcrumbList);
        breadcrumb.classList.remove('hidden');
    }

    static hideBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        breadcrumb.classList.add('hidden');
    }

    static scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    static getStatusColor(status) {
        const colors = {
            draft: '#95a5a6',
            analyzing: '#f39c12',
            ready: '#3498db',
            launched: '#27ae60',
            completed: '#27ae60',
            cancelled: '#e74c3c'
        };
        return colors[status] || colors.draft;
    }

    static getStatusIcon(status) {
        const icons = {
            draft: 'fa-file-alt',
            analyzing: 'fa-cog fa-spin',
            ready: 'fa-check-circle',
            launched: 'fa-rocket',
            completed: 'fa-flag-checkered',
            cancelled: 'fa-times-circle'
        };
        return icons[status] || icons.draft;
    }

    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    static calculateProgress(tasks) {
        if (!tasks || tasks.length === 0) return 0;
        const completed = tasks.filter(task => task.status === 'completed').length;
        return Math.round((completed / tasks.length) * 100);
    }

    static exportToCSV(data, filename) {
        const csvContent = this.convertToCSV(data);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    static convertToCSV(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => {
            return headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma or quote
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',');
        });
        
        return [csvHeaders, ...csvRows].join('\n');
    }
}

// Event handlers for modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modal-close');

    if (modalClose) {
        modalClose.onclick = () => Utils.closeModal();
    }

    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                Utils.closeModal();
            }
        };
    }

    // Handle escape key for modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            Utils.closeModal();
        }
    });
});