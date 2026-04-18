-- ============================================================
--  FILE: user_order_payment_db.sql
--  CHẠY LẦN LƯỢT TRONG:
--    1. user_db
--    2. order_db
--    3. payment_db
--  (Mỗi phần có tiêu đề USE rõ ràng)
-- ============================================================


-- ============================================================
-- PHẦN 1: USER_DB
-- ============================================================
USE user_db;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM users;
DELETE FROM users_details;
DELETE FROM user_role;
ALTER TABLE users           AUTO_INCREMENT = 1;
ALTER TABLE users_details   AUTO_INCREMENT = 1;
ALTER TABLE user_role       AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- Vai trò
INSERT INTO user_role (id, role_name) VALUES
(1, 'ROLE_USER'),
(2, 'ROLE_ADMIN');

-- Thông tin chi tiết khách hàng
INSERT INTO users_details (id, first_name, last_name, email, phone_number, country, locality) VALUES
(1, 'Minh',   'Hồ Công',      'minh.ho@gmail.com',      '0901234567', 'Vietnam', 'Bình Định'),
(2, 'Lan',    'Nguyễn Thị',   'lan.nguyen@gmail.com',   '0902345678', 'Vietnam', 'Hà Nội'),
(3, 'Tuấn',   'Trần Anh',     'tuan.tran@gmail.com',    '0903456789', 'Vietnam', 'Đà Nẵng'),
(4, 'Hương',  'Lê Thu',       'huong.le@gmail.com',     '0904567890', 'Vietnam', 'TP.HCM'),
(5, 'Quốc',   'Phạm Anh',     'quoc.pham@gmail.com',   '0905678901', 'Vietnam', 'Cần Thơ'),
(6, 'Admin',  'System',        'admin@luxeshop.vn',      '0909999999', 'Vietnam', 'TP.HCM');

-- Tài khoản đăng nhập (password: 1234 — nên hash trong production)
INSERT INTO users (id, user_name, user_password, active, role_id, user_details_id) VALUES
(1, 'minh_it',    '1234', 1, 1, 1),
(2, 'lan_cute',   '1234', 1, 1, 2),
(3, 'tuan_dev',   '1234', 1, 1, 3),
(4, 'huong_9x',   '1234', 1, 1, 4),
(5, 'quoc_p',     '1234', 0, 1, 5),   -- tài khoản bị khóa để test
(6, 'admin',      'admin123', 1, 2, 6);


-- ============================================================
-- PHẦN 2: ORDER_DB
-- ============================================================
USE orders_db;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM order_items;
DELETE FROM orders;
ALTER TABLE order_items AUTO_INCREMENT = 1;
ALTER TABLE orders     AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- Đơn hàng
INSERT INTO orders (id, ordered_date, shipping_address, status, total_amount, user_id) VALUES
(1,  '2024-06-01 09:15:00', '123 Bùi Thị Xuân, Quy Nhơn, Bình Định',      'COMPLETED',  2069000, 1),
(2,  '2024-06-03 14:30:00', 'Số 5 Phố Láng, Đống Đa, Hà Nội',              'COMPLETED',  1200000, 2),
(3,  '2024-06-05 10:00:00', '789 Cách Mạng Tháng 8, Quận 10, TP.HCM',      'DELIVERING', 1170000, 3),
(4,  '2024-06-07 16:45:00', '45 Lê Duẩn, Hải Châu, Đà Nẵng',              'DELIVERING', 1690000, 3),
(5,  '2024-06-09 11:20:00', '88 Nguyễn Du, Quận 1, TP.HCM',               'PENDING',     830000, 4),
(6,  '2024-06-10 08:00:00', '12 Hoàng Hoa Thám, Bình Thạnh, TP.HCM',      'PENDING',    2790000, 1),
(7,  '2024-06-12 19:00:00', '99 Trần Phú, Nha Trang, Khánh Hòa',          'CANCELLED',   450000, 2),
(8,  '2024-06-14 13:30:00', '7 Điện Biên Phủ, Bình Thạnh, TP.HCM',        'COMPLETED',  1540000, 4);

-- Chi tiết đơn hàng
-- (variant_id khớp với thứ tự INSERT product_variants ở sql_product_db.sql)
INSERT INTO order_items (id, price_at_purchase, product_name, quantity, subtotal, variant_id, variant_info, order_id) VALUES
-- Đơn 1: Áo Thun Trắng M + Quần Jean Indigo 30
(1,  179000, 'Áo Thun Basic Cổ Tròn',      2, 358000,  2,  'Trắng / M',          1),
(2,  850000, 'Quần Jean Slim Fit 511',      2, 1700000, 27, 'Xanh Indigo / 30',  1),
-- Đơn 2: Váy Hoa Nhí S
(3,  1200000,'Váy Hoa Nhí Vintage A-line', 1, 1200000, 44, 'Hoa Nhí Đỏ / S',    2),
-- Đơn 3: Áo Sơ Mi Trắng M + Mũ Bucket
(4,  420000, 'Áo Sơ Mi Slim Fit Oxford',   1, 420000,  13, 'Trắng / M',          3),
(5,  350000, 'Mũ Bucket Hat Reversible',   2, 700000,  63, 'Đen-Trắng / One S',  3),
-- Đơn 4: Áo Polo Navy L + Thắt Lưng Đen 90
(6,  2490000,'Áo Polo Classic Piqué',      1, 2490000, 11, 'Xanh Navy / L',      4),
(7,  890000, 'Thắt Lưng Da Bò Full Grain', 1, 890000,  61, 'Đen / 90cm',         4),
-- Đơn 5: Hoodie Xám M + Short Cargo Be 29
(8,  450000, 'Áo Hoodie Oversize Fleece',  1, 450000,  18, 'Xám Tiêu / M',       5),
(9,  380000, 'Quần Short Cargo Kaki',      1, 380000,  35, 'Be / 29',            5),
-- Đơn 6: Áo Polo Đỏ L + Đầm Maxi Trắng M + Túi Tote Đen
(10, 2490000,'Áo Polo Classic Piqué',      1, 2490000, 10, 'Đỏ / L',             6),
(11, 990000, 'Đầm Maxi Linen Mùa Hè',     1, 990000,  52, 'Trắng Kem / M',      6),
(12, 299000, 'Túi Tote Canvas In Logo',    1, 299000,  57, 'Đen / One Size',     6),
-- Đơn 7: Áo Khoác Bomber Đen L (Cancelled)
(13, 550000, 'Áo Khoác Bomber Y2K',        1, 550000,  23, 'Đen / L',            7),
-- Đơn 8: Quần Tây Đen 30 + Chân Váy Đen M
(14, 650000, 'Quần Tây Âu Slim',           1, 650000,  31, 'Đen / 30',           8),
(15, 350000, 'Chân Váy Chữ A Kaki',        2, 700000,  47, 'Đen / M',            8);


-- ============================================================
-- PHẦN 3: PAYMENT_DB
-- ============================================================
USE payment_db;

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM payments;
ALTER TABLE payments AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- Thanh toán (khớp với order_id)
INSERT INTO payments (id, amount, created_at, order_id, payment_method, status) VALUES
-- Đơn 1 - VNPAY - Thành công
(1, 2069000, '2024-06-01 09:20:00', 1,  'VNPAY',    'SUCCESS'),
-- Đơn 2 - Thẻ ATM - Thành công
(2, 1200000, '2024-06-03 14:35:00', 2,  'ATM_CARD', 'SUCCESS'),
-- Đơn 3 - MoMo - Thành công
(3, 1170000, '2024-06-05 10:05:00', 3,  'MOMO',     'SUCCESS'),
-- Đơn 4 - Momo - Thành công
(4, 1690000, '2024-06-07 16:50:00', 4,  'MOMO',     'SUCCESS'),
-- Đơn 5 - COD - Chờ (chưa giao)
(5,  830000, '2024-06-09 11:25:00', 5,  'COD',      'PENDING'),
-- Đơn 6 - VNPAY - Thành công
(6, 2790000, '2024-06-10 08:05:00', 6,  'VNPAY',    'SUCCESS'),
-- Đơn 7 - Thẻ tín dụng - Hoàn tiền (đơn bị hủy)
(7,  550000, '2024-06-12 19:05:00', 7,  'CREDIT_CARD', 'REFUNDED'),
-- Đơn 8 - ATM - Thành công
(8, 1540000, '2024-06-14 13:35:00', 8,  'ATM_CARD', 'SUCCESS');
