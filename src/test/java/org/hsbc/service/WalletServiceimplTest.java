package org.hsbc.service;

import org.hsbc.entity.WalletEntity;
import org.hsbc.repo.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceImplTest {

    @Mock
    private WalletRepository repository;

    @InjectMocks
    private WalletServiceImpl service;

    private WalletEntity wallet;

    @BeforeEach
    void setUp() {
        wallet = new WalletEntity();
        wallet.setId(1L);
        wallet.setBalance(5000.0);
    }

    // 1️⃣ getBalance() - Success
    @Test
    void testGetBalance() {
        when(repository.findById(1L)).thenReturn(Optional.of(wallet));

        double balance = service.getBalance();

        assertEquals(5000.0, balance);
    }

    // ❌ getBalance() - Not Found
    @Test
    void testGetBalanceNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> service.getBalance());
    }

    // 2️⃣ addMoney()
    @Test
    void testAddMoney() {
        when(repository.findById(1L)).thenReturn(Optional.of(wallet));
        when(repository.save(any(WalletEntity.class))).thenReturn(wallet);

        double newBalance = service.addMoney(1000.0);

        // 5000 + 1000 = 6000
        assertEquals(6000.0, newBalance);
        verify(repository, times(1)).save(wallet);
    }

    // 3️⃣ deductMoney() - Success
    @Test
    void testDeductMoney() {
        when(repository.findById(1L)).thenReturn(Optional.of(wallet));
        when(repository.save(any(WalletEntity.class))).thenReturn(wallet);

        double newBalance = service.deductMoney(2000.0);

        // 5000 - 2000 = 3000
        assertEquals(3000.0, newBalance);
        verify(repository, times(1)).save(wallet);
    }

    // ❌ deductMoney() - Insufficient Balance
    @Test
    void testDeductMoneyInsufficientBalance() {
        when(repository.findById(1L)).thenReturn(Optional.of(wallet));

        // Trying to deduct 6000 when balance is 5000
        assertThrows(ResponseStatusException.class, () -> service.deductMoney(6000.0));

        // Ensure save is NEVER called if exception is thrown
        verify(repository, times(0)).save(any(WalletEntity.class));
    }
}