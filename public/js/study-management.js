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
                
                // Use studyId as the display ID
                this.studies = this.studies.map((study, index) => ({
                    ...study,
                    id: study.studyId || `study-${index + 1}`
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
                window.location.href = '/studydesign?new=true';
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
        const activeOnly = activeOnlyFilter ? activeOnlyFilter.checked : false;

        console.log('Filtering studies. Total:', this.studies.length, 'ActiveOnly:', activeOnly, 'SearchTerm:', searchTerm);

        this.filteredStudies = this.studies.filter(study => {
            const matchesSearch = !searchTerm || 
                (study.title && study.title.toLowerCase().includes(searchTerm)) ||
                study.label.toLowerCase().includes(searchTerm) ||
                study.edc.toLowerCase().includes(searchTerm) ||
                study.id.toString().includes(searchTerm);

            // Filter for published studies only if the toggle is checked
            const matchesStatus = !activeOnly || study.status === 'Published' || study.status === 'Active';

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

        tbody.innerHTML = pageStudies.map(study => {
            // Determine status badge class
            let statusClass = 'status-inactive';
            if (study.status === 'Active') {
                statusClass = 'status-active';
            } else if (study.status === 'Draft') {
                statusClass = 'status-draft';
            } else if (study.status === 'Published') {
                statusClass = 'status-published';
            }
            
            const questionCount = study.questions ? study.questions.length : 0;
            const selfieNeeded = study.selfieConfig && study.selfieConfig.enabled;
            
            // Format created date
            let createdDate = 'N/A';
            if (study.createdAt) {
                const date = new Date(study.createdAt);
                createdDate = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric'
                });
            }
            
            return `
            <tr>
                <td>
                    <input type="checkbox" class="study-checkbox" data-id="${study.studyId}">
                </td>
                <td>${study.id}</td>
                <td><strong>${study.title || study.label || '<em>No title</em>'}</strong></td>
                <td style="text-align: center;">${questionCount}</td>
                <td style="text-align: center;">
                    ${selfieNeeded ? '<i class="fas fa-camera" style="color: #10b981; font-size: 18px;" title="Selfie Required"></i>' : '<i class="fas fa-minus-circle" style="color: #d1d5db; font-size: 18px;" title="No Selfie"></i>'}
                </td>
                <td style="text-align: center;">
                    <a href="/submissionresults?studyId=${study.id}" style="color: #3b82f6; text-decoration: none; font-weight: 500;">24</a>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${study.status}
                    </span>
                </td>
                <td style="font-size: 13px; color: #6b7280;">${createdDate}</td>
                <td style="text-align: center; position: relative;">
                    <div class="action-menu-container">
                        <button class="action-menu-btn" onclick="studyManager.toggleActionMenu(event, '${study.id}')" title="Actions">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="action-menu" id="action-menu-${study.id}" style="display: none;">
                            <div class="action-menu-item" onclick="studyManager.editStudy('${study.id}')">
                                <i class="fas fa-pencil-alt"></i> Edit
                            </div>
                            <div class="action-menu-item" onclick="studyManager.openMobilePreview('${study.studyId}')">
                                <i class="fas fa-mobile-alt"></i> Mobile Preview
                            </div>
                            <div class="action-menu-item delete" onclick="studyManager.deleteStudy('${study.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
        }).join('');

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

    openMobilePreview(studyId) {
        // Open mobile preview in new tab
        const previewUrl = `/mobilepreview?studyId=${encodeURIComponent(studyId)}`;
        window.open(previewUrl, '_blank');
    }

    toggleActionMenu(event, studyId) {
        event.stopPropagation();
        const menu = document.getElementById(`action-menu-${studyId}`);
        
        // Close all other menus
        document.querySelectorAll('.action-menu').forEach(m => {
            if (m.id !== `action-menu-${studyId}`) {
                m.style.display = 'none';
            }
        });
        
        // Toggle current menu
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    }
}

// Close menus when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.action-menu').forEach(menu => {
        menu.style.display = 'none';
    });
});

// Initialize on page load
let studyManager;
document.addEventListener('DOMContentLoaded', () => {
    studyManager = new StudyManager();
});
