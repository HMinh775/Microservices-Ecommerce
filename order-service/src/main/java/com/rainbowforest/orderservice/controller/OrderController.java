package com.rainbowforest.orderservice.controller;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Order;
import com.rainbowforest.orderservice.domain.User;
import com.rainbowforest.orderservice.dto.CreateOrderRequest;
import com.rainbowforest.orderservice.feignclient.UserClient;
import com.rainbowforest.orderservice.http.header.HeaderGenerator;
import com.rainbowforest.orderservice.service.CartService;
import com.rainbowforest.orderservice.service.OrderService;
import com.rainbowforest.orderservice.utilities.OrderUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/orders") // Thêm cái này để thống nhất đường dẫn /orders
public class OrderController {

    @Autowired
    private UserClient userClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CartService cartService;

    @Autowired
    private HeaderGenerator headerGenerator;

    // API MỚI: Tạo đơn hàng từ Frontend
    @PostMapping("")
    public ResponseEntity<?> createOrderFromFrontend(
            @RequestBody CreateOrderRequest request,
            HttpServletRequest httpRequest) {
        try {
            // Validate input
            if (request.getUserId() == null || request.getOrderItems() == null || request.getOrderItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Thông tin đơn hàng không hợp lệ");
            }
            
            // Tạo đơn hàng từ request
            Order order = orderService.createOrderFromRequest(request);
            
            return new ResponseEntity<>(
                    order,
                    headerGenerator.getHeadersForSuccessPostMethod(httpRequest, order.getId()),
                    HttpStatus.CREATED);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Lỗi: " + ex.getMessage());
        }
    }

    // 1. API Tạo đơn hàng từ Giỏ hàng (Bạn gọi cái này trước)
    @PostMapping(value = "/{userId}")
    public ResponseEntity<Order> saveOrder(
            @PathVariable("userId") Long userId,
            @RequestHeader(value = "Cookie") String cartId,
            HttpServletRequest request){
        
        List<Item> cart = cartService.getAllItemsFromCart(cartId);
        User user = userClient.getUserById(userId);   
        
        if(cart != null && user != null && !cart.isEmpty()) {
            Order order = this.createOrder(cart, user.getId()); 
            try {
                orderService.saveOrder(order);
                cartService.deleteCart(cartId);
                return new ResponseEntity<>(
                        order, 
                        headerGenerator.getHeadersForSuccessPostMethod(request, order.getId()),
                        HttpStatus.CREATED);
            } catch (Exception ex) {
                ex.printStackTrace();
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // 2. API CẬP NHẬT TRẠNG THÁI (Cực kỳ quan trọng - Payment Service gọi vào đây)
    // URL: PUT http://localhost:PORT/orders/{orderId}/status?status=PAID
    @PutMapping("/{orderId}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable("orderId") Long orderId, 
            @RequestParam("status") String status) {
        try {
            orderService.updateOrderStatus(orderId, status);
            return ResponseEntity.ok("Order " + orderId + " updated to " + status);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // 3. API Xóa đơn hàng (Admin)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok("Đã xóa đơn hàng #" + id);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    // 3. API Xem chi tiết đơn hàng (Dùng để kiểm tra sau khi thanh toán)
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        Order order = orderService.getOrderById(id);
        return order != null ? ResponseEntity.ok(order) : ResponseEntity.notFound().build();
    }
    // Thêm hàm này để Frontend có thể lấy toàn bộ danh sách đơn hàng có phân trang
@GetMapping("") 
public ResponseEntity<Page<Order>> getAllOrders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
    Pageable pageable = PageRequest.of(page, size);
    Page<Order> orders = orderService.getAllOrders(pageable);
    return ResponseEntity.ok(orders);
}

    // Hàm helper tạo Object Order từ Cart
    private Order createOrder(List<Item> cart, Long userId) {
        Order order = new Order();
        order.setItems(cart);
        order.setUserId(userId);
        order.setTotalAmount(OrderUtilities.countTotalPrice(cart));
        order.setOrderedDate(LocalDateTime.now());
        order.setStatus("PENDING"); // Để là PENDING cho dễ hiểu
        
        // Thiết lập quan hệ 2 chiều cho DB
        if (cart != null) {
            cart.forEach(item -> item.setOrder(order));
        }
        
        return order;
    }
}