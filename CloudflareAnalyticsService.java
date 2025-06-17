package com.steelcanvas.pocketlegion.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for fetching real website analytics from Cloudflare API
 * Integrates with AWS Lambda function that calls Cloudflare Analytics API
 */
@Service
public class CloudflareAnalyticsService {

    @Value("${cloudflare.analytics.enabled:true}")
    private boolean cloudflareAnalyticsEnabled;
    
    @Value("${aws.api.gateway.url:}")
    private String awsApiGatewayUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private Map<String, Object> cachedAnalytics = new HashMap<>();
    private LocalDateTime lastFetch = LocalDateTime.now().minusHours(1);
    
    /**
     * Fetch website analytics from AWS Lambda (which calls Cloudflare API)
     */
    @Scheduled(fixedRate = 600000) // Every 10 minutes
    public void fetchWebsiteAnalytics() {
        if (!cloudflareAnalyticsEnabled) {
            System.out.println("🚫 Cloudflare analytics disabled");
            return;
        }
        
        try {
            System.out.println("📊 Fetching website analytics from Cloudflare...");
            
            // Call AWS Lambda function that fetches from Cloudflare
            String analyticsUrl = awsApiGatewayUrl + "/cloudflare/analytics?days=7";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Content-Type", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                analyticsUrl, 
                HttpMethod.GET, 
                entity, 
                String.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                JsonNode analyticsData = objectMapper.readTree(response.getBody());
                processAnalyticsData(analyticsData);
                lastFetch = LocalDateTime.now();
                System.out.println("✅ Cloudflare analytics fetched successfully");
            } else {
                System.err.println("❌ Failed to fetch analytics: " + response.getStatusCode());
                useFallbackAnalytics();
            }
            
        } catch (Exception e) {
            System.err.println("❌ Error fetching Cloudflare analytics: " + e.getMessage());
            useFallbackAnalytics();
        }
    }
    
    /**
     * Process analytics data from AWS Lambda response
     */
    private void processAnalyticsData(JsonNode analyticsData) {
        try {
            Map<String, Object> processedData = new HashMap<>();
            
            // Extract overview data
            if (analyticsData.has("overview")) {
                JsonNode overview = analyticsData.get("overview");
                
                Map<String, Object> overviewData = new HashMap<>();
                overviewData.put("totalRequests", overview.get("totalRequests").asInt(0));
                overviewData.put("totalPageViews", overview.get("totalPageViews").asInt(0));
                overviewData.put("uniqueVisitors", overview.get("uniqueVisitors").asInt(0));
                overviewData.put("totalBytes", overview.get("totalBytes").asLong(0));
                overviewData.put("cacheHitRate", overview.get("cacheHitRate").asDouble(0.0));
                overviewData.put("bandwidthSaved", overview.get("bandwidthSaved").asDouble(0.0));
                
                processedData.put("overview", overviewData);
            }
            
            // Extract pageview trends
            if (analyticsData.has("pageviews")) {
                JsonNode pageviews = analyticsData.get("pageviews");
                List<Map<String, Object>> pageviewTrends = new ArrayList<>();
                
                for (JsonNode pageview : pageviews) {
                    Map<String, Object> trend = new HashMap<>();
                    trend.put("datetime", pageview.get("datetime").asText());
                    trend.put("pageViews", pageview.get("pageViews").asInt(0));
                    trend.put("uniqueVisitors", pageview.get("uniqueVisitors").asInt(0));
                    pageviewTrends.add(trend);
                }
                
                processedData.put("pageviewTrends", pageviewTrends);
            }
            
            // Extract top pages
            if (analyticsData.has("topPages")) {
                JsonNode topPages = analyticsData.get("topPages");
                List<Map<String, Object>> topPagesData = new ArrayList<>();
                
                for (JsonNode page : topPages) {
                    Map<String, Object> pageData = new HashMap<>();
                    pageData.put("path", page.get("path").asText());
                    pageData.put("views", page.get("views").asInt(0));
                    pageData.put("uniqueVisitors", page.get("uniqueVisitors").asInt(0));
                    pageData.put("bounceRate", page.get("bounceRate").asDouble(0.0));
                    topPagesData.add(pageData);
                }
                
                processedData.put("topPages", topPagesData);
            }
            
            // Add metadata
            processedData.put("lastUpdated", LocalDateTime.now().toString());
            processedData.put("source", "cloudflare_analytics_api");
            processedData.put("success", analyticsData.get("success").asBoolean(false));
            
            if (analyticsData.has("period")) {
                JsonNode period = analyticsData.get("period");
                Map<String, Object> periodData = new HashMap<>();
                periodData.put("since", period.get("since").asText());
                periodData.put("until", period.get("until").asText());
                periodData.put("days", period.get("days").asInt(7));
                processedData.put("period", periodData);
            }
            
            // Cache the processed data
            cachedAnalytics = processedData;
            
        } catch (Exception e) {
            System.err.println("Failed to process analytics data: " + e.getMessage());
            useFallbackAnalytics();
        }
    }
    
    /**
     * Get current website analytics data
     */
    public Map<String, Object> getWebsiteAnalytics() {
        // If data is older than 30 minutes, try to fetch fresh data
        if (lastFetch.isBefore(LocalDateTime.now().minusMinutes(30)) && cloudflareAnalyticsEnabled) {
            try {
                fetchWebsiteAnalytics();
            } catch (Exception e) {
                System.warn("Failed to refresh analytics data: " + e.getMessage());
            }
        }
        
        return cachedAnalytics.isEmpty() ? getFallbackAnalytics() : cachedAnalytics;
    }
    
    /**
     * Get analytics data formatted for admin dashboard
     */
    public Map<String, Object> getFormattedAnalytics() {
        Map<String, Object> analytics = getWebsiteAnalytics();
        Map<String, Object> formatted = new HashMap<>();
        
        // Format overview data for dashboard
        if (analytics.containsKey("overview")) {
            Map<String, Object> overview = (Map<String, Object>) analytics.get("overview");
            
            formatted.put("pageViews", overview.get("totalPageViews"));
            formatted.put("uniqueVisitors", overview.get("uniqueVisitors"));
            formatted.put("requests", overview.get("totalRequests"));
            formatted.put("bandwidth", formatBytes((Long) overview.get("totalBytes")));
            formatted.put("cacheHitRate", overview.get("cacheHitRate") + "%");
            formatted.put("bandwidthSaved", formatBytes(((Double) overview.get("bandwidthSaved")).longValue() * 1024 * 1024));
        }
        
        // Add top pages if available
        if (analytics.containsKey("topPages")) {
            formatted.put("topPages", analytics.get("topPages"));
        }
        
        // Add pageview trends for charts
        if (analytics.containsKey("pageviewTrends")) {
            formatted.put("pageviewTrends", analytics.get("pageviewTrends"));
        }
        
        formatted.put("configured", true);
        formatted.put("success", analytics.get("success"));
        formatted.put("lastUpdated", analytics.get("lastUpdated"));
        formatted.put("dataSource", analytics.get("source"));
        
        return formatted;
    }
    
    /**
     * Fallback analytics data when Cloudflare API is unavailable
     */
    private void useFallbackAnalytics() {
        cachedAnalytics = getFallbackAnalytics();
    }
    
    private Map<String, Object> getFallbackAnalytics() {
        Map<String, Object> fallback = new HashMap<>();
        
        // Fallback overview data
        Map<String, Object> overview = new HashMap<>();
        overview.put("totalRequests", 1250);
        overview.put("totalPageViews", 356);
        overview.put("uniqueVisitors", 127);
        overview.put("totalBytes", 15728640L); // ~15MB
        overview.put("cacheHitRate", 88.0);
        overview.put("bandwidthSaved", 110.0);
        fallback.put("overview", overview);
        
        // Fallback top pages
        List<Map<String, Object>> topPages = new ArrayList<>();
        topPages.add(createPageData("/", 156, 89, 32.5));
        topPages.add(createPageData("/games", 89, 67, 28.1));
        topPages.add(createPageData("/about", 67, 45, 41.2));
        topPages.add(createPageData("/pocket-legion", 45, 34, 15.7));
        topPages.add(createPageData("/news", 34, 28, 55.9));
        fallback.put("topPages", topPages);
        
        // Generate hourly trends
        List<Map<String, Object>> trends = generateSampleTrends();
        fallback.put("pageviewTrends", trends);
        
        fallback.put("lastUpdated", LocalDateTime.now().toString());
        fallback.put("source", "fallback_cloudflare_analytics");
        fallback.put("success", false);
        fallback.put("warning", "Using fallback data - Cloudflare API may be unavailable");
        
        return fallback;
    }
    
    private Map<String, Object> createPageData(String path, int views, int uniqueVisitors, double bounceRate) {
        Map<String, Object> page = new HashMap<>();
        page.put("path", path);
        page.put("views", views);
        page.put("uniqueVisitors", uniqueVisitors);
        page.put("bounceRate", bounceRate);
        return page;
    }
    
    private List<Map<String, Object>> generateSampleTrends() {
        List<Map<String, Object>> trends = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = 23; i >= 0; i--) {
            LocalDateTime datetime = now.minusHours(i);
            Map<String, Object> trend = new HashMap<>();
            trend.put("datetime", datetime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            trend.put("pageViews", (int) (Math.random() * 20) + 5);
            trend.put("uniqueVisitors", (int) (Math.random() * 15) + 3);
            trends.add(trend);
        }
        
        return trends;
    }
    
    /**
     * Format bytes to human readable format
     */
    private String formatBytes(Long bytes) {
        if (bytes == null) return "0 B";
        
        String[] units = {"B", "KB", "MB", "GB", "TB"};
        int unitIndex = 0;
        double size = bytes.doubleValue();
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.1f %s", size, units[unitIndex]);
    }
    
    /**
     * Get service status for monitoring
     */
    public Map<String, Object> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("cloudflareAnalyticsEnabled", cloudflareAnalyticsEnabled);
        status.put("awsApiGatewayUrl", awsApiGatewayUrl);
        status.put("lastFetchTime", lastFetch.toString());
        status.put("cacheSize", cachedAnalytics.size());
        status.put("dataAge", lastFetch.until(LocalDateTime.now(), java.time.temporal.ChronoUnit.MINUTES) + " minutes");
        
        return status;
    }
}