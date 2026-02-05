package org.hsbc.service;

import org.hsbc.entity.WalletEntity;

public interface WalletService {
    double getBalance();

    double addMoney(double amount);

    double deductMoney(double amount);
    
    WalletEntity getWalletSummary();
}
