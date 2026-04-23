import React, { useEffect } from 'react';
import Header from '../../components/common/Header';
import Footer from '../../components/user/Footer';
import './About.css';

const About = () => {
    // Scroll to top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-page">
            <Header />

            {/* HERO SECTION */}
            <section className="about-hero">
                <div className="about-hero__overlay"></div>
                <div className="about-hero__content">
                    <span className="about-label">CÂU CHUYỆN THƯƠNG HIỆU</span>
                    <h1 className="about-title">KIẾN TẠO PHONG CÁCH<br/><span>BỀN VỮNG & TINH TẾ</span></h1>
                </div>
            </section>

            {/* BRAND STORY */}
            <section className="about-story">
                <div className="about-container">
                    <div className="story-grid">
                        <div className="story-image">
                            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop" alt="LUXE Heritage" />
                        </div>
                        <div className="story-text">
                            <h2 className="section-heading">Hành Trình Của LUXE</h2>
                            <p>Được thành lập với khát vọng định nghĩa lại chuẩn mực thời trang cao cấp tại Việt Nam, LUXE không chỉ là một cửa hàng thời trang, mà là biểu tượng của lối sống tinh tế và hiện đại.</p>
                            <p>Chúng tôi tin rằng mỗi bộ trang phục không chỉ là vải vóc, mà là ngôn ngữ không lời kể về cá tính và đẳng cấp của người mặc. Với triết lý "Less is More", LUXE tập trung vào những đường cắt tỉ mỉ, chất liệu cao cấp và thiết kế vượt thời gian.</p>
                            <div className="story-stats">
                                <div className="stat-item">
                                    <span className="stat-num">10+</span>
                                    <span className="stat-label">Năm Di Sản</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-num">50k+</span>
                                    <span className="stat-label">Khách Hàng</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-num">100%</span>
                                    <span className="stat-label">Tâm Huyết</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CORE VALUES */}
            <section className="values-section">
                <div className="about-container">
                    <div className="values-header">
                        <span className="about-label">GIÁ TRỊ CỐT LÕI</span>
                        <h2 className="section-heading">Tâm Điểm Của Mọi Quyết Định</h2>
                    </div>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-icon">✦</div>
                            <h3>Chất Lượng Thượng Hạng</h3>
                            <p>Chúng tôi khắt khe trong việc lựa chọn chất liệu, từ sợi tơ tằm nguyên bản đến các dòng vải công nghệ mới nhất.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">✦</div>
                            <h3>Thiết Kế Tinh Giản</h3>
                            <p>Sức mạnh của sự đơn giản. Những thiết kế của LUXE giúp bạn nổi bật một cách tự nhiên mà không cần phô trương.</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">✦</div>
                            <h3>Trải Nghiệm Cá Nhân</h3>
                            <p>Mỗi khách hàng đến với LUXE đều nhận được sự chăm sóc tận tâm và những tư vấn phong cách chuyên sâu nhất.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SHOWROOM & GOOGLE MAPS */}
            <section className="location-section">
                <div className="about-container">
                    <div className="location-grid">
                        <div className="location-info">
                            <h2 className="section-heading">Ghé Thăm Showroom</h2>
                            <div className="info-block">
                                <h4>ĐỊA CHỈ</h4>
                                <p>123 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh</p>
                            </div>
                            <div className="info-block">
                                <h4>GIỜ MỞ CỬA</h4>
                                <p>Thứ 2 - Chủ Nhật: 09:00 - 21:30</p>
                            </div>
                            <div className="info-block">
                                <h4>LIÊN HỆ</h4>
                                <p>Hotline: 1800 6789<br/>Email: contact@luxe.vn</p>
                            </div>
                        </div>
                        <div className="location-map">
                            {/* Google Maps Embedding - Corrected PB parameter */}
                            <iframe 
                                title="LUXE Shop Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.231737381273!2d106.7196023!3d10.795058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527c2f8f30083%3A0x1e3f0ae915993994!2sLandmark%2081!5e0!3m2!1svi!2s!4v1713611944000!5m2!1svi!2s" 
                                width="100%" 
                                height="450" 
                                style={{ border: 0, borderRadius: '20px', filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }} 
                                allowFullScreen="" 
                                loading="lazy">
                            </iframe>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default About;
