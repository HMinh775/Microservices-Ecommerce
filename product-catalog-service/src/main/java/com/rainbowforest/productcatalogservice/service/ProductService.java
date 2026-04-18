package com.rainbowforest.productcatalogservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

import com.rainbowforest.productcatalogservice.entity.Product;

public interface ProductService {
    public Page<Product> getAllProduct(Pageable pageable);
    public List<Product> getAllProductByCategory(String category);
    public Product getProductById(Long id);
    public List<Product> getAllProductsByName(String name);
    
    // Giữ nguyên các hàm bạn đang có
    public Product addProduct(Product product); 
    public void deleteProduct(Long productId);

    // CHỈ THÊM hàm này để phục vụ nút Sửa trên Dashboard
    public Product updateProduct(Long id, Product product);
    
    // THÊM: Giảm tồn kho biến thể
    public boolean decreaseVariantStock(Long variantId, int quantity);
}
