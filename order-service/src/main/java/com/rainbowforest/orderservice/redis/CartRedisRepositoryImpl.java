package com.rainbowforest.orderservice.redis;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Repository
public class CartRedisRepositoryImpl implements CartRedisRepository {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void addItemToCart(String key, Object item) {
        // Sử dụng opsForSet() tương đương với sadd trong Jedis
        redisTemplate.opsForSet().add(key, item);
    }

    @Override
    public Collection<Object> getCart(String key, Class type) {
        Set<Object> members = redisTemplate.opsForSet().members(key);
        if (members == null) {
            return new ArrayList<>();
        }
        
        // Convert dữ liệu từ Redis (JSON/Map) về đúng kiểu Class mong muốn
        return members.stream()
                .map(item -> objectMapper.convertValue(item, type))
                .collect(Collectors.toList());
    }

    @Override
    public void deleteItemFromCart(String key, Object item) {
        // Tương đương với srem trong Jedis
        redisTemplate.opsForSet().remove(key, item);
    }

    @Override
    public void deleteCart(String key) {
        // Xóa toàn bộ key
        redisTemplate.delete(key);
    }
}