# 💎 LUXE - Premium Microservices E-Commerce with AI 💎

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-orange)](https://deepmind.google/technologies/gemini/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-blue)](https://www.mysql.com/)

LUXE là một nền tảng thương mại điện tử hiện đại được xây dựng trên kiến trúc **Microservices** mạnh mẽ, sở hữu giao diện **Luxury Concept** tinh tế và tích hợp **Trí tuệ nhân tạo (AI)** để mang lại trải nghiệm mua sắm đẳng cấp.

---

## ✨ Điểm Nổi Bật (Key Features)

### 🤖 Trợ Lý Ảo AI (Google Gemini Integration)
- Một Chatbot AI thực thụ được tích hợp trực tiếp, biết tư vấn khách hàng dựa trên **dữ liệu sản phẩm thực tế** từ database.
- Tự động phản hồi về giá cả, mẫu mã và chính sách cửa hàng 24/7.

### 🎨 Giao Diện Luxury (Premium UI)
- Phong cách tối giản, sang trọng (Dark mode & Gold accent).
- Trải nghiệm mượt mà với Hiệu ứng Glassmorphism và Typography tinh tế từ Google Fonts.

### 🔐 Bảo Mật & Quản Trị (Admin & Security)
- Hệ thống **Phân quyền (RBAC)**: Tách biệt hoàn toàn luồng người dùng và Quản trị viên.
- Trang Admin Login bảo mật, Dashboard quản lý đơn hàng và sản phẩm chuyên sâu.

### 💳 Thanh Toán Đa Kênh (Smart Payment)
- **VietQR:** Tự động tạo mã QR ngân hàng (Vietcombank) chính xác đến từng đồng.
- **MoMo QR:** Tích hợp phương thức thanh toán ví điện tử MoMo cực nhanh.

---

## 🏗️ Kiến Trúc Hệ Thống (Architecture)

Dự án sử dụng mô hình Microservices với các thành phần chính:

| Service Name | Technology | Description |
| :--- | :--- | :--- |
| **Gateway Server** | Spring Cloud Gateway | Cổng kết nối duy nhất, điều phối và bảo mật các luồng request. |
| **Eureka Server** | Spring Cloud Netflix | Trung tâm đăng ký và khám phá dịch vụ (Service Discovery). |
| **User Service** | Spring Boot / JPA | Quản lý người dùng, phân quyền và bảo mật Admin. |
| **Catalog Service** | Spring Boot / MySQL | Quản lý kho hàng, sản phẩm và biến thể. |
| **Order Service** | Spring Boot / Feign | Xử lý quy trình đặt hàng và giỏ hàng. |
| **Payment Service** | Spring Boot | Tích hợp các giải pháp cổng thanh toán QR Code. |
| **Frontend** | React / Vite / CSS | Giao diện người dùng cao cấp và tương tác AI. |

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Backend:** Java 17+, Spring Boot 3, Spring Data JPA, Spring Cloud (Eureka, Gateway, Feign).
- **Frontend:** React JS, Vite, Axios, Google Gemini API Client.
- **Database:** MySQL (Lưu trữ dữ liệu), SQL Scripts tích hợp sẵn.
- **Tools:** Maven, Git, Postman.

---

## 🚀 Hướng Dẫn Khởi Chạy (Quick Start)

1. **Khởi động Middleware:** Đảm bảo MySQL đã chạy và import các file `.sql` trong thư mục gốc.
2. **Khởi động Backend:** 
   - Chạy `eureka-server` đầu tiên (Cổng 8761).
   - Chạy `api-gateway` (Cổng 8900).
   - Chạy các dịch vụ còn lại (`user-service`, `product-catalog-service`, `order-service`, `payment-service`).
3. **Khởi động Frontend:**
   - Vào thư mục `ecommerce-admin-frontend`.
   - Chạy `npm install` sau đó `npm run dev`.
   - Truy cập `http://localhost:5173`.

---

## 📬 Liên Hệ
Dự án được thực hiện nhằm trình diễn khả năng xây dựng hệ thống phân tán và tích hợp AI hiện đại. 

**Chúc bạn có trải nghiệm mua sắm tuyệt vời tại LUXE!** 🥂
