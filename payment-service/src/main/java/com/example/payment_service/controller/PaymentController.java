package com.example.payment_service.controller;

import com.example.payment_service.model.PaymentRequest;
import com.example.payment_service.service.PaymentService;
import com.example.payment_service.entity.Payment;
import jakarta.servlet.http.HttpServletRequest; // Import này rất quan trọng
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // 1. API Tạo thanh toán (POST) - Cập nhật để hỗ trợ VNPay
    // Thêm HttpServletRequest để lấy IP của người dùng
    @PostMapping("")
    public String createPayment(@RequestBody PaymentRequest request, HttpServletRequest servletRequest) {
        return paymentService.processPayment(request, servletRequest);
    }

    // 1b. API Tạo thanh toán (POST /pay)
    @PostMapping("/pay")
    public String pay(@RequestBody PaymentRequest request, HttpServletRequest servletRequest) {
        return paymentService.processPayment(request, servletRequest);
    }

    // 2. API Lấy tất cả dữ liệu (GET) có phân trang
    @GetMapping()
    public Page<Payment> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return paymentService.getAllPayments(pageable);
    }

    // 3. API Sửa (PUT)
    @PutMapping("/{id}")
    public String update(@PathVariable Long id, @RequestBody PaymentRequest request) {
        return paymentService.updatePayment(id, request);
    }

    // 4. API Xóa (DELETE)
    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        return paymentService.deletePayment(id);
    }
}