package org.hsbc.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StockDataController.class)
class StockDataControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private StockDataController controller;

        private RestTemplate restTemplate;

        @BeforeEach
        void setUp() {
                restTemplate = mock(RestTemplate.class);
                ReflectionTestUtils.setField(controller, "restTemplate", restTemplate);
                ReflectionTestUtils.setField(controller, "flaskApiUrl", "http://localhost:5000");
        }

        @Test
        void testGetStock_Success() throws Exception {
                String json = "{\"symbol\":\"AAPL\",\"price\":150.0}";
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(json));

                mockMvc.perform(get("/api/yfdata/stocks/AAPL"))
                                .andExpect(status().isOk())
                                .andExpect(content().json(json));
        }

        @Test
        void testGetStock_NotFound() throws Exception {
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND));

                mockMvc.perform(get("/api/yfdata/stocks/UNKNOWN"))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.error").value("Stock not found"));
        }

        @Test
        void testGetCrypto_Success() throws Exception {
                String json = "{\"symbol\":\"BTC\",\"price\":40000.0}";
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(json));

                mockMvc.perform(get("/api/yfdata/crypto/BTC"))
                                .andExpect(status().isOk())
                                .andExpect(content().json(json));
        }

        @Test
        void testGetCrypto_NotFound() throws Exception {
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND));

                mockMvc.perform(get("/api/yfdata/crypto/UNKNOWN"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void testGetMutualFund_Success() throws Exception {
                String json = "{\"symbol\":\"VFIAX\",\"nav\":400.0}";
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(json));

                mockMvc.perform(get("/api/yfdata/mutual-funds/VFIAX"))
                                .andExpect(status().isOk())
                                .andExpect(content().json(json));
        }

        @Test
        void testGetMutualFund_NotFound() throws Exception {
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND));

                mockMvc.perform(get("/api/yfdata/mutual-funds/UNKNOWN"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void testGetCommodity_Success() throws Exception {
                String json = "{\"symbol\":\"GC=F\",\"price\":1800.0}";
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(json));

                mockMvc.perform(get("/api/yfdata/commodities/GC=F"))
                                .andExpect(status().isOk())
                                .andExpect(content().json(json));
        }

        @Test
        void testGetCommodity_NotFound() throws Exception {
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND));

                mockMvc.perform(get("/api/yfdata/commodities/UNKNOWN"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void testGetHistory_Success() throws Exception {
                String json = "{\"date\":\"2023-01-01\",\"close\":150.0}";
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(json));

                mockMvc.perform(get("/api/yfdata/history/AAPL?period=1MO&interval=1d"))
                                .andExpect(status().isOk())
                                .andExpect(content().json(json));
        }

        @Test
        void testGetHistory_NotFound() throws Exception {
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND));

                mockMvc.perform(get("/api/yfdata/history/UNKNOWN"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void testGetNews_Success() throws Exception {
                String json = "[{\"title\":\"News 1\"}]";
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(json));

                mockMvc.perform(get("/api/yfdata/news/AAPL"))
                                .andExpect(status().isOk())
                                .andExpect(content().json(json));
        }

        @Test
        void testGetNews_NotFound() throws Exception {
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenThrow(new HttpClientErrorException(HttpStatus.NOT_FOUND));

                mockMvc.perform(get("/api/yfdata/news/UNKNOWN"))
                                .andExpect(status().isNotFound());
        }

        @Test
        void testSearchAssets_Success() throws Exception {
                String json = "[{\"symbol\":\"AAPL\"}]";
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(json));

                mockMvc.perform(get("/api/yfdata/search?q=Apple"))
                                .andExpect(status().isOk())
                                .andExpect(content().json(json));
        }

        @Test
        void testSearchAssets_EmptyQuery() throws Exception {
                mockMvc.perform(get("/api/yfdata/search?q="))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void testGetPortfolioPerformers_Success() throws Exception {
                String requestBody = "[{\"symbol\":\"AAPL\",\"buyPrice\":100}]";
                String responseBody = "{\"top\":[]}";

                when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(responseBody));

                mockMvc.perform(post("/api/yfdata/portfolio/performers")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isOk())
                                .andExpect(content().json(responseBody));
        }

        @Test
        void testGetPortfolioPerformers_BadRequest() throws Exception {
                when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                                .thenThrow(new HttpClientErrorException(HttpStatus.BAD_REQUEST));

                mockMvc.perform(post("/api/yfdata/portfolio/performers")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void testGetPortfolioRecommendations_Success() throws Exception {
                String requestBody = "[{\"symbol\":\"AAPL\"}]";
                String responseBody = "{\"recommendations\":[]}";

                when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(responseBody));

                mockMvc.perform(post("/api/yfdata/portfolio/recommendations")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(requestBody))
                                .andExpect(status().isOk())
                                .andExpect(content().json(responseBody));
        }

        @Test
        void testGetStockAnalysis_Success() throws Exception {
                String json = "{\"sentiment\":\"Bullish\"}";
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(json));

                mockMvc.perform(get("/api/yfdata/stock/AAPL/analysis?inPortfolio=true&buyPrice=150.0"))
                                .andExpect(status().isOk())
                                .andExpect(content().json(json));
        }

        @Test
        void testGetStockAnalysis_MissingBuyPrice() throws Exception {
                mockMvc.perform(get("/api/yfdata/stock/AAPL/analysis?inPortfolio=true"))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void testHealthCheck_Success() throws Exception {
                String json = "{\"status\":\"healthy\"}";
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenReturn(ResponseEntity.ok(json));

                mockMvc.perform(get("/api/yfdata/health"))
                                .andExpect(status().isOk())
                                .andExpect(content().json(json));
        }

        @Test
        void testHealthCheck_Failure() throws Exception {
                when(restTemplate.getForEntity(anyString(), eq(String.class)))
                                .thenThrow(new RuntimeException("Connection refused"));

                mockMvc.perform(get("/api/yfdata/health"))
                                .andExpect(status().isServiceUnavailable());
        }
}