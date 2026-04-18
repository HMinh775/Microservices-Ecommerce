package com.rainbowforest.orderservice.service;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.dto.CreateOrderRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface OrderService {
    Order saveOrder(Order order);
    void updateOrderStatus(Long orderId, String status);
    void deleteOrder(Long orderId);
    Order getOrderById(Long id);
    Page<Order> getAllOrders(Pageable pageable);
    Order createOrderFromRequest(CreateOrderRequest request);
}