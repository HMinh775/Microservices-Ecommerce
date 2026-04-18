import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import ProductSelectModal from '../components/ProductSelectModal';
import './Home.css';

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = 'https://via.placeholder.com/300x400?text=No+Image';

const categories = [
  { name: 'Áo', icon: 'Áo', label: 'Tops' },
  { name: 'Quần', icon: 'Quần', label: 'Bottoms' },
  { name: 'Váy', icon: 'Váy', label: 'Dresses' },
  { name: 'Phụ kiện', icon: 'Phụ kiện', label: 'Accessories' },
];

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [showNotif, setShowNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));

    const savedCart = localStorage.getItem('cartItems') || '[]';
    const cart = JSON.parse(savedCart);
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0));

    const savedFav = localStorage.getItem('favorites') || '[]';
    setFavorites(new Set(JSON.parse(savedFav)));

    axios.get(`${API_GATEWAY}/product-catalog-service/products?page=0&size=100`)
      .then(res => {
        const data = res.data;
        if (data.content) {
          setProducts(data.content);
        } else if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    localStorage.removeItem('cartItems');
    setUser(null);
    setFavorites(new Set());
    setCartCount(0);
  };

  const toggleFavorite = (productId) => {
    const n = new Set(favorites);
    n.has(productId) ? n.delete(productId) : n.add(productId);
    setFavorites(n);
    localStorage.setItem('favorites', JSON.stringify(Array.from(n)));
  };

  const addToCart = (product, variant, quantity = 1) => {
    const savedCart = localStorage.getItem('cartItems') || '[]';
    const cart = JSON.parse(savedCart);
    const existing = cart.find(i => i.productId === product.id && i.variantId === variant.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        productName: product.productName,
        brand: product.brand,
        image: product.image,
        variantId: variant.id,
        variantInfo: { size: variant.size, color: variant.color, price: variant.price, stockQuantity: variant.stockQuantity },
        quantity,
      });
    }
    localStorage.setItem('cartItems', JSON.stringify(cart));
    setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    setShowNotif(`"${product.productName}" đã được thêm vào giỏ hàng`);
    setTimeout(() => setShowNotif(null), 3000);
  };

  const filteredProducts = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
        <Link to="/" className="nav-brand">
          <span className="brand-word">LUXE</span>
          <span className="brand-mark">✦</span>
        </Link>

        <div className="nav-links">
          <a href="#new">Hàng Mới Về</a>
          <a href="#collection">Bộ Sưu Tập</a>
          <a href="#about">Về Chúng Tôi</a>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-greeting">
                Xin chào, <strong>{user.userDetails?.lastName || user.userName}</strong>
              </span>

              <button className="icon-btn" onClick={() => navigate('/favorites')} aria-label="Yêu thích">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 17S3 12.5 3 7.5A4 4 0 0 1 10 4.6 4 4 0 0 1 17 7.5C17 12.5 10 17 10 17z"
                    stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
                    fill={favorites.size > 0 ? 'currentColor' : 'none'} />
                </svg>
                {favorites.size > 0 && <span className="badge">{favorites.size}</span>}
              </button>

              <button className="icon-btn" onClick={() => navigate('/cart')} aria-label="Giỏ hàng">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 4h2l2.5 9h7l2-6H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="16" r="1.2" fill="currentColor" />
                  <circle cx="14" cy="16" r="1.2" fill="currentColor" />
                </svg>
                {cartCount > 0 && <span className="badge">{cartCount}</span>}
              </button>

              <button className="btn-ghost" onClick={handleLogout}>Đăng Xuất</button>
            </>
          ) : (
            <Link to="/login" className="btn-dark">Đăng Nhập</Link>
          )}
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb--1" aria-hidden="true" />
        <div className="hero-orb hero-orb--2" aria-hidden="true" />

        <div className="hero-inner">
          <p className="hero-eyebrow">Bộ Sưu Tập 2024</p>
          <h1 className="hero-title">
            Định Hình<br />
            <em>Phong Cách</em>
          </h1>
          <p className="hero-desc">
            Khám phá thời trang cao cấp thiết kế riêng cho<br />những người theo đuổi sự hoàn mỹ và tinh tế.
          </p>
          <div className="hero-cta">
            <button
              className="btn-gold"
              onClick={() => document.getElementById('new')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Khám Phá Ngay
            </button>
            <button className="btn-outline-white">Xem Bộ Sưu Tập</button>
          </div>

          <div className="hero-stats">
            <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Sản Phẩm</span></div>
            <div className="stat-div" />
            <div className="stat"><span className="stat-num">50+</span><span className="stat-label">Thương Hiệu</span></div>
            <div className="stat-div" />
            <div className="stat"><span className="stat-num">10K+</span><span className="stat-label">Khách Hàng</span></div>
          </div>
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="categories-section" id="collection">
        <div className="section-label">Danh Mục</div>
        <h2 className="section-heading">Bộ Sưu Tập</h2>
        <div className="categories-row">
          {categories.map((cat, i) => (
            <button
              key={i}
              className={`cat-pill ${activeCategory === cat.name ? 'cat-pill--active' : ''}`}
              onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
            >
              <span className="cat-pill-label">{cat.name}</span>
              <span className="cat-pill-sub">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="products-section" id="new">
        <div className="products-header">
          <div>
            <div className="section-label">Sản Phẩm</div>
            <h2 className="section-heading">Nổi Bật Mùa Này</h2>
          </div>
          {products.length > 12 && (
            <button className="btn-ghost" onClick={() => alert('Tính năng sẽ sớm ra mắt!')}>
              Xem tất cả ({products.length}) →
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading-grid">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.slice(0, 12).map((p, idx) => {
              const price = p.variants?.[0]?.price || 0;
              const isFav = favorites.has(p.id);
              return (
                <article
                  key={p.id}
                  className="product-card"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className="card-img-wrap">
                    {p.category && <span className="cat-badge">{p.category}</span>}
                    <button
                      className={`fav-btn ${isFav ? 'fav-btn--active' : ''}`}
                      onClick={() => toggleFavorite(p.id)}
                      aria-label="Yêu thích"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 14S2 10 2 6a4 4 0 0 1 6-3.46A4 4 0 0 1 14 6c0 4-6 8-6 8z"
                          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
                          fill={isFav ? 'currentColor' : 'none'} />
                      </svg>
                    </button>
                    <img
                      className="card-img"
                      src={p.image ? `${API_GATEWAY}/product-catalog-service/products/images/${p.image}` : fallbackImg}
                      onError={e => e.target.src = fallbackImg}
                      alt={p.productName}
                      loading="lazy"
                    />
                    <div className="card-overlay">
                      <button
                        className="btn-overlay"
                        onClick={() => { setSelectedProduct(p); setShowModal(true); }}
                      >
                        Chọn Size & Mua
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    <p className="card-brand">{p.brand || 'BOUTIQUE'}</p>
                    <p className="card-name">{p.productName}</p>
                    <div className="card-footer">
                      <span className="card-price">{price.toLocaleString('vi-VN')}₫</span>
                      <button
                        className="btn-add"
                        onClick={() => { setSelectedProduct(p); setShowModal(true); }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="newsletter-section">
        <div className="newsletter-inner">
          <div className="nl-left">
            <p className="nl-eyebrow">Ưu Đãi Độc Quyền</p>
            <h2 className="nl-title">Nhận Thông Tin<br /><em>Sớm Nhất</em></h2>
            <p className="nl-desc">Đăng ký để nhận thông báo về bộ sưu tập mới, ưu đãi đặc biệt và sự kiện độc quyền từ LUXE.</p>
          </div>
          <div className="nl-right">
            <div className="nl-form">
              <input type="email" placeholder="email@example.com" className="nl-input" />
              <button className="btn-gold">Đăng Ký</button>
            </div>
            <p className="nl-fine">Chúng tôi tôn trọng sự riêng tư của bạn. Hủy đăng ký bất kỳ lúc nào.</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand-col">
            <span className="footer-brand">LUXE <span>✦</span></span>
            <p>Nền tảng thời trang cao cấp mang đến những bộ sưu tập độc quyền từ các nhãn hàng hàng đầu.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="TikTok">TK</a>
            </div>
          </div>
          <div className="footer-col">
            <h5>Liên Kết</h5>
            <a href="#about">Về Chúng Tôi</a>
            <a href="#products">Sản Phẩm</a>
            <a href="#contact">Liên Hệ</a>
            <a href="#faq">Câu Hỏi Thường Gặp</a>
          </div>
          <div className="footer-col">
            <h5>Hỗ Trợ</h5>
            <a href="#shipping">Chính Sách Vận Chuyển</a>
            <a href="#return">Chính Sách Đổi Trả</a>
            <a href="#privacy">Chính Sách Riêng Tư</a>
            <a href="#terms">Điều Khoản & Điều Kiện</a>
          </div>
          <div className="footer-col">
            <h5>Liên Hệ</h5>
            <p>support@luxefashion.vn</p>
            <p>1800 123 456</p>
            <p>TP.HCM, Việt Nam</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 LUXE Fashion. Bản quyền được bảo vệ.</p>
        </div>
      </footer>

      {/* ── NOTIFICATION ── */}
      {showNotif && (
        <div className="luxe-toast">
          <span className="luxe-toast-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {showNotif}
        </div>
      )}

      {/* ── MODAL ── */}
      {showModal && selectedProduct && (
        <ProductSelectModal
          product={selectedProduct}
          onConfirm={addToCart}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}