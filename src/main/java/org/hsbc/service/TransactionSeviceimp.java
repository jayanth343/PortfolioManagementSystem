package org.hsbc.service;

import org.hsbc.entity.TransactionEntity;
import org.hsbc.exception.InvalidTransactionIdException;
import org.hsbc.repo.TransactionRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionSeviceimp implements TransactionService {

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

    @Override
    public TransactionEntity getTransactionById(Long id) throws InvalidTransactionIdException {
        Optional<TransactionEntity> optTransaction = repository.findById(id);
        if (optTransaction.isEmpty()) {
            throw new InvalidTransactionIdException("Transaction not found with id " + id);
        }
        return optTransaction.get();
    }

    @Override
    public TransactionEntity updateTransaction(TransactionEntity transaction) throws InvalidTransactionIdException {
        getTransactionById(transaction.getTransactionId()); // Validate existence
        return repository.save(transaction);
    }

    @Override
    public void deleteTransaction(Long id) throws InvalidTransactionIdException {
        getTransactionById(id); // Validate existence
        repository.deleteById(id);
    }
}