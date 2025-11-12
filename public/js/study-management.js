// Study Management JavaScript
class StudyManager {
    constructor() {
        this.studies = [];
        this.filteredStudies = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.editingId = null;
        
        this.initializeEventListeners();
        this.loadStudies();
    }

    async loadStudies() {
        try {
            const response = await fetch('/api/studies');
            if (response.ok) {
                this.studies = await response.json();
                
                // Add sequential IDs for display purposes
                this.studies = this.studies.map((study, index) => ({
                    ...study,
                    id: index + 1
                }));
                
                console.log('Loaded', this.studies.length, 'studies from server');
            } else {
                console.error('Failed to load studies:', response.statusText);
                this.studies = [];
            }
        } catch (error) {
            console.error('Error loading studies:', error);
            this.studies = [];
        }
        
        this.filteredStudies = [...this.studies];
        this.filterStudies();
    }

    initializeEventListeners() {
        // Create Study button - navigate to study design page
        const createBtn = document.getElementById('createStudyBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                window.location.href = '/studydesign';
            });
        }

        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterStudies();
            });
        }

        // Active only filter
        const activeFilter = document.getElementById('activeOnlyFilter');
        if (activeFilter) {
            activeFilter.addEventListener('change', () => {
                this.filterStudies();
            });
        }

        // Select all checkbox
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                this.toggleSelectAll(e.target.checked);
            });
        }

        // Delete selected
        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => {
                this.deleteSelected();
            });
        }

        // Pagination
        const itemsPerPage = document.getElementById('itemsPerPage');
        if (itemsPerPage) {
            itemsPerPage.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1;
                this.renderTable();
            });
        }

        const prevPage = document.getElementById('prevPage');
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderTable();
                }
            });
        }

        const nextPage = document.getElementById('nextPage');
        if (nextPage) {
            nextPage.addEventListener('click', () => {
                const totalPages = Math.ceil(this.filteredStudies.length / this.itemsPerPage);
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderTable();
                }
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.renderTable();
            });
        }
        
        console.log('Event listeners initialized');
    }

    openCreateModal() {
        // Reset form and editing state
        this.editingId = null;
        document.getElementById('studyForm').reset();
        document.getElementById('studyStatus').checked = true;
        
        // Open Bootstrap modal
        const modal = new bootstrap.Modal(document.getElementById('createStudyModal'));
        modal.show();
    }

    submitStudy() {
        const studyId = document.getElementById('studyId').value.trim();
        const label = document.getElementById('studyLabel').value.trim();
        const edc = document.getElementById('studyEdc').value;
        const status = document.getElementById('studyStatus').checked ? 'Active' : 'Inactive';

        if (!studyId || !edc) {
            alert('Please fill in all required fields (Study ID and EDC)');
            return;
        }

        // Create new study
        const newId = Math.max(...this.studies.map(s => s.id), 0) + 1;
        this.studies.push({
            id: newId,
            studyId,
            label,
            edc,
            status
        });

        this.saveToLocalStorage();
        this.filterStudies();
        this.renderTable();
        document.getElementById('studyForm').reset();
        document.getElementById('studyStatus').checked = true;
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createStudyModal'));
        if (modal) {
            modal.hide();
        }
    }

    updateStudy() {
        const studyId = document.getElementById('editStudyId').value.trim();
        const label = document.getElementById('editStudyLabel').value.trim();
        const edc = document.getElementById('editStudyEdc').value;
        const status = document.getElementById('editStudyStatus').checked ? 'Active' : 'Inactive';

        if (!studyId || !edc) {
            alert('Please fill in all required fields (Study ID and EDC)');
            return;
        }

        if (!this.editingId) {
            alert('No study selected for editing');
            return;
        }

        // Update existing study
        const index = this.studies.findIndex(s => s.id === this.editingId);
        if (index !== -1) {
            this.studies[index] = {
                ...this.studies[index],
                studyId,
                label,
                edc,
                status
            };
        }

        this.editingId = null;
        this.saveToLocalStorage();
        this.filterStudies();
        this.renderTable();
        
        // Close the modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('editStudyModal'));
        if (modal) {
            modal.hide();
        }
    }

    filterStudies() {
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const activeOnlyFilter = document.getElementById('activeOnlyFilter');
        const activeOnly = activeOnlyFilter ? activeOnlyFilter.checked : true;

        console.log('Filtering studies. Total:', this.studies.length, 'ActiveOnly:', activeOnly, 'SearchTerm:', searchTerm);

        this.filteredStudies = this.studies.filter(study => {
            const matchesSearch = !searchTerm || 
                study.studyId.toLowerCase().includes(searchTerm) ||
                study.label.toLowerCase().includes(searchTerm) ||
                study.edc.toLowerCase().includes(searchTerm) ||
                study.id.toString().includes(searchTerm);

            const matchesStatus = !activeOnly || study.status === 'Active';

            return matchesSearch && matchesStatus;
        });

        console.log('Filtered to:', this.filteredStudies.length, 'studies');

        this.currentPage = 1;
        this.renderTable();
    }

    renderTable() {
        console.log('Rendering table. Page:', this.currentPage, 'ItemsPerPage:', this.itemsPerPage, 'FilteredStudies:', this.filteredStudies.length);
        
        const tbody = document.getElementById('studyTableBody');
        if (!tbody) {
            console.error('studyTableBody element not found!');
            return;
        }
        
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageStudies = this.filteredStudies.slice(start, end);

        console.log('Rendering', pageStudies.length, 'studies for this page');

        tbody.innerHTML = pageStudies.map(study => `
            <tr>
                <td>
                    <input type="checkbox" class="study-checkbox" data-id="${study.id}">
                </td>
                <td>${study.id}</td>
                <td><strong>${study.studyId}</strong></td>
                <td>${study.label || '<em>No label</em>'}</td>
                <td>
                    <span class="status-badge ${study.status === 'Active' ? 'status-active' : 'status-inactive'}">
                        ${study.status}
                    </span>
                </td>
                <td>${study.edc}</td>
                <td>
                    <button class="action-btn edit" onclick="studyManager.editStudy(${study.id})" title="Edit">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="action-btn delete" onclick="studyManager.deleteStudy(${study.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Update pagination info
        const totalStudies = this.filteredStudies.length;
        const displayStart = totalStudies === 0 ? 0 : start + 1;
        const displayEnd = Math.min(end, totalStudies);
        
        const paginationInfo = document.getElementById('paginationInfo');
        if (paginationInfo) {
            paginationInfo.textContent = `${displayStart}–${displayEnd} of ${totalStudies}`;
        }
        
        const currentPageDisplay = document.getElementById('currentPageDisplay');
        if (currentPageDisplay) {
            currentPageDisplay.textContent = `Page ${this.currentPage}`;
        }

        // Update pagination buttons
        const prevPageBtn = document.getElementById('prevPage');
        if (prevPageBtn) {
            prevPageBtn.disabled = this.currentPage === 1;
        }
        
        const totalPages = Math.ceil(totalStudies / this.itemsPerPage);
        const nextPageBtn = document.getElementById('nextPage');
        if (nextPageBtn) {
            nextPageBtn.disabled = this.currentPage >= totalPages || totalStudies === 0;
        }

        // Add event listeners to checkboxes
        document.querySelectorAll('.study-checkbox').forEach(cb => {
            cb.addEventListener('change', () => this.updateBulkActions());
        });

        // Reset select all
        const selectAllCheckbox = document.getElementById('selectAll');
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        this.updateBulkActions();
    }

    editStudy(id) {
        const study = this.studies.find(s => s.id === id);
        if (!study) return;

        // Navigate to study design page with the study ID
        window.location.href = `/studydesign?studyId=${encodeURIComponent(study.studyId)}`;
    }

    async deleteStudy(id) {
        const study = this.studies.find(s => s.id === id);
        if (!study) return;
        
        if (confirm(`Are you sure you want to delete "${study.label || study.studyId}"?`)) {
            try {
                const response = await fetch(`/api/studies/${encodeURIComponent(study.studyId)}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    // Reload studies from server
                    await this.loadStudies();
                } else {
                    const error = await response.json();
                    alert('Failed to delete study: ' + (error.error || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error deleting study:', error);
                alert('Failed to delete study. Please try again.');
            }
        }
    }

    toggleSelectAll(checked) {
        document.querySelectorAll('.study-checkbox').forEach(cb => {
            cb.checked = checked;
        });
        this.updateBulkActions();
    }

    updateBulkActions() {
        const checked = document.querySelectorAll('.study-checkbox:checked');
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        
        if (!bulkActions) return;
        
        if (checked.length > 0) {
            bulkActions.classList.add('show');
            if (selectedCount) {
                selectedCount.textContent = checked.length;
            }
        } else {
            bulkActions.classList.remove('show');
        }
    }

    async deleteSelected() {
        const checked = document.querySelectorAll('.study-checkbox:checked');
        const ids = Array.from(checked).map(cb => parseInt(cb.dataset.id));
        
        if (ids.length === 0) return;

        if (confirm(`Are you sure you want to delete ${ids.length} study/studies?`)) {
            try {
                const studiesToDelete = this.studies.filter(s => ids.includes(s.id));
                
                // Delete each study via API
                const deletePromises = studiesToDelete.map(study => 
                    fetch(`/api/studies/${encodeURIComponent(study.studyId)}`, {
                        method: 'DELETE'
                    })
                );
                
                await Promise.all(deletePromises);
                
                // Reload studies from server
                await this.loadStudies();
            } catch (error) {
                console.error('Error deleting studies:', error);
                alert('Failed to delete some studies. Please try again.');
            }
        }
    }
}

// Initialize on page load
let studyManager;
document.addEventListener('DOMContentLoaded', () => {
    studyManager = new StudyManager();
});
