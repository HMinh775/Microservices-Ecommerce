package com.rainbowforest.orderservice.service;

import com.rainbowforest.orderservice.domain.Item;
import com.rainbowforest.orderservice.domain.Product;
import com.rainbowforest.orderservice.feignclient.ProductClient;
import com.rainbowforest.orderservice.redis.CartRedisRepository;
import com.rainbowforest.orderservice.utilities.CartUtilities;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private ProductClient productClient;

    @Autowired
    private CartRedisRepository cartRedisRepository;

    @Override
    public void addItemToCart(String cartId, Long productId, Integer quantity) {
        Product product = productClient.getProductById(productId);
        
        // Sử dụng Builder của Lombok để tạo Item mới (khớp với constructor lỗi dòng 24)
        Item item = Item.builder()
                .quantity(quantity)
                .variantId(product.getId()) // Lưu ID sản phẩm vào variantId
                .productName(product.getProductName())
                .priceAtPurchase(product.getPrice())
                .subTotal(CartUtilities.getSubTotalForItem(product, quantity))
                .build();
                
        cartRedisRepository.addItemToCart(cartId, item);
    }

    @Override
    public List<Object> getCart(String cartId) {
        return (List<Object>)cartRedisRepository.getCart(cartId, Item.class);
    }

    @Override
    public void changeItemQuantity(String cartId, Long productId, Integer quantity) {
        List<Item> cart = (List)cartRedisRepository.getCart(cartId, Item.class);
        for(Item item : cart){
            // Thay item.getProduct().getId() bằng item.getVariantId()
            if(item.getVariantId().equals(productId)){
                cartRedisRepository.deleteItemFromCart(cartId, item);
                item.setQuantity(quantity);
                
                // Tính lại subtotal dựa trên giá đã lưu lúc mua
                item.setSubTotal(item.getPriceAtPurchase().multiply(new java.math.BigDecimal(quantity)));
                
                cartRedisRepository.addItemToCart(cartId, item);
            }
        }
    }

    @Override
    public void deleteItemFromCart(String cartId, Long productId) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        for(Item item : cart){
            // Sửa lỗi cannot find symbol getProduct()
            if(item.getVariantId().equals(productId)){
                cartRedisRepository.deleteItemFromCart(cartId, item);
            }
        }
    }

    @Override
    public boolean checkIfItemIsExist(String cartId, Long productId) {
        List<Item> cart = (List) cartRedisRepository.getCart(cartId, Item.class);
        if (cart == null) return false;
        for(Item item : cart){
            // Sửa lỗi cannot find symbol getProduct()
            if(item.getVariantId().equals(productId)){
                return true;
            }
        }
        return false;
    }

    @Override
    public List<Item> getAllItemsFromCart(String cartId) {
        return (List)cartRedisRepository.getCart(cartId, Item.class);
    }

    @Override
    public void deleteCart(String cartId) {
        cartRedisRepository.deleteCart(cartId);
    }
}