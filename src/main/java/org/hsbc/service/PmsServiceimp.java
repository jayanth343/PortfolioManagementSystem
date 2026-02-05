package org.hsbc.service;

import org.hsbc.entity.PmsEntity;
import org.hsbc.exception.InvalidPmsIdException;
import org.hsbc.repo.PmsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PmsServiceimp implements PmsService {
    private static final Logger log =
            LoggerFactory.getLogger(PmsServiceimp.class);
        @Autowired
        private PmsRepository repository;

    // 1️⃣ Add Asset
    @Override
    public PmsEntity addAsset(PmsEntity asset) {
        asset.setBuyingValue(asset.getBuyPrice() * asset.getQuantity());
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
    public PmsEntity getAssetById(Long id) throws InvalidPmsIdException {
        Optional<PmsEntity> optAsset = repository.findById(id);
        if (optAsset.isEmpty()) {
            throw new InvalidPmsIdException("Asset not found with id " + id);
        }
        return optAsset.get();
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