# 💎 LUXE - High-Speed Microservices E-Commerce with AI 💎

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://react.dev/)
[![Llama 3.1](https://img.shields.io/badge/AI-Llama%203.1%20(Groq)-orange)](https://groq.com/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-blue)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Cache-Redis-red)](https://redis.io/)

LUXE là một hệ thống thương mại điện tử cao cấp, vận hành trên kiến trúc **Microservices** hiện đại, kết hợp giao diện **Luxury Design** và trợ lý ảo **Llama 3.1 AI** siêu tốc.

---

## ✨ Điểm Nổi Bật (Key Features)

### ⚡ Trợ Lý AI Siêu Tốc (Groq Cloud & Llama 3.1)
- **Ultra-Fast Response:** Sử dụng mô hình **Llama 3.1 8B** qua **Groq API**, phản hồi gần như tức thì (< 500ms).
- **Autonomous Ordering:** AI có khả năng hiểu ý định mua hàng và tự động tạo đơn hàng ngay trong khung chat mà không cần qua nhiều bước.
- **Real-time Consulting:** Tư vấn sản phẩm thông minh dựa trên dữ liệu thực tế từ Product Service.

### 🏗️ Kiến Trúc Microservices Chuẩn
- Hệ thống chia nhỏ thành các dịch vụ độc lập: `User`, `Product`, `Order`, `Payment`.
- **Service Discovery (Eureka)** và **API Gateway** giúp quản lý request tập trung, bảo mật và cân bằng tải.
- Giao tiếp giữa các service qua **Feign Client** và tối ưu hiệu năng bằng **Redis Caching**.

### 🎨 Giao Diện Luxury (Premium UI/UX)
- Ngôn ngữ thiết kế sang trọng với hiệu ứng **Glassmorphism**, Dark Mode và các điểm nhấn Gold tinh tế.
- Trải nghiệm mượt mà với Typography hiện đại và các hiệu ứng chuyển cảnh cao cấp.

### 💳 Hệ Thống Thanh Toán Đa Kênh
- Tích hợp sẵn: **VietQR (Tự động tạo mã thanh toán)**, **MoMo** và **VNPay**.
- Luồng xử lý đơn hàng tự động hoàn toàn từ lúc đặt hàng đến khi cập nhật trạng thái.

---

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

| Service Name | Technology | Description |
| :--- | :--- | :--- |
| **Gateway Server** | Spring Cloud Gateway | Cổng kết nối duy nhất, điều phối và bảo mật các luồng request. |
| **Eureka Server** | Spring Cloud Netflix | Trung tâm đăng ký và khám phá dịch vụ (Service Discovery). |
| **User Service** | Spring Boot / JWT | Quản lý người dùng, phân quyền (RBAC) và bảo mật Admin. |
| **Catalog Service** | Spring Boot / MySQL | Quản lý kho hàng, sản phẩm và biến thể (Variants). |
| **Order Service** | Spring Boot / Feign | Xử lý quy trình đặt hàng, giỏ hàng và tích hợp Redis. |
| **Payment Service** | Spring Boot | Tích hợp các giải pháp cổng thanh toán QR Code & VNPay. |
| **Frontend** | React JS / Vite / CSS | Giao diện người dùng cao cấp và tương tác AI Chatbot. |

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Backend:** Java 17+, Spring Boot 3, Spring Data JPA, Spring Cloud, Spring Security.
- **Frontend:** React JS, Vite, Axios, Google Fonts (Outfit/Playfair Display).
- **AI Stack:** Llama 3.1 8B, Groq Cloud API (High-speed Inference Engine).
- **Infrastructure:** MySQL, Redis Caching, Maven, Git.

---

## 🚀 Hướng Dẫn Khởi Chạy (Quick Start)

1. **Khởi động Middleware:** Đảm bảo MySQL và Redis đã sẵn sàng.
2. **Khởi động Backend (Theo thứ tự):** 
   - `eureka-server` (Cổng 8761)
   - `api-gateway` (Cổng 8900)
   - Các dịch vụ: `user-service`, `product-catalog-service`, `order-service`, `payment-service`.
3. **Khởi động Frontend:**
   - Vào thư mục `ecommerce-admin-frontend`.
   - Chạy `npm install` và `npm run dev`.
   - Truy cập: `http://localhost:5173`.

---

## 📬 Liên Hệ
Dự án được thực hiện nhằm trình diễn khả năng xây dựng hệ thống phân tán và tích hợp AI hiện đại. 

**Chúc bạn có trải nghiệm tuyệt vời tại LUXE!** 🥂

