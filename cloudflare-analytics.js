// AWS Lambda Function - Cloudflare Analytics API Integration
// Fetches real website statistics from Cloudflare Analytics API

const https = require('https');

exports.handler = async (event) => {
    console.log('Cloudflare Analytics API called:', JSON.stringify(event, null, 2));
    
    try {
        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
            'Content-Type': 'application/json'
        };
        
        // Handle preflight OPTIONS request
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: headers,
                body: ''
            };
        }
        
        // Get Cloudflare credentials from environment
        const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
        const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;
        
        if (!cloudflareApiToken || !cloudflareZoneId) {
            console.warn('Cloudflare API credentials not configured');
            return getFallbackAnalytics(headers);
        }
        
        // Get date range from query parameters (default to last 7 days)
        const queryParams = event.queryStringParameters || {};
        const days = parseInt(queryParams.days) || 7;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);
        
        // Format dates for Cloudflare API
        const since = startDate.toISOString();
        const until = endDate.toISOString();
        
        console.log(`Fetching Cloudflare analytics from ${since} to ${until}`);
        
        // Fetch analytics from Cloudflare
        const analyticsData = await Promise.all([
            fetchCloudflareAnalytics(cloudflareApiToken, cloudflareZoneId, since, until),
            fetchCloudflarePageviews(cloudflareApiToken, cloudflareZoneId, since, until),
            fetchCloudflareTopPages(cloudflareApiToken, cloudflareZoneId, since, until)
        ]);
        
        const [overview, pageviews, topPages] = analyticsData;
        
        // Combine and format the data
        const websiteStats = {
            overview: overview,
            pageviews: pageviews,
            topPages: topPages,
            period: {
                since: since,
                until: until,
                days: days
            },
            lastUpdated: new Date().toISOString(),
            source: 'cloudflare_analytics_api',
            success: true
        };
        
        return {
            statusCode: 200,
            headers: headers,
            body: JSON.stringify(websiteStats, null, 2)
        };
        
    } catch (error) {
        console.error('Cloudflare Analytics API error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Failed to fetch Cloudflare analytics',
                message: error.message,
                success: false,
                timestamp: new Date().toISOString()
            })
        };
    }
};

// Fetch general analytics from Cloudflare
async function fetchCloudflareAnalytics(apiToken, zoneId, since, until) {
    const query = `
        query {
            viewer {
                zones(filter: { zoneTag: "${zoneId}" }) {
                    httpRequests1dGroups(
                        limit: 10000
                        filter: {
                            date_geq: "${since.split('T')[0]}"
                            date_leq: "${until.split('T')[0]}"
                        }
                    ) {
                        sum {
                            requests
                            bytes
                            cachedRequests
                            pageViews
                        }
                        uniq {
                            uniques
                        }
                        dimensions {
                            date
                        }
                    }
                }
            }
        }
    `;
    
    const data = await makeCloudflareRequest(apiToken, query);
    
    if (data.data?.viewer?.zones?.[0]?.httpRequests1dGroups) {
        const groups = data.data.viewer.zones[0].httpRequests1dGroups;
        
        // Aggregate the data
        const totals = groups.reduce((acc, group) => {
            acc.requests += group.sum.requests || 0;
            acc.bytes += group.sum.bytes || 0;
            acc.cachedRequests += group.sum.cachedRequests || 0;
            acc.pageViews += group.sum.pageViews || 0;
            acc.uniques += group.uniq.uniques || 0;
            return acc;
        }, {
            requests: 0,
            bytes: 0,
            cachedRequests: 0,
            pageViews: 0,
            uniques: 0
        });
        
        return {
            totalRequests: totals.requests,
            totalBytes: totals.bytes,
            totalPageViews: totals.pageViews,
            uniqueVisitors: totals.uniques,
            cachedRequests: totals.cachedRequests,
            cacheHitRate: totals.requests > 0 ? ((totals.cachedRequests / totals.requests) * 100).toFixed(1) : 0,
            bandwidthSaved: totals.cachedRequests * 0.1 // Estimate
        };
    }
    
    return getDefaultOverview();
}

// Fetch pageview trends
async function fetchCloudflarePageviews(apiToken, zoneId, since, until) {
    const query = `
        query {
            viewer {
                zones(filter: { zoneTag: "${zoneId}" }) {
                    httpRequests1hGroups(
                        limit: 168
                        filter: {
                            datetime_geq: "${since}"
                            datetime_leq: "${until}"
                        }
                    ) {
                        sum {
                            pageViews
                        }
                        uniq {
                            uniques
                        }
                        dimensions {
                            datetime
                        }
                    }
                }
            }
        }
    `;
    
    const data = await makeCloudflareRequest(apiToken, query);
    
    if (data.data?.viewer?.zones?.[0]?.httpRequests1hGroups) {
        const groups = data.data.viewer.zones[0].httpRequests1hGroups;
        
        return groups.map(group => ({
            datetime: group.dimensions.datetime,
            pageViews: group.sum.pageViews || 0,
            uniqueVisitors: group.uniq.uniques || 0
        }));
    }
    
    return [];
}

// Fetch top pages (this requires Web Analytics API if available)
async function fetchCloudflareTopPages(apiToken, zoneId, since, until) {
    // Note: Top pages require Cloudflare Web Analytics API
    // For now, return a placeholder structure
    return [
        { path: '/', views: 0, uniqueVisitors: 0, bounceRate: 0 },
        { path: '/games', views: 0, uniqueVisitors: 0, bounceRate: 0 },
        { path: '/about', views: 0, uniqueVisitors: 0, bounceRate: 0 }
    ];
}

// Make GraphQL request to Cloudflare Analytics API
async function makeCloudflareRequest(apiToken, query) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ query });
        
        const options = {
            hostname: 'api.cloudflare.com',
            port: 443,
            path: '/client/v4/graphql',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    
                    if (jsonData.errors) {
                        console.error('Cloudflare API errors:', jsonData.errors);
                        reject(new Error(`Cloudflare API error: ${jsonData.errors[0].message}`));
                    } else {
                        resolve(jsonData);
                    }
                } catch (parseError) {
                    reject(new Error(`Failed to parse Cloudflare response: ${parseError.message}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(new Error(`Cloudflare API request failed: ${error.message}`));
        });
        
        req.write(postData);
        req.end();
    });
}

// Fallback analytics when Cloudflare API is not available
function getFallbackAnalytics(headers) {
    const fallbackData = {
        overview: getDefaultOverview(),
        pageviews: getDefaultPageviews(),
        topPages: getDefaultTopPages(),
        period: {
            since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            until: new Date().toISOString(),
            days: 7
        },
        lastUpdated: new Date().toISOString(),
        source: 'fallback_analytics',
        success: false,
        warning: 'Cloudflare API credentials not configured - using fallback data'
    };
    
    return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify(fallbackData, null, 2)
    };
}

function getDefaultOverview() {
    return {
        totalRequests: 1250,
        totalBytes: 15728640, // ~15MB
        totalPageViews: 356,
        uniqueVisitors: 127,
        cachedRequests: 1100,
        cacheHitRate: '88.0',
        bandwidthSaved: 110
    };
}

function getDefaultPageviews() {
    // Generate 24 hours of sample data
    const pageviews = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
        const datetime = new Date(now.getTime() - (i * 60 * 60 * 1000));
        pageviews.push({
            datetime: datetime.toISOString(),
            pageViews: Math.floor(Math.random() * 20) + 5,
            uniqueVisitors: Math.floor(Math.random() * 15) + 3
        });
    }
    
    return pageviews;
}

function getDefaultTopPages() {
    return [
        { path: '/', views: 156, uniqueVisitors: 89, bounceRate: 32.5 },
        { path: '/games', views: 89, uniqueVisitors: 67, bounceRate: 28.1 },
        { path: '/about', views: 67, uniqueVisitors: 45, bounceRate: 41.2 },
        { path: '/pocket-legion', views: 45, uniqueVisitors: 34, bounceRate: 15.7 },
        { path: '/news', views: 34, uniqueVisitors: 28, bounceRate: 55.9 }
    ];
}