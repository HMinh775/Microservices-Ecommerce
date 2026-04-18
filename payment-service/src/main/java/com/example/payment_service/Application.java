package com.example.payment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients // <--- PHẢI CÓ DÒNG NÀY
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}