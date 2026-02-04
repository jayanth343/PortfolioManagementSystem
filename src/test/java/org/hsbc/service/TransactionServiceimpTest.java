package org.hsbc.service;

import org.hsbc.entity.TransactionEntity;
import org.hsbc.repo.TransactionRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionSeviceimpTest {

    @Mock
    private TransactionRepo repository;

    @InjectMocks
    private TransactionSeviceimp service;

    private TransactionEntity transaction;

    @BeforeEach
    void setUp() {
        transaction = new TransactionEntity();
        transaction.setTransactionId(1L);
        transaction.setSymbol("AAPL");
        transaction.setQuantity(10);
        transaction.setBuyPrice(150.0);
        transaction.setTransactionDate(LocalDate.now());
        transaction.setTransactionType("BUY");
    }

    // 1️⃣ addTransaction()
    @Test
    void testAddTransaction() {
        when(repository.save(any(TransactionEntity.class))).thenReturn(transaction);

        TransactionEntity saved = service.addTransaction(transaction);

        assertNotNull(saved);
        assertEquals("AAPL", saved.getSymbol());
        verify(repository, times(1)).save(transaction);
    }

    // 2️⃣ getAllTransactions()
    @Test
    void testGetAllTransactions() {
        when(repository.findAll()).thenReturn(List.of(transaction));

        List<TransactionEntity> list = service.getAllTransactions();

        assertEquals(1, list.size());
        assertEquals(transaction, list.get(0));
        verify(repository, times(1)).findAll();
    }

    // 3️⃣ getTransactionsBySymbol()
    @Test
    void testGetTransactionsBySymbol() {
        when(repository.findBySymbol("AAPL")).thenReturn(List.of(transaction));

        List<TransactionEntity> list = service.getTransactionsBySymbol("AAPL");

        assertEquals(1, list.size());
        assertEquals("AAPL", list.get(0).getSymbol());
        verify(repository, times(1)).findBySymbol("AAPL");
    }
}