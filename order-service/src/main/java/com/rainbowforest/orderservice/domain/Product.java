package com.rainbowforest.orderservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data // Tự tạo Getter/Setter/getId...
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    // Lưu ý: Không dùng @GeneratedValue vì ID này phải khớp với ID từ Product Service gửi sang
    @Column(name = "id")
    private Long id;

    @Column(name = "product_name")
    @NotNull
    private String productName;

    @Column(name = "price")
    @NotNull
    private BigDecimal price;

    // QUAN TRỌNG: Đã xóa @OneToMany(mappedBy = "product") 
    // Vì trong Item.java mới chúng ta không còn biến 'product' nữa
}