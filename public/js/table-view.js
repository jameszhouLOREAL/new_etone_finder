// Table View Functions for Photo Submissions

var selectedFiles = []; // Track selected files for comparison

function createTableRow(fileData) {
    var row = document.createElement('tr');
    row.setAttribute('data-filepath', fileData.filename);
    
    var parsedInfo = parseFilename(fileData.filename);
    
    // Format date
    var displayDate = parsedInfo.date;
    var timeSince = '';
    if (fileData.timeCreated) {
        var created = new Date(fileData.timeCreated);
        displayDate = created.toLocaleDateString();
        var now = new Date();
        var diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) timeSince = 'Today';
        else if (diffDays === 1) timeSince = '1 day ago';
        else if (diffDays < 30) timeSince = diffDays + ' days ago';
        else if (diffDays < 365) timeSince = Math.floor(diffDays / 30) + ' months ago';
        else timeSince = Math.floor(diffDays / 365) + ' years ago';
    }
    
    // Get image path for avatar (remove .json extension from filename)
    var imagePath = fileData.filename.replace(/\.json$/i, '');
    var imageUrl = '/api/image?bucket=' + encodeURIComponent(currentBucket) + '&path=' + encodeURIComponent(imagePath);
    
    // Get initials as fallback
    var initials = parsedInfo.userName.split(/[\s-]/).map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
    
    // Status
    var statusClass = fileData.validSelfie ? 'valid' : 'invalid';
    var statusText = fileData.validSelfie ? 'Valid' : 'Invalid';
    
    // API badges
    var apiBadges = '';
    if (fileData.apiResults) {
        if (fileData.apiResults.modiface) {
            apiBadges += '<span class="api-badge modiface">Modiface</span>';
        }
        if (fileData.apiResults.nexa) {
            apiBadges += '<span class="api-badge nexa">Nexa</span>';
        }
    }
    if (!apiBadges) {
        apiBadges = '<span style="color: var(--text-secondary); font-size: 11px;">—</span>';
    }
    
    row.innerHTML = 
        '<td class="cell-checkbox">' +
            '<input type="checkbox" class="row-checkbox" data-filename="' + fileData.filename + '">' +
        '</td>' +
        '<td>' +
            '<div class="cell-title">' +
                '<span class="cell-title-text">' + parsedInfo.studyName + '</span>' +
            '</div>' +
        '</td>' +
        '<td>' +
            '<div class="cell-owner">' +
                '<div class="owner-avatar">' +
                    '<img src="' + imageUrl + '" alt="' + parsedInfo.userName + '" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" />' +
                    '<div class="owner-avatar-fallback" style="display: none;">' + initials + '</div>' +
                '</div>' +
                '<span class="owner-name">' + parsedInfo.userName + '</span>' +
            '</div>' +
        '</td>' +
        '<td>' +
            '<div class="cell-date">' +
                '<div class="date-primary">' + displayDate + '</div>' +
                (timeSince ? '<div class="date-secondary">' + timeSince + '</div>' : '') +
            '</div>' +
        '</td>' +
        '<td>' +
            '<span class="status-pill ' + statusClass + '">' + statusText + '</span>' +
        '</td>' +
        '<td>' +
            '<div class="cell-apis">' + apiBadges + '</div>' +
        '</td>' +
        '<td>' +
            '<div class="cell-actions">' +
                '<button class="action-btn-icon view-btn" title="View details">🔍</button>' +
            '</div>' +
        '</td>';
    
    // Add click handlers
    // Handle checkbox
    var checkbox = row.querySelector('.row-checkbox');
    checkbox.onclick = function(e) {
        e.stopPropagation();
        handleCheckboxChange(fileData.filename, this.checked);
    };
    
    // Make entire row clickable
    row.onclick = function(e) {
        // Don't trigger if clicking on the view button itself (to avoid double-trigger)
        if (!e.target.classList.contains('view-btn') && !e.target.classList.contains('row-checkbox')) {
            handleViewFile(fileData.filename);
        }
    };
    
    var viewBtn = row.querySelector('.view-btn');
    viewBtn.onclick = function(e) {
        e.stopPropagation();
        handleViewFile(fileData.filename);
    };
    
    return row;
}

function handleViewFile(filename) {
    loadFile(filename);
    
    // Update active state
    document.querySelectorAll('#filesTable tbody tr').forEach(function(r) {
        r.classList.remove('active');
    });
    var activeRow = document.querySelector('tr[data-filepath="' + filename + '"]');
    if (activeRow) {
        activeRow.classList.add('active');
    }
    
    // Open detail panel
    openDetailPanel();
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function renderFilesTable(filteredFiles) {
    var tbody = document.getElementById('filesTableBody');
    
    if (filteredFiles.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">' +
            '<div class="empty-state">' +
            '<h3>No files match your criteria</h3>' +
            '<p>Try adjusting your search or filter</p>' +
            '</div></td></tr>';
        return;
    }
    
    tbody.innerHTML = '';
    filteredFiles.forEach(function(fileData) {
        var row = createTableRow(fileData);
        tbody.appendChild(row);
    });
}

function switchToTableView() {
    currentView = 'table';
    document.getElementById('tableView').style.display = 'block';
    document.getElementById('cardView').style.display = 'none';
    document.getElementById('tableViewBtn').classList.add('active');
    document.getElementById('cardViewBtn').classList.remove('active');
    renderFiles();
}

function switchToCardView() {
    currentView = 'card';
    document.getElementById('tableView').style.display = 'none';
    document.getElementById('cardView').style.display = 'grid';
    document.getElementById('tableViewBtn').classList.remove('active');
    document.getElementById('cardViewBtn').classList.add('active');
    renderFiles();
}

function setupTableSorting() {
    var headers = document.querySelectorAll('.data-table th.sortable');
    
    // Set initial sort indicator on date column
    headers.forEach(function(header) {
        if (header.getAttribute('data-column') === 'date') {
            header.classList.add('sort-desc');
        }
    });
    
    headers.forEach(function(header) {
        header.addEventListener('click', function() {
            var column = this.getAttribute('data-column');
            
            // Remove sort classes from all headers
            headers.forEach(function(h) {
                h.classList.remove('sort-asc', 'sort-desc');
            });
            
            // Toggle sort direction
            if (sortColumn === column && sortDirection === 'asc') {
                sortDirection = 'desc';
                this.classList.add('sort-desc');
            } else {
                sortColumn = column;
                sortDirection = 'asc';
                this.classList.add('sort-asc');
            }
            
            renderFiles();
        });
    });
}

function sortFiles(files) {
    if (!sortColumn) return files;
    
    return files.sort(function(a, b) {
        var aVal, bVal;
        var parsedA = parseFilename(a.filename);
        var parsedB = parseFilename(b.filename);
        
        switch(sortColumn) {
            case 'title':
                aVal = parsedA.studyName;
                bVal = parsedB.studyName;
                break;
            case 'owner':
                aVal = parsedA.userName;
                bVal = parsedB.userName;
                break;
            case 'date':
                aVal = a.timeCreated || '';
                bVal = b.timeCreated || '';
                break;
            case 'status':
                aVal = a.validSelfie ? 1 : 0;
                bVal = b.validSelfie ? 1 : 0;
                break;
            default:
                return 0;
        }
        
        var comparison = 0;
        if (typeof aVal === 'string') {
            comparison = aVal.localeCompare(bVal);
        } else {
            comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
    });
}

function setupFilterHandlers() {
    var statusFilter = document.getElementById('statusFilter');
    var ownerFilter = document.getElementById('ownerFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', renderFiles);
    }
    
    if (ownerFilter) {
        ownerFilter.addEventListener('change', renderFiles);
    }
    
    // Populate owner filter with unique owners
    populateOwnerFilter();
}

function populateOwnerFilter() {
    var ownerFilter = document.getElementById('ownerFilter');
    if (!ownerFilter) return;
    
    var owners = new Set();
    allFilesData.forEach(function(file) {
        var parsed = parseFilename(file.filename);
        owners.add(parsed.userName);
    });
    
    ownerFilter.innerHTML = '<option value="all">All Owners</option>';
    Array.from(owners).sort().forEach(function(owner) {
        var option = document.createElement('option');
        option.value = owner;
        option.textContent = owner;
        ownerFilter.appendChild(option);
    });
}

// Checkbox and Comparison Functions
function handleCheckboxChange(filename, isChecked) {
    if (isChecked) {
        if (!selectedFiles.includes(filename)) {
            selectedFiles.push(filename);
        }
    } else {
        selectedFiles = selectedFiles.filter(function(f) { return f !== filename; });
    }
    updateCompareButton();
}

function updateCompareButton() {
    var compareBtn = document.getElementById('compareBtn');
    var selectedCount = document.getElementById('selectedCount');
    
    if (compareBtn && selectedCount) {
        selectedCount.textContent = selectedFiles.length;
        
        if (selectedFiles.length >= 2) {
            compareBtn.style.display = 'flex';
        } else {
            compareBtn.style.display = 'none';
        }
    }
}

function setupCompareButton() {
    console.log('setupCompareButton called');
    var compareBtn = document.getElementById('compareBtn');
    var selectAllCheckbox = document.getElementById('selectAllCheckbox');
    var closeComparisonBtn = document.getElementById('closeComparisonBtn');
    
    console.log('compareBtn:', compareBtn);
    console.log('selectAllCheckbox:', selectAllCheckbox);
    console.log('closeComparisonBtn:', closeComparisonBtn);
    
    if (compareBtn) {
        compareBtn.addEventListener('click', function() {
            console.log('Compare button clicked!');
            showComparisonModal();
        });
        console.log('Compare button listener added');
    } else {
        console.error('Compare button not found!');
    }
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            var checkboxes = document.querySelectorAll('.row-checkbox');
            checkboxes.forEach(function(cb) {
                cb.checked = selectAllCheckbox.checked;
                handleCheckboxChange(cb.dataset.filename, cb.checked);
            });
        });
    }
    
    if (closeComparisonBtn) {
        closeComparisonBtn.addEventListener('click', closeComparisonModal);
    }
    
    // Close modal on backdrop click
    var comparisonModal = document.getElementById('comparisonModal');
    if (comparisonModal) {
        comparisonModal.addEventListener('click', function(e) {
            if (e.target === comparisonModal) {
                closeComparisonModal();
            }
        });
    }
}

function showComparisonModal() {
    console.log('showComparisonModal called');
    console.log('selectedFiles:', selectedFiles);
    
    var modal = document.getElementById('comparisonModal');
    var trendsTab = document.getElementById('trendsTab');
    var detailsTab = document.getElementById('detailsTab');
    
    console.log('modal:', modal);
    console.log('trendsTab:', trendsTab);
    console.log('detailsTab:', detailsTab);
    
    if (!modal || !trendsTab || !detailsTab) {
        console.error('Missing modal elements');
        return;
    }
    
    // Get data for selected files
    var selectedData = selectedFiles.map(function(filename) {
        return allFilesData.find(function(f) { return f.filename === filename; });
    }).filter(function(d) { return d !== undefined; });
    
    console.log('selectedData:', selectedData);
    
    if (selectedData.length < 2) {
        console.warn('Not enough selections:', selectedData.length);
        trendsTab.innerHTML = '<div class="comparison-no-data">Please select at least 2 submissions to compare</div>';
        detailsTab.innerHTML = '<div class="comparison-no-data">Please select at least 2 submissions to compare</div>';
        modal.style.display = 'flex';
        return;
    }
    
    // Sort by date for trend analysis
    selectedData.sort(function(a, b) {
        var dateA = a.timeCreated ? new Date(a.timeCreated) : new Date(0);
        var dateB = b.timeCreated ? new Date(b.timeCreated) : new Date(0);
        return dateA - dateB;
    });
    
    console.log('Building trend analysis...');
    // Build trend analysis content
    if (selectedData.length >= 2) {
        trendsTab.innerHTML = buildTrendAnalysis(selectedData);
    } else {
        trendsTab.innerHTML = '<div class="comparison-no-data">Need at least 2 submissions for trend analysis</div>';
    }
    
    console.log('Building comparison table...');
    // Build detailed comparison table
    detailsTab.innerHTML = buildComparisonTable(selectedData);
    
    console.log('Building charts...');
    // Build charts
    var chartsTab = document.getElementById('chartsTab');
    if (chartsTab) {
        if (selectedData.length >= 2) {
            chartsTab.innerHTML = buildChartsContent(selectedData);
            // Render charts after a small delay to ensure DOM is ready
            setTimeout(function() {
                renderSkinConcernsChart(selectedData);
            }, 100);
        } else {
            chartsTab.innerHTML = '<div class="comparison-no-data">Need at least 2 submissions for charts</div>';
        }
    }
    
    console.log('Setting up tabs...');
    // Setup tab switching
    setupComparisonTabs();
    
    console.log('Displaying modal...');
    modal.style.display = 'flex';
    console.log('Modal display set to flex');
}

function setupComparisonTabs() {
    var tabs = document.querySelectorAll('.comparison-tab');
    var tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            var targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabs.forEach(function(t) { t.classList.remove('active'); });
            tabContents.forEach(function(c) { c.classList.remove('active'); });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            if (targetTab === 'trends') {
                document.getElementById('trendsTab').classList.add('active');
            } else if (targetTab === 'charts') {
                document.getElementById('chartsTab').classList.add('active');
            } else if (targetTab === 'details') {
                document.getElementById('detailsTab').classList.add('active');
            }
        });
    });
}

function buildComparisonTable(dataArray) {
    var html = '<div class="comparison-table-container">';
    html += '<table class="comparison-table">';
    
    // Table Header with user names and timestamps
    html += '<thead><tr><th class="comparison-metric-header">Metric</th>';
    dataArray.forEach(function(fileData) {
        var parsedInfo = parseFilename(fileData.filename);
        
        // Format the timestamp
        var timeInfo = '';
        if (fileData.timeCreated) {
            var date = new Date(fileData.timeCreated);
            var dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            var timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            timeInfo = dateStr + ' • ' + timeStr;
        } else {
            timeInfo = parsedInfo.date;
        }
        
        html += '<th class="comparison-user-header">';
        html += '<div class="comparison-user-cell">';
        html += '<div class="comparison-user-name">' + parsedInfo.userName + '</div>';
        html += '<div class="comparison-user-date">' + timeInfo + '</div>';
        html += '</div>';
        html += '</th>';
    });
    html += '</tr></thead>';
    
    html += '<tbody>';
    
    // Basic Information Section
    html += '<tr class="comparison-section-row collapsible-section" data-section="basic">';
    html += '<td colspan="' + (dataArray.length + 1) + '" class="comparison-section-title">';
    html += '<span class="section-toggle">▼</span> Basic Information';
    html += '</td></tr>';
    html += '<tbody class="section-content" data-section="basic">';
    html += buildComparisonTableRow('Study', dataArray, function(d) { return parseFilename(d.filename).studyName; });
    html += buildComparisonTableRow('User ID', dataArray, function(d) { return parseFilename(d.filename).userId; });
    html += buildComparisonTableRow('Status', dataArray, function(d) { 
        return '<span class="comparison-badge ' + (d.validSelfie ? 'valid' : 'invalid') + '">' + (d.validSelfie ? 'Valid' : 'Invalid') + '</span>'; 
    });
    html += '</tbody>';
    
    // Quality Scores Section
    html += '<tr class="comparison-section-row collapsible-section" data-section="quality">';
    html += '<td colspan="' + (dataArray.length + 1) + '" class="comparison-section-title">';
    html += '<span class="section-toggle">▼</span> Quality Scores';
    html += '</td></tr>';
    html += '<tbody class="section-content" data-section="quality">';
    html += buildComparisonTableRow('Brightness', dataArray, function(d) { 
        return d.scores?.brightness?.result?.[0] ? d.scores.brightness.result[0].toFixed(1) : 'N/A'; 
    }, false);
    html += buildComparisonTableRow('Lighting', dataArray, function(d) { 
        return d.scores?.lighting?.result?.[0] ? d.scores.lighting.result[0].toFixed(1) : 'N/A'; 
    }, false);
    html += buildComparisonTableRow('Distance', dataArray, function(d) { 
        return d.scores?.distance?.result?.[0] ? d.scores.distance.result[0].toFixed(1) : 'N/A'; 
    }, false);
    html += buildComparisonTableRow('Neutral Expression', dataArray, function(d) { 
        return d.scores?.neutral?.result?.[0] ? (d.scores.neutral.result[0] * 100).toFixed(1) + '%' : 'N/A'; 
    }, false);
    html += '</tbody>';
    
    // Device Information Section
    html += '<tr class="comparison-section-row collapsible-section" data-section="device">';
    html += '<td colspan="' + (dataArray.length + 1) + '" class="comparison-section-title">';
    html += '<span class="section-toggle">▼</span> Device Information';
    html += '</td></tr>';
    html += '<tbody class="section-content" data-section="device">';
    html += buildComparisonTableRow('Device', dataArray, function(d) { 
        return ((d.exif?.deviceBrand || '') + ' ' + (d.exif?.deviceOS || '')).trim() || 'Unknown'; 
    });
    html += buildComparisonTableRow('Browser', dataArray, function(d) { return d.browserName || 'Unknown'; });
    html += buildComparisonTableRow('Camera', dataArray, function(d) { return d.usedCamera || 'N/A'; });
    html += buildComparisonTableRow('Capture Mode', dataArray, function(d) { return d.captureMode || 'N/A'; });
    html += buildComparisonTableRow('EXIF Brightness', dataArray, function(d) { 
        return d.exif?.brightness ? d.exif.brightness.toFixed(0) : 'N/A'; 
    });
    html += '</tbody>';
    
    // Top Skin Concerns Section
    html += '<tr class="comparison-section-row collapsible-section" data-section="concerns">';
    html += '<td colspan="' + (dataArray.length + 1) + '" class="comparison-section-title">';
    html += '<span class="section-toggle">▼</span> Top Skin Concerns';
    html += '</td></tr>';
    html += '<tbody class="section-content" data-section="concerns">';
    var concernsData = extractTopConcerns(dataArray);
    concernsData.forEach(function(concernName) {
        html += buildComparisonTableRow(concernName, dataArray, function(d) {
            return getConcernScoreForDisplay(d, concernName);
        });
    });
    html += '</tbody>';
    
    // Validation Issues Section
    html += '<tr class="comparison-section-row collapsible-section" data-section="issues">';
    html += '<td colspan="' + (dataArray.length + 1) + '" class="comparison-section-title">';
    html += '<span class="section-toggle">▼</span> Validation Issues';
    html += '</td></tr>';
    html += '<tbody class="section-content" data-section="issues">';
    html += buildComparisonTableRow('Issues', dataArray, function(d) {
        if (!d.selfieIssues || d.selfieIssues.length === 0) return '<span class="comparison-no-issues">✓ None</span>';
        return '<div class="comparison-issues">' + d.selfieIssues.map(function(issue) {
            return '<span class="comparison-issue-tag">' + formatIssueName(issue) + '</span>';
        }).join('') + '</div>';
    });
    html += '</tbody>';
    
    html += '</tbody></table></div>';
    
    // Setup collapsible functionality after a short delay to ensure DOM is ready
    setTimeout(setupCollapsibleSections, 100);
    
    return html;
}

function buildComparisonTableRow(label, dataArray, valueFunc, isNumeric) {
    var html = '<tr class="comparison-data-row">';
    html += '<td class="comparison-label-cell">' + label + '</td>';
    
    var values = dataArray.map(valueFunc);
    
    // Highlight best/worst values for numeric data
    var numericValues = null;
    if (isNumeric) {
        numericValues = values.map(function(v) {
            var num = parseFloat(v);
            return isNaN(num) ? null : num;
        });
        var validNums = numericValues.filter(function(n) { return n !== null; });
        if (validNums.length > 1) {
            var max = Math.max.apply(null, validNums);
            var min = Math.min.apply(null, validNums);
            
            values.forEach(function(value, index) {
                var cellClass = '';
                if (numericValues[index] === max && max !== min) {
                    cellClass = 'comparison-value-best';
                } else if (numericValues[index] === min && max !== min) {
                    cellClass = 'comparison-value-worst';
                }
                html += '<td class="comparison-value-cell ' + cellClass + '">' + value + '</td>';
            });
            html += '</tr>';
            return html;
        }
    }
    
    // Regular display for non-numeric data
    values.forEach(function(value) {
        html += '<td class="comparison-value-cell">' + value + '</td>';
    });
    
    html += '</tr>';
    return html;
}

function extractTopConcerns(dataArray) {
    var allConcernCodes = {};
    
    dataArray.forEach(function(d) {
        if (!d.apiResults?.modiface?.ranges) return;
        
        d.apiResults.modiface.ranges.forEach(function(range) {
            if (!range.concerns) return;
            range.concerns.forEach(function(concern) {
                if (concern.normalizedScore) {
                    allConcernCodes[concern.code] = true;
                }
            });
        });
    });
    
    return Object.keys(allConcernCodes).map(function(code) {
        return formatConcernName(code);
    }).slice(0, 8);
}

function getConcernScoreForDisplay(fileData, concernName) {
    if (!fileData.apiResults?.modiface?.ranges) return 'N/A';
    
    // Convert display name back to code
    var codeMap = {
        'Fine Lines': 'finelines',
        'Deep Wrinkles': 'deepwrinkles',
        'Lack of Firmness': 'lackoffirmness',
        'Large Pores': 'largepores',
        'Blotchiness': 'blotchiness',
        'Dark Pigmentation': 'darkpigmentation',
        'Wrinkles': 'wrinkles',
        'Eye Contour': 'eyecontour',
        'Dark Circles': 'darkcircles'
    };
    
    var code = codeMap[concernName] || concernName.toLowerCase();
    
    var score = null;
    fileData.apiResults.modiface.ranges.forEach(function(range) {
        if (!range.concerns) return;
        range.concerns.forEach(function(concern) {
            if (concern.code === code && concern.normalizedScore) {
                score = parseFloat(concern.normalizedScore);
            }
        });
    });
    
    return score !== null ? (score * 100).toFixed(1) + '%' : 'N/A';
}

function formatConcernName(code) {
    var names = {
        'finelines': 'Fine Lines',
        'deepwrinkles': 'Deep Wrinkles',
        'lackoffirmness': 'Lack of Firmness',
        'largepores': 'Large Pores',
        'blotchiness': 'Blotchiness',
        'darkpigmentation': 'Dark Pigmentation',
        'wrinkles': 'Wrinkles',
        'eyecontour': 'Eye Contour',
        'darkcircles': 'Dark Circles'
    };
    return names[code] || code;
}

function formatIssueName(issue) {
    return issue.split('_').map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

function setupCollapsibleSections() {
    var sectionHeaders = document.querySelectorAll('.collapsible-section');
    
    sectionHeaders.forEach(function(header) {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            var sectionName = this.getAttribute('data-section');
            var contentRows = document.querySelector('.section-content[data-section="' + sectionName + '"]');
            var toggle = this.querySelector('.section-toggle');
            
            if (contentRows) {
                var isCollapsed = contentRows.style.display === 'none';
                
                if (isCollapsed) {
                    contentRows.style.display = '';
                    toggle.textContent = '▼';
                    this.classList.remove('collapsed');
                } else {
                    contentRows.style.display = 'none';
                    toggle.textContent = '▶';
                    this.classList.add('collapsed');
                }
            }
        });
    });
}

function closeComparisonModal() {
    var modal = document.getElementById('comparisonModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize comparison functionality when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCompareButton);
} else {
    setupCompareButton();
}

// Trend Analysis Functions
function buildTrendAnalysis(dataArray) {
    if (dataArray.length < 2) return '<div class="comparison-no-data">Need at least 2 submissions for trend analysis</div>';
    
    var html = '<div class="trend-analysis-wrapper">';
    html += '<div class="trend-info-banner">';
    html += '<i class="fas fa-info-circle"></i>';
    html += '<span>Analysis based on <strong>' + dataArray.length + ' submissions</strong> over time, sorted chronologically</span>';
    html += '</div>';
    
    html += '<div class="trend-grid">';
    
    // Calculate trends
    var trends = calculateTrends(dataArray);
    
    // Rate of Change Analysis
    if (trends.rateOfChange.length > 0) {
        html += '<div class="trend-card">';
        html += '<div class="trend-card-title"><i class="fas fa-chart-line"></i> Rate of Change</div>';
        trends.rateOfChange.forEach(function(item) {
            var icon = item.direction === 'improving' ? '📈' : item.direction === 'declining' ? '📉' : '➡️';
            var colorClass = item.direction === 'improving' ? 'trend-positive' : item.direction === 'declining' ? 'trend-negative' : 'trend-neutral';
            html += '<div class="trend-item ' + colorClass + '">';
            html += '<span class="trend-icon">' + icon + '</span>';
            html += '<span class="trend-text">' + item.message + '</span>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Pattern Detection
    if (trends.patterns.length > 0) {
        html += '<div class="trend-card">';
        html += '<div class="trend-card-title"><i class="fas fa-search"></i> Detected Patterns</div>';
        trends.patterns.forEach(function(pattern) {
            html += '<div class="trend-item trend-info">';
            html += '<span class="trend-icon">💡</span>';
            html += '<span class="trend-text">' + pattern + '</span>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Predictions
    if (trends.predictions.length > 0) {
        html += '<div class="trend-card">';
        html += '<div class="trend-card-title"><i class="fas fa-crystal-ball"></i> Trajectory Predictions</div>';
        trends.predictions.forEach(function(prediction) {
            html += '<div class="trend-item trend-prediction">';
            html += '<span class="trend-icon">🎯</span>';
            html += '<span class="trend-text">' + prediction + '</span>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Correlations
    if (trends.correlations.length > 0) {
        html += '<div class="trend-card">';
        html += '<div class="trend-card-title"><i class="fas fa-link"></i> Correlation Insights</div>';
        trends.correlations.forEach(function(correlation) {
            html += '<div class="trend-item trend-correlation">';
            html += '<span class="trend-icon">🔬</span>';
            html += '<span class="trend-text">' + correlation + '</span>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    // If no trends found
    if (trends.rateOfChange.length === 0 && trends.patterns.length === 0 && 
        trends.predictions.length === 0 && trends.correlations.length === 0) {
        html += '<div class="trend-no-data">';
        html += '<i class="fas fa-chart-line" style="font-size: 48px; opacity: 0.3; margin-bottom: 16px;"></i>';
        html += '<p>No significant trends detected in the selected submissions.</p>';
        html += '<p style="font-size: 13px; opacity: 0.7;">Try selecting more submissions or submissions with greater variation.</p>';
        html += '</div>';
    }
    
    html += '</div></div>';
    return html;
}

function calculateTrends(dataArray) {
    var trends = {
        rateOfChange: [],
        patterns: [],
        predictions: [],
        correlations: []
    };
    
    if (dataArray.length < 2) return trends;
    
    // Calculate time span
    var firstDate = dataArray[0].timeCreated ? new Date(dataArray[0].timeCreated) : null;
    var lastDate = dataArray[dataArray.length - 1].timeCreated ? new Date(dataArray[dataArray.length - 1].timeCreated) : null;
    
    if (!firstDate || !lastDate) return trends;
    
    var daysDiff = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));
    var weeksDiff = daysDiff / 7;
    
    // Analyze Quality Scores - DISABLED per user request
    // analyzeQualityScoreTrends(dataArray, daysDiff, weeksDiff, trends);
    
    // Analyze Skin Concerns
    analyzeSkinConcernTrends(dataArray, daysDiff, weeksDiff, trends);
    
    // Detect Camera Patterns
    detectCameraPatterns(dataArray, trends);
    
    // Detect Capture Mode Patterns
    detectCaptureModePatterns(dataArray, trends);
    
    // Detect Time of Day Patterns
    detectTimePatterns(dataArray, trends);
    
    // Detect Lighting Correlations
    detectLightingCorrelations(dataArray, trends);
    
    return trends;
}

function analyzeQualityScoreTrends(dataArray, daysDiff, weeksDiff, trends) {
    var metrics = ['brightness', 'lighting', 'distance', 'neutral'];
    
    metrics.forEach(function(metric) {
        var values = dataArray.map(function(d) {
            if (!d.scores || !d.scores[metric]) return null;
            var val = d.scores[metric].result?.[0];
            return metric === 'neutral' ? val * 100 : val;
        }).filter(function(v) { return v !== null && !isNaN(v); });
        
        if (values.length >= 2) {
            var first = values[0];
            var last = values[values.length - 1];
            var change = last - first;
            var ratePerWeek = weeksDiff > 0 ? change / weeksDiff : 0;
            var ratePerDay = daysDiff > 0 ? change / daysDiff : 0;
            
            if (Math.abs(change) > 5) {
                var metricName = metric.charAt(0).toUpperCase() + metric.slice(1);
                var direction = change > 0 ? 'improving' : 'declining';
                var rate = Math.abs(ratePerWeek) > 1 ? 
                    ratePerWeek.toFixed(1) + ' points per week' : 
                    ratePerDay.toFixed(2) + ' points per day';
                
                trends.rateOfChange.push({
                    metric: metric,
                    direction: direction,
                    message: metricName + ' ' + (change > 0 ? 'improved' : 'declined') + ' by ' + rate
                });
                
                // Add prediction if trend is significant
                if (Math.abs(ratePerWeek) > 2) {
                    var targetRange = metric === 'brightness' ? 150 : metric === 'lighting' ? 80 : 70;
                    var remaining = targetRange - last;
                    if (ratePerWeek !== 0 && Math.sign(remaining) === Math.sign(ratePerWeek)) {
                        var weeksToTarget = Math.abs(remaining / ratePerWeek);
                        if (weeksToTarget > 0 && weeksToTarget < 12) {
                            trends.predictions.push(
                                'At current rate, ' + metricName + ' will reach optimal range in ' + 
                                Math.ceil(weeksToTarget) + ' week' + (weeksToTarget > 1.5 ? 's' : '')
                            );
                        }
                    }
                }
            }
        }
    });
}

function analyzeSkinConcernTrends(dataArray, daysDiff, weeksDiff, trends) {
    var concernScores = {};
    
    dataArray.forEach(function(d) {
        if (!d.apiResults?.modiface?.ranges) return;
        
        d.apiResults.modiface.ranges.forEach(function(range) {
            if (!range.concerns) return;
            
            range.concerns.forEach(function(concern) {
                if (!concern.normalizedScore) return;
                
                if (!concernScores[concern.code]) {
                    concernScores[concern.code] = [];
                }
                concernScores[concern.code].push(parseFloat(concern.normalizedScore));
            });
        });
    });
    
    Object.keys(concernScores).forEach(function(code) {
        var scores = concernScores[code];
        if (scores.length >= 2) {
            var first = scores[0];
            var last = scores[scores.length - 1];
            var change = (last - first) * 100;
            
            if (Math.abs(change) > 5) {
                var name = formatConcernName(code);
                var direction = change < 0 ? 'improving' : 'declining';
                
                trends.rateOfChange.push({
                    metric: code,
                    direction: direction,
                    message: name + ' ' + (change < 0 ? 'improving' : 'worsening') + ' by ' + 
                             Math.abs(change).toFixed(1) + '% over period'
                });
                
                if (change < 0) {
                    trends.predictions.push(name + ' trend suggests continued improvement');
                }
            }
        }
    });
}

function detectCameraPatterns(dataArray, trends) {
    var cameraGroups = { FRONT: [], BACK: [] };
    
    dataArray.forEach(function(d) {
        var camera = d.usedCamera;
        if (camera === 'FRONT' || camera === 'BACK') {
            var avgScore = calculateAverageQualityScore(d);
            if (avgScore > 0) {
                cameraGroups[camera].push(avgScore);
            }
        }
    });
    
    if (cameraGroups.FRONT.length > 0 && cameraGroups.BACK.length > 0) {
        var frontAvg = cameraGroups.FRONT.reduce(function(a, b) { return a + b; }, 0) / cameraGroups.FRONT.length;
        var backAvg = cameraGroups.BACK.reduce(function(a, b) { return a + b; }, 0) / cameraGroups.BACK.length;
        var diff = Math.abs(frontAvg - backAvg);
        
        if (diff > 5) {
            var better = frontAvg > backAvg ? 'FRONT' : 'BACK';
            var percent = ((diff / Math.min(frontAvg, backAvg)) * 100).toFixed(0);
            trends.patterns.push('Scores consistently better with ' + better + ' camera (+' + percent + '%)');
        }
    }
}

function detectCaptureModePatterns(dataArray, trends) {
    var modeGroups = { auto: [], manual: [] };
    var validationFailures = { auto: 0, manual: 0 };
    var totalCounts = { auto: 0, manual: 0 };
    
    dataArray.forEach(function(d) {
        var mode = d.captureMode;
        if (mode === 'auto' || mode === 'manual') {
            totalCounts[mode]++;
            
            var avgScore = calculateAverageQualityScore(d);
            if (avgScore > 0) {
                modeGroups[mode].push(avgScore);
            }
            
            if (!d.validSelfie) {
                validationFailures[mode]++;
            }
        }
    });
    
    // Check consistency
    if (modeGroups.auto.length > 1) {
        var autoVariance = calculateVariance(modeGroups.auto);
        var manualVariance = modeGroups.manual.length > 1 ? calculateVariance(modeGroups.manual) : Infinity;
        
        if (autoVariance < manualVariance && autoVariance < 100) {
            trends.patterns.push('Auto-capture mode produces more consistent results (variance: ' + autoVariance.toFixed(1) + ')');
        }
    }
    
    // Check validation failures
    if (totalCounts.manual > 0 && validationFailures.manual > 0) {
        var failureRate = (validationFailures.manual / totalCounts.manual * 100).toFixed(0);
        if (failureRate > 20) {
            trends.correlations.push('Manual capture associated with ' + failureRate + '% validation failure rate');
        }
    }
}

function detectTimePatterns(dataArray, trends) {
    var morningScores = [];
    var afternoonScores = [];
    var eveningScores = [];
    
    dataArray.forEach(function(d) {
        if (!d.timeCreated) return;
        
        var hour = new Date(d.timeCreated).getHours();
        var radianceScore = getRadianceScore(d);
        
        if (radianceScore > 0) {
            if (hour >= 6 && hour < 12) {
                morningScores.push(radianceScore);
            } else if (hour >= 12 && hour < 18) {
                afternoonScores.push(radianceScore);
            } else if (hour >= 18 || hour < 6) {
                eveningScores.push(radianceScore);
            }
        }
    });
    
    if (morningScores.length > 0 && (afternoonScores.length > 0 || eveningScores.length > 0)) {
        var morningAvg = morningScores.reduce(function(a, b) { return a + b; }, 0) / morningScores.length;
        var otherAvg = afternoonScores.concat(eveningScores);
        if (otherAvg.length > 0) {
            otherAvg = otherAvg.reduce(function(a, b) { return a + b; }, 0) / otherAvg.length;
            var diff = ((morningAvg - otherAvg) / otherAvg * 100);
            
            if (Math.abs(diff) > 10) {
                if (diff > 0) {
                    trends.patterns.push('Morning selfies show ' + diff.toFixed(0) + '% better radiance scores');
                } else {
                    trends.patterns.push('Afternoon/evening selfies show ' + Math.abs(diff).toFixed(0) + '% better radiance scores');
                }
            }
        }
    }
}

function detectLightingCorrelations(dataArray, trends) {
    var lightingGroups = { good: [], poor: [] };
    var radianceGroups = { good: [], poor: [] };
    
    dataArray.forEach(function(d) {
        var lightingScore = d.scores?.lighting?.result?.[0];
        var radianceScore = getRadianceScore(d);
        
        if (lightingScore && radianceScore > 0) {
            if (lightingScore > 70) {
                lightingGroups.good.push(lightingScore);
                radianceGroups.good.push(radianceScore);
            } else if (lightingScore < 50) {
                lightingGroups.poor.push(lightingScore);
                radianceGroups.poor.push(radianceScore);
            }
        }
    });
    
    if (radianceGroups.good.length > 0 && radianceGroups.poor.length > 0) {
        var goodAvg = radianceGroups.good.reduce(function(a, b) { return a + b; }, 0) / radianceGroups.good.length;
        var poorAvg = radianceGroups.poor.reduce(function(a, b) { return a + b; }, 0) / radianceGroups.poor.length;
        var improvement = ((goodAvg - poorAvg) / poorAvg * 100);
        
        if (improvement > 15) {
            trends.correlations.push('Better lighting correlates with ' + improvement.toFixed(0) + '% better radiance scores');
        }
    }
}

// Helper Functions
function calculateAverageQualityScore(data) {
    if (!data.scores) return 0;
    
    var scores = [];
    if (data.scores.brightness?.result?.[0]) scores.push(data.scores.brightness.result[0]);
    if (data.scores.lighting?.result?.[0]) scores.push(data.scores.lighting.result[0]);
    if (data.scores.distance?.result?.[0]) scores.push(data.scores.distance.result[0]);
    
    if (scores.length === 0) return 0;
    return scores.reduce(function(a, b) { return a + b; }, 0) / scores.length;
}

function calculateVariance(arr) {
    if (arr.length === 0) return 0;
    var mean = arr.reduce(function(a, b) { return a + b; }, 0) / arr.length;
    var squaredDiffs = arr.map(function(val) { return Math.pow(val - mean, 2); });
    return squaredDiffs.reduce(function(a, b) { return a + b; }, 0) / arr.length;
}

function getRadianceScore(data) {
    // Try to extract radiance from skin concerns or use brightness as proxy
    if (data.apiResults?.modiface?.ranges) {
        for (var i = 0; i < data.apiResults.modiface.ranges.length; i++) {
            var range = data.apiResults.modiface.ranges[i];
            if (range.concerns) {
                for (var j = 0; j < range.concerns.length; j++) {
                    var concern = range.concerns[j];
                    if (concern.code === 'radiance' && concern.normalizedScore) {
                        return parseFloat(concern.normalizedScore) * 100;
                    }
                }
            }
        }
    }
    
    // Fallback to brightness score
    if (data.scores?.brightness?.result?.[0]) {
        return data.scores.brightness.result[0];
    }
    
    return 0;
}

// Chart Building Functions
var skinConcernsChart = null; // Store chart instance for cleanup

function buildChartsContent(dataArray) {
    var html = '<div class="charts-wrapper">';
    html += '<div class="chart-container">';
    html += '<h3 class="chart-title">Top Skin Concerns Over Time</h3>';
    html += '<div class="chart-description">Tracking changes in skin concern scores across submissions</div>';
    html += '<canvas id="skinConcernsChart"></canvas>';
    html += '</div>';
    html += '</div>';
    return html;
}

function renderSkinConcernsChart(dataArray) {
    // Destroy existing chart if it exists
    if (skinConcernsChart) {
        skinConcernsChart.destroy();
        skinConcernsChart = null;
    }
    
    var canvas = document.getElementById('skinConcernsChart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    var ctx = canvas.getContext('2d');
    
    // Filter out submissions without skin concerns data
    var filteredData = dataArray.filter(function(d) {
        if (!d.apiResults?.modiface?.ranges) return false;
        
        var hasConcerns = false;
        d.apiResults.modiface.ranges.forEach(function(range) {
            if (range.concerns && range.concerns.length > 0) {
                range.concerns.forEach(function(concern) {
                    if (concern.normalizedScore) {
                        hasConcerns = true;
                    }
                });
            }
        });
        return hasConcerns;
    });
    
    if (filteredData.length === 0) {
        canvas.parentElement.innerHTML = '<div class="comparison-no-data">No skin concern data available in selected submissions</div>';
        return;
    }
    
    // Extract all unique concerns across all submissions
    var allConcerns = {};
    filteredData.forEach(function(d) {
        if (!d.apiResults?.modiface?.ranges) return;
        
        d.apiResults.modiface.ranges.forEach(function(range) {
            if (!range.concerns) return;
            range.concerns.forEach(function(concern) {
                if (concern.normalizedScore) {
                    allConcerns[concern.code] = true;
                }
            });
        });
    });
    
    // Get top concerns based on average scores
    var concernAverages = {};
    Object.keys(allConcerns).forEach(function(concernCode) {
        var scores = [];
        filteredData.forEach(function(d) {
            var score = getConcernScore(d, concernCode);
            if (score > 0) scores.push(score);
        });
        if (scores.length > 0) {
            concernAverages[concernCode] = scores.reduce(function(a, b) { return a + b; }, 0) / scores.length;
        }
    });
    
    // Sort and get top 5 concerns
    var topConcerns = Object.keys(concernAverages)
        .sort(function(a, b) { return concernAverages[b] - concernAverages[a]; })
        .slice(0, 5);
    
    if (topConcerns.length === 0) {
        canvas.parentElement.innerHTML = '<div class="comparison-no-data">No skin concern data available</div>';
        return;
    }
    
    // Prepare labels (timestamps)
    var labels = filteredData.map(function(d) {
        if (d.timeCreated) {
            var date = new Date(d.timeCreated);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + '\n' +
                   date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
        return 'Unknown';
    });
    
    // Prepare datasets for each concern
    var datasets = topConcerns.map(function(concernCode, index) {
        var data = filteredData.map(function(d) {
            return getConcernScore(d, concernCode);
        });
        
        // Color palette for different concerns
        var colors = [
            { bg: 'rgba(16, 185, 129, 0.2)', border: 'rgba(16, 185, 129, 1)' },  // Green
            { bg: 'rgba(59, 130, 246, 0.2)', border: 'rgba(59, 130, 246, 1)' },  // Blue
            { bg: 'rgba(251, 146, 60, 0.2)', border: 'rgba(251, 146, 60, 1)' },  // Orange
            { bg: 'rgba(168, 85, 247, 0.2)', border: 'rgba(168, 85, 247, 1)' },  // Purple
            { bg: 'rgba(236, 72, 153, 0.2)', border: 'rgba(236, 72, 153, 1)' }   // Pink
        ];
        
        var color = colors[index % colors.length];
        
        return {
            label: formatConcernName(concernCode),
            data: data,
            borderColor: color.border,
            backgroundColor: 'transparent',
            borderWidth: 3,
            tension: 0.3,
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: color.border,
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        };
    });
    
    // Create the chart
    skinConcernsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600'
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    borderWidth: 1,
                    padding: 12,
                    bodyFont: {
                        size: 13
                    },
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y.toFixed(1);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value;
                        },
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Concern Score',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 10
                        },
                        maxRotation: 0,
                        minRotation: 0
                    },
                    grid: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Submission Timeline',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

function getConcernScore(data, concernCode) {
    if (!data.apiResults?.modiface?.ranges) return 0;
    
    for (var i = 0; i < data.apiResults.modiface.ranges.length; i++) {
        var range = data.apiResults.modiface.ranges[i];
        if (!range.concerns) continue;
        
        for (var j = 0; j < range.concerns.length; j++) {
            var concern = range.concerns[j];
            if (concern.code === concernCode && concern.normalizedScore) {
                return parseFloat(concern.normalizedScore) * 100;
            }
        }
    }
    
    return 0;
}
