// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8080/api';
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
            // Fetch real data from multiple endpoints
            const [analyticsResponse, publicStatsResponse, leaderboardResponse] = await Promise.all([
                fetch(`${this.apiBaseUrl}/analytics/dashboard-data`, {
                    headers: {
                        'Authorization': 'Bearer ' + this.getAuthToken()
                    }
                }).catch(() => null),
                fetch(`${this.apiBaseUrl}/public/stats/overview`).catch(() => null),
                fetch(`${this.apiBaseUrl}/public/leaderboard/top10`).catch(() => null)
            ]);

            let dashboardData = {};
            let publicStats = {};
            let leaderboardData = [];

            // Parse responses if available
            if (analyticsResponse && analyticsResponse.ok) {
                dashboardData = await analyticsResponse.json();
            }
            
            if (publicStatsResponse && publicStatsResponse.ok) {
                publicStats = await publicStatsResponse.json();
            }
            
            if (leaderboardResponse && leaderboardResponse.ok) {
                leaderboardData = await leaderboardResponse.json();
            }

            // Merge real data with fallback data
            this.dashboardData = this.mergeWithFallbackData(dashboardData, publicStats, leaderboardData);
            
        } catch (error) {
            console.log('Using fallback data:', error.message);
            // Use fallback data when backend is not available
            this.dashboardData = this.getFallbackData();
        }

        this.renderAllTabs();
    }

    getAuthToken() {
        // In a real implementation, this would be a proper JWT token
        return 'dummy-admin-token';
    }

    showLoadingStates() {
        // Only show loading on first load, not on refresh
        if (this.dashboardData) return;
        
        // Show loading for all metric grids
        const grids = ['websiteMetricsGrid', 'gameMetricsGrid', 'financeMetricsGrid'];
        grids.forEach(gridId => {
            const grid = document.getElementById(gridId);
            if (grid) {
                grid.innerHTML = '<div class="loading">Loading metrics...</div>';
            }
        });
        
        // Show loading for charts
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            container.innerHTML = '<div class="loading">Loading chart...</div>';
        });
    }

    mergeWithFallbackData(dashboardData, publicStats, leaderboardData) {
        const fallback = this.getFallbackData();
        
        // Merge public stats with game analytics
        if (publicStats && Object.keys(publicStats).length > 0) {
            fallback.analytics.overview = {
                ...fallback.analytics.overview,
                totalPlayers: publicStats.totalPlayers || fallback.analytics.overview.totalPlayers,
                newPlayers: publicStats.playersToday || fallback.analytics.overview.newPlayers,
                totalSessions: publicStats.sessionsToday || fallback.analytics.overview.totalSessions,
                averageScore: publicStats.averageScore || fallback.analytics.overview.averageScore,
                highScore: publicStats.highScore || fallback.analytics.overview.highScore
            };
        }

        // Use real analytics data if available
        if (dashboardData && Object.keys(dashboardData).length > 0) {
            return {
                ...fallback,
                ...dashboardData
            };
        }

        return fallback;
    }

    renderAllTabs() {
        this.renderWebsiteMetrics();
        this.renderGameMetrics();
        this.renderFinanceMetrics();
        this.renderAllCharts();
        this.renderAllTables();
    }

    renderWebsiteMetrics() {
        const metricsGrid = document.getElementById('websiteMetricsGrid');
        if (!metricsGrid) return;

        const websiteData = this.dashboardData.website || {};
        
        const metrics = [
            {
                label: 'Total Visitors',
                value: websiteData.totalVisitors || 45780,
                change: '+15%',
                positive: true
            },
            {
                label: 'Page Views',
                value: websiteData.pageViews || 89456,
                change: '+12%',
                positive: true
            },
            {
                label: 'Bounce Rate',
                value: `${websiteData.bounceRate || 32}%`,
                change: '-5%',
                positive: true
            },
            {
                label: 'Avg Session Duration',
                value: `${websiteData.avgSessionDuration || 245}s`,
                change: '+8%',
                positive: true
            },
            {
                label: 'Newsletter Signups',
                value: websiteData.newsletterSignups || 1247,
                change: '+22%',
                positive: true
            },
            {
                label: 'SEO Score',
                value: websiteData.seoScore || 94,
                change: '+3%',
                positive: true
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

        const analytics = this.dashboardData.analytics || this.dashboardData;
        
        const metrics = [
            {
                label: 'Total Players',
                value: analytics.overview?.totalPlayers || 1245,
                change: '+12%',
                positive: true
            },
            {
                label: 'Active Sessions',
                value: analytics.overview?.activeSessions || 23,
                change: '+5%',
                positive: true
            },
            {
                label: 'Daily Active Users',
                value: analytics.overview?.dau || 245,
                change: '+8%',
                positive: true
            },
            {
                label: 'Average Score',
                value: Math.round(analytics.gameplayAnalytics?.averageScore || 1850),
                change: '+3%',
                positive: true
            },
            {
                label: 'Session Length',
                value: `${analytics.overview?.averageSessionLength || 18.5}m`,
                change: '+2%',
                positive: true
            },
            {
                label: 'Retention Rate',
                value: `${((analytics.playerAnalytics?.playerRetention || 0.65) * 100).toFixed(1)}%`,
                change: '+4%',
                positive: true
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

        const financeData = this.dashboardData.finance || {};
        
        const metrics = [
            {
                label: 'Total Revenue',
                value: `$${(financeData.totalRevenue || 3250).toLocaleString()}`,
                change: '+18%',
                positive: true
            },
            {
                label: 'Patreon Revenue',
                value: `$${(financeData.patreonRevenue || 2500).toLocaleString()}`,
                change: '+15%',
                positive: true
            },
            {
                label: 'Monthly Recurring',
                value: `$${(financeData.mrr || 2200).toLocaleString()}`,
                change: '+12%',
                positive: true
            },
            {
                label: 'Patreon Supporters',
                value: financeData.patreonSupporters || 58,
                change: '+7%',
                positive: true
            },
            {
                label: 'Average Revenue/User',
                value: `$${financeData.arpu || 43.10}`,
                change: '+6%',
                positive: true
            },
            {
                label: 'Profit Margin',
                value: `${financeData.profitMargin || 78}%`,
                change: '+3%',
                positive: true
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
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            // Website Charts
            this.renderWebsiteTrafficChart();
            this.renderPageViewsChart();
            this.renderTrafficSourcesChart();
            this.renderDeviceUsageChart();

            // Game Charts
            this.renderDailyPlayersChart();
            this.renderSessionDurationChart();
            this.renderScoreDistributionChart();
            this.renderPlatformUsageChart();
            this.renderRetentionCohortChart();
            this.renderGameplayPatternsChart();

            // Finance Charts
            this.renderRevenueTrendChart();
            this.renderPatreonGrowthChart();
            this.renderRevenueSourcesChart();
            this.renderMRRChart();
            this.renderExpenseBreakdownChart();
            this.renderProfitMarginChart();
        }, 100);
    }

    // Website Charts
    renderWebsiteTrafficChart() {
        const ctx = document.getElementById('websiteTrafficChart');
        if (!ctx) return;

        // Clear loading state
        const container = ctx.closest('.chart-container');
        if (container && container.querySelector('.loading')) {
            container.innerHTML = '<canvas id="websiteTrafficChart"></canvas>';
            const newCtx = document.getElementById('websiteTrafficChart');
            if (!newCtx) return;
        }

        if (this.charts.websiteTraffic) {
            this.charts.websiteTraffic.destroy();
        }

        const data = this.generateWebsiteTrafficData();
        this.charts.websiteTraffic = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Unique Visitors',
                    data: data.map(d => d.visitors),
                    borderColor: '#C0C0C0',
                    backgroundColor: 'rgba(192, 192, 192, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: this.getDefaultChartOptions()
        });
    }

    renderPageViewsChart() {
        const ctx = document.getElementById('pageViewsChart');
        if (!ctx) return;

        if (this.charts.pageViews) {
            this.charts.pageViews.destroy();
        }

        this.charts.pageViews = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Home', 'Games', 'About', 'News', 'Community', 'Support'],
                datasets: [{
                    label: 'Page Views',
                    data: [12500, 8900, 5600, 4200, 3800, 2900],
                    backgroundColor: '#ff6b47',
                    borderColor: '#ff6b47',
                    borderWidth: 1
                }]
            },
            options: this.getDefaultChartOptions()
        });
    }

    renderTrafficSourcesChart() {
        const ctx = document.getElementById('trafficSourcesChart');
        if (!ctx) return;

        if (this.charts.trafficSources) {
            this.charts.trafficSources.destroy();
        }

        this.charts.trafficSources = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Direct', 'Google', 'Social Media', 'Referrals', 'Email'],
                datasets: [{
                    data: [35, 30, 20, 10, 5],
                    backgroundColor: ['#C0C0C0', '#ff6b47', '#708090', '#2d2d2d', '#778899'],
                    borderWidth: 2,
                    borderColor: '#1a1a1a'
                }]
            },
            options: this.getDoughnutChartOptions()
        });
    }

    renderDeviceUsageChart() {
        const ctx = document.getElementById('deviceUsageChart');
        if (!ctx) return;

        if (this.charts.deviceUsage) {
            this.charts.deviceUsage.destroy();
        }

        this.charts.deviceUsage = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Desktop', 'Mobile', 'Tablet'],
                datasets: [{
                    data: [45, 50, 5],
                    backgroundColor: ['#C0C0C0', '#ff6b47', '#708090'],
                    borderWidth: 2,
                    borderColor: '#1a1a1a'
                }]
            },
            options: this.getDoughnutChartOptions()
        });
    }

    // Game Charts (existing methods updated)
    renderDailyPlayersChart() {
        const ctx = document.getElementById('dailyPlayersChart');
        if (!ctx) return;

        if (this.charts.dailyPlayers) {
            this.charts.dailyPlayers.destroy();
        }

        const data = this.dashboardData.charts?.dailyPlayers || this.generateDailyPlayersData();
        this.charts.dailyPlayers = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Total Players',
                    data: data.map(d => d.players),
                    borderColor: '#C0C0C0',
                    backgroundColor: 'rgba(192, 192, 192, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'New Players',
                    data: data.map(d => d.newPlayers),
                    borderColor: '#ff6b47',
                    backgroundColor: 'rgba(255, 107, 71, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: this.getDefaultChartOptions()
        });
    }

    renderSessionDurationChart() {
        const ctx = document.getElementById('sessionDurationChart');
        if (!ctx) return;

        if (this.charts.sessionDuration) {
            this.charts.sessionDuration.destroy();
        }

        const data = this.dashboardData.charts?.sessionDuration || [
            { duration: '0-5 min', count: 120 },
            { duration: '5-15 min', count: 300 },
            { duration: '15-30 min', count: 180 },
            { duration: '30+ min', count: 80 }
        ];

        this.charts.sessionDuration = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(d => d.duration),
                datasets: [{
                    data: data.map(d => d.count),
                    backgroundColor: ['#3498db', '#27ae60', '#f39c12', '#e74c3c'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: this.getDoughnutChartOptions()
        });
    }

    renderScoreDistributionChart() {
        const ctx = document.getElementById('scoreDistributionChart');
        if (!ctx) return;

        if (this.charts.scoreDistribution) {
            this.charts.scoreDistribution.destroy();
        }

        const data = this.dashboardData.charts?.scoreDistribution || [
            { scoreRange: '0-1000', count: 200 },
            { scoreRange: '1000-2500', count: 350 },
            { scoreRange: '2500-5000', count: 180 },
            { scoreRange: '5000+', count: 70 }
        ];

        this.charts.scoreDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.scoreRange),
                datasets: [{
                    label: 'Number of Sessions',
                    data: data.map(d => d.count),
                    backgroundColor: '#3498db',
                    borderColor: '#2980b9',
                    borderWidth: 1
                }]
            },
            options: this.getDefaultChartOptions()
        });
    }

    renderPlatformUsageChart() {
        const ctx = document.getElementById('platformUsageChart');
        if (!ctx) return;

        if (this.charts.platformUsage) {
            this.charts.platformUsage.destroy();
        }

        const data = this.dashboardData.charts?.platformUsage || [
            { platform: 'mobile', count: 680 },
            { platform: 'desktop', count: 320 }
        ];

        this.charts.platformUsage = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.map(d => d.platform.charAt(0).toUpperCase() + d.platform.slice(1)),
                datasets: [{
                    data: data.map(d => d.count),
                    backgroundColor: ['#3498db', '#27ae60'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: this.getDoughnutChartOptions()
        });
    }

    renderRetentionCohortChart() {
        const ctx = document.getElementById('retentionCohortChart');
        if (!ctx) return;

        if (this.charts.retentionCohort) {
            this.charts.retentionCohort.destroy();
        }

        const data = this.dashboardData.charts?.retentionCohort || [
            { cohort: 'Week 1', day1: 100, day7: 45, day30: 20 },
            { cohort: 'Week 2', day1: 120, day7: 55, day30: 25 },
            { cohort: 'Week 3', day1: 110, day7: 50, day30: 22 }
        ];

        this.charts.retentionCohort = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.cohort),
                datasets: [{
                    label: 'Day 1',
                    data: data.map(d => d.day1),
                    backgroundColor: '#3498db'
                }, {
                    label: 'Day 7',
                    data: data.map(d => d.day7),
                    backgroundColor: '#27ae60'
                }, {
                    label: 'Day 30',
                    data: data.map(d => d.day30),
                    backgroundColor: '#f39c12'
                }]
            },
            options: this.getDefaultChartOptions()
        });
    }

    renderGameplayPatternsChart() {
        const ctx = document.getElementById('gameplayPatternsChart');
        if (!ctx) return;

        if (this.charts.gameplayPatterns) {
            this.charts.gameplayPatterns.destroy();
        }

        this.charts.gameplayPatterns = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Combat', 'Strategy', 'Collection', 'Exploration', 'Social', 'Achievement'],
                datasets: [{
                    label: 'Player Engagement',
                    data: [85, 70, 60, 45, 55, 75],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Finance Charts
    renderRevenueTrendChart() {
        const ctx = document.getElementById('revenueTrendChart');
        if (!ctx) return;

        if (this.charts.revenueTrend) {
            this.charts.revenueTrend.destroy();
        }

        const data = this.generateRevenueTrendData();
        this.charts.revenueTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Total Revenue',
                    data: data.map(d => d.revenue),
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Patreon Revenue',
                    data: data.map(d => d.patreonRevenue),
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...this.getDefaultChartOptions(),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    renderPatreonGrowthChart() {
        const ctx = document.getElementById('patreonGrowthChart');
        if (!ctx) return;

        if (this.charts.patreonGrowth) {
            this.charts.patreonGrowth.destroy();
        }

        const data = this.generatePatreonGrowthData();
        this.charts.patreonGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Supporters',
                    data: data.map(d => d.supporters),
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'Monthly Revenue',
                    data: data.map(d => d.revenue),
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    renderRevenueSourcesChart() {
        const ctx = document.getElementById('revenueSourcesChart');
        if (!ctx) return;

        if (this.charts.revenueSources) {
            this.charts.revenueSources.destroy();
        }

        this.charts.revenueSources = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Patreon', 'Game Sales', 'Merchandise', 'Sponsorships', 'Other'],
                datasets: [{
                    data: [75, 15, 5, 3, 2],
                    backgroundColor: ['#f39c12', '#3498db', '#27ae60', '#e74c3c', '#9b59b6'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: this.getDoughnutChartOptions()
        });
    }

    renderMRRChart() {
        const ctx = document.getElementById('mrrChart');
        if (!ctx) return;

        if (this.charts.mrr) {
            this.charts.mrr.destroy();
        }

        const data = this.generateMRRData();
        this.charts.mrr = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Monthly Recurring Revenue',
                    data: data.map(d => d.mrr),
                    backgroundColor: '#27ae60',
                    borderColor: '#229954',
                    borderWidth: 1
                }]
            },
            options: {
                ...this.getDefaultChartOptions(),
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    }
                }
            }
        });
    }

    renderExpenseBreakdownChart() {
        const ctx = document.getElementById('expenseBreakdownChart');
        if (!ctx) return;

        if (this.charts.expenseBreakdown) {
            this.charts.expenseBreakdown.destroy();
        }

        this.charts.expenseBreakdown = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Development', 'Marketing', 'Server Costs', 'Legal/Admin', 'Tools/Software'],
                datasets: [{
                    data: [40, 25, 15, 10, 10],
                    backgroundColor: ['#3498db', '#f39c12', '#e74c3c', '#9b59b6', '#27ae60'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: this.getDoughnutChartOptions()
        });
    }

    renderProfitMarginChart() {
        const ctx = document.getElementById('profitMarginChart');
        if (!ctx) return;

        if (this.charts.profitMargin) {
            this.charts.profitMargin.destroy();
        }

        const data = this.generateProfitMarginData();
        this.charts.profitMargin = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Profit Margin %',
                    data: data.map(d => d.margin),
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...this.getDefaultChartOptions(),
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    renderAllTables() {
        this.renderWebsiteTables();
        this.renderGameTables();
        this.renderFinanceTables();
    }

    renderWebsiteTables() {
        this.renderTopPagesTable();
        this.renderSEOTable();
    }

    renderGameTables() {
        this.renderGamePerformanceTable();
    }

    renderFinanceTables() {
        this.renderTopPatreonTable();
        this.renderFinancialHealthTable();
    }

    renderTopPagesTable() {
        const tbody = document.querySelector('#topPagesTable tbody');
        if (!tbody) return;

        const pages = [
            { page: '/', views: 12500, unique: 8900, bounce: '28%' },
            { page: '/games', views: 8900, unique: 6700, bounce: '22%' },
            { page: '/about', views: 5600, unique: 4200, bounce: '35%' },
            { page: '/news', views: 4200, unique: 3100, bounce: '31%' },
            { page: '/community', views: 3800, unique: 2900, bounce: '26%' }
        ];

        tbody.innerHTML = pages.map(page => `
            <tr>
                <td>${page.page}</td>
                <td>${page.views.toLocaleString()}</td>
                <td>${page.unique.toLocaleString()}</td>
                <td>${page.bounce}</td>
            </tr>
        `).join('');
    }

    renderSEOTable() {
        const tbody = document.querySelector('#seoTable tbody');
        if (!tbody) return;

        const keywords = [
            { keyword: 'indie game studio', position: 3, clicks: 245, impressions: 12500 },
            { keyword: 'pocket legion game', position: 1, clicks: 892, impressions: 15600 },
            { keyword: 'steel canvas studio', position: 1, clicks: 1245, impressions: 8900 },
            { keyword: 'mobile strategy game', position: 8, clicks: 156, impressions: 23400 }
        ];

        tbody.innerHTML = keywords.map(kw => `
            <tr>
                <td>${kw.keyword}</td>
                <td>${kw.position}</td>
                <td>${kw.clicks}</td>
                <td>${kw.impressions.toLocaleString()}</td>
            </tr>
        `).join('');
    }


    renderGamePerformanceTable() {
        const tbody = document.querySelector('#gamePerformanceTable tbody');
        if (!tbody) return;

        const metrics = [
            { metric: 'Server Response Time', value: '85ms', status: 'online' },
            { metric: 'Game Session Success Rate', value: '99.2%', status: 'online' },
            { metric: 'Crash Rate', value: '0.3%', status: 'online' },
            { metric: 'Memory Usage', value: '67%', status: 'warning' },
            { metric: 'Player Satisfaction', value: '4.6/5', status: 'online' }
        ];

        tbody.innerHTML = metrics.map(metric => `
            <tr>
                <td>${metric.metric}</td>
                <td>${metric.value}</td>
                <td>
                    <span class="status-indicator status-${metric.status}"></span>
                    ${metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                </td>
                <td>${new Date().toLocaleTimeString()}</td>
            </tr>
        `).join('');
    }

    renderTopPatreonTable() {
        const tbody = document.querySelector('#topPatreonTable tbody');
        if (!tbody) return;

        const tiers = [
            { tier: 'Supporter ($5)', supporters: 28, revenue: 140, percentage: '56%' },
            { tier: 'Champion ($15)', supporters: 18, revenue: 270, percentage: '31%' },
            { tier: 'Legend ($30)', supporters: 8, revenue: 240, percentage: '14%' },
            { tier: 'Hero ($50)', supporters: 4, revenue: 200, percentage: '7%' }
        ];

        tbody.innerHTML = tiers.map(tier => `
            <tr>
                <td>${tier.tier}</td>
                <td>${tier.supporters}</td>
                <td>$${tier.revenue}</td>
                <td>${tier.percentage}</td>
            </tr>
        `).join('');
    }

    renderFinancialHealthTable() {
        const tbody = document.querySelector('#financialHealthTable tbody');
        if (!tbody) return;

        const metrics = [
            { metric: 'Monthly Revenue', current: '$2,500', target: '$5,000', status: 'warning' },
            { metric: 'Growth Rate', current: '15%', target: '20%', status: 'warning' },
            { metric: 'Profit Margin', current: '78%', target: '70%', status: 'online' },
            { metric: 'Supporter Count', current: '58', target: '100', status: 'warning' },
            { metric: 'Churn Rate', current: '5%', target: '<10%', status: 'online' }
        ];

        tbody.innerHTML = metrics.map(metric => `
            <tr>
                <td>${metric.metric}</td>
                <td>${metric.current}</td>
                <td>${metric.target}</td>
                <td>
                    <span class="status-indicator status-${metric.status}"></span>
                    ${metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                </td>
            </tr>
        `).join('');
    }

    // Data generation methods
    generateWebsiteTrafficData() {
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            data.push({
                date: date.toISOString().split('T')[0],
                visitors: 800 + Math.floor(Math.random() * 400)
            });
        }
        return data;
    }

    generateDailyPlayersData() {
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            data.push({
                date: date.toISOString().split('T')[0],
                players: 180 + Math.floor(Math.random() * 80),
                newPlayers: 10 + Math.floor(Math.random() * 15)
            });
        }
        return data;
    }

    generateRevenueTrendData() {
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            data.push({
                date: date.toISOString().split('T')[0],
                revenue: 80 + Math.floor(Math.random() * 40),
                patreonRevenue: 60 + Math.floor(Math.random() * 30)
            });
        }
        return data;
    }

    generatePatreonGrowthData() {
        return [
            { month: 'Jan', supporters: 25, revenue: 1250 },
            { month: 'Feb', supporters: 32, revenue: 1680 },
            { month: 'Mar', supporters: 41, revenue: 2050 },
            { month: 'Apr', supporters: 48, revenue: 2380 },
            { month: 'May', supporters: 54, revenue: 2650 },
            { month: 'Jun', supporters: 58, revenue: 2500 }
        ];
    }

    generateMRRData() {
        return [
            { month: 'Jan', mrr: 1250 },
            { month: 'Feb', mrr: 1680 },
            { month: 'Mar', mrr: 2050 },
            { month: 'Apr', mrr: 2380 },
            { month: 'May', mrr: 2650 },
            { month: 'Jun', mrr: 2500 }
        ];
    }

    generateProfitMarginData() {
        return [
            { month: 'Jan', margin: 65 },
            { month: 'Feb', margin: 72 },
            { month: 'Mar', margin: 75 },
            { month: 'Apr', margin: 78 },
            { month: 'May', margin: 80 },
            { month: 'Jun', margin: 78 }
        ];
    }

    getDefaultChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e8e8e8',
                        font: {
                            family: 'Segoe UI'
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#A9A9A9'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#A9A9A9'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        };
    }

    getDoughnutChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e8e8e8',
                        font: {
                            family: 'Segoe UI'
                        }
                    }
                }
            }
        };
    }

    startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 120000); // Refresh every 2 minutes
    }

    refreshData() {
        this.loadDashboardData();
    }

    exportToPDF() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        
        // Add title
        pdf.setFontSize(20);
        pdf.text(`Steel Canvas Studio - ${this.currentTab.charAt(0).toUpperCase() + this.currentTab.slice(1)} Analytics`, 20, 20);
        
        // Add date
        pdf.setFontSize(12);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
        
        // Add current tab data
        pdf.setFontSize(14);
        pdf.text(`${this.currentTab.charAt(0).toUpperCase() + this.currentTab.slice(1)} Metrics:`, 20, 55);
        
        // Save the PDF
        pdf.save(`${this.currentTab}-analytics-report.pdf`);
    }

    exportToExcel() {
        const wb = XLSX.utils.book_new();
        
        // Create metrics worksheet based on current tab
        let metricsData = [];
        
        if (this.currentTab === 'website') {
            metricsData = [
                ['Metric', 'Value'],
                ['Total Visitors', 45780],
                ['Page Views', 89456],
                ['Bounce Rate', '32%'],
                ['Avg Session Duration', '245s'],
                ['Newsletter Signups', 1247],
                ['SEO Score', 94]
            ];
        } else if (this.currentTab === 'game') {
            metricsData = [
                ['Metric', 'Value'],
                ['Total Players', 1245],
                ['Active Sessions', 23],
                ['Daily Active Users', 245],
                ['Average Score', 1850],
                ['Session Length', '18.5m'],
                ['Retention Rate', '65%']
            ];
        } else if (this.currentTab === 'finance') {
            metricsData = [
                ['Metric', 'Value'],
                ['Total Revenue', '$3,250'],
                ['Patreon Revenue', '$2,500'],
                ['Monthly Recurring', '$2,200'],
                ['Patreon Supporters', 58],
                ['Average Revenue/User', '$43.10'],
                ['Profit Margin', '78%']
            ];
        }
        
        const ws = XLSX.utils.aoa_to_sheet(metricsData);
        XLSX.utils.book_append_sheet(wb, ws, `${this.currentTab}_metrics`);
        
        // Save the workbook
        XLSX.writeFile(wb, `${this.currentTab}-analytics-report.xlsx`);
    }

    getFallbackData() {
        return {
            website: {
                totalVisitors: 45780,
                pageViews: 89456,
                bounceRate: 32,
                avgSessionDuration: 245,
                newsletterSignups: 1247,
                seoScore: 94
            },
            analytics: {
                overview: {
                    totalPlayers: 1245,
                    newPlayers: 67,
                    totalSessions: 8934,
                    activeSessions: 23,
                    averageSessionLength: 18.5,
                    totalRevenue: 12500,
                    arpu: 25.50,
                    dau: 245
                },
                playerAnalytics: {
                    guestPlayers: 789,
                    socialPlayers: 398,
                    patreonSupporters: 58,
                    playerRetention: 0.65,
                    topPlayers: [
                        { username: 'DragonSlayer', score: 9790, rank: 1 },
                        { username: 'SteelCommander', score: 9493, rank: 2 },
                        { username: 'CombatLegend', score: 9308, rank: 3 }
                    ]
                },
                gameplayAnalytics: {
                    averageScore: 1850,
                    highestScore: 9790
                },
                revenueAnalytics: {
                    conversionRate: 0.15
                }
            },
            finance: {
                totalRevenue: 3250,
                patreonRevenue: 2500,
                mrr: 2200,
                patreonSupporters: 58,
                arpu: 43.10,
                profitMargin: 78
            },
            performance: {
                systemHealth: {
                    uptime: 99.9,
                    responseTime: 150,
                    errorRate: 0.1,
                    memoryUsage: 65.5,
                    cpuUsage: 45.2
                }
            },
            charts: {
                dailyPlayers: [
                    { date: '2024-06-10', players: 180, newPlayers: 12 },
                    { date: '2024-06-11', players: 195, newPlayers: 18 },
                    { date: '2024-06-12', players: 210, newPlayers: 15 },
                    { date: '2024-06-13', players: 225, newPlayers: 22 },
                    { date: '2024-06-14', players: 240, newPlayers: 20 },
                    { date: '2024-06-15', players: 245, newPlayers: 16 },
                    { date: '2024-06-16', players: 245, newPlayers: 14 }
                ],
                sessionDuration: [
                    { duration: '0-5 min', count: 120 },
                    { duration: '5-15 min', count: 300 },
                    { duration: '15-30 min', count: 180 },
                    { duration: '30+ min', count: 80 }
                ],
                scoreDistribution: [
                    { scoreRange: '0-1000', count: 200 },
                    { scoreRange: '1000-2500', count: 350 },
                    { scoreRange: '2500-5000', count: 180 },
                    { scoreRange: '5000+', count: 70 }
                ],
                platformUsage: [
                    { platform: 'mobile', count: 680 },
                    { platform: 'desktop', count: 320 }
                ],
                retentionCohort: [
                    { cohort: 'Week 1', day1: 100, day7: 45, day30: 20 },
                    { cohort: 'Week 2', day1: 120, day7: 55, day30: 25 },
                    { cohort: 'Week 3', day1: 110, day7: 50, day30: 22 }
                ]
            }
        };
    }
}

// Tab switching function
function switchTab(event, tabName) {
    // Remove active class from all tabs and buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => button.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button and corresponding tab
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Update current tab in dashboard instance
    if (window.dashboard) {
        window.dashboard.currentTab = tabName;
    }
}

// Global functions for button handlers
function logout() {
    dashboard.logout();
}

function refreshData() {
    dashboard.refreshData();
}

function exportToPDF() {
    dashboard.exportToPDF();
}

function exportToExcel() {
    dashboard.exportToExcel();
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new AdminDashboard();
});