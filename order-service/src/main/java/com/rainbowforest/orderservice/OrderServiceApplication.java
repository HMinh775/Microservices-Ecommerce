package com.rainbowforest.orderservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableFeignClients
@EnableJpaRepositories
// @EnableEurekaClient -> Đã bị xóa trong Spring Boot 3, Spring tự nhận diện
// @EnableWebSecurity -> Thường không cần thiết ở class Application nữa nếu đã có class SecurityConfig
// @EnableRedisHttpSession -> Spring Boot tự kích hoạt khi thấy dependency spring-session-data-redis
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}