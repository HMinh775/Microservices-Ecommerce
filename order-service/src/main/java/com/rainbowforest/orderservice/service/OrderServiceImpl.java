package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.dto.CreateOrderRequest;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private ProductClient productClient;
    
    @Autowired
    private com.rainbowforest.orderservice.feignclient.PaymentClient paymentClient;

    @Override
    public Order saveOrder(Order order) {
        if (order.getStatus() == null) {
            order.setStatus("PENDING");
        }
        return orderRepository.save(order);
    }

    @Override
    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + orderId));
        
        order.setStatus(status);
        orderRepository.save(order);
        System.out.println(">>> Đã cập nhật đơn hàng " + orderId + " sang trạng thái: " + status);
    }

    @Override
    public void deleteOrder(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Không tìm thấy đơn hàng ID: " + orderId);
        }
        orderRepository.deleteById(orderId);
        System.out.println(">>> Đã xóa đơn hàng ID: " + orderId);
    }

    @Override
    public Order getOrderById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }
    
    @Override
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByOrderedDateDesc(userId);
    }
    
    @Override
    public Order createOrderFromRequest(CreateOrderRequest request) {
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getOrderItems()) {
            if (itemReq.getVariantId() == null || itemReq.getQuantity() <= 0) {
                throw new RuntimeException("Thông tin sản phẩm không hợp lệ");
            }
        }
        
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setOrderedDate(request.getOrderedDate() != null ? request.getOrderedDate() : java.time.LocalDateTime.now());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
        order.setTotalAmount(request.getTotalAmount());
        
        System.out.println(">>> CREATING ORDER FOR USER: " + request.getUserId());
        request.getOrderItems().forEach(i -> System.out.println("  - Item: " + i.getProductName() + ", Image: " + i.getImage()));

        List<Item> items = request.getOrderItems().stream()
                .map(itemReq -> Item.builder()
                        .productName(itemReq.getProductName())
                        .quantity(itemReq.getQuantity())
                        .priceAtPurchase(itemReq.getPriceAtPurchase())
                        .subTotal(itemReq.getSubtotal())
                        .variantId(itemReq.getVariantId())
                        .variantInfo(itemReq.getVariantInfo())
                        .image(itemReq.getImage())
                        .order(order)
                        .build())
                .collect(Collectors.toList());
        
        order.setItems(items);
        Order savedOrder = orderRepository.save(order);
        
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().isEmpty()) {
            try {
                com.rainbowforest.orderservice.dto.PaymentRequest paymentReq = com.rainbowforest.orderservice.dto.PaymentRequest.builder()
                        .orderId(savedOrder.getId())
                        .amount(savedOrder.getTotalAmount())
                        .paymentMethod(request.getPaymentMethod())
                        .status("PENDING")
                        .build();
                paymentClient.createPayment(paymentReq);
                System.out.println(">>> Auto created Payment for Order: " + savedOrder.getId());
            } catch (Exception e) {
                System.out.println(">>> Warning: Error creating Payment: " + e.getMessage());
            }
        }
        
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getOrderItems()) {
            try {
                String result = productClient.decreaseStock(itemReq.getVariantId(), itemReq.getQuantity());
                System.out.println(">>> Stock Update: " + result);
            } catch (Exception e) {
                System.out.println(">>> Warning: Failed to decrease stock for variant " + itemReq.getVariantId() + ": " + e.getMessage());
            }
        }
        
        return savedOrder;
    }
}