package org.hsbc.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;

class TransactionEntityTest {

    @Test
    void testNoArgsConstructor() {
        TransactionEntity entity = new TransactionEntity();
        assertNotNull(entity);
    }

    @Test
    void testAllArgsConstructor() {
        LocalDateTime now = LocalDateTime.now();
        TransactionEntity entity = new TransactionEntity(1L, "AAPL", 10, 150.0, now, "BUY");

        assertEquals(1L, entity.getTransactionId());
        assertEquals("AAPL", entity.getSymbol());
        assertEquals(10, entity.getQuantity());
        assertEquals(150.0, entity.getBuyPrice());
        assertEquals(now, entity.getTransactionDate());
        assertEquals("BUY", entity.getTransactionType());
    }

    @Test
    void testConstructorWithoutId() {
        LocalDateTime now = LocalDateTime.now();
        TransactionEntity entity = new TransactionEntity("AAPL", 10, 150.0, now, "BUY");
        assertEquals("AAPL", entity.getSymbol());
    }

    @Test
    void testSettersAndGetters() {
        TransactionEntity entity = new TransactionEntity();
        LocalDateTime now = LocalDateTime.now();

        entity.setTransactionId(1L);
        entity.setSymbol("AAPL");
        entity.setQuantity(10);
        entity.setBuyPrice(150.0);
        entity.setTransactionDate(now);
        entity.setTransactionType("BUY");

        assertEquals(1L, entity.getTransactionId());
        assertEquals("AAPL", entity.getSymbol());
        assertEquals(10, entity.getQuantity());
        assertEquals(150.0, entity.getBuyPrice());
        assertEquals(now, entity.getTransactionDate());
        assertEquals("BUY", entity.getTransactionType());
    }

    @Test
    void testToString() {
        TransactionEntity entity = new TransactionEntity();
        entity.setTransactionId(1L);
        entity.setSymbol("AAPL");
        String str = entity.toString();
        assertTrue(str.contains("transactionId=1"));
        assertTrue(str.contains("symbol='AAPL'"));
    }
}
