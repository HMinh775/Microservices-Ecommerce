package com.example.payment_service.service;

import com.example.payment_service.client.OrderClient;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.model.PaymentRequest;
import com.example.payment_service.repository.PaymentRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderClient orderClient;

    // Lấy thông tin từ file application.properties
    @Value("${vnpay.tmn-code}")
    private String vnp_TmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnp_HashSecret;

    @Value("${vnpay.pay-url}")
    private String vnp_PayUrl;

    @Value("${vnpay.return-url}")
    private String vnp_ReturnUrl;

    // Cấu hình Momo
    @Value("${momo.partner-code}")
    private String momo_PartnerCode;

    @Value("${momo.access-key}")
    private String momo_AccessKey;

    @Value("${momo.secret-key}")
    private String momo_SecretKey;

    @Value("${momo.pay-url}")
    private String momo_PayUrl;

    @Value("${momo.return-url}")
    private String momo_ReturnUrl;

    /**
     * Hàm chính xử lý thanh toán (Cập nhật từ hàm processPayment của bạn)
     */
    public String processPayment(PaymentRequest request, HttpServletRequest httpServletRequest) {
        // 1. Lưu bản ghi thanh toán với trạng thái PENDING
        Payment payment = new Payment();
        payment.setOrderId(request.getOrderId());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus("PENDING");
        paymentRepository.save(payment);

        // 2. Kiểm tra phương thức thanh toán
        if ("VNPAY".equalsIgnoreCase(request.getPaymentMethod())) {
            // Nếu là VNPAY -> Tạo Link và trả link về cho Frontend
            return createVnPayUrl(request, httpServletRequest);
        } else if ("MOMO".equalsIgnoreCase(request.getPaymentMethod())) {
            // Thay vì gọi API Momo thật (cần key), ta tạo QR Demo nhanh
            String amount = String.valueOf(request.getAmount().longValue());
            String addInfo = "Thanh toan MoMo cho DH" + request.getOrderId();
            // Tạo mã QR chứa thông tin thanh toán
            String qrUrl = String.format("https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MoMo_Pay:%s_Order:%s", 
                    amount, request.getOrderId());
            
            return "QRCODE_MOMO:" + qrUrl;
        } else if ("BANK_TRANSFER".equalsIgnoreCase(request.getPaymentMethod())) {
            // Nếu là Chuyển khoản ngân hàng -> Tạo link VietQR (Sử dụng thông tin bạn cung cấp)
            String bankId = "vcb";
            String accountNo = "1036467062";
            String accountName = "HO CONG MINH";
            String addInfo = "DH" + request.getOrderId(); // Nội dung chuyển khoản
            String amount = String.valueOf(request.getAmount().longValue());
            
            // Format URL VietQR: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<DESCRIPTION>&accountName=<NAME>
            String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                    bankId, accountNo, amount, addInfo, accountName.replace(" ", "%20"));
            
            return "QRCODE:" + qrUrl;
        } else {
            // Nếu là COD hoặc phương thức khác -> Xử lý như code cũ của bạn
            try {
                orderClient.updateOrderStatus(request.getOrderId(), "PAID");
                payment.setStatus("SUCCESS");
                paymentRepository.save(payment);
                return "SUCCESS";
            } catch (Exception e) {
                payment.setStatus("FAILED");
                paymentRepository.save(payment);
                return "FAILED";
            }
        }
    }

    /**
     * Logic tạo Link VNPay
     */
    private String createVnPayUrl(PaymentRequest request, HttpServletRequest httpServletRequest) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = String.valueOf(request.getOrderId()); // Dùng OrderId làm mã GD
        String vnp_IpAddr = httpServletRequest.getRemoteAddr();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        // Cách sửa 1: Thêm ngoặc đơn để nhân trước khi ép kiểu
        vnp_Params.put("vnp_Amount", String.valueOf((long) (request.getAmount() * 100)));// VNPay yêu cầu x100
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        // Thời gian tạo và hết hạn (15 phút)
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        vnp_Params.put("vnp_ExpireDate", formatter.format(cld.getTime()));

        // Sắp xếp các tham số và tạo chuỗi Query
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        try {
            for (String fieldName : fieldNames) {
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    // Build Hash Data
                    hashData.append(fieldName).append('=')
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build Query URL
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString())).append('=')
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }
            // Tạo SecureHash (Chữ ký bảo mật)
            String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
            return vnp_PayUrl + "?" + query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
        } catch (Exception e) {
            return "Error creating payment URL";
        }
    }

    /**
     * Hàm băm dữ liệu HMAC-SHA512 (Bắt buộc phải có để VNPay xác thực)
     */
    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Logic tạo Link MoMo (All-in-one)
     */
    private String createMomoUrl(PaymentRequest request) {
        try {
            String orderId = String.valueOf(request.getOrderId()) + "_" + System.currentTimeMillis();
            String requestId = String.valueOf(System.currentTimeMillis());
            String orderInfo = "Thanh toan don hang: " + request.getOrderId();
            String amount = String.valueOf(request.getAmount().longValue());
            String requestType = "captureWallet";
            String extraData = ""; // Có thể dùng để lưu thông tin thêm

            // 1. Tạo chuỗi raw signature theo quy tắc của Momo
            // format: accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
            String rawSignature = "accessKey=" + momo_AccessKey +
                    "&amount=" + amount +
                    "&extraData=" + extraData +
                    "&ipnUrl=" + momo_ReturnUrl +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + momo_PartnerCode +
                    "&redirectUrl=" + momo_ReturnUrl +
                    "&requestId=" + requestId +
                    "&requestType=" + requestType;

            // 2. Ký HMAC-SHA256
            String signature = hmacSHA256(momo_SecretKey, rawSignature);

            // 3. Tạo Body Request
            Map<String, Object> body = new HashMap<>();
            body.put("partnerCode", momo_PartnerCode);
            body.put("accessKey", momo_AccessKey);
            body.put("requestId", requestId);
            body.put("amount", amount);
            body.put("orderId", orderId);
            body.put("orderInfo", orderInfo);
            body.put("redirectUrl", momo_ReturnUrl);
            body.put("ipnUrl", momo_ReturnUrl); // Trong bản demo dùng chung return url
            body.put("extraData", extraData);
            body.put("requestType", requestType);
            body.put("signature", signature);
            body.put("lang", "vi");

            // 4. Gọi API Momo (Sử dụng RestTemplate)
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            org.springframework.http.ResponseEntity<Map> response = restTemplate.postForEntity(momo_PayUrl, body, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("payUrl")) {
                return (String) response.getBody().get("payUrl");
            } else {
                System.err.println("Momo Error Response: " + response.getBody());
                return "FAILED_TO_CREATE_MOMO_URL";
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "ERROR: " + e.getMessage();
        }
    }

    private String hmacSHA256(String key, String data) {
        try {
            Mac hmac256 = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac256.init(secretKey);
            byte[] result = hmac256.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    // Các hàm CRUD khác (giữ nguyên của bạn)
    public Page<Payment> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable);
    }

    public String updatePayment(Long id, PaymentRequest request) {
        /* code cũ */ return "";
    }

    public String deletePayment(Long id) {
        /* code cũ */ return "";
    }
}