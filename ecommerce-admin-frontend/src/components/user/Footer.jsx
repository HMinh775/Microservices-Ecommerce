import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <span className="brand-word">LUXE</span>
                    <p className="footer-tagline">Tôn vinh vẻ đẹp tinh tế qua từng đường nét thiết kế cao cấp.</p>
                </div>
                <div className="footer-links-grid">
                    <div className="footer-col">
                        <h4>Liên Kết</h4>
                        <Link to="/">Trang Chủ</Link>
                        <Link to="/search">Sản Phẩm</Link>
                        <Link to="/about">Về Chúng Tôi</Link>
                    </div>
                    <div className="footer-col">
                        <h4>Hỗ Trợ</h4>
                        <a href="#">Đổi Trả</a>
                        <a href="#">Giao Hàng</a>
                        <a href="#">Liên Hệ</a>
                    </div>
                    <div className="footer-col">
                        <h4>Theo Dõi</h4>
                        <a href="#">Instagram</a>
                        <a href="#">Facebook</a>
                        <a href="#">Pinterest</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} LUXE. Bảo Lưu Mọi Quyền.</p>
                <div className="footer-legal">
                    <a href="#">Chính sách bảo mật</a>
                    <a href="#">Điều khoản sử dụng</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
