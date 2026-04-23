package com.rainbowforest.orderservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items") // Đổi tên bảng cho rõ nghĩa
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quantity")
    @NotNull
    private int quantity;

    @Column(name = "price_at_purchase") // Giá tại thời điểm mua
    @NotNull
    private BigDecimal priceAtPurchase;

    @Column(name = "subtotal")
    @NotNull
    private BigDecimal subTotal;

    // QUAN TRỌNG: Chỉ lưu ID của Variant (biến thể size/màu)
    // Không dùng @ManyToOne trỏ sang Product entity của service khác
    @Column(name = "variant_id")
    @NotNull
    private Long variantId;

    // Lưu thêm thông tin String để hiển thị lại trong lịch sử đơn hàng 
    // mà không cần phải gọi sang Product Service lần nữa
    @Column(name = "product_name")
    private String productName;

    @Column(name = "variant_info") 
    private String variantInfo; // Ví dụ: "Size: L, Màu: Đen"

    @Column(name = "image")
    private String image;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonIgnore
    private Order order;
}