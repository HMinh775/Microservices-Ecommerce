package com.rainbowforest.orderservice.feignclient;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import com.rainbowforest.orderservice.domain.Product;

@FeignClient(name = "product-catalog-service", url = "http://localhost:8810/")
public interface ProductClient {

    @GetMapping(value = "/products/{id}")
    public Product getProductById(@PathVariable(value = "id") Long productId);
    
    // THÊM: API để giảm tồn kho
    @PutMapping(value = "/products/variants/{variantId}/decreaseStock")
    public String decreaseStock(
            @PathVariable(value = "variantId") Long variantId,
            @RequestParam(value = "quantity") int quantity);
}
