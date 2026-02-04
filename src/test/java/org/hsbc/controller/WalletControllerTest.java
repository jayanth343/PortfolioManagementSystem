package org.hsbc.controller;

import org.hsbc.service.WalletService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class WalletControllerTest {

    private MockMvc mockMvc;

    @Mock
    private WalletService service;

    @InjectMocks
    private WalletController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    // 1️⃣ Show wallet balance
    @Test
    void testGetBalance() throws Exception {
        when(service.getBalance()).thenReturn(5000.0);

        mockMvc.perform(get("/wallet/balance"))
                .andExpect(status().isOk())
                .andExpect(content().string("5000.0"));
    }

    // 2️⃣ Add money
    @Test
    void testAddMoney() throws Exception {
        // Arrange: Wallet starts at X, adding 1000 results in new balance 6000
        when(service.addMoney(1000.0)).thenReturn(6000.0);

        // Act & Assert
        // Note: controller expects @RequestParam, so we use .param("amount", ...)
        mockMvc.perform(post("/wallet/add")
                        .param("amount", "1000.0"))
                .andExpect(status().isOk())
                .andExpect(content().string("6000.0"));
    }

    // 3️⃣ Deduct money
    @Test
    void testDeductMoney() throws Exception {
        // Arrange: Deducting 500 results in new balance 4500
        when(service.deductMoney(500.0)).thenReturn(4500.0);

        // Act & Assert
        mockMvc.perform(post("/wallet/deduct")
                        .param("amount", "500.0"))
                .andExpect(status().isOk())
                .andExpect(content().string("4500.0"));
    }
}