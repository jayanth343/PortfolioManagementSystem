package org.hsbc.controller;

import org.hsbc.entity.PmsEntity;
import org.hsbc.service.PmsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PortfolioController.class)
class PortfolioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PmsService pmsService;

    @Autowired
    private PortfolioController portfolioController;

    private RestTemplate restTemplateMock;

    @BeforeEach
    void setUp() {
        restTemplateMock = mock(RestTemplate.class);
        ReflectionTestUtils.setField(portfolioController, "restTemplate", restTemplateMock);
    }

    @Test
    void testGetPortfolioSummary() throws Exception {
        PmsEntity asset = new PmsEntity();
        asset.setBuyPrice(100.0);
        asset.setQuantity(10); // Invested: 1000
        asset.setCurrentPrice(120.0); // Current: 1200
        asset.setBuyingValue(1000.0);

        when(pmsService.getAllAssets()).thenReturn(Collections.singletonList(asset));

        mockMvc.perform(get("/api/portfolio/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.portfolioValue").value(1200.0))
                .andExpect(jsonPath("$.totalInvested").value(1000.0))
                .andExpect(jsonPath("$.totalGain").value(200.0))
                .andExpect(jsonPath("$.gainPercentage").value(20.0));
    }

    @Test
    void testGetPortfolioPerformance() throws Exception {
        PmsEntity asset = new PmsEntity();
        asset.setSymbol("AAPL");
        asset.setQuantity(10);
        asset.setAssetType("Stocks");

        when(pmsService.getAllAssets()).thenReturn(Collections.singletonList(asset));

        String mockApiResponse = "{\"data\": [{\"time\": \"2023-01-01\", \"close\": 150.0}]}";
        when(restTemplateMock.getForObject(anyString(), eq(String.class))).thenReturn(mockApiResponse);

        mockMvc.perform(get("/api/portfolio/performance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].date").value("2023-01-01"))
                .andExpect(jsonPath("$[0].value").value(1500)); // 150 * 10
    }

    @Test
    void testGetPortfolioPerformance_EmptyAssets() throws Exception {
        when(pmsService.getAllAssets()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/portfolio/performance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void testGetAssetAllocation() throws Exception {
        PmsEntity stock = new PmsEntity();
        stock.setAssetType("Stocks");
        stock.setCurrentPrice(100.0);
        stock.setQuantity(10); // 1000

        PmsEntity crypto = new PmsEntity();
        crypto.setAssetType("Crypto");
        crypto.setCurrentPrice(50.0);
        crypto.setQuantity(20); // 1000

        when(pmsService.getAllAssets()).thenReturn(Arrays.asList(stock, crypto));

        mockMvc.perform(get("/api/portfolio/allocation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].assetType", containsInAnyOrder("Stocks", "Crypto")))
                .andExpect(jsonPath("$[*].value", containsInAnyOrder(1000.0, 1000.0)));
    }

    @Test
    void testGetInvestmentBreakdown() throws Exception {
        PmsEntity stock = new PmsEntity();
        stock.setAssetType("Stock"); // Should normalize to Stocks
        stock.setBuyingValue(1000.0);

        when(pmsService.getAllAssets()).thenReturn(Collections.singletonList(stock));

        mockMvc.perform(get("/api/portfolio/breakdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].type").value("Stocks"))
                .andExpect(jsonPath("$[0].value").value(1000.0));
    }

    @Test
    void testGetInvestmentBreakdown_Empty() throws Exception {
        when(pmsService.getAllAssets()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/portfolio/breakdown"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4))); // Expects all 4 types with 0
    }

    @Test
    void testGetPerformers() throws Exception {
        PmsEntity winner = new PmsEntity();
        winner.setSymbol("WIN");
        winner.setBuyPrice(100.0);
        winner.setBuyingValue(1000.00); // Set buying value explicit
        winner.setCurrentPrice(200.0);
        winner.setQuantity(10);

        PmsEntity loser = new PmsEntity();
        loser.setSymbol("LOSE");
        loser.setBuyPrice(100.0);
        loser.setBuyingValue(1000.00); // Set buying value explicit
        loser.setCurrentPrice(50.0);
        loser.setQuantity(10);

        when(pmsService.getAllAssets()).thenReturn(Arrays.asList(winner, loser));

        mockMvc.perform(get("/api/portfolio/performers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topPerformers[0].symbol").value("WIN"))
                .andExpect(jsonPath("$.lowestPerformers[0].symbol").value("LOSE"));
    }
}
