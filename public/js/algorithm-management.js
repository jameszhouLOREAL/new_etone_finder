/**
 * Algorithm Management System
 * Manages backend algorithms used by Visual Capture assistant
 */

class AlgorithmManager {
    constructor() {
        this.storageKey = 'vca_algorithms';
        this.algorithms = [];
        this.init();
    }

    init() {
        this.loadAlgorithms();
        this.renderTable();
    }

    loadAlgorithms() {
        // Try to load from localStorage
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.algorithms = JSON.parse(stored);
        } else {
            // Load default algorithms
            this.algorithms = this.getDefaultAlgorithms();
            this.saveToStorage();
        }
    }

    getDefaultAlgorithms() {
        return [
            {
                id: 1,
                code: 'shade',
                label: 'ShadeMatch',
                description: 'Use it to call ShadeMatch API for foundation and concealer matching',
                status: 'Active'
            },
            {
                id: 2,
                code: 'nexa',
                label: 'Nexa',
                description: 'Advanced skin analysis and recommendation engine',
                status: 'Active'
            },
            {
                id: 3,
                code: 'modiface',
                label: 'Modiface',
                description: 'AR-based virtual try-on and beauty simulation',
                status: 'Active'
            },
            {
                id: 4,
                code: 'skindiag',
                label: 'Skin Diagnostics',
                description: 'Comprehensive skin condition analysis and scoring',
                status: 'Active'
            },
            {
                id: 5,
                code: 'haircolor',
                label: 'Hair Color Match',
                description: 'Hair color analysis and dye recommendation system',
                status: 'Active'
            },
            {
                id: 6,
                code: 'ageverify',
                label: 'Age Verification',
                description: 'AI-powered age estimation for compliance checks',
                status: 'Inactive'
            },
            {
                id: 7,
                code: 'wrinkledetect',
                label: 'Wrinkle Detection',
                description: 'Facial wrinkle and fine line analysis algorithm',
                status: 'Active'
            },
            {
                id: 8,
                code: 'acnetrack',
                label: 'Acne Tracker',
                description: 'Acne detection and progress tracking over time',
                status: 'Active'
            },
            {
                id: 9,
                code: 'lipshade',
                label: 'Lip Shade Finder',
                description: 'Lipstick color matching based on skin tone and preferences',
                status: 'Active'
            },
            {
                id: 10,
                code: 'eyebrowshape',
                label: 'Eyebrow Shaping',
                description: 'Eyebrow shape analysis and recommendation',
                status: 'Inactive'
            }
        ];
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.algorithms));
    }

    renderTable() {
        const container = document.getElementById('algorithmTableContainer');
        
        if (this.algorithms.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <i class="fas fa-brain" style="font-size: 3rem; margin-bottom: 1rem; color: var(--border-light);"></i>
                    <p>No algorithms found</p>
                </div>
            `;
            return;
        }

        const tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th style="width: 60px;">ID</th>
                        <th style="width: 150px;">Code</th>
                        <th style="width: 180px;">Label</th>
                        <th>Description</th>
                        <th style="width: 120px;">Status</th>
                        <th style="width: 80px;">Edit</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.algorithms.map(algo => this.renderTableRow(algo)).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = tableHTML;
    }

    renderTableRow(algo) {
        const statusClass = algo.status === 'Active' ? 'status-active' : 'status-inactive';
        
        return `
            <tr>
                <td><strong>${algo.id}</strong></td>
                <td><span class="code-badge">${algo.code}</span></td>
                <td>${algo.label}</td>
                <td style="color: var(--text-secondary);">${algo.description}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${algo.status}
                    </span>
                </td>
                <td>
                    <button class="action-btn edit" onclick="algorithmManager.openEditModal(${algo.id})" title="Edit algorithm">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    openEditModal(id) {
        const algo = this.algorithms.find(a => a.id === id);
        if (!algo) return;

        // Populate form
        document.getElementById('editAlgorithmId').value = algo.id;
        document.getElementById('editCode').value = algo.code;
        document.getElementById('editLabel').value = algo.label;
        document.getElementById('editDescription').value = algo.description;
        
        const statusCheckbox = document.getElementById('editStatus');
        statusCheckbox.checked = algo.status === 'Active';
        document.getElementById('statusLabel').textContent = algo.status;

        // Show modal
        document.getElementById('editModal').classList.add('show');
    }

    closeEditModal() {
        document.getElementById('editModal').classList.remove('show');
        document.getElementById('editForm').reset();
    }

    saveAlgorithm() {
        const id = parseInt(document.getElementById('editAlgorithmId').value);
        const code = document.getElementById('editCode').value.trim();
        const label = document.getElementById('editLabel').value.trim();
        const description = document.getElementById('editDescription').value.trim();
        const status = document.getElementById('editStatus').checked ? 'Active' : 'Inactive';

        // Validate
        if (!label || !description) {
            alert('Please fill in all required fields');
            return;
        }

        // Find and update algorithm
        const index = this.algorithms.findIndex(a => a.id === id);
        if (index !== -1) {
            this.algorithms[index] = {
                id,
                code,
                label,
                description,
                status
            };

            this.saveToStorage();
            this.renderTable();
            this.closeEditModal();

            // Show success feedback
            this.showSuccessMessage('Algorithm updated successfully');
        }
    }

    showSuccessMessage(message) {
        // Create temporary success message
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-green);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 2000;
            animation: slideInRight 0.3s ease;
        `;
        msg.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span style="margin-left: 0.5rem;">${message}</span>
        `;

        document.body.appendChild(msg);

        // Remove after 3 seconds
        setTimeout(() => {
            msg.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => msg.remove(), 300);
        }, 3000);
    }
}

// Initialize the algorithm manager
const algorithmManager = new AlgorithmManager();

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
