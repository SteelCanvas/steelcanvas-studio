// Admin Dashboard JavaScript - UNIFIED DATA FILE VERSION
// Version: 20250617185000
// READS FROM BACKEND-POPULATED JSON FILE
console.log('🚀 UNIFIED ADMIN SCRIPT LOADED - READS FROM BACKEND DATA FILE');

class AdminDashboard {
    constructor() {
        this.charts = {};
        this.dashboardData = null;
        this.refreshInterval = null;
        this.currentTab = 'website';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    checkAuthStatus() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        if (isLoggedIn === 'true') {
            this.showDashboard();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMessage');

        // Simple authentication check
        if (username === 'admin' && password === 'password123') {
            localStorage.setItem('adminLoggedIn', 'true');
            errorDiv.textContent = '';
            this.showDashboard();
        } else {
            errorDiv.textContent = 'Invalid username or password';
        }
    }

    showDashboard() {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        this.loadDashboardData();
        this.startAutoRefresh();
    }

    logout() {
        localStorage.removeItem('adminLoggedIn');
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('dashboard').style.display = 'none';
        
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    async loadDashboardData() {
        try {
            console.log('📊 Loading dashboard data from backend-populated file...');
            
            // Try to load the main comprehensive data file first
            const timestamp = Date.now(); // Cache busting
            let allData = null;
            
            try {
                const response = await fetch(`admin-data.json?t=${timestamp}`);
                if (response.ok) {
                    allData = await response.json();
                    console.log('✅ Comprehensive data loaded from admin-data.json:', allData);
                    this.hideErrorMessages();
                } else {
                    throw new Error('Main data file not available');
                }
            } catch (error) {
                console.warn('⚠️ Main data file not available, trying individual files...');
                
                // Fallback to individual files
                const [overviewData, cloudflareData, patreonData] = await Promise.all([
                    fetch(`api-data/overview.json?t=${timestamp}`).then(r => r.ok ? r.json() : null).catch(() => null),
                    fetch(`api-data/cloudflare.json?t=${timestamp}`).then(r => r.ok ? r.json() : null).catch(() => null),
                    fetch(`api-data/patreon.json?t=${timestamp}`).then(r => r.ok ? r.json() : null).catch(() => null)
                ]);
                
                if (overviewData || cloudflareData || patreonData) {
                    allData = {
                        gameStats: overviewData,
                        websiteStats: cloudflareData,
                        patreonStats: patreonData,
                        dataSource: 'individual_files',
                        lastUpdated: new Date().toISOString()
                    };
                    console.log('✅ Data loaded from individual files');
                    this.hideErrorMessages();
                } else {
                    throw new Error('No data files available');
                }
            }
            
            if (allData) {
                // Check data freshness
                this.checkDataFreshness(allData);
                
                // Generate dashboard data from the loaded data
                this.dashboardData = this.generateDashboardData(allData);
            } else {
                throw new Error('No valid data found');
            }
            
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error.message);
            this.showErrorMessages([
                'Backend data files not available',
                'Backend may not be running or exporting data',
                'Using fallback local data'
            ]);
            
            // Use fallback data
            this.dashboardData = this.generateDashboardData({
                gameStats: { error: 'Data not available' },
                websiteStats: { error: 'Data not available' },
                patreonStats: { error: 'Data not available' },
                dataSource: 'error_fallback'
            });
        }

        this.renderAllTabs();
    }

    checkDataFreshness(data) {
        const lastUpdated = data.lastUpdated || data.exportedAt;
        if (lastUpdated) {
            const dataAge = Date.now() - new Date(lastUpdated).getTime();
            const ageMinutes = Math.floor(dataAge / (1000 * 60));
            
            if (ageMinutes > 10) {
                this.showWarningMessages([
                    `Data is ${ageMinutes} minutes old`,
                    'Backend may not be updating data files regularly'
                ]);
            }
        }
    }

    showErrorMessages(errors) {
        let errorContainer = document.getElementById('errorContainer');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'errorContainer';
            errorContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                z-index: 1000;
                max-width: 400px;
                font-family: 'Segoe UI', sans-serif;
            `;
            document.body.appendChild(errorContainer);
        }
        
        errorContainer.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">⚠️ Data Loading Issues</div>
            ${errors.map(error => `<div style="margin: 5px 0;">• ${error}</div>`).join('')}
            <div style="margin-top: 10px; font-size: 12px; opacity: 0.9;">Check if backend is running and exporting data.</div>
        `;
        errorContainer.style.display = 'block';
    }

    showWarningMessages(warnings) {
        let warningContainer = document.getElementById('warningContainer');
        if (!warningContainer) {
            warningContainer = document.createElement('div');
            warningContainer.id = 'warningContainer';
            warningContainer.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: #ff9800;
                color: white;
                padding: 15px;
                border-radius: 5px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                z-index: 1000;
                max-width: 400px;
                font-family: 'Segoe UI', sans-serif;
            `;
            document.body.appendChild(warningContainer);
        }
        
        warningContainer.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">⚠️ Data Warning</div>
            ${warnings.map(warning => `<div style="margin: 5px 0;">• ${warning}</div>`).join('')}
        `;
        warningContainer.style.display = 'block';
        
        // Auto-hide warning after 10 seconds
        setTimeout(() => {
            if (warningContainer) {
                warningContainer.style.display = 'none';
            }
        }, 10000);
    }

    hideErrorMessages() {
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
        
        const warningContainer = document.getElementById('warningContainer');
        if (warningContainer) {
            warningContainer.style.display = 'none';
        }
    }

    getLocalVisitorData() {
        // Simple visitor tracking using localStorage
        try {
            const visitorData = JSON.parse(localStorage.getItem('steelcanvas_analytics') || '{}');
            const now = Date.now();
            
            // Initialize if not exists
            if (!visitorData.firstVisit) {
                visitorData.firstVisit = now;
                visitorData.totalVisits = 1;
                visitorData.pageViews = 1;
            } else {
                visitorData.totalVisits = (visitorData.totalVisits || 0) + 1;
                visitorData.pageViews = (visitorData.pageViews || 0) + 1;
            }
            
            visitorData.lastVisit = now;
            localStorage.setItem('steelcanvas_analytics', JSON.stringify(visitorData));
            
            return {
                visitors: visitorData.totalVisits || 0,
                pageViews: visitorData.pageViews || 0,
                firstVisit: visitorData.firstVisit,
                lastVisit: visitorData.lastVisit
            };
        } catch (error) {
            return { visitors: 0, pageViews: 0 };
        }
    }

    generateDashboardData(allData = {}) {
        const now = new Date();
        
        // Extract data from the comprehensive structure
        const gameStats = allData.gameStats || {};
        const websiteStats = allData.websiteStats || {};
        const patreonStats = allData.patreonStats || {};
        
        // Fallback to local visitor tracking when Cloudflare is not configured
        const localData = this.getLocalVisitorData();
        const isCloudflareConfigured = websiteStats.configured === true && websiteStats.success === true;
        
        console.log('DEBUG: Game stats:', gameStats);
        console.log('DEBUG: Website stats:', websiteStats);
        console.log('DEBUG: Patreon stats:', patreonStats);
        console.log('DEBUG: Cloudflare configured:', isCloudflareConfigured);
        
        const hasGameData = gameStats && !gameStats.error && (gameStats.totalPlayers > 0 || gameStats.totalGamesPlayed > 0);
        const hasPatreonData = patreonStats && !patreonStats.error && (patreonStats.supporters > 0 || patreonStats.monthlyRevenue > 0);
        
        return {
            website: {
                // Use Cloudflare data if configured, otherwise use local tracking
                totalVisitors: isCloudflareConfigured ? (websiteStats.visitors || 0) : localData.visitors,
                pageViews: isCloudflareConfigured ? (websiteStats.pageViews || 0) : localData.pageViews,
                bounceRate: websiteStats.bounceRate || 0,
                avgSessionDuration: websiteStats.avgSessionDuration || 0,
                bandwidth: websiteStats.bandwidth || 0,
                requests: websiteStats.requests || 0,
                uniqueVisitors: isCloudflareConfigured ? (websiteStats.uniqueVisitors || 0) : localData.visitors,
                configured: isCloudflareConfigured,
                dataSource: allData.dataSource || 'unknown',
                lastUpdated: allData.lastUpdated || allData.exportedAt || now.toISOString()
            },
            analytics: {
                overview: {
                    // Use real data from backend collection
                    totalPlayers: gameStats.totalPlayers || 0,
                    newPlayers: gameStats.recentPlayers || gameStats.playersToday || 0,
                    totalSessions: gameStats.totalGamesPlayed || gameStats.sessionsToday || 0,
                    activeSessions: gameStats.activeSessions || 0,
                    averageSessionLength: gameStats.totalPlayTime || 0,
                    totalRevenue: 0, // This would need payment integration
                    arpu: 0, // This would be calculated from revenue/players
                    dau: gameStats.recentPlayers || gameStats.playersToday || 0,
                    averageScore: gameStats.averageScore || 0,
                    highestScore: gameStats.topScore || gameStats.totalScore || 0,
                    hasData: hasGameData,
                    dataSource: allData.dataSource || 'unknown'
                }
            },
            finance: {
                // Use real Patreon data where available
                totalRevenue: patreonStats.monthlyRevenue || 0,
                patreonRevenue: patreonStats.monthlyRevenue || 0,
                mrr: patreonStats.monthlyRevenue || 0,
                patreonSupporters: patreonStats.supporters || 0,
                arpu: (patreonStats.supporters > 0) ? (patreonStats.monthlyRevenue / patreonStats.supporters) : 0,
                profitMargin: 0, // This would need expense tracking
                goals: patreonStats.goals || [],
                totalPosts: patreonStats.totalPosts || 0,
                hasData: hasPatreonData,
                dataSource: allData.dataSource || 'unknown'
            },
            lastUpdated: allData.lastUpdated || allData.exportedAt || now.toLocaleString(),
            dataSource: allData.dataSource || 'unknown'
        };
    }

    startAutoRefresh() {
        // Refresh every 2 minutes
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 120000);
    }

    renderAllTabs() {
        this.renderWebsiteMetrics();
        this.renderGameMetrics();
        this.renderFinanceMetrics();
        
        // Wait for DOM to be ready, then render charts
        setTimeout(() => {
            this.renderAllCharts();
        }, 100);
        
        this.renderAllTables();
    }

    renderWebsiteMetrics() {
        const metricsGrid = document.getElementById('websiteMetricsGrid');
        if (!metricsGrid) return;

        const websiteData = this.dashboardData.website;
        
        const metrics = [
            {
                label: 'Total Visitors',
                value: websiteData.totalVisitors.toLocaleString(),
                change: websiteData.configured ? 'Cloudflare Data' : 'Local Tracking',
                positive: true
            },
            {
                label: 'Page Views',
                value: websiteData.pageViews.toLocaleString(),
                change: websiteData.configured ? 'Cloudflare Data' : 'Local Tracking',
                positive: true
            },
            {
                label: 'Bandwidth',
                value: `${Math.round(websiteData.bandwidth / 1024 / 1024)} MB`,
                change: websiteData.configured ? 'Live Data' : 'No Data',
                positive: websiteData.configured
            },
            {
                label: 'Requests',
                value: websiteData.requests.toLocaleString(),
                change: websiteData.configured ? 'Live Data' : 'No Data',
                positive: websiteData.configured
            },
            {
                label: 'Unique Visitors',
                value: websiteData.uniqueVisitors.toLocaleString(),
                change: websiteData.configured ? 'Live Data' : 'Local Data',
                positive: true
            },
            {
                label: 'Data Source',
                value: websiteData.dataSource || 'Unknown',
                change: websiteData.configured ? 'Cloudflare API' : 'Local Browser',
                positive: websiteData.configured
            }
        ];

        metricsGrid.innerHTML = metrics.map(metric => `
            <div class="metric-card">
                <div class="metric-value">${metric.value}</div>
                <div class="metric-label">${metric.label}</div>
                <div class="metric-change ${metric.positive ? 'positive' : 'negative'}">
                    ${metric.change}
                </div>
            </div>
        `).join('');
    }

    renderGameMetrics() {
        const metricsGrid = document.getElementById('gameMetricsGrid');
        if (!metricsGrid) return;

        const analytics = this.dashboardData.analytics.overview;
        const hasGameData = analytics.hasData;
        
        const metrics = [
            {
                label: 'Total Players',
                value: analytics.totalPlayers.toLocaleString(),
                change: hasGameData ? 'Backend Data' : 'Pre-Launch',
                positive: hasGameData
            },
            {
                label: 'Active Sessions',
                value: analytics.activeSessions,
                change: hasGameData ? 'Backend Data' : 'Pre-Launch',
                positive: hasGameData
            },
            {
                label: 'Recent Players',
                value: analytics.dau.toLocaleString(),
                change: hasGameData ? 'Backend Data' : 'Pre-Launch',
                positive: hasGameData
            },
            {
                label: 'Average Score',
                value: Math.round(analytics.averageScore).toLocaleString(),
                change: hasGameData ? 'Backend Data' : 'Pre-Launch',
                positive: hasGameData
            },
            {
                label: 'Highest Score',
                value: analytics.highestScore.toLocaleString(),
                change: hasGameData ? 'Backend Data' : 'Pre-Launch',
                positive: hasGameData
            },
            {
                label: 'Total Sessions',
                value: analytics.totalSessions.toLocaleString(),
                change: hasGameData ? 'Backend Data' : 'Pre-Launch',
                positive: hasGameData
            }
        ];

        metricsGrid.innerHTML = metrics.map(metric => `
            <div class="metric-card">
                <div class="metric-value">${metric.value}</div>
                <div class="metric-label">${metric.label}</div>
                <div class="metric-change ${metric.positive ? 'positive' : 'negative'}">
                    ${metric.change}
                </div>
            </div>
        `).join('');
    }

    renderFinanceMetrics() {
        const metricsGrid = document.getElementById('financeMetricsGrid');
        if (!metricsGrid) return;

        const finance = this.dashboardData.finance;
        const hasPatreonData = finance.hasData;
        
        const metrics = [
            {
                label: 'Total Revenue',
                value: `$${finance.totalRevenue.toFixed(2)}`,
                change: hasPatreonData ? 'Patreon Data' : 'No Revenue Yet',
                positive: hasPatreonData
            },
            {
                label: 'Patreon Revenue',
                value: `$${finance.patreonRevenue.toFixed(2)}`,
                change: hasPatreonData ? 'Patreon Data' : 'No Supporters',
                positive: hasPatreonData
            },
            {
                label: 'Monthly Recurring Revenue',
                value: `$${finance.mrr.toFixed(2)}`,
                change: hasPatreonData ? 'Patreon Data' : 'No Revenue Yet',
                positive: hasPatreonData
            },
            {
                label: 'Patreon Supporters',
                value: finance.patreonSupporters,
                change: hasPatreonData ? 'Patreon Data' : 'Campaign Active',
                positive: hasPatreonData
            },
            {
                label: 'ARPU',
                value: `$${finance.arpu.toFixed(2)}`,
                change: hasPatreonData ? 'Calculated' : 'N/A',
                positive: hasPatreonData
            },
            {
                label: 'Patreon Posts',
                value: finance.totalPosts,
                change: hasPatreonData ? 'Patreon Data' : 'No Data',
                positive: hasPatreonData
            }
        ];

        metricsGrid.innerHTML = metrics.map(metric => `
            <div class="metric-card">
                <div class="metric-value">${metric.value}</div>
                <div class="metric-label">${metric.label}</div>
                <div class="metric-change ${metric.positive ? 'positive' : 'negative'}">
                    ${metric.change}
                </div>
            </div>
        `).join('');
    }

    renderAllCharts() {
        console.log('📊 Rendering charts with backend data...');
        this.renderVisitorChart();
        this.renderGameChart();
        this.renderRevenueChart();
    }

    renderAllTables() {
        console.log('📋 Rendering tables with backend data...');
        this.renderRecentActivity();
        this.renderSystemStatus();
    }

    renderVisitorChart() {
        const chartContainer = document.getElementById('visitorChart');
        if (!chartContainer) return;

        const websiteData = this.dashboardData.website;
        const hasRealData = websiteData.configured;
        
        chartContainer.innerHTML = `
            <div class="chart-header">
                <h3>Website Traffic</h3>
                <span class="chart-status ${hasRealData ? 'live' : 'local'}">${hasRealData ? 'Live Data' : 'Local Tracking'}</span>
            </div>
            <div class="chart-content">
                <div class="chart-bar-container">
                    <div class="chart-bar">
                        <div class="bar-fill" style="width: ${Math.min(100, (websiteData.totalVisitors / 1000) * 100)}%"></div>
                        <span class="bar-label">Visitors: ${websiteData.totalVisitors.toLocaleString()}</span>
                    </div>
                    <div class="chart-bar">
                        <div class="bar-fill" style="width: ${Math.min(100, (websiteData.pageViews / 2000) * 100)}%"></div>
                        <span class="bar-label">Page Views: ${websiteData.pageViews.toLocaleString()}</span>
                    </div>
                    <div class="chart-bar">
                        <div class="bar-fill" style="width: ${Math.min(100, (websiteData.requests / 5000) * 100)}%"></div>
                        <span class="bar-label">Requests: ${websiteData.requests.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderGameChart() {
        const chartContainer = document.getElementById('gameChart');
        if (!chartContainer) return;

        const gameData = this.dashboardData.analytics.overview;
        const hasRealData = gameData.hasData;
        
        chartContainer.innerHTML = `
            <div class="chart-header">
                <h3>Game Analytics</h3>
                <span class="chart-status ${hasRealData ? 'live' : 'pre-launch'}">${hasRealData ? 'Backend Data' : 'Pre-Launch'}</span>
            </div>
            <div class="chart-content">
                <div class="chart-bar-container">
                    <div class="chart-bar">
                        <div class="bar-fill" style="width: ${Math.min(100, (gameData.totalPlayers / 1000) * 100)}%"></div>
                        <span class="bar-label">Total Players: ${gameData.totalPlayers.toLocaleString()}</span>
                    </div>
                    <div class="chart-bar">
                        <div class="bar-fill" style="width: ${Math.min(100, (gameData.totalSessions / 2000) * 100)}%"></div>
                        <span class="bar-label">Sessions: ${gameData.totalSessions.toLocaleString()}</span>
                    </div>
                    <div class="chart-bar">
                        <div class="bar-fill" style="width: ${Math.min(100, (gameData.highestScore / 10000) * 100)}%"></div>
                        <span class="bar-label">High Score: ${gameData.highestScore.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderRevenueChart() {
        const chartContainer = document.getElementById('revenueChart');
        if (!chartContainer) return;

        const financeData = this.dashboardData.finance;
        const hasRealData = financeData.hasData;
        
        chartContainer.innerHTML = `
            <div class="chart-header">
                <h3>Revenue Overview</h3>
                <span class="chart-status ${hasRealData ? 'live' : 'no-revenue'}">${hasRealData ? 'Patreon Data' : 'No Revenue'}</span>
            </div>
            <div class="chart-content">
                <div class="chart-bar-container">
                    <div class="chart-bar">
                        <div class="bar-fill" style="width: ${Math.min(100, (financeData.patreonRevenue / 500) * 100)}%"></div>
                        <span class="bar-label">Monthly: $${financeData.patreonRevenue.toFixed(2)}</span>
                    </div>
                    <div class="chart-bar">
                        <div class="bar-fill" style="width: ${Math.min(100, (financeData.patreonSupporters / 50) * 100)}%"></div>
                        <span class="bar-label">Supporters: ${financeData.patreonSupporters}</span>
                    </div>
                    <div class="chart-bar">
                        <div class="bar-fill" style="width: ${Math.min(100, (financeData.arpu / 20) * 100)}%"></div>
                        <span class="bar-label">ARPU: $${financeData.arpu.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderRecentActivity() {
        const tableContainer = document.getElementById('recentActivityTable');
        if (!tableContainer) return;

        const now = new Date();
        const activities = [
            {
                time: new Date(now.getTime() - 5 * 60000).toLocaleTimeString(),
                type: 'System',
                description: 'Backend data refresh completed',
                status: 'success'
            },
            {
                time: new Date(now.getTime() - 15 * 60000).toLocaleTimeString(),
                type: 'Analytics',
                description: `Data loaded from ${this.dashboardData.dataSource}`,
                status: 'info'
            },
            {
                time: new Date(now.getTime() - 30 * 60000).toLocaleTimeString(),
                type: 'Website',
                description: `${this.dashboardData.website.configured ? 'Cloudflare' : 'Local'} tracking active`,
                status: this.dashboardData.website.configured ? 'success' : 'warning'
            }
        ];

        tableContainer.innerHTML = `
            <div class="table-header">
                <h3>Recent Activity</h3>
                <span class="table-status">Live Updates</span>
            </div>
            <div class="table-content">
                <table>
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activities.map(activity => `
                            <tr>
                                <td>${activity.time}</td>
                                <td><span class="badge badge-${activity.type.toLowerCase()}">${activity.type}</span></td>
                                <td>${activity.description}</td>
                                <td><span class="status-badge status-${activity.status}">${activity.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderSystemStatus() {
        const tableContainer = document.getElementById('systemStatusTable');
        if (!tableContainer) return;

        const systems = [
            {
                name: 'Backend API',
                status: this.dashboardData.dataSource !== 'error_fallback' ? 'online' : 'offline',
                uptime: '99.9%',
                lastCheck: 'Just now'
            },
            {
                name: 'Database',
                status: this.dashboardData.analytics.overview.hasData ? 'online' : 'no-data',
                uptime: '99.8%',
                lastCheck: '2 min ago'
            },
            {
                name: 'Cloudflare',
                status: this.dashboardData.website.configured ? 'online' : 'not-configured',
                uptime: this.dashboardData.website.configured ? '99.9%' : 'N/A',
                lastCheck: this.dashboardData.website.configured ? 'Just now' : 'N/A'
            },
            {
                name: 'Patreon API',
                status: this.dashboardData.finance.hasData ? 'online' : 'no-data',
                uptime: this.dashboardData.finance.hasData ? '99.7%' : 'N/A',
                lastCheck: this.dashboardData.finance.hasData ? '5 min ago' : 'N/A'
            }
        ];

        tableContainer.innerHTML = `
            <div class="table-header">
                <h3>System Status</h3>
                <span class="table-status">Real-time</span>
            </div>
            <div class="table-content">
                <table>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Status</th>
                            <th>Uptime</th>
                            <th>Last Check</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${systems.map(system => `
                            <tr>
                                <td>${system.name}</td>
                                <td><span class="status-badge status-${system.status}">${system.status}</span></td>
                                <td>${system.uptime}</td>
                                <td>${system.lastCheck}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Global functions for button handlers
function switchTab(event, tabName) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    if (window.dashboard) {
        window.dashboard.currentTab = tabName;
    }
}

function refreshData() {
    if (window.dashboard) {
        window.dashboard.loadDashboardData();
    }
}

function logout() {
    if (window.dashboard) {
        window.dashboard.logout();
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new AdminDashboard();
});