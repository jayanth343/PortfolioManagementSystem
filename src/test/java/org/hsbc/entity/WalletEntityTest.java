package org.hsbc.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class WalletEntityTest {

    @Test
    void testNoArgsConstructor() {
        WalletEntity entity = new WalletEntity();
        assertNotNull(entity);
    }

    @Test
    void testAllArgsConstructor() {
        WalletEntity entity = new WalletEntity(1L, 5000.0);
        assertEquals(1L, entity.getId());
        assertEquals(5000.0, entity.getBalance());
    }

    @Test
    void testSettersAndGetters() {
        WalletEntity entity = new WalletEntity();
        entity.setId(1L);
        entity.setBalance(5000.0);

        assertEquals(1L, entity.getId());
        assertEquals(5000.0, entity.getBalance());
    }

    @Test
    void testToString() {
        WalletEntity entity = new WalletEntity();
        entity.setId(1L);
        entity.setBalance(5000.0);
        String str = entity.toString();
        assertTrue(str.contains("id=1"));
        assertTrue(str.contains("balance=5000.0"));
    }
}
