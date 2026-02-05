package org.hsbc.service;

import org.hsbc.entity.WalletEntity;
import org.hsbc.repo.WalletRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WalletServiceImpl implements WalletService{
    private final WalletRepository repository;

    public WalletServiceImpl(WalletRepository repository) {
        this.repository = repository;
    }

    private WalletEntity getWallet() {
        return repository.findById(1L)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Wallet not found"));
    }

    @Override
    public double getBalance() {
        return getWallet().getBalance();
    }

    @Override
    public double addMoney(double amount) {
        WalletEntity wallet = getWallet();
        wallet.setBalance(wallet.getBalance() + amount);
        repository.save(wallet);
        return wallet.getBalance();
    }

    @Override
    public double deductMoney(double amount) {
        WalletEntity wallet = getWallet();

        if (wallet.getBalance() < amount) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Insufficient balance");
        }

        wallet.setBalance(wallet.getBalance() - amount);
        repository.save(wallet);
        return wallet.getBalance();
    }
    
    @Override
    public WalletEntity getWalletSummary() {
        return getWallet();
    }
}
