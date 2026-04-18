package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sku; // Bổ sung: Mã định danh sản phẩm (VD: AT-TRANG-L)

    private String color; // Màu sắc

    private String size;  // Kích cỡ (S, M, L, XL, 32, 33...)

    @NotNull
    @PositiveOrZero(message = "Giá sản phẩm không được âm")
    private BigDecimal price; // Giá bán (mỗi size có thể giá khác nhau)

    @Column(name = "stock_quantity")
    @NotNull
    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    private int stockQuantity; // Số lượng tồn kho từng loại

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonBackReference
    private Product product;
}