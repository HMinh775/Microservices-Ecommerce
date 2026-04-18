package com.rainbowforest.orderservice.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*; // Thêm import này
import java.util.List;

@Entity
@Table (name = "users")
@Data // Thêm cái này để tự sinh getId(), setId() cho TẤT CẢ các trường
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "user_name")
    @NotNull
    private String userName;

    // Lưu ý: Nếu bạn đã sửa Order.java theo hướng Microservices (chỉ lưu Long userId)
    // Thì bạn có thể xóa hoặc comment đoạn @OneToMany này đi để tránh lỗi mapping
    @OneToMany (mappedBy = "userId") 
    @JsonIgnore
    private List<Order> orders;
}