package com.rainbowforest.productcatalogservice.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   // Trong file Product.java
@NotBlank(message = "Tên sản phẩm không được để trống")
@Size(min = 2, max = 100, message = "Tên sản phẩm phải từ 2 đến 100 ký tự")
@com.fasterxml.jackson.annotation.JsonProperty("productName") // Khớp với React
private String productName;

@com.fasterxml.jackson.annotation.JsonProperty("brand")
private String brand;

@com.fasterxml.jackson.annotation.JsonProperty("material")
private String material;

@NotBlank(message = "Danh mục không được để trống")
@com.fasterxml.jackson.annotation.JsonProperty("category")
private String category;

@com.fasterxml.jackson.annotation.JsonProperty("description")
private String description;

@Column(name = "image")
@com.fasterxml.jackson.annotation.JsonProperty("image")
private String image;

@OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
@JsonManagedReference
@com.fasterxml.jackson.annotation.JsonProperty("variants")
private List<ProductVariant> variants;
}