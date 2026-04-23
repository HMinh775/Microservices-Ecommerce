package com.rainbowforest.userservice.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Value("${groq.api.prefix}")
    private String groqApiPrefix;

    @Value("${groq.api.token}")
    private String groqApiToken;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/ask")
    public ResponseEntity<?> askGroq(@RequestBody Map<String, Object> payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + groqApiPrefix + groqApiToken);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

        try {
            // Proxy yêu cầu sang Groq Cloud API
            return restTemplate.postForEntity(groqApiUrl, entity, Map.class);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi kết nối Groq AI từ Backend: " + e.getMessage()));
        }
    }
}
