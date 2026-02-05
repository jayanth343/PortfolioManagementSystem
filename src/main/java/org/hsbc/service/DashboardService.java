package org.hsbc.service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private static final Logger log =
            LoggerFactory.getLogger(DashboardService.class);

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
