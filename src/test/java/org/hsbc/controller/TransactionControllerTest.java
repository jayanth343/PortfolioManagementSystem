package org.hsbc.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.hsbc.entity.TransactionEntity;
import org.hsbc.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock
    private TransactionService service;

    @InjectMocks
    private TransactionController controller;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        objectMapper = new ObjectMapper();
        // Required to handle LocalDate serialization properly
        objectMapper.findAndRegisterModules();
    }

    // 1️⃣ Add transaction
    @Test
    void testAddTransaction() throws Exception {
        TransactionEntity txn = new TransactionEntity("AAPL", 10, 150.0, LocalDate.now(), "BUY");
        txn.setTransactionId(1L);

        when(service.addTransaction(any(TransactionEntity.class))).thenReturn(txn);

        mockMvc.perform(post("/transactions/add")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(txn)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.symbol").value("AAPL"))
                .andExpect(jsonPath("$.transactionType").value("BUY"));
    }

    // 2️⃣ Get all transactions
    @Test
    void testGetAllTransactions() throws Exception {
        List<TransactionEntity> txnList = Arrays.asList(
                new TransactionEntity("AAPL", 10, 150.0, LocalDate.now(), "BUY"),
                new TransactionEntity("GOOGL", 5, 2000.0, LocalDate.now(), "SELL")
        );

        when(service.getAllTransactions()).thenReturn(txnList);

        mockMvc.perform(get("/transactions/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].symbol").value("AAPL"));
    }

    // 3️⃣ Get transactions by symbol
    @Test
    void testGetBySymbol() throws Exception {
        List<TransactionEntity> txnList = Arrays.asList(
                new TransactionEntity("TSLA", 20, 700.0, LocalDate.now(), "BUY")
        );

        when(service.getTransactionsBySymbol("TSLA")).thenReturn(txnList);

        mockMvc.perform(get("/transactions/symbol/TSLA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].symbol").value("TSLA"));
    }
}