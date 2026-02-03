package org.hsbc.repo;

import org.hsbc.entity.PmsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface PmsRepository extends JpaRepository<PmsEntity, Long> {


        // Find by stock symbol (AAPL, TSLA, etc.)
        Optional<PmsEntity> findBySymbol(String symbol);

        // Find all assets of a type (STOCK, CRYPTO, etc.)
        List<PmsEntity> findByAssetType(String assetType);

        // Custom query: total investment value
        @Query("SELECT SUM(p.buyingValue) FROM PmsEntity p")
        Double getTotalBuyingValue();

        // Custom query: total current value
        @Query("SELECT SUM(p.currentPrice * p.quantity) FROM PmsEntity p")
        Double getTotalCurrentValue();


}
