
package org.hsbc.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@ExtendWith(MockitoExtension.class)
public class StockDataControllerTest {

    private MockMvc mockMvc;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private StockDataController stockDataController;

    private final String FLASK_URL = "http://localhost:5000";

    @BeforeEach
    void setUp() {
        // 1. Inject the Flask URL value (simulating @Value)
        ReflectionTestUtils.setField(stockDataController, "flaskApiUrl", FLASK_URL);

        // 2. Overwrite the hardcoded RestTemplate with our Mock using Reflection
        // This is necessary because the controller does 'new RestTemplate()' in the constructor
        ReflectionTestUtils.setField(stockDataController, "restTemplate", restTemplate);

        // 3. Build the standalone MockMvc context
        mockMvc = MockMvcBuilders.standaloneSetup(stockDataController).build();
    }

    // ==========================================
    // 1. GET Stock Tests
    // ==========================================

    @Test
    void getStock_Success() throws Exception {
        String mockResponse = "{\"symbol\":\"AAPL\",\"price\":150.0}";
        when(restTemplate.getForEntity(eq(FLASK_URL + "/api/stocks/AAPL"), eq(String.class)))
                .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        mockMvc.perform(get("/api/yfdata/stocks/AAPL"))
                .andExpect(status().isOk())
                .andExpect(content().json(mockResponse));
    }

    @Test
    void getStock_NotFound() throws Exception {
        when(restTemplate.getForEntity(anyString(), eq(String.class)))
                .thenThrow( HttpClientErrorException.NotFound.class);

        mockMvc.perform(get("/api/yfdata/stocks/UNKNOWN"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Stock not found"));
    }

    @Test
    void getStock_ServerError() throws Exception {
        when(restTemplate.getForEntity(anyString(), eq(String.class)))
                .thenThrow(new RuntimeException("Flask down"));

        mockMvc.perform(get("/api/yfdata/stocks/AAPL"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").exists());
    }

    // ==========================================
    // 2. GET Crypto Tests
    // ==========================================

    @Test
    void getCrypto_Success() throws Exception {
        String mockResponse = "{\"symbol\":\"BTC\",\"price\":50000.0}";
        when(restTemplate.getForEntity(eq(FLASK_URL + "/api/crypto/BTC"), eq(String.class)))
                .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        mockMvc.perform(get("/api/yfdata/crypto/BTC"))
                .andExpect(status().isOk())
                .andExpect(content().json(mockResponse));
    }

    // ==========================================
    // 3. GET Mutual Fund Tests
    // ==========================================

    @Test
    void getMutualFund_Success() throws Exception {
        String mockResponse = "{\"symbol\":\"VFIAX\",\"nav\":400.0}";
        when(restTemplate.getForEntity(eq(FLASK_URL + "/api/mutual-funds/VFIAX"), eq(String.class)))
                .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        mockMvc.perform(get("/api/yfdata/mutual-funds/VFIAX"))
                .andExpect(status().isOk())
                .andExpect(content().json(mockResponse));
    }

    // ==========================================
    // 4. GET Commodity Tests
    // ==========================================

    @Test
    void getCommodity_Success() throws Exception {
        String mockResponse = "{\"symbol\":\"GC=F\",\"price\":1900.0}";
        when(restTemplate.getForEntity(eq(FLASK_URL + "/api/commodities/GC=F"), eq(String.class)))
                .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        mockMvc.perform(get("/api/yfdata/commodities/GC=F"))
                .andExpect(status().isOk())
                .andExpect(content().json(mockResponse));
    }

    // ==========================================
    // 5. GET History Tests
    // ==========================================

    @Test
    void getHistory_DefaultPeriod() throws Exception {
        String mockResponse = "{\"history\":[]}";
        // Verify default period is 1MO
        when(restTemplate.getForEntity(eq(FLASK_URL + "/api/history/AAPL?period=1MO"), eq(String.class)))
                .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        mockMvc.perform(get("/api/yfdata/history/AAPL"))
                .andExpect(status().isOk())
                .andExpect(content().json(mockResponse));
    }

    @Test
    void getHistory_CustomPeriod() throws Exception {
        String mockResponse = "{\"history\":[]}";
        // Verify custom period 1Y
        when(restTemplate.getForEntity(eq(FLASK_URL + "/api/history/AAPL?period=1Y"), eq(String.class)))
                .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        mockMvc.perform(get("/api/yfdata/history/AAPL").param("period", "1Y"))
                .andExpect(status().isOk());
    }

    // ==========================================
    // 6. GET News Tests
    // ==========================================

    @Test
    void getNews_Success() throws Exception {
        String mockResponse = "[{\"title\":\"News 1\"}]";
        when(restTemplate.getForEntity(eq(FLASK_URL + "/api/news/AAPL"), eq(String.class)))
                .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        mockMvc.perform(get("/api/yfdata/news/AAPL"))
                .andExpect(status().isOk())
                .andExpect(content().json(mockResponse));
    }

    // ==========================================
    // 7. GET Search Tests
    // ==========================================

    @Test
    void searchAssets_Success() throws Exception {
        String mockResponse = "[{\"symbol\":\"AAPL\"}]";
        when(restTemplate.getForEntity(eq(FLASK_URL + "/api/search?q=Apple"), eq(String.class)))
                .thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.OK));

        mockMvc.perform(get("/api/yfdata/search").param("q", "Apple"))
                .andExpect(status().isOk())
                .andExpect(content().json(mockResponse));
    }

    @Test
    void searchAssets_MissingQuery() throws Exception {
        // The controller checks if q is null or empty manually
        mockMvc.perform(get("/api/yfdata/search").param("q", ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Query parameter 'q' is required"));
    }
}

// ===========================