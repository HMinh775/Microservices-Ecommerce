package com.rainbowforest.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class SessionFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // Logic check session của bạn viết ở đây
        // Ví dụ: lấy session từ header hoặc cookie
        System.out.println("Global Filter đang hoạt động!");
        
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return -1; // Chạy sớm nhất để check auth
    }
}