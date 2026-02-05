package org.hsbc.service;

import org.hsbc.entity.TransactionEntity;

import org.hsbc.repo.TransactionRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionSeviceimp implements TransactionService {
    private static final Logger log =
            LoggerFactory.getLogger(TransactionSeviceimp.class);

    private final TransactionRepo repository;

    public TransactionSeviceimp(TransactionRepo repository) {
        this.repository = repository;
    }

    @Override
    public TransactionEntity addTransaction(TransactionEntity transaction) {
        return repository.save(transaction);
    }

    @Override
    public List<TransactionEntity> getAllTransactions() {
        return repository.findAll();
    }

    @Override
    public List<TransactionEntity> getTransactionsBySymbol(String symbol) {
        return repository.findBySymbol(symbol);
    }
}
