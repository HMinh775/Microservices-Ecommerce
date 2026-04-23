import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Header.css';

// Icon components
const ChevronIcon = ({ isOpen }) => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        className={`chevron-icon ${isOpen ? 'chevron-icon--open' : ''}`}
    >
        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
);

const HeartIcon = ({ filled }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill={filled ? 'currentColor' : 'none'}
        />
    </svg>
);

const CartIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M6 6h15l-1.5 9h-12L6 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6L5 3H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="20" r="1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const UserIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const MỚI_VỀ_CONTENT = [
    {
        title: 'PHONG CÁCH',
        items: [
            { label: 'Minimalist Style (Tối giản)', link: '/search?q=minimalist' },
            { label: 'CEO Elegant (Sang trọng)', link: '/search?q=ceo' },
            { label: 'Signature Look (Cá tính)', link: '/search?q=signature' },
            { label: 'Seasonal Trend (Hợp mốt)', link: '/search?q=trend' },
        ]
    },
    {
        title: 'DÒNG SẢN PHẨM',
        items: [
            { label: 'Áo sơ mi Premium', link: '/search?q=sơ+mi' },
            { label: 'Áo thun Basic', link: '/search?q=thun' },
            { label: 'Quần Jean Denim', link: '/search?q=jean' },
            { label: 'Áo khoác Blazer', link: '/search?q=áo+khoác' },
        ]
    },
    {
        title: 'CÔNG NGHỆ VẢI',
        items: [
            { label: 'CloudTouch™ (Mềm mịn)', link: '/search?q=cloudtouch' },
            { label: 'AirDry™ (Thoáng khí)', link: '/search?q=airdry' },
            { label: 'Anti-UV™ (Chống nắng)', link: '/search?q=anti-uv' },
            { label: 'FlexFit™ (Co giãn)', link: '/search?q=flexfit' },
        ]
    }
];

const BỘ_SƯU_TẬP_CONTENT = [
    {
        title: 'ĐẶC BIỆT',
        items: [
            { label: 'Limited Edition (Bản giới hạn)', link: '/search?q=limited' },
            { label: 'Heritage Collection', link: '/search?q=heritage' },
            { label: 'The Minimalist 2024', link: '/search?q=minimalist' },
            { label: 'VVIP Exclusive', link: '/search?q=vvip' },
        ]
    },
    {
        title: 'NHU CẦU',
        items: [
            { label: 'Trang phục Công sở', link: '/search?q=office' },
            { label: 'Thể thao năng động', link: '/search?q=sport' },
            { label: 'Thời trang Dạo phố', link: '/search?q=streetwear' },
            { label: 'Dự tiệc cao cấp', link: '/search?q=party' },
        ]
    },
    {
        title: 'PHỤ KIỆN',
        items: [
            { label: 'Ví da thủ công', link: '/search?q=ví' },
            { label: 'Thắt lưng Premium', link: '/search?q=thắt+lưng' },
            { label: 'Cà vạt thiết kế', link: '/search?q=cà+vạt' },
            { label: 'Kính mắt LUXE', link: '/search?q=kính' },
        ]
    }
];

// Navigation links config
const NAV_LINKS = [
    { path: '/', label: 'Trang Chủ' },
    { path: '/search', label: 'Hàng Mới Về', hasMega: true, content: MỚI_VỀ_CONTENT },
    { path: '/search', label: 'Bộ Sưu Tập', hasMega: true, content: BỘ_SƯU_TẬP_CONTENT },
    { path: '/about', label: 'Về Chúng Tôi' },
];

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, cartCount, favoritesCount } = useApp();

    const [scrolled, setScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [activeMegaMenu, setActiveMegaMenu] = useState(null);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showUserMenu && !e.target.closest('.user-dropdown')) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showUserMenu]);

    // Close mobile menu on route change
    useEffect(() => {
        setShowMobileMenu(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = showMobileMenu ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showMobileMenu]);

    const handleLogout = useCallback(() => {
        logout();
        navigate('/');
        setShowUserMenu(false);
    }, [logout, navigate]);

    const isActivePath = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
                <div className="header__container">
                    {/* Logo */}
                    <Link to="/" className="header__logo">
                        <span className="header__logo-text">LUXE</span>
                        <span className="header__logo-dot"></span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="header__nav">
                        {NAV_LINKS.map((link) => (
                            <div 
                                key={link.label} 
                                className="header__nav-item"
                                onMouseEnter={() => link.hasMega && setActiveMegaMenu(link.label)}
                                onMouseLeave={() => setActiveMegaMenu(null)}
                            >
                                <Link
                                    to={link.path}
                                    className={`header__nav-link ${isActivePath(link.path) ? 'header__nav-link--active' : ''}`}
                                >
                                    {link.label}
                                    {link.hasMega && (
                                        <svg width="10" height="10" viewBox="0 0 10 10" className={`nav-arrow ${activeMegaMenu === link.label ? 'rotated' : ''}`}>
                                            <path d="M2 4l3 3 3-3" stroke="currentColor" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </Link>

                                {link.hasMega && activeMegaMenu === link.label && (
                                    <div className="mega-menu">
                                        <div className="mega-menu__container">
                                            {link.content.map((column, idx) => (
                                                <div key={idx} className="mega-menu__col">
                                                    <h4 className="mega-menu__title">{column.title}</h4>
                                                    <ul className="mega-menu__list">
                                                        {column.items.map((item, i) => (
                                                            <li key={i}>
                                                                <Link to={item.link} className="mega-menu__link" onClick={() => setActiveMegaMenu(null)}>
                                                                    {item.label}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                            {/* Feature Column */}
                                            <div className="mega-menu__col mega-menu__col--feature">
                                                <div className="mega-feature">
                                                    <div className="mega-feature__img">
                                                        <img 
                                                            src={link.label === 'Hàng Mới Về' 
                                                                ? "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?q=80&w=300&auto=format&fit=crop"
                                                                : "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=300&auto=format&fit=crop"} 
                                                            onError={(e) => {
                                                                e.target.onerror = null; 
                                                                e.target.src = "https://placehold.co/300x400/1a1a1a/d4af37?text=LUXE+STYLE";
                                                            }}
                                                            alt="Feature" 
                                                        />
                                                    </div>
                                                    <div className="mega-feature__content">
                                                        <span className="mega-feature__label">Hot Pick</span>
                                                        <h5 className="mega-feature__title">LUXE Signature</h5>
                                                        <button className="mega-feature__btn">Khám phá ngay</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="header__actions">
                        {/* User Menu */}
                        {user ? (
                            <div className="user-dropdown">
                                <button
                                    className="user-dropdown__trigger"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    aria-expanded={showUserMenu}
                                    aria-haspopup="true"
                                >
                                    <UserIcon />
                                    <span className="user-dropdown__name">{user.lastName || user.userName}</span>
                                    <ChevronIcon isOpen={showUserMenu} />
                                </button>

                                {showUserMenu && (
                                    <div className="user-dropdown__menu">
                                        <Link to="/profile" className="user-dropdown__item" onClick={() => setShowUserMenu(false)}>
                                            Hồ sơ cá nhân
                                        </Link>
                                        <Link to="/orders" className="user-dropdown__item" onClick={() => setShowUserMenu(false)}>
                                            Đơn hàng của tôi
                                        </Link>
                                        <Link to="/favorites" className="user-dropdown__item" onClick={() => setShowUserMenu(false)}>
                                            Sản phẩm yêu thích
                                        </Link>
                                        <div className="user-dropdown__divider"></div>
                                        <button className="user-dropdown__item user-dropdown__item--logout" onClick={handleLogout}>
                                            Đăng Xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="header__login-btn">
                                Đăng Nhập
                            </Link>
                        )}

                        {/* Favorites */}
                        <button
                            className="header__icon-btn"
                            onClick={() => navigate('/favorites')}
                            aria-label="Yêu thích"
                        >
                            <HeartIcon filled={favoritesCount > 0} />
                            {favoritesCount > 0 && (
                                <span className="header__badge">{favoritesCount > 99 ? '99+' : favoritesCount}</span>
                            )}
                        </button>

                        {/* Cart */}
                        <button
                            className="header__icon-btn"
                            onClick={() => navigate('/cart')}
                            aria-label="Giỏ hàng"
                        >
                            <CartIcon />
                            {cartCount > 0 && (
                                <span className="header__badge">{cartCount > 99 ? '99+' : cartCount}</span>
                            )}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            className="header__menu-toggle"
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            aria-label={showMobileMenu ? 'Đóng menu' : 'Mở menu'}
                            aria-expanded={showMobileMenu}
                        >
                            {showMobileMenu ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${showMobileMenu ? 'mobile-menu--open' : ''}`}>
                <div className="mobile-menu__backdrop" onClick={() => setShowMobileMenu(false)}></div>
                <nav className="mobile-menu__content">
                    {NAV_LINKS.map(({ path, label }) => (
                        <Link
                            key={path}
                            to={path}
                            className={`mobile-menu__link ${isActivePath(path) ? 'mobile-menu__link--active' : ''}`}
                        >
                            {label}
                        </Link>
                    ))}
                    <div className="mobile-menu__divider"></div>
                    {user ? (
                        <>
                            <Link to="/profile" className="mobile-menu__link">Hồ sơ cá nhân</Link>
                            <Link to="/orders" className="mobile-menu__link">Đơn hàng của tôi</Link>
                            <button className="mobile-menu__logout" onClick={handleLogout}>Đăng Xuất</button>
                        </>
                    ) : (
                        <Link to="/login" className="mobile-menu__login">Đăng Nhập</Link>
                    )}
                </nav>
            </div>
        </>
    );
};

export default Header;