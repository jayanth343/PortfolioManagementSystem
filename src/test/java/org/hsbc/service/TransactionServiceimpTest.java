package org.hsbc.service;

import org.hsbc.entity.TransactionEntity;
import org.hsbc.exception.InvalidTransactionIdException;
import org.hsbc.repo.TransactionRepo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
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
        transaction.setTransactionDate(LocalDateTime.now());
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

    // 4️⃣ getTransactionById() - Success
    @Test
    void testGetTransactionById_Success() throws InvalidTransactionIdException {
        when(repository.findById(1L)).thenReturn(Optional.of(transaction));

        TransactionEntity found = service.getTransactionById(1L);

        assertNotNull(found);
        assertEquals(1L, found.getTransactionId());
        verify(repository, times(1)).findById(1L);
    }

    // 5️⃣ getTransactionById() - Failure (Exception)
    @Test
    void testGetTransactionById_NotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(InvalidTransactionIdException.class, () -> {
            service.getTransactionById(99L);
        });

        verify(repository, times(1)).findById(99L);
    }

    // 6️⃣ updateTransaction() - Success
    @Test
    void testUpdateTransaction_Success() throws InvalidTransactionIdException {
        when(repository.findById(1L)).thenReturn(Optional.of(transaction));
        when(repository.save(any(TransactionEntity.class))).thenReturn(transaction);

        TransactionEntity updated = service.updateTransaction(transaction);

        assertNotNull(updated);
        verify(repository, times(1)).save(transaction);
    }

    // 7️⃣ updateTransaction() - Failure (Exception)
    @Test
    void testUpdateTransaction_NotFound() {
        TransactionEntity newTrans = new TransactionEntity();
        newTrans.setTransactionId(99L);

        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(InvalidTransactionIdException.class, () -> {
            service.updateTransaction(newTrans);
        });

        verify(repository, never()).save(any());
    }

    // 8️⃣ deleteTransaction() - Success
    @Test
    void testDeleteTransaction_Success() throws InvalidTransactionIdException {
        when(repository.findById(1L)).thenReturn(Optional.of(transaction));

        assertDoesNotThrow(() -> service.deleteTransaction(1L));

        verify(repository, times(1)).deleteById(1L);
    }

    // 9️⃣ deleteTransaction() - Failure (Exception)
    @Test
    void testDeleteTransaction_NotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(InvalidTransactionIdException.class, () -> {
            service.deleteTransaction(99L);
        });

        verify(repository, never()).deleteById(anyLong());
    }
}