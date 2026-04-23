import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FilterBar from '../../components/user/FilterBar';
import ProductSelectModal from '../../components/user/ProductSelectModal';
import Header from '../../components/common/Header';
import Footer from '../../components/user/Footer';
import { useApp } from '../../context/AppContext';
import './Home.css';

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = 'https://via.placeholder.com/300x400?text=Khong+Co+Anh';

const getProductImage = (image) => {
    if (!image) return fallbackImg;
    if (image.startsWith('http')) return image;
    return `${API_GATEWAY}/product-catalog-service/products/images/${image}`;
};


export default function Home() {
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, favorites } = useApp();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotif, setShowNotif] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedBrand, setSelectedBrand] = useState('');
  const [availableBrands, setAvailableBrands] = useState([]);

  useEffect(() => {
    axios.get(`${API_GATEWAY}/product-catalog-service/products?page=0&size=100`)
      .then(res => {
        const data = res.data;
        let prods = data.content || (Array.isArray(data) ? data : []);
        setProducts(prods);
        setAvailableBrands([...new Set(prods.map(p => p.brand).filter(Boolean))]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // toggleFavorite is now provided by useApp() context

  const filteredProducts = products.filter(p => {
    if (activeCategory && p.categoryName !== activeCategory) return false;
    if (selectedBrand && p.brand !== selectedBrand) return false;
    if (priceRange.min || priceRange.max) {
      const minPrice = p.variants?.[0]?.price || 0;
      if (priceRange.min && minPrice < parseFloat(priceRange.min)) return false;
      if (priceRange.max && minPrice > parseFloat(priceRange.max)) return false;
    }
    return true;
  });

  const resetFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedBrand('');
    setActiveCategory(null);
  };

  const handleAddToCart = (product, variant, qty) => {
    addToCart(product, variant, qty);
    setShowNotif(`Đã thêm ${qty} ${product.productName} vào giỏ hàng!`);
    setTimeout(() => setShowNotif(null), 3000);
  };

  return (
    <>
      <Header />

      {/* HERO SECTION */}
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
            Khám phá thời trang cao cấp thiết kế riêng cho<br />
            những người theo đuổi sự hoàn mỹ và tinh tế.
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
            <div className="stat">
              <span className="stat-num">500+</span>
              <span className="stat-label">Sản Phẩm</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <span className="stat-num">50+</span>
              <span className="stat-label">Thương Hiệu</span>
            </div>
            <div className="stat-div" />
            <div className="stat">
              <span className="stat-num">10K+</span>
              <span className="stat-label">Khách Hàng</span>
            </div>
          </div>
        </div>

        <div className="hero-scroll-hint" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* FILTER BAR */}
      <FilterBar
        onPriceChange={(min, max) => setPriceRange({ min, max })}
        onBrandChange={setSelectedBrand}
        onReset={resetFilters}
        brands={availableBrands}
      />


      {/* PRODUCTS */}
      <section className="products-section" id="new">
        <div className="products-header">
          <div>
            <div className="section-label">Sản Phẩm</div>
            <h2 className="section-heading">Nổi Bật Mùa Này</h2>
          </div>
          <button className="btn-text" onClick={() => navigate('/search')}>
            Xem Tất Cả
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="loading-grid">
            {[1, 2, 3, 4].map(n => <div key={n} className="skeleton-card" />)}
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.slice(0, 8).map((p) => (
              <div key={p.id} className="product-card">
                <div className="product-img-wrap" onClick={() => { setSelectedProduct(p); setShowModal(true); }}>
                  <img
                    src={getProductImage(p.image)}
                    onError={(e) => { e.target.src = fallbackImg; }}
                    alt={p.productName}
                    className="product-img"
                  />
                  <div className="product-overlay">
                    <button 
                      className="btn-quick-add"
                      onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); setShowModal(true); }}
                    >
                      Thêm Vào Túi
                    </button>
                  </div>
                  {p.variants?.[0]?.price < 500000 && <span className="product-tag">Yêu Thích</span>}
                </div>

                <div className="product-info">
                  <div className="product-info-top">
                    <span className="product-brand">{p.brand || 'Thiết kế LUXE'}</span>
                    <button
                      className={`fav-btn ${favorites.includes(p.id) ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                      aria-label="Yêu thích"
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill={favorites.includes(p.id) ? 'currentColor' : 'none'}>
                        <path d="M10 17S3 12.5 3 7.5A4 4 0 0 1 10 4.6 4 4 0 0 1 17 7.5C17 12.5 10 17 10 17z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                  <h3 className="product-name">{p.productName}</h3>
                  <p className="product-price">
                    {p.variants?.[0]?.price.toLocaleString('vi-VN')}₫
                    {p.variants?.[0]?.price > 1000000 && <span className="price-label">Cao Cấp</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="view-all-container">
           <button className="btn-gold-large" onClick={() => navigate('/search')}>
              Xem Tất Cả Sản Phẩm
           </button>
        </div>
      </section>

      <Footer />

      {/* MODAL */}
      {showModal && selectedProduct && (
        <ProductSelectModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          onConfirm={handleAddToCart}
        />
      )}

      {/* TOAST NOTIFICATION */}
      {showNotif && <div className="toast">{showNotif}</div>}
    </>
  );
}
