package org.hsbc.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.hsbc.entity.PmsEntity;
import org.hsbc.exception.InvalidPmsIdException;
import org.hsbc.repo.PmsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class PmsServiceimpTest {

    @Mock
    private PmsRepository repository;

    @InjectMocks
    private PmsServiceimp service;

    private PmsEntity asset1;

    @BeforeEach
    void setUp() {
        // Setup dummy data
        asset1 = new PmsEntity();
        asset1.setId(1L);
        asset1.setSymbol("AAPL");
        asset1.setBuyPrice(150.0);
        asset1.setCurrentPrice(170.0);
        asset1.setQuantity(10);
    }

    // --- Success Tests ---

    @Test
    void testGetAssetById_Success() throws InvalidPmsIdException {
        when(repository.findById(1L)).thenReturn(Optional.of(asset1));

        PmsEntity result = service.getAssetById(1L);

        assertNotNull(result);
        assertEquals("AAPL", result.getSymbol());
    }

    @Test
    void testUpdateQuantity_Success() throws InvalidPmsIdException {
        when(repository.findById(1L)).thenReturn(Optional.of(asset1));
        when(repository.save(any(PmsEntity.class))).thenReturn(asset1);

        PmsEntity updated = service.updateQuantity(1L, 20);

        assertEquals(20, updated.getQuantity());
        // Check if buying value updated: 150 * 20 = 3000
        assertEquals(3000.0, updated.getBuyingValue());
    }

    @Test
    void testCalculatePL_Success() throws InvalidPmsIdException {
        when(repository.findById(1L)).thenReturn(Optional.of(asset1));

        // Buy: 150 * 10 = 1500
        // Current: 170 * 10 = 1700
        // PL: 200
        double pl = service.calculatePL(1L);

        assertEquals(200.0, pl);
    }

    @Test
    void testRemoveAsset_Success() throws InvalidPmsIdException {
        when(repository.findById(1L)).thenReturn(Optional.of(asset1));

        assertDoesNotThrow(() -> service.removeAsset(1L));

        verify(repository, times(1)).deleteById(1L);
    }

    // --- Exception Tests (Failure Scenarios) ---

    @Test
    void testGetAssetById_NotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(InvalidPmsIdException.class, () -> {
            service.getAssetById(99L);
        });
    }

    @Test
    void testUpdateQuantity_NotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(InvalidPmsIdException.class, () -> {
            service.updateQuantity(99L, 5);
        });
    }

    @Test
    void testCalculatePL_NotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(InvalidPmsIdException.class, () -> {
            service.calculatePL(99L);
        });
    }
}