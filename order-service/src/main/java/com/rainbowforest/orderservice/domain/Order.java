package com.rainbowforest.orderservice.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data // Dùng Lombok để bỏ đống Getter/Setter thủ công
@NoArgsConstructor
@AllArgsConstructor
@Builder // Hỗ trợ tạo Object nhanh: Order.builder().status("NEW").build()
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ordered_date")
    private LocalDateTime orderedDate; // Nên dùng LocalDateTime để có cả giờ phút giây

    @Column(name = "status")
    private String status; // Ví dụ: PENDING, SHIPPING, COMPLETED, CANCELLED

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    // CHỈNH SỬA QUAN TRỌNG: Đổi sang @OneToMany
    // Một Order có nhiều Item, và mỗi Item chỉ thuộc về 1 Order duy nhất
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id") // Tạo khóa ngoại order_id nằm bên bảng Item
    private List<Item> items;

    // Trong Microservices, ta chỉ lưu userId (Long) thay vì Map cả Object User
    // Để tránh việc Order Service phải truy cập trực tiếp DB của User Service
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name")
    private String userName; // Lưu tên để hiển thị nhanh
    
    @Column(name = "shipping_address")
    private String shippingAddress; // Shop quần áo thì cần địa chỉ giao hàng nhé!
}