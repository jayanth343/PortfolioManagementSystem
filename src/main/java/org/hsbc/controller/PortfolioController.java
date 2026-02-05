package org.hsbc.controller;

import org.hsbc.entity.PmsEntity;
import org.hsbc.service.PmsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.*;

@RestController
@RequestMapping("/api/portfolio")
@CrossOrigin(origins = "*")
public class PortfolioController {

    @Autowired
    private PmsService pmsService;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getPortfolioSummary() {
        List<PmsEntity> assets = pmsService.getAllAssets();
        
        double totalPortfolioValue = 0;
        double totalInvestedValue = 0;

        for (PmsEntity asset : assets) {
            totalPortfolioValue += asset.getCurrentPrice() * asset.getQuantity();
            
            // Use buyPrice * quantity if buyingValue is 0
            double buyingValue = asset.getBuyingValue();
            if (buyingValue == 0) {
                buyingValue = asset.getBuyPrice() * asset.getQuantity();
            }
            totalInvestedValue += buyingValue;
        }

        double totalGain = totalPortfolioValue - totalInvestedValue;
        double gainPercentage = totalInvestedValue > 0 ? (totalGain / totalInvestedValue) * 100 : 0;

        System.out.println("Portfolio Summary: totalPortfolioValue=" + totalPortfolioValue + 
                         ", totalInvestedValue=" + totalInvestedValue + 
                         ", totalGain=" + totalGain + ", gainPercentage=" + gainPercentage + "%");

        Map<String, Object> summary = new HashMap<>();
        summary.put("userName", "Alex Johnson");
        summary.put("portfolioValue", totalPortfolioValue);
        summary.put("totalInvested", totalInvestedValue);
        summary.put("totalGain", totalGain);
        summary.put("gainPercentage", gainPercentage);

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/performance")
    public ResponseEntity<List<Map<String, Object>>> getPortfolioPerformance() {
        List<PmsEntity> assets = pmsService.getAllAssets();
        
        if (assets.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        // Fetch 1-year historical data for each asset and aggregate
        Map<String, Double> aggregatedData = new TreeMap<>(); // TreeMap for sorted dates
        
        for (PmsEntity asset : assets) {
            String symbol = asset.getSymbol();
            int quantity = asset.getQuantity();
            String assetType = asset.getAssetType() != null ? asset.getAssetType() : "Stocks";
            
            System.out.println("Fetching history for " + symbol + " (type: " + assetType + ")");
            
            // Call Flask API to get 1-year historical data
            String url = "http://localhost:5000/api/history/" + symbol + "?period=1Y&interval=1d";
            
            try {
                String response = restTemplate.getForObject(url, String.class);
                JsonNode historyData = objectMapper.readTree(response);
                
                // Flask API returns 'data' field, not 'history'
                if (historyData.has("data") && historyData.get("data").isArray()) {
                    for (JsonNode dataPoint : historyData.get("data")) {
                        // Flask returns 'time' field (YYYY-MM-DD string for daily data)
                        String date = dataPoint.get("time").asText();
                        
                        // For mutual funds, use 'nav' field if exists, otherwise use 'close'
                        double price = 0.0;
                        if (dataPoint.has("nav")) {
                            price = dataPoint.get("nav").asDouble();
                        } else if (dataPoint.has("close")) {
                            price = dataPoint.get("close").asDouble();
                        } else {
                            System.err.println("No price data for " + symbol + " on " + date);
                            continue;
                        }
                        
                        double value = price * quantity;
                        
                        // Add to aggregated data
                        aggregatedData.put(date, aggregatedData.getOrDefault(date, 0.0) + value);
                    }
                    System.out.println("Added " + historyData.get("data").size() + " data points for " + symbol);
                } else {
                    System.err.println("No data array in response for " + symbol + ". Response: " + response);
                }
            } catch (Exception e) {
                System.err.println("Error fetching history for " + symbol + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
        
        // Convert to response format
        List<Map<String, Object>> performance = new ArrayList<>();
        for (Map.Entry<String, Double> entry : aggregatedData.entrySet()) {
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("date", entry.getKey());
            dataPoint.put("value", Math.round(entry.getValue()));
            performance.add(dataPoint);
        }
        
        System.out.println("Returning " + performance.size() + " total data points for portfolio chart");
        return ResponseEntity.ok(performance);
    }

    @GetMapping("/allocation")
    public ResponseEntity<List<Map<String, Object>>> getAssetAllocation() {
        List<PmsEntity> assets = pmsService.getAllAssets();
        Map<String, Double> allocation = new HashMap<>();

        for (PmsEntity asset : assets) {
            double value = asset.getCurrentPrice() * asset.getQuantity();
            String assetType = asset.getAssetType() != null ? asset.getAssetType() : "Unknown";
            
            allocation.put(assetType, allocation.getOrDefault(assetType, 0.0) + value);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Double> entry : allocation.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("assetType", entry.getKey());
            item.put("value", entry.getValue());
            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/breakdown")
    public ResponseEntity<List<Map<String, Object>>> getInvestmentBreakdown() {
        List<PmsEntity> assets = pmsService.getAllAssets();
        Map<String, Double> breakdown = new HashMap<>();

        // Initialize all types
        breakdown.put("Stocks", 0.0);
        breakdown.put("Mutual Funds", 0.0);
        breakdown.put("Crypto", 0.0);
        breakdown.put("Commodities", 0.0);

        for (PmsEntity asset : assets) {
            double investedValue = asset.getBuyingValue();
            String assetType = asset.getAssetType() != null ? asset.getAssetType().trim() : "Stocks";
            
            // Normalize asset type names to match frontend (case-insensitive)
            String normalizedType = assetType;
            if (assetType.equalsIgnoreCase("Stock") || assetType.equalsIgnoreCase("Stocks")) {
                normalizedType = "Stocks";
            } else if (assetType.equalsIgnoreCase("Commodity") || assetType.equalsIgnoreCase("Commodities")) {
                normalizedType = "Commodities";
            } else if (assetType.equalsIgnoreCase("Fund") || assetType.equalsIgnoreCase("Mutual Fund") 
                       || assetType.equalsIgnoreCase("Mutual Funds")) {
                normalizedType = "Mutual Funds";
            } else if (assetType.equalsIgnoreCase("Crypto") || assetType.equalsIgnoreCase("Cryptocurrency")) {
                normalizedType = "Crypto";
            }
            
            breakdown.put(normalizedType, breakdown.getOrDefault(normalizedType, 0.0) + investedValue);
        }

        // Only return non-zero values
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, Double> entry : breakdown.entrySet()) {
            if (entry.getValue() > 0) {
                Map<String, Object> item = new HashMap<>();
                item.put("type", entry.getKey());
                item.put("value", entry.getValue());
                result.add(item);
            }
        }
        
        // If result is empty, return all types with 0 values for UI consistency
        if (result.isEmpty()) {
            for (String type : Arrays.asList("Stocks", "Mutual Funds", "Crypto", "Commodities")) {
                Map<String, Object> item = new HashMap<>();
                item.put("type", type);
                item.put("value", 0.0);
                result.add(item);
            }
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/performers")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getPerformers() {
        List<PmsEntity> assets = pmsService.getAllAssets();
        
        if (assets.isEmpty()) {
            Map<String, List<Map<String, Object>>> emptyResult = new HashMap<>();
            emptyResult.put("topPerformers", new ArrayList<>());
            emptyResult.put("lowestPerformers", new ArrayList<>());
            return ResponseEntity.ok(emptyResult);
        }

        // Calculate percentage change for each asset and create list
        List<Map<String, Object>> assetPerformance = new ArrayList<>();
        
        for (PmsEntity asset : assets) {
            double currentValue = asset.getCurrentPrice() * asset.getQuantity();
            // Use buyPrice * quantity if buyingValue is 0
            double buyingValue = asset.getBuyingValue();
            if (buyingValue == 0) {
                buyingValue = asset.getBuyPrice() * asset.getQuantity();
            }
            double gain = currentValue - buyingValue;
            double percentageChange = buyingValue > 0 ? (gain / buyingValue) * 100 : 0;

            Map<String, Object> assetData = new HashMap<>();
            assetData.put("id", asset.getId());
            assetData.put("companyName", asset.getCompanyName());
            assetData.put("symbol", asset.getSymbol());
            assetData.put("currentValue", currentValue);
            assetData.put("percentageChange", percentageChange);
            assetData.put("assetType", asset.getAssetType());
            
            System.out.println("Asset " + asset.getSymbol() + ": currentValue=" + currentValue + 
                             ", buyingValue=" + buyingValue + ", percentageChange=" + percentageChange + "%");
            
            assetPerformance.add(assetData);
        }

        // Sort by percentage change (descending - highest first)
        assetPerformance.sort((a, b) -> 
            Double.compare((Double) b.get("percentageChange"), (Double) a.get("percentageChange"))
        );

        // Get top 3 performers (highest percentage change)
        List<Map<String, Object>> topPerformers = assetPerformance.stream()
            .limit(3)
            .collect(java.util.stream.Collectors.toList());

        // Get lowest 3 performers (lowest percentage change - from the end of sorted list)
        int size = assetPerformance.size();
        List<Map<String, Object>> lowestPerformers = new ArrayList<>();
        for (int i = Math.max(0, size - 3); i < size; i++) {
            lowestPerformers.add(assetPerformance.get(i));
        }
        // Reverse to show worst first
        java.util.Collections.reverse(lowestPerformers);

        Map<String, List<Map<String, Object>>> result = new HashMap<>();
        result.put("topPerformers", topPerformers);
        result.put("lowestPerformers", lowestPerformers);

        return ResponseEntity.ok(result);
    }
}
