-- ============================================================
--  FILE: product_db.sql
--  CHẠY TRONG DATABASE: product_db
--  MÔ TẢ: Dữ liệu mẫu cho shop quần áo thời trang
-- ============================================================

USE product_db;

-- Tắt kiểm tra khóa ngoại để xóa sạch dữ liệu cũ
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM product_variants;
DELETE FROM products;
ALTER TABLE product_variants AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- ────────────────────────────────────────────────────────────
-- BẢNG products  (cột image = tên file lưu trong media-storage)
-- ────────────────────────────────────────────────────────────
INSERT INTO products (id, product_name, brand, material, category, description, image) VALUES
-- ÁO NAM
(1,  'Áo Thun Basic Cổ Tròn',       'Uniqlo',       '100% Cotton',       'Áo',          'Áo thun unisex tối giản, mềm mịn, thoáng mát cho mọi dịp.',              '1.jpg' ),
(2,  'Áo Polo Classic Piqué',        'Lacoste',      'Vải Piqué cao cấp', 'Áo',          'Polo lịch lãm sang trọng, phong cách thể thao quý tộc.',                 '2.jpg' ),
(3,  'Áo Sơ Mi Slim Fit Oxford',     'Owen',         'Vải Oxford chống nhăn','Áo',       'Sơ mi công sở giữ form suốt ngày, không nhăn, không phai màu.',           '3.jpg'),
(4,  'Áo Hoodie Oversize Fleece',    'H&M',          'Nỉ bông 320GSM',    'Áo',          'Hoodie dày dặn, ấm áp, form rộng unisex phù hợp cả nam lẫn nữ.',          '4.jpg'),
(5,  'Áo Khoác Bomber Y2K',          'Local Brand',  'Polyester ripstop', 'Áo',          'Khoác bomber phong cách streetwear, chống gió nhẹ.',                       '5.jpg'),
-- QUẦN NAM
(6,  'Quần Jean Slim Fit 511',       'Levi\'s',      'Denim co giãn 98/2','Quần',        'Dáng ôm chuẩn, màu xanh indigo wash, bền màu theo thời gian.',            '6.jpg'),
(7,  'Quần Tây Âu Slim',             'Aristino',     'Vải Tuyết mưa PE',  'Quần',        'Quần tây công sở dáng đứng, không nhăn, dễ mix đồ.',                      '7.jpg'),
(8,  'Quần Short Cargo Kaki',        'Dickies',      'Kaki thô 100% Cotton','Quần',      'Quần lửng nhiều túi, phong cách bụi bặm cá tính.',                        '8.jpg'),
(9,  'Quần Jogger Thể Thao',         'Nike',         'Vải DryFit 4-way',  'Quần',        'Co giãn 4 chiều, thấm hút mồ hôi nhanh, lý tưởng tập gym.',               '9.jpg'),
-- VÁY / ĐÀM NỮ
(10, 'Váy Hoa Nhí Vintage A-line',   'IVY moda',     'Vải Voan mềm',      'Váy',         'Váy dáng A tôn dáng, họa tiết hoa nhí nữ tính dịu dàng.',                 '10.jpg'),
(11, 'Chân Váy Chữ A Kaki',          'Nem Fashion',  'Kaki cao cấp',      'Váy',         'Chân váy dài qua gối, thanh lịch dễ phối với áo blouse hay áo sơ mi.',    '11.jpg'),
(12, 'Đầm Maxi Linen Mùa Hè',       'Zara',         'Linen 100%',        'Váy',         'Đầm dài thoáng mát cho ngày hè, thiết kế tối giản tinh tế.',              '12.jpg'),
-- PHỤ KIỆN
(13, 'Túi Tote Canvas In Logo',      'adidas',       'Canvas 12oz',       'Phụ kiện',    'Túi tote cỡ lớn, chắc chắn, in logo nổi bật, đựng vừa laptop 15".',       '13.jpg'),
(14, 'Mũ Bucket Hat Reversible',     'New Era',      'Cotton twill',      'Phụ kiện',    'Mũ bucket 2 mặt, có thể mix phong cách khác nhau.',                       '14.jpg'),
(15, 'Thắt Lưng Da Bò Full Grain',   'Pedro',        'Da bò thật',        'Phụ kiện',    'Thắt lưng da thật cao cấp, bền bỉ theo năm tháng.',                       '15.jpg'),
-- THÊM 35 SẢN PHẨM MỚI
(16, 'Áo Sơ Mi Linen Trắng',         'Zara',         'Linen 100%',        'Áo',          'Sơ mi linen mát mẻ, thích hợp cho hè và những ngày trời nóng.',           '16.jpg'),
(17, 'Áo Thun Graphic Print',        'H&M',          'Cotton 100%',       'Áo',          'Áo thun in họa tiết thời trang, năng động và cá tính.',                  '17.jpg'),
(18, 'Áo Blazer Slim Fit',           'Zara',         'Vải Wool blend',    'Áo',          'Blazer lịch lãm, perfect cho công sở và dự tiệc.',                        '18.jpg'),
(19, 'Áo Cardigan Dệt Kim',          'Uniqlo',       'Acrylic 100%',      'Áo',          'Cardigan ấm áp, dễ phối, phù hợp mọi mùa.',                              '19.jpg'),
(20, 'Áo Sweater Cơ Bản',            'Lacoste',      'Cotton blend',      'Áo',          'Sweater cổ lọ ấm áp, màu sắc đa dạng.',                                  '20.jpg'),
(21, 'Áo Crop Top',                  'H&M',          'Cotton 100%',       'Áo',          'Crop top hiện đại, tôn dáng cho mùa hè.',                                '21.jpg'),
(22, 'Áo Tanktop Nam',               'Nike',         'Polyester blend',   'Áo',          'Tanktop thấm hút mồ hôi, lý tưởng cho tập luyện.',                       '22.jpg'),
(23, 'Quần Chinos Slim',             'Aristino',     'Cotton blend',      'Quần',        'Quần chinos dáng slim, dễ phối, không bị nhăn.',                         '23.jpg'),
(24, 'Quần Tây Công Sở',             'Hugo Boss',    'Wool blend',        'Quần',        'Quần tây cao cấp, bền bỉ và sang trọng.',                                '24.jpg'),
(25, 'Quần Denim Ripped',            'Topshop',      'Denim 100%',        'Quần',        'Quần jean ripped trend hiện nay, cá tính và năng động.',                 '25.jpg'),
(26, 'Quần Kaki Casual',             'Dockers',      'Cotton blend',      'Quần',        'Quần kaki thoải mái, phù hợp cho ngày thường.',                          '26.jpg'),
(27, 'Quần Palazzo Nữ',              'Zara',         'Rayon blend',      ('Váy'),       ('Váy palazzo rộng rãi, nữ tính và thanh lịch.'),                         ('27.jpg')),
(28,('Legging Co Giãn'),             ('Nike'),        ('Nylon blend'),      ('Quần'),       ('Legging thoáng mát, co giãn 4 chiều.'),                                  ('28.jpg')),
(29,('Đầm Cocktail'),                ('Zara'),        ('Polyester blend'),  ('Váy'),        ('Đầm ngắn thanh lịch, phù hợp cho các cuộc tiệc.'),                       ('29.jpg')),
(30, 'Váy Denim Ngắn',               'H&M',          'Denim 100%',        'Váy',         'Váy denim ngắn, kinh điển và dễ phối.',                                 '30.jpg'),
(31, 'Váy Midi Nữ Tính',             'IVY moda',     'Linen blend',       'Váy',         'Váy midi tôn dáng, vải mềm mại.',                                       '31.jpg'),
(32, 'Váy Xếp Ly Học Sinh',          'Local Brand',  'Polyester blend',   'Váy',         'Váy xếp ly trẻ trung, phong cách Hàn Quốc.',                             '32.jpg'),
(33, 'Túi Đeo Chéo',                 'Zara',         'Canvas',            'Phụ kiện',    'Túi đeo chéo tiện lợi, dung tích vừa chứa đồ cần thiết.',                 '33.jpg'),
(34, 'Túi Xách Tay',                 'Coach',        'Leather blend',     'Phụ kiện',    'Túi xách cao cấp, bảo hành 5 năm.',                                      '34.jpg'),
(35, 'Úp Lê Len Lừng',               'Uniqlo',       'Wool 100%',         'Phụ kiện',    'Úp lê ấm áp, tạo điểm nhấn cho outfit.',                                 '35.jpg'),
(36, 'Khăn Quàng Cổ',                'Burberry',     'Silk blend',        'Phụ kiện',    'Khăn quàng cao cấp, sang trọng và thanh lịch.',                          '36.jpg'),
(37, 'Mũ Nón Lưỡi Trai',             'Adidas',       'Cotton twill',      'Phụ kiện',    'Mũ nón thể thao, bảo vệ tốt từ tia UV.',                                 '37.jpg'),
(38, 'Giày Sneaker Nam',             'Nike',         'Mesh + Synthetic',  'Phụ kiện',    'Sneaker thoáng mát, phù hợp cho hoạt động hàng ngày.',                   '38.jpg'),
(39, 'Giày Oxford Công Sở',          'Clarks',       'Leather',           'Phụ kiện',    'Giày oxford chính hãng, thoải mái suốt cả ngày.',                        '39.jpg'),
(40, 'Sandal Da Thun',               'Birkenstock',  'Leather + Cork',    'Phụ kiện',    'Sandal da Đức, lâu bền và thoải mái.',                                  '40.jpg'),
(41, 'Áo Khoác Gió Lightweight',     'Columbia',     'Polyester',         'Áo',          'Khoác gió nhẹ, dễ gấp gọn, phù hợp phượt.',                              '41.jpg'),
(42, 'Áo Denim Jacket',              'Levi\'s',      'Denim 100%',        'Áo',         'Áo denim cổ điển, bền bỉ theo năm tháng.',                               '42.jpg'),
(43, 'Áo Overcoat Dài',              'Zara',         'Wool blend',        'Áo',          'Overcoat dài sang trọng, phù hợp cho mùa lạnh.',                       ('43.jpg')),
(44,('Áo Gilet Phông'),               ('H&M'),          ('Nylon'),             ('Áo'),          ('Gilet phông ấm áp, nhẹ nhàng không bí bách.'),                            ('44.jpg')),
(45, 'Quần Tây Công Sở Premium',     'Armani',       'Wool 100%',         'Quần',        'Quần tây cao cấp, may tuyệt vời, bền lâu.',                              '45.jpg'),
(46, 'Quần Jogger Cotton',           'Adidas',       'Cotton blend',      'Quần',        'Quần jogger thoệ dễ chịu, phù hợp cho nhà.',                             '46.jpg'),
(47, 'Quần Short Jean Nữ',           'Topshop',      'Denim 100%',        'Quần',        'Quần short denim, kinh điển và dễ phối.',                               '47.jpg'),
(48, 'Váy Trễ Vai Nữ Tính',          'Zara',         'Cotton blend',      'Váy',         'Váy trễ vai nhẹ nhàng, phù hợp cho hẹn hò.',                             '48.jpg'),
(49, 'Váy Công Chúa Tulle',          'Local Brand',  'Tulle + Lining',    'Váy',         'Váy công chúa sang trọng, lý tưởng cho tiệc cưới.',                     '49.jpg'),
(50, 'Đầm Bodycon Bó Sát',           'ASOS',         'Elastane blend',    'Váy',         'Đầm bó sát tôn dáng, hoàn hảo cho những dạo chơi ban đêm.',              '50.jpg');

-- ────────────────────────────────────────────────────────────
-- BẢNG product_variants
-- ────────────────────────────────────────────────────────────
INSERT INTO product_variants (color, size, price, stock_quantity, product_id) VALUES
-- SP1: Áo Thun Basic (Uniqlo)
('Trắng',       'S',   179000, 80,  1),
('Trắng',       'M',   179000, 120, 1),
('Trắng',       'L',   179000, 100, 1),
('Đen',         'M',   179000, 90,  1),
('Đen',         'L',   179000, 85,  1),
('Navy',        'M',   179000, 70,  1),
('Navy',        'L',   179000, 60,  1),
-- SP2: Áo Polo Lacoste
('Trắng',       'M',  2490000, 10,  2),
('Đỏ',          'M',  2490000, 8,   2),
('Đỏ',          'L',  2490000, 6,   2),
('Xanh Navy',   'L',  2490000, 12,  2),
('Xanh Navy',   'XL', 2590000, 5,   2),
-- SP3: Áo Sơ Mi Owen
('Trắng',       'M',   420000, 30,  3),
('Trắng',       'L',   420000, 25,  3),
('Xanh Nhạt',   'M',   420000, 20,  3),
('Xanh Nhạt',   'L',   420000, 18,  3),
('Kẻ Caro',     'L',   450000, 15,  3),
-- SP4: Áo Hoodie H&M
('Xám Tiêu',    'M',   450000, 50,  4),
('Xám Tiêu',    'L',   450000, 45,  4),
('Xám Tiêu',    'XL',  450000, 30,  4),
('Đen',         'M',   450000, 40,  4),
('Đen',         'L',   450000, 38,  4),
-- SP5: Áo Khoác Bomber
('Đen',         'L',   550000, 25,  5),
('Đen',         'XL',  580000, 20,  5),
('Be',          'M',   550000, 15,  5),
-- SP6: Quần Jean Levi's
('Xanh Indigo', '29',  850000, 15,  6),
('Xanh Indigo', '30',  850000, 20,  6),
('Xanh Indigo', '31',  850000, 18,  6),
('Xanh Indigo', '32',  850000, 12,  6),
('Xanh Nhạt',   '30',  890000, 10,  6),
('Đen',         '30',  890000, 8,   6),
-- SP7: Quần Tây Aristino
('Đen',         '28',  650000, 12,  7),
('Đen',         '30',  650000, 15,  7),
('Xám',         '30',  650000, 10,  7),
('Xám',         '32',  650000, 8,   7),
-- SP8: Quần Short Cargo
('Be',          '29',  380000, 20,  8),
('Be',          '31',  380000, 18,  8),
('Đen',         '29',  380000, 22,  8),
-- SP9: Quần Jogger Nike
('Đen',         'S',   690000, 30,  9),
('Đen',         'M',   690000, 45,  9),
('Đen',         'L',   690000, 40,  9),
('Xám',         'M',   690000, 35,  9),
-- SP10: Váy Hoa Nhí IVY
('Hoa Nhí Đỏ',  'XS', 1200000, 10, 10),
('Hoa Nhí Đỏ',  'S',  1200000, 12, 10),
('Hoa Nhí Đỏ',  'M',  1200000, 8,  10),
('Hoa Nhí Xanh','S',  1200000, 15, 10),
-- SP11: Chân Váy Nem
('Đen',         'S',   350000, 20, 11),
('Đen',         'M',   350000, 25, 11),
('Đen',         'L',   350000, 15, 11),
('Trắng Kem',   'M',   380000, 18, 11),
-- SP12: Đầm Maxi Zara
('Trắng Kem',   'S',   990000, 8,  12),
('Trắng Kem',   'M',   990000, 10, 12),
('Đen',         'S',   990000, 6,  12),
('Đen',         'M',   990000, 9,  12),
-- SP13: Túi Tote adidas
('Đen',         'One Size', 299000, 50, 13),
('Trắng',       'One Size', 299000, 40, 13),
('Xanh Navy',   'One Size', 299000, 35, 13),
-- SP14: Mũ Bucket
('Đen/Trắng',   'One Size', 350000, 30, 14),
('Nâu/Beige',   'One Size', 350000, 25, 14),
-- SP15: Thắt Lưng Pedro
('Đen',         '90cm',  890000, 10, 15),
('Đen',         '95cm',  890000, 12, 15),
('Nâu',         '90cm',  890000, 8,  15),
('Nâu',         '95cm',  890000, 10, 15),
-- SP16: Áo Sơ Mi Linen Zara
('Trắng',       'S',   580000, 25, 16),
('Trắng',       'M',   580000, 30, 16),
('Trắng',       'L',   580000, 20, 16),
('Beige',       'M',   590000, 15, 16),
-- SP17: Áo Thun Graphic H&M
('Đen',         'S',   199000, 40, 17),
('Đen',         'M',   199000, 50, 17),
('Đen',         'L',   199000, 35, 17),
('Xám',         'M',   199000, 25, 17),
-- SP18: Áo Blazer Zara
('Đen',         'S',   490000, 15, 18),
('Đen',         'M',   490000, 20, 18),
('Nâu',         'M',   490000, 12, 18),
-- SP19: Áo Cardigan Uniqlo
('Trắng',       'S',   349000, 30, 19),
('Đen',         'M',   349000, 35, 19),
('Xám',         'L',   349000, 25, 19),
('Navy',        'M',   349000, 28, 19),
-- SP20: Sweater Lacoste
('Trắng',       'S',   890000, 12, 20),
('Navy',        'M',   890000, 18, 20),
('Đỏ',          'L',   890000, 10, 20),
-- SP21: Áo Crop Top H&M
('Trắng',       'XS',  149000, 50, 21),
('Đen',         'S',   149000, 45, 21),
('Hồng',        'S',   149000, 35, 21),
-- SP22: Tanktop Nike
('Đen',         'S',   259000, 40, 22),
('Xám',         'M',   259000, 50, 22),
('Trắng',       'L',   259000, 30, 22),
-- SP23: Quần Chinos Aristino
('Xám',         '28',  520000, 20, 23),
('Xám Đen',     '30',  520000, 25, 23),
('Be',          '30',  520000, 18, 23),
-- SP24: Quần Tây Hugo Boss
('Đen',         '30',  1690000, 8, 24),
('Xám',         '32',  1690000, 10, 24),
('Navy',        '30',  1690000, 6, 24),
-- SP25: Quần Denim Ripped Topshop
('Xanh Đậm',    '25',  450000, 30, 25),
('Xanh Nhạt',   '26',  450000, 25, 25),
('Đen',         '27',  450000, 20, 25),
-- SP26: Quần Kaki Dockers
('Xám',         '30',  450000, 25, 26),
('Be',          '32',  450000, 20, 26),
('Xám Đen',     '30',  450000, 15, 26),
-- SP27: Quần Palazzo Zara
('Đen',         'S',   590000, 20, 27),
('Xám',         'M',   590000, 18, 27),
('Trắng',       'L',   590000, 12, 27),
-- SP28: Legging Nike
('Đen',         'XS',  590000, 35, 28),
('Đen',         'S',   590000, 40, 28),
('Navy',        'M',   590000, 28, 28),
('Xám',         'L',   590000, 20, 28),
-- SP29: Đầm Cocktail Zara
('Đen',         'S',   690000, 12, 29),
('Đỏ',          'M',   690000, 10, 29),
('Navy',        'L',   690000, 8,  29),
-- SP30: Váy Denim H&M
('Xanh Đậm',    'S',   449000, 25, 30),
('Xanh Nhạt',   'M',   449000, 30, 30),
('Đen',         'L',   449000, 20, 30),
-- SP31: Váy Midi IVY
('Xám',         'S',   590000, 18, 31),
('Xám',         'M',   590000, 22, 31),
('Trắng Kem',   'L',   590000, 15, 31),
-- SP32: Váy Xếp Ly Local Brand
('Trắng',       'S',   320000, 35, 32),
('Xám',         'M',   320000, 40, 32),
('Đen',         'L',   320000, 30, 32),
-- SP33: Túi Đeo Chéo Zara
('Đen',         'One Size', 450000, 40, 33),
('Camel',       'One Size', 450000, 30, 33),
('Navy',        'One Size', 450000, 25, 33),
-- SP34: Túi Xách Coach
('Đen',         'One Size', 2890000, 15, 34),
('Nâu',         'One Size', 2890000, 12, 34),
-- SP35: Úp Lê Uniqlo
('Xám',         'S',   390000, 25, 35),
('Navy',        'M',   390000, 30, 35),
('Đỏ',          'L',   390000, 20, 35),
-- SP36: Khăn Quàng Burberry
('Be/Check',    'One Size', 3490000, 8, 36),
('Đỏ/Check',    'One Size', 3490000, 6, 36),
-- SP37: Mũ Nón Adidas
('Đen',         'One Size', 290000, 50, 37),
('Trắng',       'One Size', 290000, 40, 37),
('Navy',        'One Size', 290000, 35, 37),
-- SP38: Sneaker Nike
('Trắng',       '36',   890000, 20, 38),
('Trắng',       '38',   890000, 25, 38),
('Đen',         '40',   890000, 15, 38),
-- SP39: Giày Oxford Clarks
('Nâu',         '36',   1290000, 10, 39),
('Đen',         '38',   1290000, 12, 39),
('Nâu',         '40',   1290000, 8,  39),
-- SP40: Sandal Birkenstock
('Nâu',         '35',   1890000, 15, 40),
('Nâu',         '37',   1890000, 18, 40),
('Đen',         '39',   1890000, 12, 40),
-- SP41: Khoác Gió Columbia
('Đen',         'S',   780000, 20, 41),
('Navy',        'M',   780000, 25, 41),
('Xám',         'L',   780000, 18, 41),
-- SP42: Áo Denim Levi's
('Xanh Indigo', 'S',   890000, 22, 42),
('Xanh Indigo', 'M',   890000, 28, 42),
('Xanh Nhạt',   'L',   890000, 18, 42),
('Đen',         'M',   890000, 15, 42),
-- SP43: Overcoat Zara
('Đen',         'S',   1290000, 10, 43),
('Camel',       'M',   1290000, 12, 43),
('Grey',        'L',   1290000, 8,  43),
-- SP44: Gilet Phông H&M
('Đen',         'M',   490000, 35, 44),
('Navy',        'L',   490000, 30, 44),
('Xám',         'XL',  490000, 25, 44),
-- SP45: Quần Tây Armani
('Đen',         '30',  2490000, 8, 45),
('Xám',         '32',  2490000, 6, 45),
('Navy',        '31',  2490000, 5, 45),
-- SP46: Quần Jogger Adidas
('Đen',         'S',   690000, 40, 46),
('Xám',         'M',   690000, 45, 46),
('Navy',        'L',   690000, 35, 46),
-- SP47: Quần Short Jean Nữ Topshop
('Xanh Đậm',    '25',  379000, 32, 47),
('Xanh Nhạt',   '26',  379000, 28, 47),
('Đen',         '27',  379000, 25, 47),
-- SP48: Váy Trễ Vai Zara
('Đen',         'S',   590000, 18, 48),
('Trắng',       'M',   590000, 22, 48),
('Hồng',        'L',   590000, 15, 48),
-- SP49: Váy Công Chúa Tulle
('Trắng',       'One Size', 1290000, 10, 49),
('Hồng',        'One Size', 1290000, 8,  49),
-- SP50: Đầm Bodycon ASOS
('Đen',         'S',   490000, 25, 50),
('Đỏ',          'M',   490000, 20, 50),
('Navy',        'L',   490000, 18, 50);
