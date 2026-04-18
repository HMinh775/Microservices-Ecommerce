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
        // Nếu chưa có trạng thái, đặt mặc định là PENDING
        if (order.getStatus() == null) {
            order.setStatus("PENDING");
        }
        return orderRepository.save(order);
    }

    @Override
    public void updateOrderStatus(Long orderId, String status) {
        // Tìm đơn hàng, nếu không có sẽ quăng lỗi (giúp Payment biết tại sao lỗi)
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + orderId));
        
        order.setStatus(status);
        orderRepository.save(order);
        
        // Log ra màn hình để bạn dễ debug khi test Postman
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
        return orderRepository.findAll(pageable); // Sử dụng Repository để lấy hết data có phân trang
    }
    
    @Override
    public Order createOrderFromRequest(CreateOrderRequest request) {
        // 1. Validate stock cho tất cả items trước
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getOrderItems()) {
            if (itemReq.getVariantId() == null || itemReq.getQuantity() <= 0) {
                throw new RuntimeException("Thông tin sản phẩm không hợp lệ");
            }
        }
        
        // 2. Tạo Order
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setOrderedDate(request.getOrderedDate() != null ? request.getOrderedDate() : java.time.LocalDateTime.now());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
        order.setTotalAmount(request.getTotalAmount());
        
        // 3. Convert OrderItemRequests thành Items
        List<Item> items = request.getOrderItems().stream()
                .map(itemReq -> Item.builder()
                        .productName(itemReq.getProductName())
                        .quantity(itemReq.getQuantity())
                        .priceAtPurchase(itemReq.getPriceAtPurchase())
                        .subTotal(itemReq.getSubtotal())
                        .variantId(itemReq.getVariantId())
                        .variantInfo(itemReq.getVariantInfo())
                        .order(order)
                        .build())
                .collect(Collectors.toList());
        
        order.setItems(items);
        
        // 4. Lưu order
        Order savedOrder = orderRepository.save(order);
        
        // 4b. Tự động tạo payment
        if (request.getPaymentMethod() != null && !request.getPaymentMethod().isEmpty()) {
            try {
                com.rainbowforest.orderservice.dto.PaymentRequest paymentReq = com.rainbowforest.orderservice.dto.PaymentRequest.builder()
                        .orderId(savedOrder.getId())
                        .amount(savedOrder.getTotalAmount())
                        .paymentMethod(request.getPaymentMethod())
                        .status("PENDING")
                        .build();
                paymentClient.createPayment(paymentReq);
                System.out.println(">>> Đã tạo Payment tự động cho Order: " + savedOrder.getId());
            } catch (Exception e) {
                System.out.println(">>> Cảnh báo: Lỗi khi tạo Payment: " + e.getMessage());
            }
        }
        
        // 5. Giảm tồn kho cho từng item (gọi sang Product Service)
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getOrderItems()) {
            try {
                String result = productClient.decreaseStock(itemReq.getVariantId(), itemReq.getQuantity());
                System.out.println(">>> " + result);
            } catch (Exception e) {
                System.out.println(">>> Cảnh báo: Không thể giảm tồn kho cho variant " + itemReq.getVariantId() + ": " + e.getMessage());
                // Không throw exception để order vẫn được tạo, nhưng ghi log
            }
        }
        
        return savedOrder;
    }
}