package com.rainbowforest.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
// Đã xóa @EnableEurekaClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }

    @Bean
    public CommandLineRunner updateDatabaseSchema(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                System.out.println(">>> DANG SUA LOI DO DAI MAT KHAU: Dang mo rong cot user_password...");
                jdbcTemplate.execute("ALTER TABLE users MODIFY user_password VARCHAR(255)");
                System.out.println(">>> MO RONG COT THANH CONG!");
            } catch (Exception e) {
                System.out.println(">>> LUU Y: " + e.getMessage());
            }
        };
    }
}