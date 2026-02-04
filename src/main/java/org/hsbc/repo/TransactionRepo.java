package org.hsbc.repo;

import org.hsbc.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepo extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findBySymbol(String symbol);
}
