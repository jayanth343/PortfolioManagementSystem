package org.hsbc.controller;

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

    @Value("${flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;

    private final RestTemplate restTemplate;

    public StockDataController() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Get stock data by ticker symbol
     * @param symbol Stock ticker symbol (e.g., AAPL, MSFT)
     * @return Stock data including price, volume, news, recommendations
     */
    @GetMapping("/stocks/{symbol}")
    public ResponseEntity<?> getStock(@PathVariable String symbol) {
        try {
            String url = flaskApiUrl + "/api/stocks/" + symbol.toUpperCase();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Stock not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error fetching stock data: " + e.getMessage()));
        }
    }

    /**
     * Get cryptocurrency data by symbol
     * @param symbol Crypto symbol (e.g., BTC, ETH)
     * @return Cryptocurrency data including price, market cap, volume
     */
    @GetMapping("/crypto/{symbol}")
    public ResponseEntity<?> getCrypto(@PathVariable String symbol) {
        try {
            String url = flaskApiUrl + "/api/crypto/" + symbol.toUpperCase();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Cryptocurrency not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error fetching crypto data: " + e.getMessage()));
        }
    }

    /**
     * Get mutual fund data by symbol
     * @param symbol Mutual fund symbol
     * @return Mutual fund data including NAV, returns, holdings
     */
    @GetMapping("/mutual-funds/{symbol}")
    public ResponseEntity<?> getMutualFund(@PathVariable String symbol) {
        try {
            String url = flaskApiUrl + "/api/mutual-funds/" + symbol.toUpperCase();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Mutual fund not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error fetching mutual fund data: " + e.getMessage()));
        }
    }

    /**
     * Get commodity/futures data by symbol
     * @param symbol Commodity symbol (e.g., GC=F for Gold, CL=F for Crude Oil)
     * @return Commodity data including price, volume, changes
     */
    @GetMapping("/commodities/{symbol}")
    public ResponseEntity<?> getCommodity(@PathVariable String symbol) {
        try {
            String url = flaskApiUrl + "/api/commodities/" + symbol.toUpperCase();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Commodity not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error fetching commodity data: " + e.getMessage()));
        }
    }

    /**
     * Get historical price data for a symbol
     * @param symbol Asset symbol
     * @param period Time period (1D, 5D, 1W, 1MO, 3MO, 6MO, 1Y, 2Y)
     * @return Historical OHLCV data
     */
    @GetMapping("/history/{symbol}")
    public ResponseEntity<?> getHistory(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1MO") String period) {
        try {
            String url = flaskApiUrl + "/api/history/" + symbol.toUpperCase() + "?period=" + period.toUpperCase();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("History not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error fetching history: " + e.getMessage()));
        }
    }

    /**
     * Get news for a specific symbol
     * @param symbol Asset symbol
     * @return Latest news articles
     */
    @GetMapping("/news/{symbol}")
    public ResponseEntity<?> getNews(@PathVariable String symbol) {
        try {
            String url = flaskApiUrl + "/api/news/" + symbol.toUpperCase();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("News not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error fetching news: " + e.getMessage()));
        }
    }

    /**
     * Search for assets (stocks, cryptos, mutual funds, commodities)
     * @param query Search query string
     * @return Search results across all asset types
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchAssets(@RequestParam String q) {
        try {
            if (q == null || q.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("Query parameter 'q' is required"));
            }
            String url = flaskApiUrl + "/api/search?q=" + q.trim();
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error searching assets: " + e.getMessage()));
        }
    }

    /**
     * Get portfolio performers (top 5 best and worst)
     * @param requestBody JSON with holdings array containing ticker, buyPrice, quantity, purchaseDate
     * @return Top 5 best and worst performers with comprehensive metrics
     */
    @PostMapping("/portfolio/performers")
    public ResponseEntity<?> getPortfolioPerformers(@RequestBody String requestBody) {
        try {
            String url = flaskApiUrl + "/api/portfolio/performers";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException.BadRequest e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Invalid request: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error analyzing portfolio performers: " + e.getMessage()));
        }
    }

    /**
     * Get comprehensive portfolio recommendations using AI sentiment analysis
     * @param requestBody JSON with holdings array containing ticker, buyPrice, quantity
     * @return Portfolio recommendations with buy/sell/hold actions based on sentiment + analysts
     */
    @PostMapping("/portfolio/recommendations")
    public ResponseEntity<?> getPortfolioRecommendations(@RequestBody String requestBody) {
        try {
            String url = flaskApiUrl + "/api/portfolio/recommendations";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException.BadRequest e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse("Invalid request: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
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
    @GetMapping("/stock/{symbol}/analysis")
    public ResponseEntity<?> getStockAnalysis(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "false") boolean inPortfolio,
            @RequestParam(required = false) Double buyPrice) {
        try {
            if (inPortfolio && buyPrice == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(createErrorResponse("buyPrice is required when inPortfolio=true"));
            }
            
            String url = flaskApiUrl + "/api/stock/" + symbol.toUpperCase() + "/analysis"
                    + "?inPortfolio=" + inPortfolio;
            
            if (buyPrice != null) {
                url += "&buyPrice=" + buyPrice;
            }
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (HttpClientErrorException.NotFound e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse("Unable to analyze stock"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error analyzing stock: " + e.getMessage()));
        }
    }

    /**
     * Health check endpoint for the Flask API
     * @return Health status of the data API
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        try {
            String url = flaskApiUrl + "/health";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "unhealthy");
            errorResponse.put("error", "Flask API is not reachable: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
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
