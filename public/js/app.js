// jsPDF will be loaded conditionally when needed
let jsPDF = null;
if (window.jspdf) {
    jsPDF = window.jspdf.jsPDF;
}

// Load sidebar component
async function loadSidebar() {
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        try {
            const response = await fetch('/components/sidebar.html');
            const html = await response.text();
            sidebarContainer.innerHTML = html;
            
            // Set active state based on current page
            const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'studylist';
            const activeItem = document.querySelector(`.nav-item[data-page="${currentPage}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        } catch (error) {
            console.error('Error loading sidebar:', error);
        }
    }
}

// Sidebar toggle functionality
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (sidebar && toggleIcon) {
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Expand sidebar
            sidebar.classList.remove('collapsed');
            body.classList.remove('sidebar-collapsed');
            // Change to left arrow (close icon)
            toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />';
            localStorage.setItem('sidebarCollapsed', 'false');
        } else {
            // Collapse sidebar
            sidebar.classList.add('collapsed');
            body.classList.add('sidebar-collapsed');
            // Change to right arrow (open icon)
            toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />';
            localStorage.setItem('sidebarCollapsed', 'true');
        }
    }
}

// Expand sidebar when clicking on logo (only when collapsed)
function expandSidebarFromLogo() {
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (sidebar && sidebar.classList.contains('collapsed')) {
        // Only expand if currently collapsed
        sidebar.classList.remove('collapsed');
        body.classList.remove('sidebar-collapsed');
        // Change to left arrow (close icon)
        if (toggleIcon) {
            toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />';
        }
        localStorage.setItem('sidebarCollapsed', 'false');
    }
}

// Load saved sidebar state
function loadSidebarState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (isCollapsed) {
        const sidebar = document.getElementById('sidebar');
        const body = document.body;
        const toggleIcon = document.getElementById('toggleIcon');
        
        if (sidebar && toggleIcon) {
            sidebar.classList.add('collapsed');
            body.classList.add('sidebar-collapsed');
            // Change to right arrow (open icon)
            toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />';
        }
    }
}

// Make function globally available
window.toggleSidebar = toggleSidebar;
window.expandSidebarFromLogo = expandSidebarFromLogo;

// Generic function to navigate with expanded sidebar
function navigateWithExpandedSidebar(event, url) {
    // Prevent the default link behavior
    event.preventDefault();
    
    console.log(`Navigation clicked to ${url} - expanding sidebar and navigating...`);
    
    // Force expand the sidebar if it's collapsed
    const sidebar = document.getElementById('sidebar');
    const body = document.body;
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (sidebar && sidebar.classList.contains('collapsed')) {
        console.log('Sidebar was collapsed, expanding it...');
        sidebar.classList.remove('collapsed');
        body.classList.remove('sidebar-collapsed');
        if (toggleIcon) {
            // Change to left arrow (close icon)
            toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />';
        }
        localStorage.setItem('sidebarCollapsed', 'false');
    } else {
        console.log('Sidebar was already expanded');
    }
    
    // Navigate to the URL after a short delay to allow sidebar animation
    setTimeout(() => {
        console.log(`Navigating to ${url}...`);
        window.location.href = url;
    }, 150);
}

// Function to open study list with expanded sidebar (legacy support)
function openStudyListWithExpandedSidebar(event) {
    navigateWithExpandedSidebar(event, '/studylist');
}

// Make functions globally available
window.navigateWithExpandedSidebar = navigateWithExpandedSidebar;
window.openStudyListWithExpandedSidebar = openStudyListWithExpandedSidebar;

// Authentication variables
let isAuthenticated = false;
let currentUser = null;

// Google Sign-In callback
function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    
    currentUser = {
        id: responsePayload.sub,
        email: responsePayload.email,
        name: responsePayload.name,
        picture: responsePayload.picture,
        domain: responsePayload.hd
    };
    
    // Check if user is from allowed domain (optional)
    if (currentUser.domain && currentUser.domain !== 'loreal.com') {
        showToast('Access restricted to L\'Oréal accounts only');
        return;
    }
    
    isAuthenticated = true;
    
    // Store user info in localStorage
    localStorage.setItem('vca_user', JSON.stringify(currentUser));
    localStorage.setItem('vca_authenticated', 'true');
    
    hideAuthOverlay();
    showUserInfo();
    showToast('Successfully signed in as ' + currentUser.name);
}

// Decode JWT response
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Hide authentication overlay
function hideAuthOverlay() {
    const authOverlay = document.getElementById('authOverlay');
    if (authOverlay) {
        authOverlay.style.display = 'none';
    }
    // Auto-load the default bucket after authentication
    if (currentBucket) {
        updateBucketDisplay();
        loadFiles();
    }
}

// Show user info in header
function showUserInfo() {
    const userInfo = document.getElementById('userInfo');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (userAvatar && currentUser.picture) {
        userAvatar.src = currentUser.picture;
    }
    if (userName && currentUser.name) {
        userName.textContent = currentUser.name;
    }
    if (userInfo) {
        userInfo.style.display = 'flex';
    }
}

// Sign out function
function signOut() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        google.accounts.id.disableAutoSelect();
    }
    isAuthenticated = false;
    currentUser = null;
    
    // Clear localStorage
    localStorage.removeItem('vca_user');
    localStorage.removeItem('vca_authenticated');
    
    const userInfo = document.getElementById('userInfo');
    const authOverlay = document.getElementById('authOverlay');
    
    if (userInfo) {
        userInfo.style.display = 'none';
    }
    if (authOverlay) {
        authOverlay.style.display = 'flex';
    }
    showToast('Signed out successfully');
}

// Check authentication on page load
function checkAuthentication() {
    // Development bypass for localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Auto-authenticate for development
        if (!isAuthenticated) {
            currentUser = {
                id: 'dev-user',
                email: 'developer@localhost',
                name: 'Development User',
                picture: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0Yjc2ODgiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIxMiIgeT0iMTIiPgo8cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4UzMuNTggMTYgOCAxNiAxNiAxMi40MiAxNiA4IDEyLjQyIDAgOCAwWk04IDJDMTEuMzEgMiAxNCA0LjY5IDE0IDhTMTEuMzEgMTQgOCAxNCA0IDExLjMxIDQgOCA0IDQuNjkgOCAyWiIgZmlsbD0iI2ZmZmZmZiIvPgo8L3N2Zz4KPC9zdmc+',
                domain: 'localhost'
            };
            isAuthenticated = true;
            hideAuthOverlay();
            showUserInfo();
        }
        return true;
    }
    
    // Production authentication flow - check localStorage first
    const savedAuth = localStorage.getItem('vca_authenticated');
    const savedUser = localStorage.getItem('vca_user');
    
    if (savedAuth === 'true' && savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            isAuthenticated = true;
            hideAuthOverlay();
            showUserInfo();
            return true;
        } catch (e) {
            // If parsing fails, clear localStorage and require sign-in
            localStorage.removeItem('vca_user');
            localStorage.removeItem('vca_authenticated');
        }
    }
    
    // No valid saved session, show auth overlay
    if (!isAuthenticated) {
        const authOverlay = document.getElementById('authOverlay');
        const bucketModal = document.getElementById('bucketModal');
        
        if (authOverlay) {
            authOverlay.style.display = 'flex';
        }
        if (bucketModal) {
            bucketModal.classList.remove('active');
        }
        return false;
    }
    return true;
}

// Initialize Google Sign-In when the page loads
function initializeGoogleSignIn() {
    // Skip Google Sign-In initialization for localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Localhost detected - skipping Google Sign-In initialization');
        return;
    }
    
    // Dynamically load Google Sign-In library for production only
    if (typeof google === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = function() {
            initializeGoogleSignInLibrary();
        };
        script.onerror = function() {
            console.warn('Failed to load Google Sign-In library');
            showGoogleSignInError();
        };
        document.head.appendChild(script);
    } else {
        initializeGoogleSignInLibrary();
    }
}

function initializeGoogleSignInLibrary() {
    try {
        // Wait for Google Sign-In library to load
        if (typeof google !== 'undefined' && google.accounts) {
            google.accounts.id.initialize({
                client_id: '434775612504-337vvnh0ufstp9a7n4kdom0eu1tn6st1.apps.googleusercontent.com',
                callback: handleCredentialResponse
            });
            
            // Render the sign-in button
            google.accounts.id.renderButton(
                document.querySelector('.g_id_signin'),
                { 
                    theme: 'outline', 
                    size: 'large',
                    text: 'sign_in_with',
                    width: 280
                }
            );
        } else {
            // Retry after a short delay if Google library not ready yet
            setTimeout(initializeGoogleSignInLibrary, 100);
        }
    } catch (error) {
        console.warn('Google Sign-In initialization failed:', error);
        showGoogleSignInError();
    }
}

function showGoogleSignInError() {
    if (document.querySelector('.g_id_signin')) {
        document.querySelector('.g_id_signin').innerHTML = 
            '<div style="padding: 12px; text-align: center; color: #666; font-size: 14px;">' +
            'Google Sign-In temporarily unavailable.<br>' +
            '<button onclick="window.location.reload()" style="margin-top: 8px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">Refresh Page</button>' +
            '</div>';
    }
}

var currentBucket = 'vca-gcs-edc-loreal-internal-results-eu-dv';
var allFiles = [];
var allFilesData = [];
var currentFile = null;
var currentData = null;
var isRawView = false;
var currentView = 'table'; // 'table' or 'card'
var sortColumn = 'date';
var sortDirection = 'desc';
var maxProgressPercentage = 0; // Track maximum progress to prevent backward movement

// Navigation functions
function showSubmissionsPage() {
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById('submissionsNavItem').classList.add('active');
    
    // Update page title
    document.getElementById('pageTitle').innerHTML = '📊 Photo Submissions';
    document.getElementById('pageSubtitle').textContent = 'Manage and analyze photo submission results';
    
    // Show submissions content, hide buckets content
    document.querySelector('.master-detail-container')?.style.setProperty('display', 'flex');
    document.querySelector('.filters-toolbar')?.style.setProperty('display', 'flex');
    
    const bucketsContent = document.getElementById('bucketsContent');
    if (bucketsContent) {
        bucketsContent.style.display = 'none';
    }
    
    // Show refresh button on submissions page
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.style.display = 'flex';
    }
    
    // If we have a bucket and files haven't been loaded yet, load them
    if (currentBucket && allFiles.length === 0) {
        loadFiles();
    }
}

function showBucketsPage() {
    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById('bucketsNavItem').classList.add('active');
    
    // Update page title
    document.getElementById('pageTitle').innerHTML = '🗂️ Bucket Management';
    document.getElementById('pageSubtitle').textContent = 'Manage and switch between different GCP Storage buckets';
    
    // Hide submissions content, show buckets content
    document.querySelector('.master-detail-container')?.style.setProperty('display', 'none');
    document.querySelector('.filters-toolbar')?.style.setProperty('display', 'none');
    
    const bucketsContent = document.getElementById('bucketsContent');
    if (bucketsContent) {
        bucketsContent.style.display = 'block';
    }
    
    // Keep refresh button visible on buckets page too (useful for refreshing bucket info)
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.style.display = 'flex';
    }
    
    // Update bucket display
    updateBucketDisplay();
}

function showURLGenerator() {
    // Navigate to the URL generator page
    window.location.href = '/urlgenerator';
}

function showStudyList() {
    // Navigate to the study list page
    window.location.href = '/studylist';
}

// View switching functions
function switchToView(viewType) {
    currentView = viewType;
    
    // Update button states
    document.getElementById('gridViewBtn')?.classList.toggle('active', viewType === 'grid');
    document.getElementById('listViewBtn')?.classList.toggle('active', viewType === 'list');
    
    // Update view class
    const filesView = document.getElementById('filesView');
    if (filesView) {
        if (viewType === 'grid') {
            filesView.classList.remove('list-view');
            filesView.classList.add('grid-view');
        } else {
            filesView.classList.remove('grid-view');
            filesView.classList.add('list-view');
        }
    }
    
    // Re-render files in new view
    filterAndDisplayFiles();
}

// Resizable panel divider functions

// Resizable panel initialization
function initializeResizablePanel() {
    const resizeHandle = document.getElementById('resizeHandle');
    const masterSection = document.getElementById('masterSection');
    const container = document.querySelector('.master-detail-container');
    
    if (!resizeHandle || !masterSection || !container) return;
    
    let isResizing = false;
    
    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        
        const containerRect = container.getBoundingClientRect();
        const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        
        // Constrain between 30% and 70%
        if (newWidth >= 30 && newWidth <= 70) {
            masterSection.style.flex = `0 0 ${newWidth}%`;
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

function updateBucketDisplay() {
    // Update bucket display in buckets page if it exists
    const bucketDisplay = document.getElementById('currentBucketDisplay');
    if (bucketDisplay) {
        bucketDisplay.textContent = '📦 ' + currentBucket;
    }
    
    const fileCount = document.getElementById('bucketFileCount');
    if (fileCount) {
        fileCount.textContent = allFiles.length;
    }
    
    const lastAccessed = document.getElementById('lastAccessed');
    if (lastAccessed) {
        lastAccessed.textContent = new Date().toLocaleDateString();
    }
}

function switchToBucket(bucketName) {
    if (!bucketName || !bucketName.trim()) {
        showToast('Please enter a valid bucket name');
        return;
    }
    
    if (bucketName === currentBucket) {
        showToast('Already connected to this bucket');
        return;
    }
    
    if (!isAuthenticated) {
        showToast('Please sign in first');
        return;
    }
    
    currentBucket = bucketName.trim();
    const quickSwitchInput = document.getElementById('quickSwitchInput');
    if (quickSwitchInput) {
        quickSwitchInput.value = '';
    }
    updateBucketDisplay();
    showToast('Switched to bucket: ' + bucketName);
    
    // Load files from new bucket
    loadFiles();
}

function refreshFiles() {
    if (!isAuthenticated) {
        showToast('Please sign in first');
        return;
    }
    
    if (!currentBucket) {
        showToast('No bucket selected');
        return;
    }
    
    // Show loading state
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<span>🔄</span> Refreshing...';
        refreshBtn.classList.add('loading');
    }
    
    // Clear current data
    allFiles = [];
    allFilesData = [];
    
    // Reload files with proper completion handling
    refreshLoadFiles(refreshBtn);
    
    showToast('Refreshing files from bucket: ' + currentBucket);
}

function refreshLoadFiles(refreshBtn) {
    if (!isAuthenticated || !currentBucket) {
        resetRefreshButton(refreshBtn);
        return;
    }
    
    console.log('Refreshing files from bucket:', currentBucket);
    
    // Show loading state in grid
    var container = document.getElementById('filesView');
    if (container) {
        container.innerHTML = 
            '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;"><div class="loading"><div class="spinner"></div><span>Refreshing files...</span></div></div>';
    }
    
    fetch('/api/files?bucket=' + encodeURIComponent(currentBucket))
        .then(function(response) {
            return response.json().then(function(data) {
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to refresh files');
                }
                return data;
            });
        })
        .then(function(data) {
            console.log('Files refreshed:', data.files.length);
            allFiles = data.files;
            allFilesData = [];
            
            // Load basic file data and display cards
            loadFileAnalytics();
            displayFilesAsCards();
            updateSummaryStats();
            
            // Reset refresh button
            resetRefreshButton(refreshBtn);
            
            showToast('Successfully refreshed ' + data.files.length + ' files');
        })
        .catch(function(err) {
            console.error('Refresh error:', err);
            var container = document.getElementById('filesView');
            if (container) {
                container.innerHTML = 
                    '<div style="grid-column: 1/-1;" class="error"><h3>❌ Refresh Failed</h3><p>' + err.message + 
                    '</p><button class="retry-btn" onclick="refreshFiles()">Try Again</button></div>';
            }
            
            // Reset refresh button
            resetRefreshButton(refreshBtn);
            
            showToast('Failed to refresh files: ' + err.message, 'error');
        });
}

function resetRefreshButton(refreshBtn) {
    if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<span>🔄</span> Refresh';
        refreshBtn.classList.remove('loading');
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Load sidebar component first
    await loadSidebar();
    
    // Load saved sidebar state
    setTimeout(loadSidebarState, 100); // Small delay to ensure DOM is ready
    
    // Check authentication first (this will auto-authenticate for localhost)
    checkAuthentication();
    
    // Initialize Google Sign-In only for non-localhost
    initializeGoogleSignIn();
    
    // Event listeners - only attach if elements exist
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) connectBtn.addEventListener('click', connectToBucket);
    
    const changeBucketBtn = document.getElementById('changeBucketBtn');
    if (changeBucketBtn) changeBucketBtn.addEventListener('click', showBucketModal);
    
    const closePanelBtn = document.getElementById('closePanelBtn');
    if (closePanelBtn) closePanelBtn.addEventListener('click', closeDetailPanel);
    
    const pdfBtn = document.getElementById('pdfBtn');
    if (pdfBtn) pdfBtn.addEventListener('click', exportToPDF);
    
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) downloadBtn.addEventListener('click', downloadFile);
    
    const copyBtn = document.getElementById('copyBtn');
    if (copyBtn) copyBtn.addEventListener('click', copyToClipboard);
    
    const toggleViewBtn = document.getElementById('toggleViewBtn');
    if (toggleViewBtn) toggleViewBtn.addEventListener('click', toggleView);
    
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', refreshFiles);
    
    // View toggle buttons
    document.getElementById('tableViewBtn')?.addEventListener('click', function() {
        if (typeof switchToTableView === 'function') {
            switchToTableView();
        }
    });
    
    document.getElementById('cardViewBtn')?.addEventListener('click', function() {
        if (typeof switchToCardView === 'function') {
            switchToCardView();
        }
    });
    
    // Initialize table sorting and filters
    setTimeout(function() {
        if (typeof setupTableSorting === 'function') {
            setupTableSorting();
        }
        if (typeof setupFilterHandlers === 'function') {
            setupFilterHandlers();
        }
    }, 100);
    
    // Initialize resizable panel
    if (typeof initializeResizablePanel === 'function') {
        initializeResizablePanel();
    }
    
    // Setup click-outside handler for detail panel
    if (typeof setupDetailPanelClickOutside === 'function') {
        setupDetailPanelClickOutside();
    }
    
    const bucketNameInput = document.getElementById('bucketNameInput');
    if (bucketNameInput) {
        bucketNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                connectToBucket();
            }
        });
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            if (currentView === 'table' && typeof renderFiles === 'function') {
                renderFiles();
            } else {
                filterAndDisplayFiles();
            }
        });
    }
    
    // Navigation handling - these are now handled by sidebar component with <a> tags
    // Keep these for backward compatibility with old pages
    const submissionsNavItem = document.getElementById('submissionsNavItem');
    if (submissionsNavItem) {
        submissionsNavItem.addEventListener('click', function() {
            showSubmissionsPage();
        });
    }
    
    const bucketsNavItem = document.getElementById('bucketsNavItem');
    if (bucketsNavItem) {
        bucketsNavItem.addEventListener('click', function() {
            showBucketsPage();
        });
    }
    
    const urlGeneratorNavItem = document.getElementById('urlGeneratorNavItem');
    if (urlGeneratorNavItem) {
        urlGeneratorNavItem.addEventListener('click', function() {
            showURLGenerator();
        });
    }
    
    const studyListNavItem = document.getElementById('studylistNavItem');
    if (studyListNavItem) {
        studyListNavItem.addEventListener('click', function() {
            showStudyList();
        });
    }
    
    const analyticsNavItem = document.getElementById('analyticsNavItem');
    if (analyticsNavItem) {
        analyticsNavItem.addEventListener('click', function() {
            window.location.href = '/analytics';
        });
    }
    
    // Buckets page functionality
    const quickSwitchBtn = document.getElementById('quickSwitchBtn');
    if (quickSwitchBtn) {
        quickSwitchBtn.addEventListener('click', function() {
            const bucketName = document.getElementById('quickSwitchInput').value.trim();
            if (bucketName) {
                switchToBucket(bucketName);
            }
        });
    }
    
    const quickSwitchInput = document.getElementById('quickSwitchInput');
    if (quickSwitchInput) {
        quickSwitchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const bucketName = this.value.trim();
                if (bucketName) {
                    switchToBucket(bucketName);
                }
            }
        });
    }
    
    // Auto-connect to default bucket (after authentication check)
    if (currentBucket && isAuthenticated) {
        updateBucketDisplay();
        hideBucketModal();
        loadFiles();
    }
});

function showBucketModal() {
    const bucketModal = document.getElementById('bucketModal');
    const bucketNameInput = document.getElementById('bucketNameInput');
    
    if (bucketModal) {
        bucketModal.classList.add('active');
    }
    if (bucketNameInput) {
        bucketNameInput.value = currentBucket || '';
        bucketNameInput.focus();
    }
}

function hideBucketModal() {
    const bucketModal = document.getElementById('bucketModal');
    if (bucketModal) {
        bucketModal.classList.remove('active');
    }
}

function connectToBucket() {
    if (!isAuthenticated) {
        showToast('Please sign in first');
        return;
    }
    
    var bucketName = document.getElementById('bucketNameInput').value.trim();
    
    if (!bucketName) {
        showToast('Please enter a bucket name');
        return;
    }
    
    currentBucket = bucketName;
    updateBucketDisplay();
    hideBucketModal();
    showToast('Connected to bucket: ' + bucketName);
    
    loadFiles();
}

function loadFiles() {
    if (!isAuthenticated) {
        showToast('Please sign in first');
        return;
    }
    
    if (!currentBucket) {
        showToast('No bucket selected');
        return;
    }
    
    console.log('Loading files from bucket:', currentBucket);
    
    // Show loading progress modal immediately (with 0 files initially)
    showLoadingProgressModal(0);
    
    // Update progress modal header to show we're fetching file list
    var progressCurrentFile = document.getElementById('progressCurrentFile');
    if (progressCurrentFile) {
        progressCurrentFile.textContent = 'Fetching file list from bucket...';
    }
    
    fetch('/api/files?bucket=' + encodeURIComponent(currentBucket))
        .then(function(response) {
            return response.json().then(function(data) {
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load files');
                }
                return data;
            });
        })
        .then(function(data) {
            console.log('Files loaded:', data.files.length);
            allFiles = data.files;
            allFilesData = [];
            
            // Update modal with actual file count now that we know it
            var progressTotal = document.getElementById('progressTotal');
            if (progressTotal) {
                progressTotal.textContent = data.files.length;
            }
            
            // Show summary bar and toolbar
            var filtersToolbar = document.getElementById('filtersToolbar');
            if (filtersToolbar) {
                filtersToolbar.style.display = 'flex';
            }
            
            // Load basic file data and display cards
            loadFileAnalytics();
            displayFilesAsCards();
            updateSummaryStats();
        })
        .catch(function(err) {
            console.error('Error:', err);
            
            // Hide loading modal on error
            hideLoadingProgressModal();
            
            // Show error in the appropriate container based on current view
            var container = currentView === 'table' ? document.getElementById('filesTableBody') : document.getElementById('cardView');
            if (container) {
                if (currentView === 'table') {
                    container.innerHTML = 
                        '<tr class="empty-row"><td colspan="6">' +
                        '<div class="error"><h3>❌ Error</h3><p>' + err.message + 
                        '</p><ul><li>Run: gcloud auth application-default login</li>' +
                        '<li>Check bucket name and permissions</li>' +
                        '<li>Verify bucket exists</li></ul>' +
                        '<button class="retry-btn" onclick="loadFiles()">Retry</button></div>' +
                        '</td></tr>';
                } else {
                    container.innerHTML = 
                        '<div class="error"><h3>❌ Error</h3><p>' + err.message + 
                        '</p><ul><li>Run: gcloud auth application-default login</li>' +
                        '<li>Check bucket name and permissions</li>' +
                        '<li>Verify bucket exists</li></ul>' +
                        '<button class="retry-btn" onclick="loadFiles()">Retry</button></div>';
                }
            }
            
            showToast('Failed to load files: ' + err.message, 'error');
        });
}

function loadFileAnalytics() {
    // Initialize with placeholder data
    allFilesData = allFiles.map(function(file, index) {
        return {
            filename: typeof file === 'string' ? file : file.name,
            timeCreated: typeof file === 'object' ? file.timeCreated : null,
            updated: typeof file === 'object' ? file.updated : null,
            size: typeof file === 'object' ? file.size : null,
            loaded: false,
            validSelfie: null,
            scoresCount: 0,
            acneTotal: 0,
            hasDevice: false,
            networkQuality: null
        };
    });
    
    // Start preloading metadata for all files
    preloadFileMetadata();
}

function preloadFileMetadata() {
    var loadedCount = 0;
    var totalFiles = allFiles.length;
    var startTime = Date.now();
    
    if (totalFiles === 0) {
        return;
    }
    
    console.log('Preloading metadata for', totalFiles, 'files...');
    
    // Show loading progress modal instead of toast
    showLoadingProgressModal(totalFiles);
    
    // OPTIMIZATION: Load files in parallel batches for much faster loading
    var BATCH_SIZE = 20; // Load 20 files concurrently
    var batches = [];
    
    // Split files into batches
    for (var i = 0; i < allFiles.length; i += BATCH_SIZE) {
        batches.push(allFiles.slice(i, i + BATCH_SIZE));
    }
    
    console.log('Loading', totalFiles, 'files in', batches.length, 'batches of', BATCH_SIZE);
    
    // Track file completion with atomic counter
    var completedFiles = 0;
    
    // Process batches sequentially, but files within each batch in parallel
    function processBatch(batchIndex) {
        if (batchIndex >= batches.length) {
            return; // All done
        }
        
        var batch = batches[batchIndex];
        var batchPromises = batch.map(function(file, batchFileIndex) {
            var index = batchIndex * BATCH_SIZE + batchFileIndex;
            var filename = typeof file === 'string' ? file : file.name;
            
            return fetch('/api/file?bucket=' + encodeURIComponent(currentBucket) + '&filename=' + encodeURIComponent(filename))
                .then(function(response) {
                    return response.json().then(function(data) {
                        if (response.ok) {
                            return { success: true, data: data, filename: filename, index: index };
                        }
                        throw new Error(data.error || 'Failed to load file');
                    });
                })
                .then(function(result) {
                    // Extract metrics and update allFilesData
                    var metrics = extractFileMetrics(result.filename, result.data.content);
                    allFilesData[result.index] = metrics;
                    
                    // Increment completed counter atomically
                    completedFiles++;
                    
                    // Calculate speed
                    var elapsedSeconds = (Date.now() - startTime) / 1000;
                    var speed = elapsedSeconds > 0 ? (completedFiles / elapsedSeconds).toFixed(1) : 0;
                    
                    // Update progress with current file
                    updateLoadingProgress(completedFiles, totalFiles, speed, result.filename);
                    
                    return true;
                })
                .catch(function(err) {
                    console.warn('Failed to preload', filename, ':', err.message);
                    
                    // Still increment counter even on failure
                    completedFiles++;
                    
                    // Calculate speed
                    var elapsedSeconds = (Date.now() - startTime) / 1000;
                    var speed = elapsedSeconds > 0 ? (completedFiles / elapsedSeconds).toFixed(1) : 0;
                    
                    // Update progress
                    updateLoadingProgress(completedFiles, totalFiles, speed, filename);
                    
                    return false;
                });
        });
        
        // Wait for entire batch to complete, then process next batch
        Promise.all(batchPromises).then(function() {
            // Process next batch
            processBatch(batchIndex + 1);
        });
    }
    
    // Start processing first batch
    processBatch(0);
}

function updateLoadingProgress(loaded, total, speed, currentFile) {
    // Update progress indicator - with null safety checks
    var progressLoaded = document.getElementById('progressLoaded');
    var progressTotal = document.getElementById('progressTotal');
    var progressSpeed = document.getElementById('progressSpeed');
    var progressBarFill = document.getElementById('progressBarFill');
    var progressBarText = document.getElementById('progressBarText');
    var progressCurrentFile = document.getElementById('progressCurrentFile');
    
    // Early return if modal elements don't exist
    if (!progressLoaded || !progressTotal || !progressBarFill) {
        console.log('Progress modal elements not found, skipping update');
        return;
    }
    
    // Update loaded count and speed
    if (progressLoaded) progressLoaded.textContent = loaded;
    if (progressTotal) progressTotal.textContent = total;
    if (progressSpeed) progressSpeed.textContent = speed + ' files/s';
    
    // Calculate percentage with safety checks
    var percentage = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
    
    // CRITICAL: Only update progress bar if percentage is moving forward
    // Store the current width to prevent CSS transitions from going backward
    if (percentage > maxProgressPercentage) {
        maxProgressPercentage = percentage;
        if (progressBarFill) {
            // Force reflow to ensure the browser applies the new width
            progressBarFill.style.transition = 'none';
            void progressBarFill.offsetWidth; // Trigger reflow
            progressBarFill.style.width = maxProgressPercentage + '%';
            // Re-enable transition for next update
            setTimeout(function() {
                if (progressBarFill) {
                    progressBarFill.style.transition = '';
                }
            }, 10);
        }
        if (progressBarText) {
            progressBarText.textContent = maxProgressPercentage + '%';
        }
    }
    // If percentage hasn't increased, don't touch the progress bar at all
    
    // Update current file being loaded
    if (progressCurrentFile && currentFile) {
        var displayName = currentFile.split('/').pop();
        progressCurrentFile.textContent = 'Loading: ' + displayName;
    }
    
    console.log('Preloaded', loaded, '/', total, 'files -', maxProgressPercentage + '%');
    
    // OPTIMIZATION: Only update display every 20 files or batch to reduce UI overhead
    // This significantly improves loading performance
    if (loaded % 20 === 0 || loaded === total) {
        // Refresh the display with new data
        if (currentView === 'table' && typeof renderFiles === 'function') {
            renderFiles();
        } else {
            displayFilesAsCards();
        }
        updateSummaryStats();
    }
    
    // Handle completion
    if (loaded === total) {
        // Force to 100% on completion
        maxProgressPercentage = 100;
        if (progressBarFill) progressBarFill.style.width = '100%';
        if (progressBarText) progressBarText.textContent = '100%';
        if (progressCurrentFile) {
            progressCurrentFile.textContent = 'Complete! ✓';
        }
        
        console.log('Loading complete - forcing 100%');
        
        // Final update
        if (currentView === 'table' && typeof renderFiles === 'function') {
            renderFiles();
        } else {
            displayFilesAsCards();
        }
        updateSummaryStats();
        
        // Populate owner filter after data is loaded
        if (typeof populateOwnerFilter === 'function') {
            populateOwnerFilter();
        }
        
        // Save data to localStorage for analytics
        saveDataForAnalytics();
        
        // Hide loading modal after a brief delay
        setTimeout(function() {
            hideLoadingProgressModal();
        }, 800); // Show completion state briefly
    }
}

function saveDataForAnalytics() {
    try {
        // Save only the essential data (not full JSON content)
        const analyticsData = allFilesData.map(function(file) {
            return {
                filename: file.filename,
                validSelfie: file.validSelfie,
                askedZone: file.askedZone,
                autoTakePict: file.autoTakePict,
                browserName: file.browserName,
                captureMode: file.captureMode,
                exif: file.exif,
                scores: file.scores,
                selfieIssues: file.selfieIssues,
                timeSpent: file.timeSpent,
                usedCamera: file.usedCamera,
                apiResults: file.apiResults,
                timeCreated: file.timeCreated
            };
        });
        localStorage.setItem('vca_files_data', JSON.stringify(analyticsData));
        console.log('Saved', analyticsData.length, 'files for analytics');
    } catch (e) {
        console.error('Failed to save analytics data:', e);
    }
}

function extractFileMetrics(filename, data) {
    // Find the existing entry to preserve timestamp info
    var existingEntry = allFilesData.find(function(f) { return f.filename === filename; });
    
    var metrics = {
        filename: filename,
        timeCreated: existingEntry ? existingEntry.timeCreated : null,
        updated: existingEntry ? existingEntry.updated : null,
        size: existingEntry ? existingEntry.size : null,
        loaded: true,
        validSelfie: data.validSelfie || false,
        scoresCount: 0,
        scores: data.scores || {},
        acneTotal: 0,
        hasDevice: !!(data.exif && data.exif.deviceBrand),
        networkQuality: data.networkQuality || 'Unknown',
        askedZone: data.askedZone || 'Unknown',
        autoTakePict: data.autoTakePict,
        browserName: data.browserName,
        captureMode: data.captureMode,
        exif: data.exif,
        selfieIssues: data.selfieIssues || [],
        timeSpent: data.timeSpent,
        usedCamera: data.usedCamera,
        apiResults: data.apiResults
    };
    
    // Count quality scores
    if (data.scores) {
        metrics.scoresCount = Object.keys(data.scores).length;
    }
    
    // Count acne total
    if (data.apiResults && data.apiResults.modiface && data.apiResults.modiface.acne_count && data.apiResults.modiface.acne_count.front) {
        var acne = data.apiResults.modiface.acne_count.front;
        metrics.acneTotal = (acne.inflammatory || 0) + (acne.retentional || 0) + (acne.pigmented || 0);
    }
    
    return metrics;
}

function displayFilesAsCards() {
    var container = document.getElementById('cardView');
    
    if (!container) {
        console.warn('Card view container not found, skipping display');
        return;
    }
    
    if (allFiles.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No JSON files found</h3><p>No files found in this bucket</p></div>';
        return;
    }
    
    filterAndDisplayFiles();
}

function filterAndDisplayFiles() {
    var searchTerm = document.getElementById('searchInput').value.toLowerCase();
    var container = document.getElementById('cardView');
    
    if (!container) {
        console.error('Card view container not found');
        return;
    }
    
    // Filter files based on search
    var filteredFiles = allFilesData.filter(function(fileData) {
        // Search filter
        if (searchTerm && !fileData.filename.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        return true;
    });
    
    // Sort by timeCreated (latest first)
    filteredFiles.sort(function(a, b) {
        if (!a.timeCreated && !b.timeCreated) return 0;
        if (!a.timeCreated) return 1;
        if (!b.timeCreated) return -1;
        return new Date(b.timeCreated) - new Date(a.timeCreated);
    });
    
    // Update file count badge
    const fileCountBadge = document.getElementById('fileCountBadge');
    if (fileCountBadge) {
        fileCountBadge.textContent = filteredFiles.length + ' file' + (filteredFiles.length !== 1 ? 's' : '');
    }
    
    // Display files
    if (filteredFiles.length === 0) {
        container.innerHTML = '<div class="empty-state"><h3>No files match your criteria</h3><p>Try adjusting your search or filter</p></div>';
        return;
    }
    
    container.innerHTML = '';
    filteredFiles.forEach(function(fileData) {
        var card = createFileCard(fileData);
        container.appendChild(card);
    });
}

function parseFilename(filename) {
    // Extract just the filename without path
    var fileName = filename.split('/').pop();
    
    // Remove .json extension
    var baseName = fileName.replace(/\.json$/i, '');
    
    // Parse format: STUDY-DATE-ID-NAME (e.g., TESTLOGPT-20241027-9251-JamesZHOU)
    var parts = baseName.split('-');
    
    if (parts.length >= 4) {
        return {
            studyName: parts[0],
            date: parts[1],
            userId: parts[2],
            userName: parts.slice(3).join('-'), // Join remaining parts in case name has hyphens
            originalFilename: fileName
        };
    } else if (parts.length === 3) {
        // Fallback for 3-part format: STUDY-DATE-NAME
        return {
            studyName: parts[0],
            date: parts[1],
            userId: '',
            userName: parts[2],
            originalFilename: fileName
        };
    }
    
    // Fallback if parsing fails
    return {
        studyName: 'Unknown Study',
        date: 'Unknown Date',
        userId: '',
        userName: baseName,
        originalFilename: fileName
    };
}

function createFileCard(fileData) {
    var card = document.createElement('div');
    card.className = 'file-card';
    card.setAttribute('data-filepath', fileData.filename);
    
    // Parse filename for structured information
    var parsedInfo = parseFilename(fileData.filename);
    
    // Format date for display
    var displayDate = parsedInfo.date;
    if (parsedInfo.date && parsedInfo.date.length === 8) {
        // Convert YYYYMMDD to readable format
        var year = parsedInfo.date.substring(0, 4);
        var month = parsedInfo.date.substring(4, 6);
        var day = parsedInfo.date.substring(6, 8);
        displayDate = month + '/' + day + '/' + year;
    }
    
    // Format timestamp for display
    var timeDisplay = 'Unknown time';
    if (fileData.timeCreated) {
        var timeCreated = new Date(fileData.timeCreated);
        var now = new Date();
        var diffMs = now - timeCreated;
        var diffMins = Math.floor(diffMs / 60000);
        var diffHours = Math.floor(diffMs / 3600000);
        var diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) {
            timeDisplay = 'Just now';
        } else if (diffMins < 60) {
            timeDisplay = diffMins + ' min' + (diffMins !== 1 ? 's' : '') + ' ago';
        } else if (diffHours < 24) {
            timeDisplay = diffHours + ' hour' + (diffHours !== 1 ? 's' : '') + ' ago';
        } else if (diffDays < 7) {
            timeDisplay = diffDays + ' day' + (diffDays !== 1 ? 's' : '') + ' ago';
        } else {
            // Show actual date/time for older files
            timeDisplay = timeCreated.toLocaleDateString() + ' ' + 
                         timeCreated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    
    // Determine status
    var status = fileData.validSelfie === null ? 'unknown' : 
                 fileData.validSelfie ? 'valid' : 'invalid';
    var statusText = fileData.validSelfie === null ? 'Unknown' : 
                     fileData.validSelfie ? 'Valid' : 'Invalid';
    
    // Determine which APIs have data
    var hasModiface = !!(fileData.apiResults && fileData.apiResults.modiface);
    var hasNexa = !!(fileData.apiResults && fileData.apiResults.nexa);
    
    // Create thumbnail image URL
    var pathWithoutExtension = fileData.filename.replace(/\.json$/i, '');
    var imageUrl = '/api/image?bucket=' + encodeURIComponent(currentBucket) + '&path=' + encodeURIComponent(pathWithoutExtension);
    
    // Build API badges HTML
    var apiBadgesHtml = '';
    if (hasModiface) {
        apiBadgesHtml += '<div class="metric-badge api-badge modiface">Modiface</div>';
    }
    if (hasNexa) {
        apiBadgesHtml += '<div class="metric-badge api-badge nexa">NEXA</div>';
    }
    
    card.innerHTML = 
        '<div class="file-card-header">' +
            '<div class="file-info">' +
                '<div class="study-name">' + parsedInfo.studyName + '</div>' +
                '<div class="participant-info">' +
                    '<div class="user-name">' + parsedInfo.userName + '</div>' +
                    '<div class="capture-date">' + displayDate + '</div>' +
                    '<div class="capture-time">📷 ' + timeDisplay + '</div>' +
                '</div>' +
            '</div>' +
            '<div class="file-thumbnail">' +
                '<img src="' + imageUrl + '" alt="Photo thumbnail" onerror="this.style.display=&quot;none&quot;; this.nextElementSibling.style.display=&quot;flex&quot;;" />' +
                '<div class="file-thumbnail-placeholder" style="display: none;">📷</div>' +
            '</div>' +
        '</div>' +
        '<div class="file-metrics">' +
            apiBadgesHtml +
            '<div class="metric-badge status-badge ' + status + '">' + statusText + '</div>' +
        '</div>';
    
    card.onclick = function() {
        loadFile(fileData.filename);
        
        // Update active state
        document.querySelectorAll('.file-card').forEach(function(c) {
            c.classList.remove('active');
        });
        card.classList.add('active');
        
        // Open detail panel
        openDetailPanel();
    };
    
    return card;
}

function createFileListItem(fileData) {
    var item = document.createElement('div');
    item.className = 'file-list-item';
    item.setAttribute('data-filepath', fileData.filename);
    
    // Parse filename
    var parsedInfo = parseFilename(fileData.filename);
    
    // Format timestamp
    var timeDisplay = 'Unknown time';
    if (fileData.timeCreated) {
        var timeCreated = new Date(fileData.timeCreated);
        timeDisplay = timeCreated.toLocaleDateString() + ' ' + 
                     timeCreated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Status
    var statusClass = fileData.validSelfie ? 'valid' : 'invalid';
    var statusText = fileData.validSelfie ? 'Valid' : 'Invalid';
    
    item.innerHTML = 
        '<div class="file-list-icon">📄</div>' +
        '<div class="file-list-content">' +
            '<div class="file-list-name">' + parsedInfo.userName + ' - ' + parsedInfo.studyName + '</div>' +
            '<div class="file-list-meta">' +
                '<span>📷 ' + timeDisplay + '</span>' +
                '<span>⭐ ' + (fileData.loaded ? fileData.scoresCount : '?') + ' scores</span>' +
                '<span>⚠️ ' + (fileData.loaded ? fileData.acneTotal : '?') + ' concerns</span>' +
            '</div>' +
        '</div>' +
        '<div class="file-list-badge ' + statusClass + '">' + statusText + '</div>';
    
    item.onclick = function() {
        loadFile(fileData.filename);
        
        // Update active state
        document.querySelectorAll('.file-list-item').forEach(function(i) {
            i.classList.remove('active');
        });
        item.classList.add('active');
        
        // Open detail panel
        openDetailPanel();
    };
    
    return item;
}

function updateSummaryStats() {
    var totalFiles = allFilesData.length;
    var validSelfies = allFilesData.filter(function(f) { return f.validSelfie === true; }).length;
    
    // Only calculate average from files that have been loaded
    var loadedFiles = allFilesData.filter(function(f) { return f.loaded && f.scoresCount > 0; });
    var totalScores = loadedFiles.reduce(function(sum, f) { return sum + f.scoresCount; }, 0);
    var avgScores = loadedFiles.length > 0 ? Math.round(totalScores / loadedFiles.length) : 0;
    
    var totalConcerns = allFilesData.reduce(function(sum, f) { return sum + f.acneTotal; }, 0);
    
    // Update elements only if they exist (summary bar was removed)
    var totalFilesEl = document.getElementById('totalFiles');
    var validSelfiesEl = document.getElementById('validSelfies');
    var avgScoresEl = document.getElementById('avgScores');
    var totalConcernsEl = document.getElementById('totalConcerns');
    
    if (totalFilesEl) totalFilesEl.textContent = totalFiles;
    if (validSelfiesEl) validSelfiesEl.textContent = validSelfies;
    if (avgScoresEl) avgScoresEl.textContent = avgScores;
    if (totalConcernsEl) totalConcernsEl.textContent = totalConcerns;
}

function openDetailPanel() {
    var detailSection = document.getElementById('detailSection');
    if (detailSection) {
        detailSection.classList.add('open');
    }
}

function closeDetailPanel() {
    var detailSection = document.getElementById('detailSection');
    if (detailSection) {
        detailSection.classList.remove('open');
    }
}

// Close detail panel when clicking outside
function setupDetailPanelClickOutside() {
    document.addEventListener('click', function(e) {
        var detailSection = document.getElementById('detailSection');
        if (!detailSection || !detailSection.classList.contains('open')) {
            return;
        }
        
        // Check if click is outside the detail section
        if (!detailSection.contains(e.target)) {
            // Don't close if clicking on table rows or view buttons (which open the panel)
            if (!e.target.closest('.data-table') && 
                !e.target.closest('.view-btn') && 
                !e.target.closest('.cell-title-text') &&
                !e.target.closest('.file-card')) {
                closeDetailPanel();
            }
        }
    });
}

function loadFile(filename) {
    if (!currentBucket) {
        showToast('No bucket selected');
        return;
    }
    
    console.log('Loading file:', filename);
    currentFile = filename;
    var viewerContent = document.getElementById('viewerContent');
    var viewerTitle = document.getElementById('viewerTitle');
    var actionButtons = document.getElementById('actionButtons');
    
    if (!viewerContent) {
        console.error('Viewer content element not found!');
        return;
    }
    
    // Update viewer title
    if (viewerTitle) {
        var displayName = filename.split('/').pop();
        viewerTitle.textContent = '📄 ' + displayName;
    }
    
    viewerContent.innerHTML = '<div class="loading"><div class="spinner"></div><span>Loading...</span></div>';
    
    if (actionButtons) {
        actionButtons.style.display = 'none';
    }
    
    isRawView = false;
    var toggleText = document.getElementById('viewToggleText');
    if (toggleText) {
        toggleText.textContent = 'Show Raw JSON';
    }
    
    fetch('/api/file?bucket=' + encodeURIComponent(currentBucket) + '&filename=' + encodeURIComponent(filename))
        .then(function(response) {
            return response.json().then(function(data) {
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load file');
                }
                return data;
            });
        })
        .then(function(data) {
            console.log('File loaded successfully:', filename);
            currentData = data.content;
            
            if (actionButtons) {
                actionButtons.style.display = 'flex';
            }
            
            // Update file metrics in our data store
            var fileIndex = allFilesData.findIndex(function(f) { return f.filename === filename; });
            if (fileIndex !== -1) {
                allFilesData[fileIndex] = extractFileMetrics(filename, currentData);
                
                // Update the card display
                updateFileCard(filename, allFilesData[fileIndex]);
                
                // Update summary stats
                updateSummaryStats();
            }
            
            displayJSON(currentData);
        })
        .catch(function(err) {
            console.error('Error loading file:', err);
            if (viewerContent) {
                viewerContent.innerHTML = '<div class="error"><h3>❌ Error</h3><p>' + 
                    err.message + '</p></div>';
            }
        });
}

function updateFileCard(filename, metrics) {
    var card = document.querySelector('.file-card[data-filepath="' + filename + '"]');
    if (!card) return;
    
    // Update status pill
    var status = metrics.validSelfie === null ? 'unknown' : 
                 metrics.validSelfie ? 'valid' : 'invalid';
    var statusText = metrics.validSelfie === null ? 'Unknown' : 
                     metrics.validSelfie ? 'Valid Selfie' : 'Invalid Selfie';
    
    var statusPill = card.querySelector('.status-pill');
    if (statusPill) {
        statusPill.className = 'status-pill ' + status;
        statusPill.textContent = statusText;
    }
    
    // Update KPI values
    var kpiTiles = card.querySelectorAll('.kpi-tile');
    if (kpiTiles[0]) kpiTiles[0].querySelector('.kpi-value').textContent = metrics.scoresCount;
    if (kpiTiles[1]) kpiTiles[1].querySelector('.kpi-value').textContent = metrics.acneTotal;
    if (kpiTiles[2]) kpiTiles[2].querySelector('.kpi-value').textContent = metrics.hasDevice ? 'Yes' : 'No';
}

function getImageUrl() {
    if (!currentBucket || !currentFile) return null;
    
    var pathWithoutExtension = currentFile.replace(/\.json$/i, '');
    return '/api/image?bucket=' + encodeURIComponent(currentBucket) + '&path=' + encodeURIComponent(pathWithoutExtension);
}

function getImageDirectUrl() {
    if (!currentBucket || !currentFile) return null;
    
    var pathWithoutExtension = currentFile.replace(/\.json$/i, '');
    return '/api/image?bucket=' + encodeURIComponent(currentBucket) + '&path=' + encodeURIComponent(pathWithoutExtension) + '&download=1';
}

function displayJSON(data) {
    var viewerContent = document.getElementById('viewerContent');
    
    if (isRawView) {
        viewerContent.innerHTML = '<pre>' + syntaxHighlight(JSON.stringify(data, null, 2)) + '</pre>';
    } else {
        viewerContent.innerHTML = formatSkinAnalysis(data);
    }
}

function exportToPDF() {
    if (!currentData || !currentFile) {
        showToast('No data to export');
        return;
    }
    
    // Check if jsPDF is available
    if (!jsPDF && window.jspdf) {
        jsPDF = window.jspdf.jsPDF;
    }
    
    if (!jsPDF) {
        showToast('PDF library not loaded. Please refresh the page.');
        return;
    }
    
    var pdfBtn = document.getElementById('pdfBtn');
    pdfBtn.disabled = true;
    pdfBtn.innerHTML = '<div class="spinner" style="width: 16px; height: 16px; border-width: 2px; margin: 0;"></div> Generating...';
    
    var pdfContainer = document.getElementById('pdfContent');
    pdfContainer.style.left = '0';
    pdfContainer.style.top = '0';
    
    var content = '<div class="pdf-header">' +
        '<h1>Skin Analysis Report</h1>' +
        '<div class="subtitle">' + currentFile + '</div>' +
        '<div class="subtitle">' + new Date().toLocaleString() + '</div>' +
        '</div>' +
        formatSkinAnalysis(currentData);
    
    pdfContainer.innerHTML = content;
    
    // Apply blur by replacing image with blurred canvas version
    setTimeout(function() {
        var pdfImages = pdfContainer.querySelectorAll('.analysis-image');
        var blurPromises = [];
        
        pdfImages.forEach(function(img) {
            var promise = new Promise(function(resolve) {
                // Wait for image to load if not already loaded
                if (img.complete && img.naturalWidth > 0) {
                    blurImageWithCanvas(img);
                    resolve();
                } else {
                    img.onload = function() {
                        blurImageWithCanvas(img);
                        resolve();
                    };
                    img.onerror = function() {
                        resolve(); // Continue even if image fails to load
                    };
                }
            });
            blurPromises.push(promise);
        });
        
        // Wait for all images to be blurred
        Promise.all(blurPromises).then(function() {
            // Wait a bit more for canvas blur to render, then generate PDF
            setTimeout(function() {
                html2canvas(pdfContainer, {
                    scale: 2,
                    useCORS: false,
                    logging: false,
                    backgroundColor: '#ffffff',
                    windowWidth: 800,
                    allowTaint: true
                }).then(function(canvas) {
                    pdfContainer.style.left = '-9999px';
                    
                    var imgData = canvas.toDataURL('image/png');
                    var pdf = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });
                    
                    var imgWidth = 210; // A4 width in mm
                    var pageHeight = 297; // A4 height in mm
                    var imgHeight = (canvas.height * imgWidth) / canvas.width;
                    
                    // If content fits on one page, just add it
                    if (imgHeight <= pageHeight) {
                        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
                    } else {
                        // Content spans multiple pages - split without gaps
                        var heightLeft = imgHeight;
                        var position = 0;
                        var page = 0;
                        
                        while (heightLeft > 0) {
                            if (page > 0) {
                                pdf.addPage();
                            }
                            
                            var sourceY = page * pageHeight;
                            var sourceHeight = Math.min(pageHeight, heightLeft);
                            
                            // Calculate the portion of the canvas to display on this page
                            var ratio = canvas.width / imgWidth;
                            var canvasSourceY = sourceY * ratio;
                            var canvasSourceHeight = sourceHeight * ratio;
                            
                            // Create a temporary canvas for this page's content
                            var pageCanvas = document.createElement('canvas');
                            pageCanvas.width = canvas.width;
                            pageCanvas.height = canvasSourceHeight;
                            var pageCtx = pageCanvas.getContext('2d');
                            
                            pageCtx.drawImage(
                                canvas,
                                0, canvasSourceY,
                                canvas.width, canvasSourceHeight,
                                0, 0,
                                canvas.width, canvasSourceHeight
                            );
                            
                            var pageImgData = pageCanvas.toDataURL('image/png');
                            pdf.addImage(pageImgData, 'PNG', 0, 0, imgWidth, sourceHeight);
                            
                            heightLeft -= pageHeight;
                            page++;
                        }
                    }
                    
                    var pdfFilename = currentFile.split('/').pop().replace('.json', '_report.pdf');
                    pdf.save(pdfFilename);
                    
                    showToast('PDF exported successfully!');
                    
                    pdfBtn.disabled = false;
                    pdfBtn.innerHTML = '📄 Export PDF';
                }).catch(function(err) {
                    console.error('PDF Export Error:', err);
                    showToast('Failed to export PDF: ' + err.message);
                    pdfBtn.disabled = false;
                    pdfBtn.innerHTML = '📄 Export PDF';
                });
            }, 300);
        });
    }, 500);
}

// Helper function to blur image using canvas
function blurImageWithCanvas(img) {
    try {
        // Create a canvas element
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        
        // Set canvas size to match image
        canvas.width = img.width || img.naturalWidth;
        canvas.height = img.height || img.naturalHeight;
        
        // Apply blur using canvas filter
        ctx.filter = 'blur(10px)';
        
        // Draw the image onto the canvas with blur
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Replace the image source with the blurred canvas data
        img.src = canvas.toDataURL('image/png');
        
        // Remove any existing filters on the img element
        img.style.filter = 'none';
        img.style.webkitFilter = 'none';
    } catch (error) {
        console.error('Error blurring image:', error);
        // Fallback to CSS blur if canvas fails
        img.style.filter = 'blur(10px)';
        img.style.webkitFilter = 'blur(10px)';
    }
}

function formatSkinAnalysis(data) {
    var html = '';
    
    var imageUrl = getImageUrl();
    var directUrl = getImageDirectUrl();
    if (imageUrl) {
        html += '<div class="analysis-image-container">';
        html += '<a href="' + directUrl + '" target="_blank" rel="noopener noreferrer" class="analysis-image-link" title="Click to view full size image">';
        html += '<img src="' + imageUrl + '" class="analysis-image" ';
        html += 'onerror="this.classList.add(\'error-img\'); this.parentElement.parentElement.querySelector(\'.image-error-msg\').style.display=\'block\';" />';
        html += '</a>';
        html += '<span class="image-label">Analysis Image (Click to view full size)</span>';
        html += '<div class="image-error-msg">Image not available</div>';
        html += '</div>';
    }
    
    html += '<div class="section">';
    html += '<h3 class="section-title">📊 Analysis Summary</h3>';
    html += '<table class="info-table">';
    html += '<tr><th colspan="2">General Information</th></tr>';
    if (data.askedZone) html += '<tr><td>Zone</td><td>' + data.askedZone + '</td></tr>';
    if (data.captureMode) html += '<tr><td>Capture Mode</td><td>' + data.captureMode + '</td></tr>';
    if (data.validSelfie !== undefined) html += '<tr><td>Valid Selfie</td><td><span class="badge ' + (data.validSelfie ? 'badge-ok' : 'badge-warning') + '">' + (data.validSelfie ? 'Valid ✓' : 'Invalid ✗') + '</span></td></tr>';
    if (data.networkQuality) html += '<tr><td>Network Quality</td><td>' + data.networkQuality + '</td></tr>';
    if (data.timeSpent) html += '<tr><td>Time Spent</td><td>' + data.timeSpent + '</td></tr>';
    if (data.browserName) html += '<tr><td>Browser</td><td>' + data.browserName + '</td></tr>';
    html += '</table>';
    html += '</div>';
    
    if (data.exif) {
        html += '<div class="section">';
        html += '<h3 class="section-title">📱 Device Information</h3>';
        html += '<table class="info-table">';
        html += '<tr><th colspan="2">EXIF Data</th></tr>';
        if (data.exif.deviceBrand) html += '<tr><td>Device Brand</td><td>' + data.exif.deviceBrand + '</td></tr>';
        if (data.exif.deviceModel) html += '<tr><td>Device Model</td><td>' + data.exif.deviceModel + '</td></tr>';
        if (data.exif.deviceOS) html += '<tr><td>Operating System</td><td>' + data.exif.deviceOS + '</td></tr>';
        if (data.exif.width && data.exif.height) html += '<tr><td>Image Dimensions</td><td>' + data.exif.width + ' × ' + data.exif.height + ' px</td></tr>';
        if (data.exif.brightness) html += '<tr><td>Brightness</td><td>' + data.exif.brightness.toFixed(2) + '</td></tr>';
        if (data.exif.whiteBalanceMode) html += '<tr><td>White Balance</td><td>' + data.exif.whiteBalanceMode + '</td></tr>';
        if (data.exif.selfieDateTime) html += '<tr><td>Capture Date</td><td>' + new Date(data.exif.selfieDateTime).toLocaleString() + '</td></tr>';
        html += '</table>';
        html += '</div>';
    }
    
    if (data.scores) {
        html += '<div class="section">';
        html += '<h3 class="section-title">⭐ Quality Scores</h3>';
        html += '<table class="info-table">';
        html += '<tr><th>Metric</th><th>Value</th><th>Status</th></tr>';
        for (var key in data.scores) {
            var score = data.scores[key];
            var value = Array.isArray(score.result) ? score.result.join(', ') : score.result;
            var statusClass = score.status === 'OK' ? 'badge-ok' : 'badge-warning';
            html += '<tr><td style="text-transform: capitalize;">' + key + '</td><td>' + value + '</td><td><span class="badge ' + statusClass + '">' + score.status + '</span></td></tr>';
        }
        html += '</table>';
        html += '</div>';
    }
    
    if (data.apiResults && data.apiResults.shade) {
        html += '<div class="section">';
        html += '<h3 class="section-title">🎨 Skin Tone (LAB Color Space)</h3>';
        html += '<table class="info-table">';
        html += '<tr><th>Component</th><th>Value</th></tr>';
        html += '<tr><td>L (Lightness)</td><td>' + data.apiResults.shade.l.toFixed(2) + '</td></tr>';
        html += '<tr><td>A (Red-Green)</td><td>' + data.apiResults.shade.a.toFixed(2) + '</td></tr>';
        html += '<tr><td>B (Blue-Yellow)</td><td>' + data.apiResults.shade.b.toFixed(2) + '</td></tr>';
        html += '</table>';
        html += '</div>';
    }
    
    // NEXA API Results Section
    if (data.apiResults && data.apiResults.nexa) {
        html += '<div class="section api-section nexa-section">';
        html += '<h3 class="section-title">🔬 NEXA Analysis</h3>';
        html += '<div class="api-badge nexa-badge">NEXA API v' + data.apiResults.nexa.version + '</div>';
        html += '<table class="info-table">';
        html += '<tr><th>Feature</th><th>Score</th></tr>';
        for (var key in data.apiResults.nexa) {
            if (key !== 'version' && typeof data.apiResults.nexa[key] === 'number') {
                var featureName = key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
                var score = data.apiResults.nexa[key].toFixed(2);
                html += '<tr><td style="text-transform: capitalize;">' + featureName + '</td><td>' + score + '</td></tr>';
            }
        }
        html += '</table>';
        html += '</div>';
    }
    
    // Modiface API Results Section
    if (data.apiResults && data.apiResults.modiface) {
        // Modiface Skin Concerns
        if (data.apiResults.modiface.ranges && data.apiResults.modiface.ranges[0]) {
            var concerns = data.apiResults.modiface.ranges[0].concerns;
            if (concerns && concerns.length > 0) {
                html += '<div class="section api-section modiface-section">';
                html += '<h3 class="section-title">🔍 Modiface Skin Concerns Analysis</h3>';
                html += '<div class="api-badge modiface-badge">Modiface API</div>';
                html += '<div class="age-range-badge">Age Range: ' + data.apiResults.modiface.ranges[0].label + '</div>';
                html += '<div class="concerns-grid">';
                concerns.forEach(function(concern) {
                    var score = concern.normalizedScore ? (parseFloat(concern.normalizedScore) * 100).toFixed(1) : 'N/A';
                    var concernName = concern.code.replace(/([A-Z])/g, ' $1').trim();
                    html += '<div class="concern-card">';
                    html += '<div class="concern-name">' + concernName + '</div>';
                    if (concern.normalizedScore) {
                        html += '<div class="concern-value">Score: ' + score + '%</div>';
                        html += '<div class="score-bar"><div class="score-fill" style="width: ' + score + '%"></div></div>';
                    } else {
                        html += '<div class="concern-value">No data available</div>';
                    }
                    html += '</div>';
                });
                html += '</div>';
                html += '</div>';
            }
        }
        
        // Modiface Acne Analysis
        if (data.apiResults.modiface.acne_count) {
            var acneData = data.apiResults.modiface.acne_count.front;
            html += '<div class="section api-section modiface-section">';
            html += '<h3 class="section-title">🔴 Modiface Acne Analysis</h3>';
            html += '<div class="api-badge modiface-badge">Modiface API</div>';
            html += '<table class="info-table">';
            html += '<tr><th>Type</th><th>Count</th></tr>';
            html += '<tr><td>Inflammatory</td><td>' + acneData.inflammatory + '</td></tr>';
            html += '<tr><td>Retentional</td><td>' + acneData.retentional + '</td></tr>';
            html += '<tr><td>Pigmented</td><td>' + acneData.pigmented + '</td></tr>';
            html += '<tr><td><strong>Total</strong></td><td><strong>' + (acneData.inflammatory + acneData.retentional + acneData.pigmented) + '</strong></td></tr>';
            html += '</table>';
            html += '</div>';
        }
        
        // Modiface Metadata
        if (data.apiResults.modiface.metadata) {
            var meta = data.apiResults.modiface.metadata;
            html += '<div class="section api-section modiface-section">';
            html += '<h3 class="section-title">ℹ️ Modiface Analysis Metadata</h3>';
            html += '<div class="api-badge modiface-badge">Modiface API</div>';
            html += '<table class="info-table">';
            if (meta.brand) html += '<tr><td>Brand</td><td>' + meta.brand + '</td></tr>';
            if (meta.country) html += '<tr><td>Country</td><td>' + meta.country.toUpperCase() + '</td></tr>';
            if (meta.tenant) html += '<tr><td>Tenant</td><td>' + meta.tenant + '</td></tr>';
            if (meta.touchpoint) html += '<tr><td>Touchpoint</td><td>' + meta.touchpoint + '</td></tr>';
            if (meta.environment) html += '<tr><td>Environment</td><td>' + meta.environment.toUpperCase() + '</td></tr>';
            if (meta.creationDate) html += '<tr><td>Created</td><td>' + new Date(meta.creationDate).toLocaleString() + '</td></tr>';
            if (meta.creationVersion) html += '<tr><td>Version</td><td>' + meta.creationVersion + '</td></tr>';
            if (meta.structureVersion) html += '<tr><td>Structure Version</td><td>' + meta.structureVersion + '</td></tr>';
            if (meta.touchpoint_url) html += '<tr><td>Touchpoint URL</td><td>' + meta.touchpoint_url + '</td></tr>';
            html += '</table>';
            html += '</div>';
        }
    }
    
    return html;
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
        function (match) {
            var cls = 'json-number';
            if (/^"/.test(match)) {
                cls = /:$/.test(match) ? 'json-key' : 'json-string';
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        }
    );
}

function toggleView() {
    isRawView = !isRawView;
    document.getElementById('viewToggleText').textContent = isRawView ? 'Show Formatted View' : 'Show Raw JSON';
    displayJSON(currentData);
}

function downloadFile() {
    if (!currentData || !currentFile) return;
    var blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = currentFile.split('/').pop();
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON file downloaded!');
}

function copyToClipboard() {
    if (!currentData) return;
    navigator.clipboard.writeText(JSON.stringify(currentData, null, 2))
        .then(function() { showToast('Copied to clipboard!'); })
        .catch(function(err) { showToast('Failed to copy: ' + err); });
}

function showLoadingToast() {
    var loadingToast = document.getElementById('loadingToast');
    if (loadingToast) {
        loadingToast.style.display = 'block';
        loadingToast.classList.remove('closing');
    }
}

function hideLoadingToast() {
    var loadingToast = document.getElementById('loadingToast');
    if (loadingToast) {
        loadingToast.classList.add('closing');
        setTimeout(function() {
            loadingToast.style.display = 'none';
            loadingToast.classList.remove('closing');
        }, 300); // Match animation duration
    }
}

function showLoadingProgressModal(totalFiles) {
    var modal = document.getElementById('loadingProgressModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Reset maximum progress tracker
        maxProgressPercentage = 0;
        
        // Initialize progress values
        var progressLoaded = document.getElementById('progressLoaded');
        var progressTotal = document.getElementById('progressTotal');
        var progressSpeed = document.getElementById('progressSpeed');
        var progressBarFill = document.getElementById('progressBarFill');
        var progressBarText = document.getElementById('progressBarText');
        var progressCurrentFile = document.getElementById('progressCurrentFile');
        
        if (progressLoaded) progressLoaded.textContent = '0';
        if (progressTotal) progressTotal.textContent = totalFiles;
        if (progressSpeed) progressSpeed.textContent = '0 files/s';
        if (progressBarFill) progressBarFill.style.width = '0%';
        if (progressBarText) progressBarText.textContent = '0%';
        if (progressCurrentFile) progressCurrentFile.textContent = 'Initializing...';
    }
}

function hideLoadingProgressModal() {
    var modal = document.getElementById('loadingProgressModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, type === 'error' ? 5000 : 3000);
}

// Wrapper function for compatibility with table-view.js
function renderFiles() {
    if (currentView === 'table' && typeof renderFilesTable === 'function') {
        // Use table view rendering
        var searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        var statusFilterValue = document.getElementById('statusFilter')?.value || 'all';
        var ownerFilterValue = document.getElementById('ownerFilter')?.value || 'all';
        
        var filteredFiles = allFilesData.filter(function(fileData) {
            if (searchTerm && !fileData.filename.toLowerCase().includes(searchTerm)) return false;
            if (statusFilterValue === 'valid' && !fileData.validSelfie) return false;
            if (statusFilterValue === 'invalid' && fileData.validSelfie) return false;
            if (ownerFilterValue !== 'all') {
                var parsed = parseFilename(fileData.filename);
                if (parsed.userName !== ownerFilterValue) return false;
            }
            return true;
        });
        
        filteredFiles = sortFiles ? sortFiles(filteredFiles) : filteredFiles;
        renderFilesTable(filteredFiles);
        
        var fileCountBadge = document.getElementById('fileCountBadge');
        if (fileCountBadge) {
            fileCountBadge.textContent = filteredFiles.length + ' file' + (filteredFiles.length !== 1 ? 's' : '');
        }
    } else {
        // Fall back to card view
        filterAndDisplayFiles();
    }
}