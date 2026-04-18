package com.rainbowforest.userservice.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import com.rainbowforest.userservice.entity.User;

public interface UserService {
    Page<User> getAllUsers(Pageable pageable);
    User getUserById(Long id);
    User getUserByName(String userName);
    User saveUser(User user);
    void deleteUser(Long id);

    User findUserByEmail(String email);
    void updatePassword(String email, String newPassword);
}