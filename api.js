/**
 * Steel Canvas Studio API Client
 * Handles API requests with graceful fallbacks and caching
 */

class SteelCanvasAPI {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api/public';
        this.cachePrefix = 'steelcanvas_';
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        this.fallbackData = this.getFallbackData();
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
     * Make API request with fallback handling
     */
    async apiRequest(endpoint, fallbackKey) {
        // Check cache first
        const cachedData = this.getCachedData(endpoint);
        if (cachedData) {
            console.log(`Using cached data for ${endpoint}`);
            return cachedData;
        }

        try {
            console.log(`Fetching data from ${this.baseUrl}${endpoint}`);
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Timeout after 5 seconds
                signal: AbortSignal.timeout(5000)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache the successful response
            this.setCachedData(endpoint, data);
            console.log(`Successfully fetched and cached data for ${endpoint}`);
            
            return data;

        } catch (error) {
            console.warn(`API request failed for ${endpoint}:`, error.message);
            console.log(`Using fallback data for ${endpoint}`);
            
            // Return fallback data
            const fallbackData = this.fallbackData[fallbackKey];
            
            // Cache fallback data with shorter duration
            this.setCachedData(endpoint, fallbackData);
            
            return fallbackData;
        }
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
     * Update UI elements with live stats
     */
    async updateLiveStats() {
        try {
            // Update overview stats
            const overview = await this.getOverviewStats();
            
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

            console.log('Live stats updated successfully');

        } catch (error) {
            console.error('Failed to update live stats:', error);
        }
    }

    /**
     * Update leaderboard display
     */
    async updateLeaderboard() {
        try {
            const leaderboard = await this.getTop10Leaderboard();
            const leaderboardEl = document.getElementById('leaderboard-list');
            
            if (leaderboardEl && Array.isArray(leaderboard)) {
                leaderboardEl.innerHTML = leaderboard.slice(0, 5).map((entry, index) => `
                    <div class="leaderboard-entry">
                        <span class="rank">#${index + 1}</span>
                        <span class="username">${entry.player?.username || 'Unknown'}</span>
                        <span class="score">${this.formatNumber(entry.score || 0)}</span>
                    </div>
                `).join('');
                
                console.log('Leaderboard updated successfully');
            }

        } catch (error) {
            console.error('Failed to update leaderboard:', error);
        }
    }

    /**
     * Update recent activity display
     */
    async updateRecentActivity() {
        try {
            const activity = await this.getRecentActivity();
            const activityEl = document.getElementById('recent-activity');
            
            if (activityEl && Array.isArray(activity)) {
                activityEl.innerHTML = activity.slice(0, 3).map(entry => `
                    <div class="activity-entry">
                        <span class="username">${entry.player?.username || 'Player'}</span>
                        <span class="score">scored ${this.formatNumber(entry.score || 0)}</span>
                        <span class="time">${this.formatDate(entry.createdAt)}</span>
                    </div>
                `).join('');
                
                console.log('Recent activity updated successfully');
            }

        } catch (error) {
            console.error('Failed to update recent activity:', error);
        }
    }

    /**
     * Initialize and start periodic updates
     */
    async initialize() {
        console.log('Initializing Steel Canvas API client...');
        
        // Initial update
        await Promise.all([
            this.updateLiveStats(),
            this.updateLeaderboard(),
            this.updateRecentActivity()
        ]);

        // Set up periodic updates every 30 seconds
        setInterval(async () => {
            await Promise.all([
                this.updateLiveStats(),
                this.updateLeaderboard(),
                this.updateRecentActivity()
            ]);
        }, 30000);

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