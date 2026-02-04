package org.hsbc.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/yfdata")
@CrossOrigin(origins = "*")
public class StockDataController {

    private static final Logger logger = LoggerFactory.getLogger(StockDataController.class);

    @Value("${flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;

    private final RestTemplate restTemplate;

    public StockDataController() {
        this.restTemplate = new RestTemplate();
        logger.info("StockDataController initialized");
    }

    /**
     * Get stock data by ticker symbol
     * @param symbol Stock ticker symbol (e.g., AAPL, MSFT)
     * @return Stock data including price, volume, news, recommendations
     */
    @GetMapping(value = "/stocks/{symbol}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getStock(@PathVariable String symbol) {
        logger.info("Request received for stock: {}", symbol);
        try {
            String url = flaskApiUrl + "/api/stocks/" + symbol.toUpperCase();
            logger.debug("Calling Flask API: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            logger.info("Successfully fetched stock data for: {}", symbol);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Stock not found: {}", symbol);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Stock not found"));
        } catch (Exception e) {
            logger.error("Error fetching stock data for {}: {}", symbol, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Error fetching stock data: " + e.getMessage()));
        }
    }

    /**
     * Get cryptocurrency data by symbol
     * @param symbol Crypto symbol (e.g., BTC, ETH)
     * @return Cryptocurrency data including price, market cap, volume
     */
    @GetMapping(value = "/crypto/{symbol}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getCrypto(@PathVariable String symbol) {
        logger.info("Request received for crypto: {}", symbol);
        try {
            String url = flaskApiUrl + "/api/crypto/" + symbol.toUpperCase();
            logger.debug("Calling Flask API: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            logger.info("Successfully fetched crypto data for: {}", symbol);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Cryptocurrency not found: {}", symbol);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Cryptocurrency not found"));
        } catch (Exception e) {
            logger.error("Error fetching crypto data for {}: {}", symbol, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Error fetching crypto data: " + e.getMessage()));
        }
    }

    /**
     * Get mutual fund data by symbol
     * @param symbol Mutual fund symbol
     * @return Mutual fund data including NAV, returns, holdings
     */
    @GetMapping(value = "/mutual-funds/{symbol}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMutualFund(@PathVariable String symbol) {
        logger.info("Request received for mutual fund: {}", symbol);
        try {
            String url = flaskApiUrl + "/api/mutual-funds/" + symbol.toUpperCase();
            logger.debug("Calling Flask API: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            logger.info("Successfully fetched mutual fund data for: {}", symbol);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Mutual fund not found: {}", symbol);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Mutual fund not found"));
        } catch (Exception e) {
            logger.error("Error fetching mutual fund data for {}: {}", symbol, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Error fetching mutual fund data: " + e.getMessage()));
        }
    }

    /**
     * Get commodity/futures data by symbol
     * @param symbol Commodity symbol (e.g., GC=F for Gold, CL=F for Crude Oil)
     * @return Commodity data including price, volume, changes
     */
    @GetMapping(value = "/commodities/{symbol}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getCommodity(@PathVariable String symbol) {
        logger.info("Request received for commodity: {}", symbol);
        try {
            String url = flaskApiUrl + "/api/commodities/" + symbol.toUpperCase();
            logger.debug("Calling Flask API: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            logger.info("Successfully fetched commodity data for: {}", symbol);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Commodity not found: {}", symbol);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Commodity not found"));
        } catch (Exception e) {
            logger.error("Error fetching commodity data for {}: {}", symbol, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Error fetching commodity data: " + e.getMessage()));
        }
    }

    /**
     * Get historical price data for a symbol
     * @param symbol Asset symbol
     * @param period Time period (1D, 5D, 1W, 1MO, 3MO, 6MO, 1Y, 2Y)
     * @param interval Data interval (1m, 5m, 15m, 1h, 1d, 1wk, 1mo)
     * @return Historical OHLCV data
     */
    @GetMapping(value = "/history/{symbol}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getHistory(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1MO") String period,
            @RequestParam(required = false) String interval) {
        logger.info("Request received for history: {} with period: {}, interval: {}", symbol, period, interval);
        try {
            String url = flaskApiUrl + "/api/history/" + symbol.toUpperCase() + "?period=" + period.toUpperCase();
            if (interval != null && !interval.isEmpty()) {
                url += "&interval=" + interval.toLowerCase();
            }
            logger.debug("Calling Flask API: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            logger.info("Successfully fetched history for: {} ({}, {})", symbol, period, interval);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("History not found for: {} ({}, {})", symbol, period, interval);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("History not found"));
        } catch (Exception e) {
            logger.error("Error fetching history for {} ({}, {}): {}", symbol, period, interval, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Error fetching history: " + e.getMessage()));
        }
    }

    /**
     * Get news for a specific symbol
     * @param symbol Asset symbol
     * @return Latest news articles
     */
    @GetMapping(value = "/news/{symbol}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getNews(@PathVariable String symbol) {
        logger.info("Request received for news: {}", symbol);
        try {
            String url = flaskApiUrl + "/api/news/" + symbol.toUpperCase();
            logger.debug("Calling Flask API: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            logger.info("Successfully fetched news for: {}", symbol);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("News not found for: {}", symbol);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("News not found"));
        } catch (Exception e) {
            logger.error("Error fetching news for {}: {}", symbol, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Error fetching news: " + e.getMessage()));
        }
    }

    /**
     * Search for assets (stocks, cryptos, mutual funds, commodities)
     * @param query Search query string
     * @return Search results across all asset types
     */
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> searchAssets(@RequestParam String q) {
        logger.info("Search request received with query: {}", q);
        try {
            if (q == null || q.trim().isEmpty()) {
                logger.warn("Empty search query received");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(createErrorResponse("Query parameter 'q' is required"));
            }
            String url = flaskApiUrl + "/api/search?q=" + q.trim();
            logger.debug("Calling Flask API: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            logger.info("Search completed successfully for query: {}", q);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (Exception e) {
            logger.error("Error searching assets for query {}: {}", q, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Error searching assets: " + e.getMessage()));
        }
    }

    /**
     * Get portfolio performers (top 5 best and worst)
     * @param requestBody JSON with holdings array containing ticker, buyPrice, quantity, purchaseDate
     * @return Top 5 best and worst performers with comprehensive metrics
     */
    @PostMapping(value = "/portfolio/performers", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPortfolioPerformers(@RequestBody String requestBody) {
        logger.info("Portfolio performers analysis request received");
        logger.debug("Request body: {}", requestBody);
        try {
            String url = flaskApiUrl + "/api/portfolio/performers";
            logger.debug("Calling Flask API: {}", url);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            logger.info("Portfolio performers analysis completed successfully");
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException.BadRequest e) {
            logger.warn("Invalid portfolio performers request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Invalid request: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error analyzing portfolio performers: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Error analyzing portfolio performers: " + e.getMessage()));
        }
    }

    /**
     * Get comprehensive portfolio recommendations using AI sentiment analysis
     * @param requestBody JSON with holdings array containing ticker, buyPrice, quantity
     * @return Portfolio recommendations with buy/sell/hold actions based on sentiment + analysts
     */
    @PostMapping(value = "/portfolio/recommendations", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPortfolioRecommendations(@RequestBody String requestBody) {
        logger.info("Portfolio recommendations request received");
        logger.debug("Request body: {}", requestBody);
        try {
            String url = flaskApiUrl + "/api/portfolio/recommendations";
            logger.debug("Calling Flask API: {}", url);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            logger.info("Portfolio recommendations generated successfully");
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException.BadRequest e) {
            logger.warn("Invalid portfolio recommendations request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Invalid request: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Error generating portfolio recommendations: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Error generating recommendations: " + e.getMessage()));
        }
    }

    /**
     * Get comprehensive analysis for a single stock
     * @param symbol Stock ticker symbol
     * @param inPortfolio Whether stock is in portfolio (default: false)
     * @param buyPrice Required if inPortfolio=true
     * @return Stock analysis with sentiment, analyst recommendations, and action
     */
    @GetMapping(value = "/stock/{symbol}/analysis", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getStockAnalysis(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "false") boolean inPortfolio,
            @RequestParam(required = false) Double buyPrice) {
        logger.info("Stock analysis request for: {} (inPortfolio={}, buyPrice={})", symbol, inPortfolio, buyPrice);
        try {
            if (inPortfolio && buyPrice == null) {
                logger.warn("buyPrice missing for stock analysis: {}", symbol);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(createErrorResponse("buyPrice is required when inPortfolio=true"));
            }
            
            String url = flaskApiUrl + "/api/stock/" + symbol.toUpperCase() + "/analysis"
                    + "?inPortfolio=" + inPortfolio;
            
            if (buyPrice != null) {
                url += "&buyPrice=" + buyPrice;
            }
            
            logger.debug("Calling Flask API: {}", url);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            logger.info("Stock analysis completed successfully for: {}", symbol);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            logger.warn("Unable to analyze stock: {}", symbol);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Unable to analyze stock"));
        } catch (Exception e) {
            logger.error("Error analyzing stock {}: {}", symbol, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(createErrorResponse("Error analyzing stock: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint for the Flask API
     * @return Health status of the data API
     */
    @GetMapping(value = "/health", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> healthCheck() {
        logger.debug("Health check request received");
        try {
            String url = flaskApiUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            logger.info("Health check: Flask API is healthy");
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(response.getBody());
        } catch (Exception e) {
            logger.error("Health check failed: Flask API is not reachable - {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "unhealthy");
            errorResponse.put("error", "Flask API is not reachable: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorResponse);
        }
    }

    /**
     * Helper method to create standardized error responses
     */
    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
