// Analytics Dashboard JavaScript

let analyticsData = [];

// Navigation functions
function navigateToSubmissions() {
    window.location.href = '/';
}

function navigateToBuckets() {
    window.location.href = '/?page=buckets';
}

function navigateToURLGenerator() {
    window.location.href = '/urlgenerator';
}

function navigateToAnalytics() {
    window.location.href = '/analytics';
}

// Load data from localStorage
function loadAnalyticsData() {
    const storedData = localStorage.getItem('vca_files_data');
    if (storedData) {
        try {
            analyticsData = JSON.parse(storedData);
            console.log('Loaded analytics data:', analyticsData.length, 'files');
            generateAnalytics();
        } catch (e) {
            console.error('Failed to parse analytics data:', e);
        }
    }
}

// Generate analytics visualizations
function generateAnalytics() {
    const container = document.getElementById('analyticsContent');
    
    if (!analyticsData || analyticsData.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <h3>No Data Available</h3>
                <p>Please load files from the Photo Submissions page first</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Overview Stats Card
    container.appendChild(createOverviewCard());
    
    // Quality Scores Distribution
    container.appendChild(createQualityScoresCard());
    
    // Device Analytics
    container.appendChild(createDeviceAnalyticsCard());
    
    // Capture Modes
    container.appendChild(createCaptureModeCard());
    
    // Time Spent Analysis
    container.appendChild(createTimeSpentCard());
    
    // Top Skin Concerns (if API data available)
    container.appendChild(createSkinConcernsCard());
    
    // Validation Issues
    container.appendChild(createValidationIssuesCard());
    
    // Camera Usage
    container.appendChild(createCameraUsageCard());
    
    // Brightness Distribution
    container.appendChild(createBrightnessDistributionCard());
    
    // Gender Demographics (if available)
    container.appendChild(createGenderDemographicsCard());
}

function createOverviewCard() {
    const card = document.createElement('div');
    card.className = 'analytics-card large';
    
    const totalFiles = analyticsData.length;
    const validSelfies = analyticsData.filter(f => f.validSelfie === true).length;
    const avgBrightness = calculateAverage(analyticsData, 'exif.brightness');
    const autoCaptures = analyticsData.filter(f => f.captureMode === 'auto').length;
    
    card.innerHTML = `
        <h3>📊 Overview Statistics</h3>
        <div class="stats-row">
            <div class="stat-box">
                <div class="stat-box-value">${totalFiles}</div>
                <div class="stat-box-label">Total Submissions</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-value">${validSelfies}</div>
                <div class="stat-box-label">Valid Selfies</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-value">${((validSelfies / totalFiles) * 100).toFixed(1)}%</div>
                <div class="stat-box-label">Success Rate</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-value">${avgBrightness.toFixed(0)}</div>
                <div class="stat-box-label">Avg Brightness</div>
            </div>
            <div class="stat-box">
                <div class="stat-box-value">${((autoCaptures / totalFiles) * 100).toFixed(0)}%</div>
                <div class="stat-box-label">Auto Capture</div>
            </div>
        </div>
    `;
    
    return card;
}

function createQualityScoresCard() {
    const card = document.createElement('div');
    card.className = 'analytics-card large';
    
    const scores = {
        brightness: calculateAverage(analyticsData, 'scores.brightness.result.0'),
        lighting: calculateAverage(analyticsData, 'scores.lighting.result.0'),
        distance: calculateAverage(analyticsData, 'scores.distance.result.0'),
        neutral: calculateAverage(analyticsData, 'scores.neutral.result.0')
    };
    
    card.innerHTML = `
        <h3>📈 Average Quality Scores</h3>
        <div class="chart-container">
            <canvas id="qualityScoresChart"></canvas>
        </div>
    `;
    
    setTimeout(() => {
        const ctx = document.getElementById('qualityScoresChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Brightness', 'Lighting', 'Distance', 'Neutral Expression'],
                    datasets: [{
                        label: 'Average Score',
                        data: [scores.brightness, scores.lighting, scores.distance, scores.neutral * 100],
                        backgroundColor: [
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(245, 158, 11, 0.7)',
                            'rgba(139, 92, 246, 0.7)'
                        ],
                        borderColor: [
                            'rgba(16, 185, 129, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(245, 158, 11, 1)',
                            'rgba(139, 92, 246, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
        }
    }, 100);
    
    return card;
}

function createDeviceAnalyticsCard() {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    const devices = {};
    const browsers = {};
    
    analyticsData.forEach(item => {
        const device = `${item.exif?.deviceBrand || 'Unknown'} ${item.exif?.deviceOS || ''}`.trim();
        const browser = item.browserName || 'Unknown';
        
        devices[device] = (devices[device] || 0) + 1;
        browsers[browser] = (browsers[browser] || 0) + 1;
    });
    
    const topDevices = Object.entries(devices).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topBrowsers = Object.entries(browsers).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    card.innerHTML = `
        <h3>📱 Device & Browser Analytics</h3>
        <div style="margin-top: 12px;">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Top Devices</div>
            ${topDevices.map(([device, count]) => `
                <div class="device-badge">${device} (${count})</div>
            `).join('')}
        </div>
        <div style="margin-top: 16px;">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Browsers</div>
            ${topBrowsers.map(([browser, count]) => `
                <div class="device-badge">${browser} (${count})</div>
            `).join('')}
        </div>
    `;
    
    return card;
}

function createCaptureModeCard() {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    const autoMode = analyticsData.filter(f => f.captureMode === 'auto').length;
    const manualMode = analyticsData.filter(f => f.captureMode === 'manual').length;
    
    card.innerHTML = `
        <h3>📸 Capture Mode Distribution</h3>
        <div class="chart-container">
            <canvas id="captureModeChart"></canvas>
        </div>
    `;
    
    setTimeout(() => {
        const ctx = document.getElementById('captureModeChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Auto Capture', 'Manual Capture'],
                    datasets: [{
                        data: [autoMode, manualMode],
                        backgroundColor: [
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(59, 130, 246, 0.7)'
                        ],
                        borderColor: [
                            'rgba(16, 185, 129, 1)',
                            'rgba(59, 130, 246, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }, 100);
    
    return card;
}

function createTimeSpentCard() {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    const times = analyticsData
        .filter(f => f.timeSpent)
        .map(f => parseTimeSpent(f.timeSpent))
        .filter(t => t > 0);
    
    const avgTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    const minTime = times.length > 0 ? Math.min(...times) : 0;
    const maxTime = times.length > 0 ? Math.max(...times) : 0;
    
    card.innerHTML = `
        <h3>⏱️ Time Spent Analysis</h3>
        <div class="metric-list">
            <div class="metric-item">
                <span class="metric-label">Average Time</span>
                <span class="metric-value">${avgTime.toFixed(1)}s</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Minimum Time</span>
                <span class="metric-value">${minTime.toFixed(1)}s</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">Maximum Time</span>
                <span class="metric-value">${maxTime.toFixed(1)}s</span>
            </div>
        </div>
    `;
    
    return card;
}

function createSkinConcernsCard() {
    const card = document.createElement('div');
    card.className = 'analytics-card large';
    
    const concernsMap = {};
    
    analyticsData.forEach(item => {
        if (item.apiResults?.modiface?.ranges) {
            item.apiResults.modiface.ranges.forEach(range => {
                if (range.concerns) {
                    range.concerns.forEach(concern => {
                        if (concern.normalizedScore) {
                            if (!concernsMap[concern.code]) {
                                concernsMap[concern.code] = [];
                            }
                            concernsMap[concern.code].push(parseFloat(concern.normalizedScore));
                        }
                    });
                }
            });
        }
    });
    
    const avgConcerns = Object.entries(concernsMap)
        .map(([code, scores]) => ({
            code: formatConcernName(code),
            avg: scores.reduce((a, b) => a + b, 0) / scores.length
        }))
        .sort((a, b) => b.avg - a.avg)
        .slice(0, 8);
    
    if (avgConcerns.length === 0) {
        card.innerHTML = `
            <h3>🔬 Top Skin Concerns</h3>
            <div class="no-data" style="padding: var(--spacing-4);">
                <p>No API results available</p>
            </div>
        `;
        return card;
    }
    
    card.innerHTML = `
        <h3>🔬 Top Skin Concerns (Average Scores)</h3>
        <div class="concern-grid">
            ${avgConcerns.map(concern => `
                <div class="concern-item">
                    <div class="concern-name">${concern.code}</div>
                    <div class="concern-score">${(concern.avg * 100).toFixed(1)}%</div>
                    <div class="metric-bar">
                        <div class="metric-bar-fill" style="width: ${concern.avg * 100}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    return card;
}

function createValidationIssuesCard() {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    const issuesMap = {};
    let totalIssues = 0;
    
    analyticsData.forEach(item => {
        if (item.selfieIssues && item.selfieIssues.length > 0) {
            item.selfieIssues.forEach(issue => {
                issuesMap[issue] = (issuesMap[issue] || 0) + 1;
                totalIssues++;
            });
        }
    });
    
    const topIssues = Object.entries(issuesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    card.innerHTML = `
        <h3>⚠️ Common Validation Issues</h3>
        ${topIssues.length === 0 ? `
            <div style="text-align: center; padding: var(--spacing-4); color: var(--text-muted);">
                <p>No validation issues detected! 🎉</p>
            </div>
        ` : `
            <div class="metric-list">
                ${topIssues.map(([issue, count]) => `
                    <div class="metric-item">
                        <span class="metric-label">${formatIssueName(issue)}</span>
                        <span class="metric-value">${count}</span>
                    </div>
                    <div class="metric-bar">
                        <div class="metric-bar-fill" style="width: ${(count / totalIssues) * 100}%"></div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
    
    return card;
}

function createCameraUsageCard() {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    const frontCamera = analyticsData.filter(f => f.usedCamera === 'FRONT').length;
    const backCamera = analyticsData.filter(f => f.usedCamera === 'BACK').length;
    
    const zones = {};
    analyticsData.forEach(item => {
        const zone = item.askedZone || 'Unknown';
        zones[zone] = (zones[zone] || 0) + 1;
    });
    
    card.innerHTML = `
        <h3>📷 Camera & Zone Usage</h3>
        <div class="metric-list">
            <div class="metric-item">
                <span class="metric-label">Front Camera</span>
                <span class="metric-value">${frontCamera}</span>
            </div>
            <div class="metric-bar">
                <div class="metric-bar-fill" style="width: ${(frontCamera / analyticsData.length) * 100}%"></div>
            </div>
            <div class="metric-item">
                <span class="metric-label">Back Camera</span>
                <span class="metric-value">${backCamera}</span>
            </div>
            <div class="metric-bar">
                <div class="metric-bar-fill" style="width: ${(backCamera / analyticsData.length) * 100}%"></div>
            </div>
        </div>
        <div style="margin-top: 16px;">
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Capture Zones</div>
            ${Object.entries(zones).map(([zone, count]) => `
                <div class="device-badge">${zone.replace('_', ' ')} (${count})</div>
            `).join('')}
        </div>
    `;
    
    return card;
}

function createBrightnessDistributionCard() {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    const brightnesses = analyticsData
        .filter(f => f.exif?.brightness)
        .map(f => f.exif.brightness);
    
    const ranges = {
        'Very Dark (0-50)': brightnesses.filter(b => b < 50).length,
        'Dark (50-100)': brightnesses.filter(b => b >= 50 && b < 100).length,
        'Good (100-150)': brightnesses.filter(b => b >= 100 && b < 150).length,
        'Bright (150-200)': brightnesses.filter(b => b >= 150 && b < 200).length,
        'Very Bright (200+)': brightnesses.filter(b => b >= 200).length
    };
    
    card.innerHTML = `
        <h3>💡 Brightness Distribution</h3>
        <div class="metric-list">
            ${Object.entries(ranges).map(([range, count]) => `
                <div class="metric-item">
                    <span class="metric-label">${range}</span>
                    <span class="metric-value">${count}</span>
                </div>
                <div class="metric-bar">
                    <div class="metric-bar-fill" style="width: ${(count / brightnesses.length) * 100}%"></div>
                </div>
            `).join('')}
        </div>
    `;
    
    return card;
}

function createGenderDemographicsCard() {
    const card = document.createElement('div');
    card.className = 'analytics-card';
    
    const genders = {
        male: 0,
        female: 0,
        unknown: 0
    };
    
    analyticsData.forEach(item => {
        if (item.apiResults?.modiface?.gender) {
            if (item.apiResults.modiface.gender === 'm') genders.male++;
            else if (item.apiResults.modiface.gender === 'f') genders.female++;
            else genders.unknown++;
        } else {
            genders.unknown++;
        }
    });
    
    card.innerHTML = `
        <h3>👤 Gender Demographics</h3>
        <div class="chart-container">
            <canvas id="genderChart"></canvas>
        </div>
    `;
    
    setTimeout(() => {
        const ctx = document.getElementById('genderChart');
        if (ctx) {
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Male', 'Female', 'Unknown'],
                    datasets: [{
                        data: [genders.male, genders.female, genders.unknown],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(236, 72, 153, 0.7)',
                            'rgba(156, 163, 175, 0.7)'
                        ],
                        borderColor: [
                            'rgba(59, 130, 246, 1)',
                            'rgba(236, 72, 153, 1)',
                            'rgba(156, 163, 175, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }, 100);
    
    return card;
}

// Utility functions
function calculateAverage(data, path) {
    const values = data
        .map(item => getNestedValue(item, path))
        .filter(v => v !== null && v !== undefined && !isNaN(v));
    
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

function parseTimeSpent(timeStr) {
    // Parse PT0H0M16S format
    const match = timeStr.match(/PT(\d+)H(\d+)M(\d+)S/);
    if (!match) return 0;
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const seconds = parseInt(match[3]);
    return hours * 3600 + minutes * 60 + seconds;
}

function formatConcernName(code) {
    const names = {
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
    return issue.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.getElementById('submissionsNavItem')?.addEventListener('click', navigateToSubmissions);
    document.getElementById('bucketsNavItem')?.addEventListener('click', navigateToBuckets);
    document.getElementById('urlGeneratorNavItem')?.addEventListener('click', navigateToURLGenerator);
    document.getElementById('analyticsNavItem')?.addEventListener('click', navigateToAnalytics);
    
    document.getElementById('refreshAnalyticsBtn')?.addEventListener('click', loadAnalyticsData);
    
    // Load data
    loadAnalyticsData();
});
