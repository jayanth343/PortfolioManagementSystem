package org.hsbc.service;

import org.hsbc.entity.TransactionEntity;
import org.hsbc.exception.InvalidTransactionIdException;

import java.util.List;

public interface TransactionService {
    TransactionEntity addTransaction(TransactionEntity transaction);

    List<TransactionEntity> getAllTransactions();

    List<TransactionEntity> getTransactionsBySymbol(String symbol);

    TransactionEntity getTransactionById(Long id) throws InvalidTransactionIdException;

    TransactionEntity updateTransaction(TransactionEntity transaction) throws InvalidTransactionIdException;

    void deleteTransaction(Long id) throws InvalidTransactionIdException;

}