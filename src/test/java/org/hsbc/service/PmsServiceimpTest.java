package org.hsbc.service;

import org.hsbc.entity.PmsEntity;
import org.hsbc.repo.PmsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PmsServiceimpTest {

    @Mock
    private PmsRepository repository;

    @InjectMocks
    private PmsServiceimp service;

    private PmsEntity asset;

    @BeforeEach
    void setUp() {
        asset = new PmsEntity();
        asset.setId(1L);
        asset.setCompanyName("Apple");
        asset.setSymbol("AAPL");
        asset.setQuantity(10);
        asset.setBuyPrice(100);
        asset.setCurrentPrice(120);
    }

    // 1️⃣ addAsset()
    @Test
    void testAddAsset() {
        when(repository.save(any(PmsEntity.class))).thenReturn(asset);

        PmsEntity saved = service.addAsset(asset);

        assertEquals(1000, saved.getBuyingValue());
        verify(repository, times(1)).save(asset);
    }

    // 2️⃣ removeAsset()
    @Test
    void testRemoveAsset() {
        doNothing().when(repository).deleteById(1L);

        service.removeAsset(1L);

        verify(repository, times(1)).deleteById(1L);
    }

    // 3️⃣ updateQuantity()
    @Test
    void testUpdateQuantity() {
        when(repository.findById(1L)).thenReturn(Optional.of(asset));
        when(repository.save(any(PmsEntity.class))).thenReturn(asset);

        PmsEntity updated = service.updateQuantity(1L, 20);

        assertEquals(20, updated.getQuantity());
        assertEquals(2000, updated.getBuyingValue());
    }

    // 4️⃣ calculatePL()
    @Test
    void testCalculatePL() {
        when(repository.findById(1L)).thenReturn(Optional.of(asset));

        double pl = service.calculatePL(1L);

        assertEquals(200, pl);
    }

    // 5️⃣ calculatePLPercentage()
    @Test
    void testCalculatePLPercentage() {
        when(repository.findById(1L)).thenReturn(Optional.of(asset));

        double plPercent = service.calculatePLPercentage(1L);

        assertEquals(20.0, plPercent);
    }

    // 6️⃣ getTotalPortfolioValue()
    @Test
    void testGetTotalPortfolioValue() {
        when(repository.findAll()).thenReturn(List.of(asset));

        double total = service.getTotalPortfolioValue();

        assertEquals(1200, total);
    }

    // ❌ Asset not found scenario
    @Test
    void testAssetNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> service.calculatePL(99L));
    }
}
