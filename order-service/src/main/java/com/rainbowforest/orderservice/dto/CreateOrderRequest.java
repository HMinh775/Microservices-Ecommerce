package com.rainbowforest.orderservice.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {
    private Long userId;
    private LocalDateTime orderedDate;
    private String shippingAddress;
    private String status;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private List<OrderItemRequest> orderItems;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private String productName;
        private int quantity;
        private BigDecimal priceAtPurchase;
        private BigDecimal subtotal;
        private Long variantId;
        private String variantInfo;
    }
}
