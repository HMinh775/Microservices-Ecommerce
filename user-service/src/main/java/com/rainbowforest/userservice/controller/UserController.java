package com.rainbowforest.userservice.controller;

import com.rainbowforest.userservice.entity.PasswordResetOTP;
import com.rainbowforest.userservice.entity.User;
import com.rainbowforest.userservice.repository.OTPRepository;
import com.rainbowforest.userservice.service.EmailService;
import com.rainbowforest.userservice.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    // 1. LẤY TẤT CẢ NGƯỜI DÙNG CÓ PHÂN TRANG
    @GetMapping
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size){
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> users = userService.getAllUsers(pageable);
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 2. LẤY THEO ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") Long id){
        try {
            User user = userService.getUserById(id);
            if (user != null) {
                return new ResponseEntity<>(user, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 3. THÊM MỚI
    @PostMapping
    public ResponseEntity<User> addUser(@Valid @RequestBody User user){
        try {
            if (user != null) {
                User savedUser = userService.saveUser(user);
                return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
            }
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 4. ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<User> login(@Valid @RequestBody User loginRequest) {
        try {
            User user = userService.getUserByName(loginRequest.getUserName());
            if (user != null && user.getUserPassword() != null && user.getUserPassword().equals(loginRequest.getUserPassword())) {
                if (user.getActive() != 1) {
                    return new ResponseEntity<>(HttpStatus.FORBIDDEN);
                }
                return new ResponseEntity<>(user, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 5. XÓA
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long id) {
        try {
            User user = userService.getUserById(id);
            if (user != null) {
                userService.deleteUser(id);
                return new ResponseEntity<>(HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 6. CẬP NHẬT
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable("id") Long id, @Valid @RequestBody User user) {
        try {
            User currentUser = userService.getUserById(id);
            if (currentUser != null) {
                user.setId(id);
                User updatedUser = userService.saveUser(user);
                return new ResponseEntity<>(updatedUser, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 7. TEST ENDPOINT
    @GetMapping("/test")
    public String test() {
        return "UserController is working!";
    }

    // =============================
    // FORGOT PASSWORD / OTP SECTION
    // =============================

    // 8. YÊU CẦU OTP
    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.isBlank()) {
                return new ResponseEntity<>("Email không được để trống", HttpStatus.BAD_REQUEST);
            }

            User user = userService.findUserByEmail(email);
            if (user == null) {
                return new ResponseEntity<>("Email không tồn tại trong hệ thống", HttpStatus.NOT_FOUND);
            }

            // Tạo mã OTP 6 chữ số
            String otp = String.format("%06d", new Random().nextInt(999999));

            // Xóa OTP cũ (nếu có) và lưu OTP mới
            otpRepository.deleteByEmail(email);
            PasswordResetOTP resetOTP = new PasswordResetOTP(email, otp, 5);
            otpRepository.save(resetOTP);

            // Gửi email
            emailService.sendOTP(email, otp);
            return new ResponseEntity<>("Mã OTP đã được gửi đến email của bạn", HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>("Lỗi khi gửi email: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 9. XÁC NHẬN OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");

            Optional<PasswordResetOTP> otpOpt = otpRepository.findByEmailAndOtp(email, otp);
            if (otpOpt.isPresent()) {
                if (otpOpt.get().isExpired()) {
                    return new ResponseEntity<>("Mã OTP đã hết hạn", HttpStatus.BAD_REQUEST);
                }
                return new ResponseEntity<>("Mã OTP hợp lệ", HttpStatus.OK);
            }
            return new ResponseEntity<>("Mã OTP không chính xác", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 10. ĐẶT LẠI MẬT KHẨU
    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            String newPassword = request.get("newPassword");

            Optional<PasswordResetOTP> otpOpt = otpRepository.findByEmailAndOtp(email, otp);
            if (otpOpt.isPresent()) {
                if (otpOpt.get().isExpired()) {
                    return new ResponseEntity<>("Mã OTP đã hết hạn", HttpStatus.BAD_REQUEST);
                }

                userService.updatePassword(email, newPassword);
                otpRepository.deleteByEmail(email);

                return new ResponseEntity<>("Cập nhật mật khẩu thành công", HttpStatus.OK);
            }
            return new ResponseEntity<>("Mã OTP không chính xác hoặc đã hết hạn", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}