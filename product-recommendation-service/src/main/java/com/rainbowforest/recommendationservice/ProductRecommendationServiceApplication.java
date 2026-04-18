package com.rainbowforest.recommendationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableFeignClients // Giữ lại để dùng Feign Client gọi Service khác
@EnableJpaRepositories
// Đã xóa @EnableEurekaClient vì Spring Boot 3 tự động nhận diện    
public class ProductRecommendationServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProductRecommendationServiceApplication.class, args);
    }
}