package org.hsbc.controller;

import org.hsbc.entity.PmsEntity;
import org.hsbc.exception.InvalidPmsIdException;
import org.hsbc.service.PmsService;
import org.hsbc.service.PmsServiceimp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pms")
@CrossOrigin(origins = "*")
public class PmsController {
    private static final Logger log =
            LoggerFactory.getLogger(PmsController.class);


//    public List<PmsEntity> findAllPms(){
//        List<PmsEntity> pmsEntities = PmsEntity.finda
//        return pmsEntities;
//    }
@GetMapping("/all")
public List<PmsEntity> getAllAssets() {
    return service.getAllAssets();
}
    @GetMapping("/{id}")
    public PmsEntity getAssetById(@PathVariable Long id) throws InvalidPmsIdException {
        return service.getAssetById(id);
    }

    @Autowired
        public PmsService service;

        @PostMapping("/add")
        public PmsEntity addAsset(@RequestBody PmsEntity asset) {
            return service.addAsset(asset);
        }

        @DeleteMapping("/remove/{id}")
        public String removeAsset(@PathVariable Long id) throws InvalidPmsIdException {
            service.removeAsset(id);
            return "Asset removed successfully";
        }

        @PutMapping("/update-quantity/{id}")
        public PmsEntity updateQuantity(
                @PathVariable Long id,
                @RequestParam int quantity) throws InvalidPmsIdException {
            return service.updateQuantity(id, quantity);
        }

        @GetMapping("/pl/{id}")
        public double getPL(@PathVariable Long id) throws InvalidPmsIdException {
            return service.calculatePL(id);
        }

        @GetMapping("/pl-percentage/{id}")
        public double getPLPercentage(@PathVariable Long id) throws InvalidPmsIdException {
            return service.calculatePLPercentage(id);
        }

        @GetMapping("/total-value")
        public double getTotalValue() {
            return service.getTotalPortfolioValue();
        }

        @PutMapping("/update-price/{symbol}")
        public PmsEntity updateCurrentPrice(
                @PathVariable String symbol,
                @RequestParam double price) {
            return service.updateCurrentPrice(symbol, price);
        }
        
        @PostMapping("/buy")
        public PmsEntity buyAsset(
                @RequestParam String symbol,
                @RequestParam String companyName,
                @RequestParam int quantity,
                @RequestParam double price,
                @RequestParam String assetType) {
            return service.buyAsset(symbol, companyName, quantity, price, assetType);
        }
        
        @PostMapping("/sell")
        public PmsEntity sellAsset(
                @RequestParam String symbol,
                @RequestParam int quantity) {
            return service.sellAsset(symbol, quantity);
        }
    }



