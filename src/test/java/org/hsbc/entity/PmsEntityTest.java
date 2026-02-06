package org.hsbc.entity;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class PmsEntityTest {

    @Test
    void testNoArgsConstructor() {
        PmsEntity entity = new PmsEntity();
        assertNotNull(entity);
    }

    @Test
    void testAllArgsConstructor() {
        LocalDate date = LocalDate.now();
        PmsEntity entity = new PmsEntity(1L, "Apple", "AAPL", 10, 100.0, 150.0, 1000.0, "USD", "NASDAQ", "Tech",
                "Stock");
        entity.setPurchaseDate(date);

        assertEquals(1L, entity.getId());
        assertEquals("Apple", entity.getCompanyName());
        assertEquals("AAPL", entity.getSymbol());
        assertEquals(10, entity.getQuantity());
        assertEquals(100.0, entity.getBuyPrice());
        assertEquals(150.0, entity.getCurrentPrice());
        assertEquals(1000.0, entity.getBuyingValue());
        assertEquals("USD", entity.getCurrency());
        assertEquals("NASDAQ", entity.getExchange());
        assertEquals("Tech", entity.getIndustry());
        assertEquals("Stock", entity.getAssetType());
        assertEquals(date, entity.getPurchaseDate());
    }

    @Test
    void testConstructorWithoutId() {
        PmsEntity entity = new PmsEntity("Apple", "AAPL", 10, 100.0, 150.0, 1000.0, "USD", "NASDAQ", "Tech", "Stock");
        assertEquals("Apple", entity.getCompanyName());
    }

    @Test
    void testSettersAndGetters() {
        PmsEntity entity = new PmsEntity();
        LocalDate date = LocalDate.now();

        entity.setId(1L);
        entity.setCompanyName("Apple");
        entity.setSymbol("AAPL");
        entity.setQuantity(10);
        entity.setBuyPrice(100.0);
        entity.setCurrentPrice(150.0);
        entity.setBuyingValue(1000.0);
        entity.setCurrency("USD");
        entity.setExchange("NASDAQ");
        entity.setIndustry("Tech");
        entity.setAssetType("Stock");
        entity.setPurchaseDate(date);

        assertEquals(1L, entity.getId());
        assertEquals("Apple", entity.getCompanyName());
        assertEquals("AAPL", entity.getSymbol());
        assertEquals(10, entity.getQuantity());
        assertEquals(100.0, entity.getBuyPrice());
        assertEquals(150.0, entity.getCurrentPrice());
        assertEquals(1000.0, entity.getBuyingValue());
        assertEquals("USD", entity.getCurrency());
        assertEquals("NASDAQ", entity.getExchange());
        assertEquals("Tech", entity.getIndustry());
        assertEquals("Stock", entity.getAssetType());
        assertEquals(date, entity.getPurchaseDate());
    }

    @Test
    void testToString() {
        PmsEntity entity = new PmsEntity();
        entity.setId(1L);
        entity.setSymbol("AAPL");
        String str = entity.toString();
        assertTrue(str.contains("id=1"));
        assertTrue(str.contains("symbol='AAPL'"));
    }
}
