package org.hsbc.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private WalletServiceImpl walletService;

    @Mock
    private PmsService pmsService;

    @InjectMocks
    private DashboardService dashboardService;

    // 1️⃣ getTotalUsedBalance()
    @Test
    void testGetTotalUsedBalance() {
        // Arrange
        double portfolioValue = 5000.0;
        when(pmsService.getTotalPortfolioValue()).thenReturn(portfolioValue);

        // Act
        double result = dashboardService.getTotalUsedBalance();

        // Assert
        assertEquals(5000.0, result);
        verify(pmsService, times(1)).getTotalPortfolioValue();
    }

    // 2️⃣ getAvailableBalance()
    @Test
    void testGetAvailableBalance() {
        // Arrange
        double walletBalance = 10000.0;
        double portfolioValue = 2000.0;

        when(walletService.getBalance()).thenReturn(walletBalance);
        when(pmsService.getTotalPortfolioValue()).thenReturn(portfolioValue);

        // Act
        double result = dashboardService.getAvailableBalance();

        // Assert: 10000 - 2000 = 8000
        assertEquals(8000.0, result);
        verify(walletService, times(1)).getBalance();
        verify(pmsService, times(1)).getTotalPortfolioValue();
    }
}