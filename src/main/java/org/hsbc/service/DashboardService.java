package org.hsbc.service;


import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final WalletServiceImpl walletService;
    private final PmsService pmsService;

    public DashboardService(WalletServiceImpl walletService,
                            PmsService pmsService) {
        this.walletService = walletService;
        this.pmsService = pmsService;
    }

    public double getTotalUsedBalance() {
        return pmsService.getTotalPortfolioValue();
    }

    public double getAvailableBalance() {
        return walletService.getBalance()
                - pmsService.getTotalPortfolioValue();
    }
}
