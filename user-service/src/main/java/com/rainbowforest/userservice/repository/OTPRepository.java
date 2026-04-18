package com.rainbowforest.userservice.repository;

import com.rainbowforest.userservice.entity.PasswordResetOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPRepository extends JpaRepository<PasswordResetOTP, Long> {
    Optional<PasswordResetOTP> findByEmailAndOtp(String email, String otp);
    void deleteByEmail(String email);
}
