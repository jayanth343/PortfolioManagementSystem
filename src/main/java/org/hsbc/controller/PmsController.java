package org.hsbc.controller;

import org.hsbc.entity.PmsEntity;
import org.hsbc.service.PmsService;
import org.hsbc.service.PmsServiceimp;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pms")
public class PmsController {


//    public List<PmsEntity> findAllPms(){
//        List<PmsEntity> pmsEntities = PmsEntity.finda
//        return pmsEntities;
//    }
@GetMapping("/all")
public List<PmsEntity> getAllAssets() {
    return service.getAllAssets();
}
    @GetMapping("/{id}")
    public PmsEntity getAssetById(@PathVariable Long id) {
        return service.getAssetById(id);
    }

    @Autowired
        public PmsService service;

        @PostMapping("/add")
        public PmsEntity addAsset(@RequestBody PmsEntity asset) {
            return service.addAsset(asset);
        }

        @DeleteMapping("/remove/{id}")
        public String removeAsset(@PathVariable Long id) {
            service.removeAsset(id);
            return "Asset removed successfully";
        }

        @PutMapping("/update-quantity/{id}")
        public PmsEntity updateQuantity(
                @PathVariable Long id,
                @RequestParam int quantity) {
            return service.updateQuantity(id, quantity);
        }

        @GetMapping("/pl/{id}")
        public double getPL(@PathVariable Long id) {
            return service.calculatePL(id);
        }

        @GetMapping("/pl-percentage/{id}")
        public double getPLPercentage(@PathVariable Long id) {
            return service.calculatePLPercentage(id);
        }

        @GetMapping("/total-value")
        public double getTotalValue() {
            return service.getTotalPortfolioValue();
        }
    }


