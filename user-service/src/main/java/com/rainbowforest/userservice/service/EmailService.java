package com.rainbowforest.userservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOTP(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Mã xác thực đặt lại mật khẩu của bạn");
        message.setText("Chào bạn,\n\n"
                + "Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản tại Luxe Store.\n"
                + "Mã xác thực (OTP) của bạn là: " + otp + "\n"
                + "Mã này có hiệu lực trong 5 phút.\n\n"
                + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ Luxe Store.");
        mailSender.send(message);
    }
}
