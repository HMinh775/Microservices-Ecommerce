package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.entity.ProductVariant;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import com.rainbowforest.productcatalogservice.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductVariantRepository productVariantRepository;


    @Override
    public Page<Product> getAllProduct(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    @Override
    public List<Product> getAllProductByCategory(String category) {
        return productRepository.findAllByCategory(category);
    }

    @Override
    public Product getProductById(Long id) {
        // Thay getOne(id) bằng findById(id) để an toàn hơn và tránh lỗi rỗng
        return productRepository.findById(id).orElse(null);
    }

    @Override
    public List<Product> getAllProductsByName(String name) {
        // Đảm bảo trong Repository có hàm này
        return productRepository.findAllByProductName(name);
    }

    @Override
    public Product addProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    // THÊM HÀM NÀY ĐỂ HẾT LỖI ĐỎ (Nếu Interface có khai báo)
    @Override
    public Product updateProduct(Long id, Product product) {
        if (productRepository.existsById(id)) {
            product.setId(id); // Gán ID cũ để nó thực hiện Update thay vì Insert mới
            return productRepository.save(product);
        }
        return null;
    }
    
    // THÊM: Giảm tồn kho biến thể
    @Override
    public boolean decreaseVariantStock(Long variantId, int quantity) {
        Optional<ProductVariant> variant = productVariantRepository.findById(variantId);
        
        if (variant.isPresent()) {
            ProductVariant v = variant.get();
            // Kiểm tra có đủ tồn kho không
            if (v.getStockQuantity() >= quantity) {
                v.setStockQuantity(v.getStockQuantity() - quantity);
                productVariantRepository.save(v);
                System.out.println(">>> Đã giảm tồn kho biến thể " + variantId + " đi " + quantity);
                return true;
            } else {
                System.out.println(">>> Không đủ tồn kho: biến thể " + variantId + " chỉ còn " + v.getStockQuantity());
                return false;
            }
        }
        return false;
    }
}