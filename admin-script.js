// Admin Dashboard JavaScript
class AdminDashboard {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8081/api';
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
            console.log('Loading dashboard data...');
            
            // Fetch data from local JSON files exported by backend
            const [overviewData, cloudflareData, patreonData] = await Promise.all([
                fetch('api-data/overview.json').then(r => r.ok ? r.json() : null).catch(() => null),
                fetch('api-data/cloudflare.json').then(r => r.ok ? r.json() : null).catch(() => null),
                fetch('api-data/patreon.json').then(r => r.ok ? r.json() : null).catch(() => null)
            ]);
            
            let realData = {};
            
            if (overviewData) {
                realData.overview = overviewData;
                console.log('Overview data loaded from file:', realData.overview);
            }
            
            if (cloudflareData) {
                realData.website = cloudflareData;
                console.log('Cloudflare data loaded from file:', realData.website);
            }
            
            if (patreonData) {
                realData.patreon = patreonData;
                console.log('Patreon data loaded from file:', realData.patreon);
            }
            
            // Use real data where available
            this.dashboardData = this.generateDashboardData(realData);
            
        } catch (error) {
            console.log('Error loading data, using fallback values:', error.message);
            this.dashboardData = this.generateDashboardData({});
        }

        this.renderAllTabs();
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


    generateDashboardData(realData = {}) {
        const now = new Date();
        
        return {
            website: {
                // Use real website analytics data where available
                totalVisitors: realData.website?.totalVisitors || 0,
                pageViews: realData.website?.pageViews || 0,
                bounceRate: realData.website?.bounceRate || 0,
                avgSessionDuration: realData.website?.avgSessionDuration || 0,
                bandwidth: realData.website?.bandwidth || 0,
                requests: realData.website?.requests || 0,
                uniqueVisitors: realData.website?.uniqueVisitors || 0,
                configured: (function() {
                    const result = realData.website?.configured === true;
                    console.log('DEBUG: realData.website?.configured =', realData.website?.configured);
                    console.log('DEBUG: configured result =', result);
                    return result;
                })(),
                newsletterSignups: 0, // This would need email service integration
                seoScore: 0 // This would need SEO tool integration
            },
            analytics: {
                overview: {
                    // Use real data from backend, default to 0 if not available
                    totalPlayers: realData.overview?.totalPlayers || 0,
                    newPlayers: realData.overview?.playersToday || 0,
                    totalSessions: realData.overview?.sessionsToday || 0,
                    activeSessions: 0, // This would need real-time session tracking
                    averageSessionLength: 0, // This would need session duration calculation
                    totalRevenue: 0, // This would need payment integration
                    arpu: 0, // This would be calculated from revenue/players
                    dau: realData.overview?.playersToday || 0,
                    averageScore: realData.overview?.averageScore || 0,
                    highestScore: realData.overview?.highScore || 0
                }
            },
            finance: {
                // Use real Patreon data where available
                totalRevenue: (realData.patreon?.monthlyRevenue || 0),
                patreonRevenue: (realData.patreon?.monthlyRevenue || 0),
                mrr: (realData.patreon?.monthlyRevenue || 0),
                patreonSupporters: (realData.patreon?.supporters || 0),
                arpu: realData.patreon?.supporters > 0 ? (realData.patreon.monthlyRevenue / realData.patreon.supporters) : 0,
                profitMargin: 0, // This would need expense tracking
                goals: realData.patreon?.goals || [],
                totalPosts: realData.patreon?.totalPosts || 0
            },
            lastUpdated: now.toLocaleString()
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
                change: websiteData.configured ? 'Live Data' : 'No Data',
                positive: websiteData.configured
            },
            {
                label: 'Page Views',
                value: websiteData.pageViews.toLocaleString(),
                change: websiteData.configured ? 'Live Data' : 'No Data',
                positive: websiteData.configured
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
                change: websiteData.configured ? 'Live Data' : 'No Data',
                positive: websiteData.configured
            },
            {
                label: 'Cloudflare Status',
                value: websiteData.configured ? 'Connected' : 'Offline',
                change: websiteData.configured ? 'Active' : 'Setup Required',
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
        
        const hasGameData = analytics.totalPlayers > 0 || analytics.dau > 0 || analytics.averageScore > 0;
        
        const metrics = [
            {
                label: 'Total Players',
                value: analytics.totalPlayers.toLocaleString(),
                change: hasGameData ? 'Real Data' : 'Pre-Launch',
                positive: hasGameData
            },
            {
                label: 'Active Sessions',
                value: analytics.activeSessions,
                change: hasGameData ? 'Real Data' : 'Pre-Launch',
                positive: hasGameData
            },
            {
                label: 'Daily Active Users',
                value: analytics.dau.toLocaleString(),
                change: hasGameData ? 'Real Data' : 'Pre-Launch',
                positive: hasGameData
            },
            {
                label: 'Average Score',
                value: analytics.averageScore.toLocaleString(),
                change: hasGameData ? 'Real Data' : 'Pre-Launch',
                positive: hasGameData
            },
            {
                label: 'Highest Score',
                value: analytics.highestScore.toLocaleString(),
                change: hasGameData ? 'Real Data' : 'Pre-Launch',
                positive: hasGameData
            },
            {
                label: 'Total Sessions',
                value: analytics.totalSessions.toLocaleString(),
                change: hasGameData ? 'Real Data' : 'Pre-Launch',
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
        
        const hasPatreonData = finance.patreonSupporters > 0 || finance.patreonRevenue > 0;
        
        const metrics = [
            {
                label: 'Total Revenue',
                value: `$${finance.totalRevenue.toFixed(2)}`,
                change: hasPatreonData ? 'Live Data' : 'No Revenue Yet',
                positive: hasPatreonData
            },
            {
                label: 'Patreon Revenue',
                value: `$${finance.patreonRevenue.toFixed(2)}`,
                change: hasPatreonData ? 'Live Data' : 'No Supporters',
                positive: hasPatreonData
            },
            {
                label: 'Monthly Recurring Revenue',
                value: `$${finance.mrr.toFixed(2)}`,
                change: hasPatreonData ? 'Live Data' : 'No Revenue Yet',
                positive: hasPatreonData
            },
            {
                label: 'Patreon Supporters',
                value: finance.patreonSupporters,
                change: hasPatreonData ? 'Live Data' : 'Campaign Active',
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
                change: 'Live Data',
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
        // Website charts
        this.renderWebsiteTrafficChart();
        this.renderPageViewsChart();
        this.renderTrafficSourcesChart();
        this.renderDeviceUsageChart();
        
        // Game charts
        this.renderDailyPlayersChart();
        this.renderSessionDurationChart();
        this.renderScoreDistributionChart();
        this.renderPlatformUsageChart();
        this.renderRetentionCohortChart();
        this.renderGameplayPatternsChart();
        
        // Finance charts
        this.renderRevenueTrendChart();
        this.renderPatreonGrowthChart();
        this.renderRevenueSourcesChart();
        this.renderMRRChart();
        this.renderExpenseBreakdownChart();
        this.renderProfitMarginChart();
    }

    // Website Charts
    renderWebsiteTrafficChart() {
        const ctx = document.getElementById('websiteTrafficChart');
        if (!ctx) return;

        if (this.charts.websiteTraffic) {
            this.charts.websiteTraffic.destroy();
        }

        const data = this.generateWebsiteTrafficData();
        this.charts.websiteTraffic = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Daily Visitors',
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

        const data = this.generatePageViewsData();
        this.charts.pageViews = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(d => d.page),
                datasets: [{
                    label: 'Page Views',
                    data: data.map(d => d.views),
                    backgroundColor: '#ff6b47',
                    borderColor: '#e55939',
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

    // Game Charts
    renderDailyPlayersChart() {
        const ctx = document.getElementById('dailyPlayersChart');
        if (!ctx) return;

        if (this.charts.dailyPlayers) {
            this.charts.dailyPlayers.destroy();
        }

        const data = this.generateDailyPlayersData();
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

        this.charts.sessionDuration = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['0-5 min', '5-15 min', '15-30 min', '30+ min'],
                datasets: [{
                    data: [120, 300, 180, 80],
                    backgroundColor: ['#ff6b47', '#C0C0C0', '#708090', '#2d2d2d'],
                    borderWidth: 2,
                    borderColor: '#1a1a1a'
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

        this.charts.scoreDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['0-1000', '1000-2500', '2500-5000', '5000+'],
                datasets: [{
                    label: 'Number of Sessions',
                    data: [200, 350, 180, 70],
                    backgroundColor: '#ff6b47',
                    borderColor: '#e55939',
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

        this.charts.platformUsage = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Mobile', 'Desktop'],
                datasets: [{
                    data: [680, 320],
                    backgroundColor: ['#ff6b47', '#C0C0C0'],
                    borderWidth: 2,
                    borderColor: '#1a1a1a'
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

        this.charts.retentionCohort = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3'],
                datasets: [{
                    label: 'Day 1',
                    data: [100, 120, 110],
                    backgroundColor: '#ff6b47'
                }, {
                    label: 'Day 7',
                    data: [45, 55, 50],
                    backgroundColor: '#C0C0C0'
                }, {
                    label: 'Day 30',
                    data: [20, 25, 22],
                    backgroundColor: '#708090'
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
                labels: ['Morning', 'Afternoon', 'Evening', 'Night', 'Weekend'],
                datasets: [{
                    label: 'Player Activity',
                    data: [65, 89, 95, 45, 78],
                    borderColor: '#ff6b47',
                    backgroundColor: 'rgba(255, 107, 71, 0.2)',
                    pointBackgroundColor: '#ff6b47',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ff6b47'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e8e8e8'
                        }
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            color: '#444'
                        },
                        grid: {
                            color: '#444'
                        },
                        pointLabels: {
                            color: '#A9A9A9'
                        },
                        ticks: {
                            color: '#A9A9A9',
                            backdropColor: 'transparent'
                        }
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
                labels: data.map(d => d.month),
                datasets: [{
                    label: 'Total Revenue',
                    data: data.map(d => d.revenue),
                    borderColor: '#ff6b47',
                    backgroundColor: 'rgba(255, 107, 71, 0.1)',
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
                            },
                            color: '#A9A9A9'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#A9A9A9'
                        },
                        grid: {
                            color: '#444'
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
                    borderColor: '#C0C0C0',
                    backgroundColor: 'rgba(192, 192, 192, 0.1)',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y'
                }, {
                    label: 'Monthly Revenue',
                    data: data.map(d => d.revenue),
                    borderColor: '#ff6b47',
                    backgroundColor: 'rgba(255, 107, 71, 0.1)',
                    fill: false,
                    tension: 0.4,
                    yAxisID: 'y1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#e8e8e8'
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        ticks: {
                            color: '#A9A9A9'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value;
                            },
                            color: '#A9A9A9'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    },
                    x: {
                        ticks: {
                            color: '#A9A9A9'
                        },
                        grid: {
                            color: '#444'
                        }
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
                    backgroundColor: ['#ff6b47', '#C0C0C0', '#708090', '#2d2d2d', '#778899'],
                    borderWidth: 2,
                    borderColor: '#1a1a1a'
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
                    backgroundColor: '#ff6b47',
                    borderColor: '#e55939',
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
                            },
                            color: '#A9A9A9'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#A9A9A9'
                        },
                        grid: {
                            color: '#444'
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
                    backgroundColor: ['#ff6b47', '#C0C0C0', '#708090', '#2d2d2d', '#778899'],
                    borderWidth: 2,
                    borderColor: '#1a1a1a'
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
                    borderColor: '#ff6b47',
                    backgroundColor: 'rgba(255, 107, 71, 0.1)',
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
                            },
                            color: '#A9A9A9'
                        },
                        grid: {
                            color: '#444'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#A9A9A9'
                        },
                        grid: {
                            color: '#444'
                        }
                    }
                }
            }
        });
    }

    // Table rendering
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
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                visitors: 0 // Real website analytics not implemented yet
            });
        }
        return data;
    }

    generatePageViewsData() {
        return [
            { page: 'Home', views: 0 },
            { page: 'Games', views: 0 },
            { page: 'About', views: 0 },
            { page: 'News', views: 0 },
            { page: 'Community', views: 0 }
        ];
    }

    generateDailyPlayersData() {
        const data = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            data.push({
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                players: 0, // Real player data from backend will be used when available
                newPlayers: 0
            });
        }
        return data;
    }

    generateRevenueTrendData() {
        return [
            { month: 'Jan', revenue: 0 },
            { month: 'Feb', revenue: 0 },
            { month: 'Mar', revenue: 0 },
            { month: 'Apr', revenue: 0 },
            { month: 'May', revenue: 0 },
            { month: 'Jun', revenue: 0 }
        ];
    }

    generatePatreonGrowthData() {
        return [
            { month: 'Jan', supporters: 0, revenue: 0 },
            { month: 'Feb', supporters: 0, revenue: 0 },
            { month: 'Mar', supporters: 0, revenue: 0 },
            { month: 'Apr', supporters: 0, revenue: 0 },
            { month: 'May', supporters: 0, revenue: 0 },
            { month: 'Jun', supporters: 0, revenue: 0 }
        ];
    }

    generateMRRData() {
        return [
            { month: 'Jan', mrr: 0 },
            { month: 'Feb', mrr: 0 },
            { month: 'Mar', mrr: 0 },
            { month: 'Apr', mrr: 0 },
            { month: 'May', mrr: 0 },
            { month: 'Jun', mrr: 0 }
        ];
    }

    generateProfitMarginData() {
        return [
            { month: 'Jan', margin: 0 },
            { month: 'Feb', margin: 0 },
            { month: 'Mar', margin: 0 },
            { month: 'Apr', margin: 0 },
            { month: 'May', margin: 0 },
            { month: 'Jun', margin: 0 }
        ];
    }

    // Chart options
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
                        color: '#444'
                    }
                },
                y: {
                    ticks: {
                        color: '#A9A9A9'
                    },
                    grid: {
                        color: '#444'
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
                        },
                        padding: 20
                    }
                }
            }
        };
    }
}

// Global functions for button handlers
function switchTab(event, tabName) {
    // Remove active class from all tab buttons and content
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked button and corresponding content
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Update current tab
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

function exportToPDF() {
    if (typeof jsPDF === 'undefined') {
        alert('PDF export library not loaded');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Steel Canvas Studio - Analytics Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
    
    if (window.dashboard && window.dashboard.dashboardData) {
        const data = window.dashboard.dashboardData;
        
        // Website metrics
        doc.setFontSize(16);
        doc.text('Website Analytics', 20, 50);
        doc.setFontSize(12);
        doc.text(`Total Visitors: ${data.website.totalVisitors.toLocaleString()}`, 20, 60);
        doc.text(`Page Views: ${data.website.pageViews.toLocaleString()}`, 20, 70);
        doc.text(`Bounce Rate: ${data.website.bounceRate}%`, 20, 80);
        
        // Game metrics
        doc.setFontSize(16);
        doc.text('Game Analytics', 20, 100);
        doc.setFontSize(12);
        doc.text(`Total Players: ${data.analytics.overview.totalPlayers.toLocaleString()}`, 20, 110);
        doc.text(`Average Score: ${data.analytics.overview.averageScore.toLocaleString()}`, 20, 120);
        doc.text(`Active Sessions: ${data.analytics.overview.activeSessions}`, 20, 130);
        
        // Finance metrics
        doc.setFontSize(16);
        doc.text('Finance Analytics', 20, 150);
        doc.setFontSize(12);
        doc.text(`Total Revenue: $${data.finance.totalRevenue.toLocaleString()}`, 20, 160);
        doc.text(`Patreon Revenue: $${data.finance.patreonRevenue.toLocaleString()}`, 20, 170);
        doc.text(`Profit Margin: ${data.finance.profitMargin}%`, 20, 180);
    }
    
    doc.save('steel-canvas-analytics.pdf');
}

function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        alert('Excel export library not loaded');
        return;
    }
    
    if (!window.dashboard || !window.dashboard.dashboardData) {
        alert('No data available for export');
        return;
    }
    
    const data = window.dashboard.dashboardData;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Website data
    const websiteData = [
        ['Metric', 'Value'],
        ['Total Visitors', data.website.totalVisitors],
        ['Page Views', data.website.pageViews],
        ['Bounce Rate', `${data.website.bounceRate}%`],
        ['Avg Session Duration', `${data.website.avgSessionDuration}s`],
        ['Newsletter Signups', data.website.newsletterSignups],
        ['SEO Score', data.website.seoScore]
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(websiteData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Website');
    
    // Game data
    const gameData = [
        ['Metric', 'Value'],
        ['Total Players', data.analytics.overview.totalPlayers],
        ['New Players', data.analytics.overview.newPlayers],
        ['Active Sessions', data.analytics.overview.activeSessions],
        ['Average Score', data.analytics.overview.averageScore],
        ['Highest Score', data.analytics.overview.highestScore],
        ['Daily Active Users', data.analytics.overview.dau]
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(gameData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Game');
    
    // Finance data
    const financeData = [
        ['Metric', 'Value'],
        ['Total Revenue', `$${data.finance.totalRevenue}`],
        ['Patreon Revenue', `$${data.finance.patreonRevenue}`],
        ['Monthly Recurring Revenue', `$${data.finance.mrr}`],
        ['Patreon Supporters', data.finance.patreonSupporters],
        ['ARPU', `$${data.finance.arpu}`],
        ['Profit Margin', `${data.finance.profitMargin}%`]
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(financeData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Finance');
    
    // Save file
    XLSX.writeFile(wb, 'steel-canvas-analytics.xlsx');
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    window.dashboard = new AdminDashboard();
});