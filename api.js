/**
 * Steel Canvas Studio API Client
 * Handles API requests with graceful fallbacks and caching
 */

class SteelCanvasAPI {
    constructor() {
        // AWS Elastic Beanstalk URL
        this.awsApiUrl = 'http://steelcanvas-backend-env.eba-xajgzdxm.us-east-2.elasticbeanstalk.com/api/public';
        
        // Local backend for development
        this.baseUrl = 'http://localhost:8081/api/public';
        this.websocketUrl = 'ws://localhost:8081/ws';
        
        // Configuration
        this.cachePrefix = 'steelcanvas_';
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        this.fallbackData = this.getFallbackData();
        this.websocketConnected = false;
        this.stompClient = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.pollingInterval = null;
        this.useWebSocket = true;
        this.useAWS = true; // Prefer AWS API for public statistics
    }

    /**
     * Fallback data for when the backend is offline
     */
    getFallbackData() {
        return {
            overview: {
                totalPlayers: 1247,
                playersToday: 23,
                sessionsToday: 67,
                averageScore: 8543,
                highScore: 25670
            },
            leaderboard: [
                {
                    id: '1',
                    player: { username: 'DragonSlayer91' },
                    score: 25670,
                    maxCrowdSize: 189,
                    createdAt: '2025-01-08T14:30:00Z'
                },
                {
                    id: '2',
                    player: { username: 'TacticalMaster' },
                    score: 23450,
                    maxCrowdSize: 176,
                    createdAt: '2025-01-08T13:15:00Z'
                },
                {
                    id: '3',
                    player: { username: 'LegionCommander' },
                    score: 21890,
                    maxCrowdSize: 165,
                    createdAt: '2025-01-08T12:45:00Z'
                },
                {
                    id: '4',
                    player: { username: 'MedievalHero' },
                    score: 20540,
                    maxCrowdSize: 158,
                    createdAt: '2025-01-08T11:20:00Z'
                },
                {
                    id: '5',
                    player: { username: 'WarChief' },
                    score: 19870,
                    maxCrowdSize: 152,
                    createdAt: '2025-01-08T10:55:00Z'
                }
            ],
            recentActivity: [
                {
                    id: '1',
                    player: { username: 'NewPlayer123' },
                    score: 1250,
                    maxCrowdSize: 45,
                    createdAt: '2025-01-08T15:30:00Z'
                },
                {
                    id: '2',
                    player: { username: 'ReturningSoldier' },
                    score: 8940,
                    maxCrowdSize: 89,
                    createdAt: '2025-01-08T15:25:00Z'
                },
                {
                    id: '3',
                    player: { username: 'BattleVeteran' },
                    score: 15670,
                    maxCrowdSize: 134,
                    createdAt: '2025-01-08T15:20:00Z'
                }
            ]
        };
    }

    /**
     * Check if cached data is still valid
     */
    isCacheValid(timestamp) {
        return (Date.now() - timestamp) < this.cacheDuration;
    }

    /**
     * Get data from sessionStorage cache
     */
    getCachedData(key) {
        try {
            const cached = sessionStorage.getItem(this.cachePrefix + key);
            if (cached) {
                const data = JSON.parse(cached);
                if (this.isCacheValid(data.timestamp)) {
                    return data.value;
                }
            }
        } catch (e) {
            console.warn('Failed to parse cached data:', e);
        }
        return null;
    }

    /**
     * Store data in sessionStorage cache
     */
    setCachedData(key, value) {
        try {
            sessionStorage.setItem(this.cachePrefix + key, JSON.stringify({
                value: value,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Failed to cache data:', e);
        }
    }

    /**
     * Make API request with AWS and local backend fallback handling
     */
    async apiRequest(endpoint, fallbackKey) {
        // Try AWS API first for public statistics
        if (this.useAWS && this.isPublicEndpoint(endpoint)) {
            try {
                console.log(`🌐 Fetching data from AWS API: ${endpoint}`);
                const awsEndpoint = this.mapToAWSEndpoint(endpoint);
                const response = await fetch(`${this.awsApiUrl}${awsEndpoint}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: AbortSignal.timeout(8000)
                });

                if (response.ok) {
                    const data = await response.json();
                    this.setCachedData(endpoint, data);
                    console.log(`✅ Successfully fetched data from AWS API: ${endpoint}`);
                    return data;
                }
                
                console.warn(`⚠️ AWS API returned ${response.status}, trying local backend`);
            } catch (awsError) {
                console.warn(`⚠️ AWS API failed for ${endpoint}: ${awsError.message}`);
            }
        }

        // Try local backend
        try {
            console.log(`🔍 Fetching data from local backend: ${this.baseUrl}${endpoint}`);
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.setCachedData(endpoint, data);
            console.log(`✅ Successfully fetched data from local backend: ${endpoint}`);
            return data;

        } catch (error) {
            console.error(`❌ Backend connection failed for ${endpoint}:`, error.message);
            
            // Check if we have recent cached data
            const cachedData = this.getCachedData(endpoint);
            if (cachedData) {
                console.log(`🔄 Using cached data for ${endpoint}`);
                return cachedData;
            }
            
            // Use fallback data as last resort
            console.warn(`⚠️ Using fallback data for ${endpoint}`);
            return this.fallbackData[fallbackKey];
        }
    }

    /**
     * Check if endpoint should use AWS public API
     */
    isPublicEndpoint(endpoint) {
        const publicEndpoints = ['/stats/overview', '/leaderboard/top10', '/activity/recent'];
        return publicEndpoints.includes(endpoint);
    }

    /**
     * Map local endpoint to AWS Elastic Beanstalk endpoint
     */
    mapToAWSEndpoint(endpoint) {
        const mapping = {
            '/stats/overview': '/stats',
            '/leaderboard/top10': '/leaderboard/top10',
            '/activity/recent': '/activity/recent'
        };
        return mapping[endpoint] || endpoint;
    }

    /**
     * Get overview statistics
     */
    async getOverviewStats() {
        return await this.apiRequest('/stats/overview', 'overview');
    }

    /**
     * Get top 10 leaderboard
     */
    async getTop10Leaderboard() {
        return await this.apiRequest('/leaderboard/top10', 'leaderboard');
    }

    /**
     * Get recent activity
     */
    async getRecentActivity() {
        return await this.apiRequest('/activity/recent', 'recentActivity');
    }

    /**
     * Format number with commas
     */
    formatNumber(num) {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString();
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Recently';
        }
    }

    /**
     * Check if the backend is healthy
     */
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseUrl.replace('/public', '')}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(3000)
            });
            return response.ok;
        } catch (error) {
            console.warn('Health check failed:', error.message);
            return false;
        }
    }

    /**
     * Initialize WebSocket connection with STOMP protocol
     */
    initializeWebSocket() {
        if (!this.useWebSocket) {
            console.log('WebSocket disabled, using polling mode');
            this.startPolling();
            return;
        }

        try {
            // Use SockJS for better compatibility
            const socket = new SockJS(`${this.websocketUrl}`);
            this.stompClient = Stomp.over(socket);
            
            // Disable debug logging
            this.stompClient.debug = null;
            
            const connectHeaders = {};
            
            this.stompClient.connect(connectHeaders, 
                (frame) => {
                    this.onWebSocketConnect(frame);
                },
                (error) => {
                    this.onWebSocketError(error);
                }
            );
            
            // Handle connection close
            socket.onclose = () => {
                this.onWebSocketDisconnect();
            };
            
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            this.fallbackToPolling();
        }
    }

    /**
     * Handle successful WebSocket connection
     */
    onWebSocketConnect(frame) {
        console.log('✅ WebSocket connected successfully');
        this.websocketConnected = true;
        this.reconnectAttempts = 0;
        
        // Stop polling if it was running
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        
        // Subscribe to data updates
        this.subscribeToUpdates();
        
        // Request initial data
        this.requestInitialData();
    }

    /**
     * Handle WebSocket connection error
     */
    onWebSocketError(error) {
        console.error('❌ WebSocket connection error:', error);
        this.websocketConnected = false;
        this.attemptReconnect();
    }

    /**
     * Handle WebSocket disconnection
     */
    onWebSocketDisconnect() {
        console.warn('⚠️ WebSocket disconnected');
        this.websocketConnected = false;
        this.attemptReconnect();
    }

    /**
     * Attempt to reconnect WebSocket
     */
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('Max reconnection attempts reached, falling back to polling');
            this.fallbackToPolling();
            return;
        }
        
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        setTimeout(() => {
            this.initializeWebSocket();
        }, this.reconnectDelay * this.reconnectAttempts);
    }

    /**
     * Fallback to polling mode when WebSocket fails
     */
    fallbackToPolling() {
        console.log('🔄 Falling back to polling mode');
        this.useWebSocket = false;
        this.websocketConnected = false;
        this.startPolling();
    }

    /**
     * Subscribe to WebSocket data updates
     */
    subscribeToUpdates() {
        if (!this.stompClient || !this.websocketConnected) return;
        
        // Subscribe to stats updates
        this.stompClient.subscribe('/topic/stats', (message) => {
            const data = JSON.parse(message.body);
            this.handleStatsUpdate(data);
        });
        
        // Subscribe to leaderboard updates
        this.stompClient.subscribe('/topic/leaderboard', (message) => {
            const data = JSON.parse(message.body);
            this.handleLeaderboardUpdate(data);
        });
        
        // Subscribe to activity updates
        this.stompClient.subscribe('/topic/activity', (message) => {
            const data = JSON.parse(message.body);
            this.handleActivityUpdate(data);
        });
        
        console.log('📡 Subscribed to WebSocket updates');
    }

    /**
     * Request initial data via WebSocket
     */
    requestInitialData() {
        if (!this.stompClient || !this.websocketConnected) return;
        
        this.stompClient.send('/app/stats/request', {}, JSON.stringify({}));
        this.stompClient.send('/app/leaderboard/request', {}, JSON.stringify({}));
        this.stompClient.send('/app/activity/request', {}, JSON.stringify({}));
        
        console.log('📤 Requested initial data via WebSocket');
    }

    /**
     * Handle real-time stats update
     */
    handleStatsUpdate(data) {
        if (data.error) {
            console.error('Stats update error:', data.error);
            return;
        }
        
        this.updateStatsDisplay(data);
        console.log('📊 Stats updated via WebSocket');
    }

    /**
     * Handle real-time leaderboard update
     */
    handleLeaderboardUpdate(data) {
        if (data.error) {
            console.error('Leaderboard update error:', data.error);
            return;
        }
        
        this.updateLeaderboardDisplay(data);
        console.log('🏆 Leaderboard updated via WebSocket');
    }

    /**
     * Handle real-time activity update
     */
    handleActivityUpdate(data) {
        if (data.error) {
            console.error('Activity update error:', data.error);
            return;
        }
        
        this.updateActivityDisplay(data);
        console.log('🎮 Activity updated via WebSocket');
    }

    /**
     * Start polling mode for when WebSocket is unavailable
     */
    startPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        // Initial update
        this.updateAllData();
        
        // Set up polling every 30 seconds
        this.pollingInterval = setInterval(() => {
            this.updateAllData();
        }, 30000);
        
        console.log('🔄 Polling mode started (30s intervals)');
    }

    /**
     * Update all data (for polling mode)
     */
    async updateAllData() {
        await Promise.all([
            this.updateLiveStats(),
            this.updateLeaderboard(),
            this.updateRecentActivity()
        ]);
    }

    /**
     * Update UI elements with live stats (polling mode)
     */
    async updateLiveStats() {
        try {
            const overview = await this.getOverviewStats();
            this.updateStatsDisplay(overview);
            console.log('Live stats updated successfully');
        } catch (error) {
            console.error('Failed to update live stats:', error);
        }
    }

    /**
     * Update stats display with data
     */
    updateStatsDisplay(overview) {
        // Update total players
        const totalPlayersEl = document.getElementById('total-players');
        if (totalPlayersEl && overview.totalPlayers !== undefined) {
            totalPlayersEl.textContent = this.formatNumber(overview.totalPlayers);
        }

        // Update players today
        const playersTodayEl = document.getElementById('players-today');
        if (playersTodayEl && overview.playersToday !== undefined) {
            playersTodayEl.textContent = this.formatNumber(overview.playersToday);
        }

        // Update sessions today
        const sessionsTodayEl = document.getElementById('sessions-today');
        if (sessionsTodayEl && overview.sessionsToday !== undefined) {
            sessionsTodayEl.textContent = this.formatNumber(overview.sessionsToday);
        }

        // Update average score
        const avgScoreEl = document.getElementById('average-score');
        if (avgScoreEl && overview.averageScore !== undefined) {
            avgScoreEl.textContent = this.formatNumber(overview.averageScore);
        }

        // Update high score
        const highScoreEl = document.getElementById('high-score');
        if (highScoreEl && overview.highScore !== undefined) {
            highScoreEl.textContent = this.formatNumber(overview.highScore);
        }
    }

    /**
     * Update leaderboard display (polling mode)
     */
    async updateLeaderboard() {
        try {
            const leaderboard = await this.getTop10Leaderboard();
            this.updateLeaderboardDisplay(leaderboard);
            console.log('Leaderboard updated successfully');
        } catch (error) {
            console.error('Failed to update leaderboard:', error);
        }
    }

    /**
     * Update leaderboard display with data
     */
    updateLeaderboardDisplay(leaderboard) {
        const leaderboardEl = document.getElementById('leaderboard-list');
        
        if (leaderboardEl && Array.isArray(leaderboard)) {
            leaderboardEl.innerHTML = leaderboard.slice(0, 5).map((entry, index) => `
                <div class="leaderboard-entry">
                    <span class="rank">#${index + 1}</span>
                    <span class="username">${entry.player?.username || 'Unknown'}</span>
                    <span class="score">${this.formatNumber(entry.score || 0)}</span>
                </div>
            `).join('');
        }
    }

    /**
     * Update recent activity display (polling mode)
     */
    async updateRecentActivity() {
        try {
            const activity = await this.getRecentActivity();
            this.updateActivityDisplay(activity);
            console.log('Recent activity updated successfully');
        } catch (error) {
            console.error('Failed to update recent activity:', error);
        }
    }

    /**
     * Update activity display with data
     */
    updateActivityDisplay(activity) {
        const activityEl = document.getElementById('recent-activity');
        
        if (activityEl && Array.isArray(activity)) {
            activityEl.innerHTML = activity.slice(0, 3).map(entry => `
                <div class="activity-entry">
                    <span class="username">${entry.player?.username || 'Player'}</span>
                    <span class="score">scored ${this.formatNumber(entry.score || 0)}</span>
                    <span class="time">${this.formatDate(entry.createdAt)}</span>
                </div>
            `).join('');
        }
    }

    /**
     * Initialize and start real-time or periodic updates
     */
    async initialize() {
        console.log('Initializing Steel Canvas API client...');
        
        // Check if WebSocket libraries are available
        if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
            console.warn('WebSocket libraries not available, falling back to polling');
            this.useWebSocket = false;
        }
        
        // Try WebSocket first, fallback to polling on failure
        if (this.useWebSocket) {
            try {
                this.initializeWebSocket();
            } catch (error) {
                console.error('WebSocket initialization failed:', error);
                this.fallbackToPolling();
            }
        } else {
            this.startPolling();
        }

        console.log('Steel Canvas API client initialized successfully');
    }
}

// Create global instance
window.steelCanvasAPI = new SteelCanvasAPI();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.steelCanvasAPI.initialize();
    });
} else {
    window.steelCanvasAPI.initialize();
}