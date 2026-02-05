package org.hsbc.controller;

import org.hsbc.service.DashboardService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DashboardService service;

    @InjectMocks
    private DashboardController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void testGetWalletSummary() throws Exception {
        // Arrange
        // Scenario:
        // Available Balance (Wallet cash): 2000.0
        // Used Balance (Stock value): 8000.0
        // Total Balance (Net worth): 10000.0

        when(service.getAvailableBalance()).thenReturn(2000.0);
        when(service.getTotalUsedBalance()).thenReturn(8000.0);

        // Act & Assert
        mockMvc.perform(get("/dashboard/wallet-summary"))
                .andExpect(status().isOk())

                // Verify Math: available (2000) + used (8000) = total (10000)
                .andExpect(jsonPath("$.totalBalance").value(10000.0))

                // Verify individual fields
                .andExpect(jsonPath("$.totalUsed").value(8000.0))
                .andExpect(jsonPath("$.availableBalance").value(2000.0));
    }
}