package org.hsbc.service;

//Import statemnts
import org.hsbc.entity.PmsEntity;
import org.hsbc.entity.TransactionEntity;
import org.hsbc.exception.InvalidPmsIdException;
import org.hsbc.repo.PmsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PmsServiceimp implements PmsService {
    private static final Logger log = LoggerFactory.getLogger(PmsServiceimp.class);
    @Autowired
    private PmsRepository repository;

    @Autowired
    private WalletService walletService;

    // 1️⃣ Add Asset
    @Override
    public PmsEntity addAsset(PmsEntity asset) {
        // Calculate total cost
        double totalCost = asset.getBuyPrice() * asset.getQuantity();

        // Check and deduct from wallet (this will throw exception if insufficient
        // balance)
        walletService.deductMoney(totalCost);

        // Set purchase date and buying value
        asset.setPurchaseDate(LocalDate.now());
        asset.setBuyingValue(totalCost);

        return repository.save(asset);
    }

    // 2️⃣ Remove Asset
    @Override
    public void removeAsset(Long id) throws InvalidPmsIdException {
        getAssetById(id);
        repository.deleteById(id);
    }

    // 3️⃣ Update Quantity
    @Override
    public PmsEntity updateQuantity(Long id, int newQuantity) throws InvalidPmsIdException {
        PmsEntity asset = getAssetById(id);

        asset.setQuantity(newQuantity);
        asset.setBuyingValue(asset.getBuyPrice() * newQuantity);

        return repository.save(asset);
    }

    // 4️⃣ Calculate Profit / Loss
    @Override
    public double calculatePL(Long id) throws InvalidPmsIdException {
        PmsEntity asset = getAssetById(id);

        double buyingValue = asset.getBuyPrice() * asset.getQuantity();
        double currentValue = asset.getCurrentPrice() * asset.getQuantity();

        return currentValue - buyingValue;
    }

    // 5️⃣ Calculate P/L Percentage
    @Override
    public double calculatePLPercentage(Long id) throws InvalidPmsIdException {
        PmsEntity asset = getAssetById(id);

        double buyingValue = asset.getBuyPrice() * asset.getQuantity();
        double pl = calculatePL(id);

        if (buyingValue == 0)
            return 0;

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
    public PmsEntity getAssetById(Long id) throws InvalidPmsIdException {
        Optional<PmsEntity> optAsset = repository.findById(id);
        if (optAsset.isEmpty()) {
            throw new InvalidPmsIdException("Asset not found with id " + id);
        }
        return optAsset.get();
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
        throw new org.hsbc.exception.ResourceNotFoundException("Asset not found with symbol " + symbol);
    }

    @Override
    public PmsEntity buyAsset(String symbol, String companyName, int quantity, double price, String assetType) {
        // Calculate total cost and deduct from wallet
        double totalCost = price * quantity;
        walletService.deductMoney(totalCost);
        
        // Check if asset already exists
        Optional<PmsEntity> existingAsset = repository.findBySymbol(symbol);
        
        PmsEntity asset;
        if (existingAsset.isPresent()) {
            // Update existing asset
            asset = existingAsset.get();
            int newQuantity = asset.getQuantity() + quantity;
            
            // Calculate weighted average buy price
            double totalValue = (asset.getBuyPrice() * asset.getQuantity()) + (price * quantity);
            double avgBuyPrice = totalValue / newQuantity;
            
            asset.setQuantity(newQuantity);
            asset.setBuyPrice(avgBuyPrice);
            asset.setBuyingValue(totalValue);
            asset.setCurrentPrice(price);
        } else {
            // Create new asset
            asset = new PmsEntity();
            asset.setSymbol(symbol);
            asset.setCompanyName(companyName);
            asset.setQuantity(quantity);
            asset.setBuyPrice(price);
            asset.setCurrentPrice(price);
            asset.setBuyingValue(price * quantity);
            asset.setAssetType(assetType);
            asset.setPurchaseDate(LocalDate.now());
        }
        
        PmsEntity savedAsset = repository.save(asset);
        
        // Record transaction
        TransactionEntity transaction = new TransactionEntity(
            symbol,
            quantity,
            price,
            java.time.LocalDateTime.now(),
            "BUY"
        );
        transactionService.addTransaction(transaction);
        
        return savedAsset;
    }

    @Override
    public PmsEntity sellAsset(String symbol, int quantity) {
        Optional<PmsEntity> optAsset = repository.findBySymbol(symbol);
        
        if (optAsset.isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Asset not found with symbol " + symbol
            );
        }
        
        PmsEntity asset = optAsset.get();
        
        if (quantity > asset.getQuantity()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Cannot sell more than owned quantity. Available: " + asset.getQuantity()
            );
        }
        
        // Calculate sale proceeds and add to wallet
        double saleProceeds = asset.getCurrentPrice() * quantity;
        walletService.addMoney(saleProceeds);
        
        // Record transaction
        TransactionEntity transaction = new TransactionEntity(
            symbol,
            quantity,
            asset.getCurrentPrice(),
            java.time.LocalDateTime.now(),
            "SELL"
        );
        transactionService.addTransaction(transaction);
        
        if (quantity == asset.getQuantity()) {
            // Sell entire position
            repository.delete(asset);
            return null;
        } else {
            // Reduce quantity
            int newQuantity = asset.getQuantity() - quantity;
            asset.setQuantity(newQuantity);
            asset.setBuyingValue(asset.getBuyPrice() * newQuantity);
            return repository.save(asset);
        }
    }

}