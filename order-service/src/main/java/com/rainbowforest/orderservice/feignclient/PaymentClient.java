package com.rainbowforest.orderservice.feignclient;

import com.rainbowforest.orderservice.dto.PaymentRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service")
public interface PaymentClient {
    
    @PostMapping("/payments")
    String createPayment(@RequestBody PaymentRequest request);
}
