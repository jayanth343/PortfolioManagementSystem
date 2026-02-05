package org.hsbc.service;

import org.hsbc.entity.PmsEntity;
import org.hsbc.exception.InvalidException;
import org.hsbc.repo.PmsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PmsServiceimp implements PmsService {

        @Autowired
        private PmsRepository repository;
        
        @Autowired
        private WalletService walletService;

        // 1️⃣ Add Asset
        @Override
        public PmsEntity addAsset(PmsEntity asset) {
            // Calculate total cost
            double totalCost = asset.getBuyPrice() * asset.getQuantity();
            
            // Check and deduct from wallet (this will throw exception if insufficient balance)
            walletService.deductMoney(totalCost);
            
            // Set purchase date and buying value
            asset.setPurchaseDate(LocalDate.now());
            asset.setBuyingValue(totalCost);
            
            return repository.save(asset);
        }

        // 2️⃣ Remove Asset
        @Override
        public void removeAsset(Long id) {
            repository.deleteById(id);
        }

        // 3️⃣ Update Quantity
        @Override
        public PmsEntity updateQuantity(Long id, int newQuantity) {
            PmsEntity asset = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Asset not found"));

            asset.setQuantity(newQuantity);
            asset.setBuyingValue(asset.getBuyPrice() * newQuantity);

            return repository.save(asset);
        }

        // 4️⃣ Calculate Profit / Loss
        @Override
        public double calculatePL(Long id) {
            PmsEntity asset = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Asset not found"));

            double buyingValue = asset.getBuyPrice() * asset.getQuantity();
            double currentValue = asset.getCurrentPrice() * asset.getQuantity();

            return currentValue - buyingValue;
        }

        // 5️⃣ Calculate P/L Percentage
        @Override
        public double calculatePLPercentage(Long id) {
            PmsEntity asset = repository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Asset not found"));

            double buyingValue = asset.getBuyPrice() * asset.getQuantity();
            double pl = calculatePL(id);

            if (buyingValue == 0) return 0;

            return (pl / buyingValue) * 100;
        }

        // 6️⃣ Total Portfolio Value
        @Override
        public double getTotalPortfolioValue() {
            return repository.findAll()
                    .stream()
                    .mapToDouble(a -> a.getCurrentPrice() * a.getQuantity())
                    .sum();
        }
    public PmsServiceimp(PmsRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<PmsEntity> getAllAssets() {
        return repository.findAll();
    }
    @Override
    public PmsEntity getAssetById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Asset not found with id " + id
                ));
    }

    @Override
    public PmsEntity updateCurrentPrice(String symbol, double newPrice) {
        List<PmsEntity> assets = repository.findAll();
        for (PmsEntity asset : assets) {
            if (asset.getSymbol().equalsIgnoreCase(symbol)) {
                asset.setCurrentPrice(newPrice);
                System.out.println("Updated " + symbol + " price to: " + newPrice);
                return repository.save(asset);
            }
        }
        throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Asset not found with symbol " + symbol
        );
    }
//
//    public PmsEntity findAllPms(long id) throws InvalidException {
//        Optional<PmsEntity> optProduct = repository.findById(id);
//        PmsEntity pmsEntity = optProduct.orElseThrow(
//                ()->new InvalidException("Id is not valid: " + id)
//        );
//
//        return pmsEntity;
//    }




}
