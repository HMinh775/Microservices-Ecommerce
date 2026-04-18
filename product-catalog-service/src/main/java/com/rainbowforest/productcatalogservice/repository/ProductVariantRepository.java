package com.rainbowforest.productcatalogservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.rainbowforest.productcatalogservice.entity.ProductVariant;

import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
    // Tìm biến thể theo ID
    public Optional<ProductVariant> findById(Long id);
}
