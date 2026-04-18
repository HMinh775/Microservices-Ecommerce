package com.rainbowforest.productcatalogservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private HeaderGenerator headerGenerator;

    // Đọc đường dẫn thư mục lưu ảnh từ application.properties
    @Value("${upload.path}")
    private String uploadPath;

    // 1. LẤY TẤT CẢ SẢN PHẨM CÓ PHÂN TRANG
    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.getAllProduct(pageable);
        return new ResponseEntity<>(products, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    // 2. THÊM MỚI SẢN PHẨM (XỬ LÝ FILE ẢNH + DỮ LIỆU JSON)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> addProduct(
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("product") String productJson) {

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            Product product = objectMapper.readValue(productJson, Product.class);

            // Xử lý lưu file ảnh vào thư mục cấu hình
            if (image != null && !image.isEmpty()) {
                Path uploadDir = Paths.get(uploadPath);

                // Tạo thư mục nếu chưa có
                if (!Files.exists(uploadDir)) {
                    Files.createDirectories(uploadDir);
                }

                // Tên file ngắn hơn: 8 ký tự uuid + tên gốc (ví dụ: a1b2c3d4_ao_thun.jpg)
                String fileName = UUID.randomUUID().toString().substring(0, 8) + "_" + image.getOriginalFilename();
                Path filePath = uploadDir.resolve(fileName);

                try (InputStream inputStream = image.getInputStream()) {
                    Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
                }

                // Lưu tên file (kèm đuôi) vào DB
                product.setImage(fileName);
            }

            // Gán quan hệ cha-con cho variants
            if (product.getVariants() != null) {
                product.getVariants().forEach(v -> v.setProduct(product));
            }

            Product newProduct = productService.addProduct(product);
            return new ResponseEntity<>(newProduct, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 3. SERVE ẢNH: GET /products/images/{filename}
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadPath).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            // Tự detect content-type dựa theo đuôi file
            String contentType = "image/jpeg";
            String lower = filename.toLowerCase();
            if (lower.endsWith(".png"))  contentType = "image/png";
            else if (lower.endsWith(".gif"))  contentType = "image/gif";
            else if (lower.endsWith(".webp")) contentType = "image/webp";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 4. LẤY CHI TIẾT THEO ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getOneProductById(@PathVariable("id") long id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return new ResponseEntity<>(product, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
        }
        return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }

    // 5. XÓA SẢN PHẨM (XÓA CẢ FILE ẢNH)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") long id) {
        Product existingProduct = productService.getProductById(id);
        if (existingProduct != null && existingProduct.getImage() != null) {
            deleteImageFile(existingProduct.getImage());
        }
        productService.deleteProduct(id);
        return new ResponseEntity<>(headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
    }

    // 6. CẬP NHẬT SẢN PHẨM (HỖ TRỢ ĐỔI ẢNH BẰNG POST THAY VÌ PUT DO HẠN CHẾ MULTIPART)
    @PostMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Product> updateProduct(
            @PathVariable("id") long id,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @RequestParam("product") String productJson) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            Product product = objectMapper.readValue(productJson, Product.class);

            Product existingProduct = productService.getProductById(id);
            if (existingProduct == null) {
                return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
            }

            // Xử lý lưu ảnh mới nếu có tải lên
            if (image != null && !image.isEmpty()) {
                Path uploadDir = Paths.get(uploadPath);
                if (!Files.exists(uploadDir)) { Files.createDirectories(uploadDir); }
                String fileName = UUID.randomUUID().toString().substring(0, 8) + "_" + image.getOriginalFilename();
                Path filePath = uploadDir.resolve(fileName);
                try (InputStream inputStream = image.getInputStream()) {
                    Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
                }
                
                // XÓA ẢNH CŨ NẾU CÓ
                if (existingProduct.getImage() != null) {
                    deleteImageFile(existingProduct.getImage());
                }
                
                product.setImage(fileName);
            } else {
                // Nếu không up ảnh mới, giữ lại ảnh cũ
                product.setImage(existingProduct.getImage());
            }

            // Bảo toàn ID và quan hệ
            product.setId(id);
            if (product.getVariants() != null) {
                product.getVariants().forEach(v -> v.setProduct(product));
            }

            Product updatedProduct = productService.updateProduct(id, product);
            return new ResponseEntity<>(updatedProduct, headerGenerator.getHeadersForSuccessGetMethod(), HttpStatus.OK);
            
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // HÀM HỖ TRỢ XÓA FILE ẢNH VẬT LÝ
    private void deleteImageFile(String filename) {
        try {
            Path filePath = Paths.get(uploadPath).resolve(filename).normalize();
            Files.deleteIfExists(filePath);
        } catch (Exception e) {
            System.err.println("Lỗi khi xóa file: " + filename + " - " + e.getMessage());
        }
    }

    // 7. GIẢM TỒN KHO BIẾN THỂ (Gọi từ Order Service)
    @PutMapping("/variants/{variantId}/decreaseStock")
    public ResponseEntity<String> decreaseStock(
            @PathVariable("variantId") Long variantId,
            @RequestParam("quantity") int quantity) {
        try {
            boolean success = productService.decreaseVariantStock(variantId, quantity);
            if (success) {
                return ResponseEntity.ok("Tồn kho biến thể " + variantId + " đã giảm " + quantity);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Không đủ tồn kho cho biến thể " + variantId);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi: " + e.getMessage());
        }
    }
}