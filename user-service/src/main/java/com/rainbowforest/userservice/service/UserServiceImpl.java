package com.rainbowforest.userservice.service;

import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.entity.UserRole;
import com.rainbowforest.userservice.repository.UserRepository;
import com.rainbowforest.userservice.repository.UserRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @Override
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getUserByName(String userName) {
        return userRepository.findByUserName(userName);
    }

    @Override
    @Transactional
    public User saveUser(User user) {
        if (user.getId() == null) {
            user.setActive(1); 
            // Mã hóa mật khẩu khi đăng ký mới
            user.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
            UserRole role = userRoleRepository.findUserRoleByRoleName("ROLE_USER");
            user.setRole(role);
            return userRepository.save(user);
        } else {
            return userRepository.findById(user.getId()).map(existingUser -> {
                existingUser.setUserName(user.getUserName());
                
                // Chỉ mã hóa nếu mật khẩu thay đổi (so sánh plaintext mới với hash cũ hoặc đơn giản là luôn mã hóa nếu có giá trị)
                if (user.getUserPassword() != null && !user.getUserPassword().equals(existingUser.getUserPassword())) {
                    existingUser.setUserPassword(passwordEncoder.encode(user.getUserPassword()));
                }
                
                existingUser.setActive(user.getActive());
                
                if (user.getUserDetails() != null) {
                    if (existingUser.getUserDetails() == null) {
                        existingUser.setUserDetails(user.getUserDetails());
                    } else {
                        // Cập nhật các trường thông tin chi tiết
                        existingUser.getUserDetails().setFirstName(user.getUserDetails().getFirstName());
                        existingUser.getUserDetails().setLastName(user.getUserDetails().getLastName());
                        existingUser.getUserDetails().setEmail(user.getUserDetails().getEmail());
                        existingUser.getUserDetails().setPhoneNumber(user.getUserDetails().getPhoneNumber());
                        existingUser.getUserDetails().setStreet(user.getUserDetails().getStreet());
                        existingUser.getUserDetails().setStreetNumber(user.getUserDetails().getStreetNumber());
                        existingUser.getUserDetails().setZipCode(user.getUserDetails().getZipCode());
                        existingUser.getUserDetails().setLocality(user.getUserDetails().getLocality());
                        existingUser.getUserDetails().setCountry(user.getUserDetails().getCountry());
                    }
                }
                
                // CẬP NHẬT QUYỀN HẠN (ROLE)
                if (user.getRole() != null && user.getRole().getId() != null) {
                    UserRole role = userRoleRepository.findById(user.getRole().getId()).orElse(null);
                    if (role != null) existingUser.setRole(role);
                }
                
                return userRepository.save(existingUser);
            }).orElseGet(() -> userRepository.save(user));
        }
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User findUserByEmail(String email) {
        return userRepository.findByUserDetailsEmail(email);
    }

    @Override
    public boolean updatePassword(String email, String newPassword) {
        User user = userRepository.findByUserDetailsEmail(email);
        if (user != null) {
            // Mã hóa mật khẩu mới khi reset qua OTP
            user.setUserPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    @Transactional
    public void changePassword(Long id, String currentPassword, String newPassword) throws Exception {
        User user = userRepository.findById(id).orElseThrow(() -> new Exception("Người dùng không tồn tại"));
        
        // Kiểm tra mật khẩu hiện tại bằng BCrypt
        if (!passwordEncoder.matches(currentPassword, user.getUserPassword())) {
            throw new Exception("Mật khẩu hiện tại không chính xác");
        }
        
        // Cập nhật mật khẩu mới (đã mã hóa)
        user.setUserPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}