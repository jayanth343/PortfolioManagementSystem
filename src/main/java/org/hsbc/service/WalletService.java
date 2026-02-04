package org.hsbc.service;

public interface WalletService {
    double getBalance();

    double addMoney(double amount);

    double deductMoney(double amount);
}
