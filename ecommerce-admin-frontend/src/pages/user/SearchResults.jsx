import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import FilterBar from '../../components/user/FilterBar';
import ProductSelectModal from '../../components/user/ProductSelectModal';
import Header from '../../components/common/Header';
import './SearchResults.css';

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = 'https://via.placeholder.com/300x400?text=Khong+Co+Anh';

const getProductImage = (image) => {
    if (!image) return fallbackImg;
    if (image.startsWith('http')) return image;
    return `${API_GATEWAY}/product-catalog-service/products/images/${image}`;
};

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedBrand, setSelectedBrand] = useState('');
  const [availableBrands, setAvailableBrands] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    const savedCart = localStorage.getItem('cartItems') || '[]';
    setCartCount(JSON.parse(savedCart).reduce((s, i) => s + i.quantity, 0));
    const savedFav = localStorage.getItem('favorites') || '[]';
    setFavorites(new Set(JSON.parse(savedFav)));

    setLoading(true);
    axios.get(`${API_GATEWAY}/product-catalog-service/products?page=0&size=100`)
      .then(res => {
        const prods = res.data.content || res.data || [];
        setProducts(prods);
        setAvailableBrands([...new Set(prods.map(p => p.brand).filter(Boolean))]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleFavorite = (productId) => {
    const n = new Set(favorites);
    if (n.has(productId)) n.delete(productId);
    else n.add(productId);
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
  };

  const filteredResults = products.filter(p => {
    const q = query.toLowerCase();
    const nameMatch = p.productName.toLowerCase().includes(q);
    const brandMatch = p.brand?.toLowerCase().includes(q);
    const price = p.variants?.[0]?.price?.toString() || "";
    const nameBrandPriceMatch = nameMatch || brandMatch || price.includes(q);

    if (!nameBrandPriceMatch) return false;
    if (selectedBrand && p.brand !== selectedBrand) return false;
    if (priceRange.min && (p.variants?.[0]?.price || 0) < parseFloat(priceRange.min)) return false;
    if (priceRange.max && (p.variants?.[0]?.price || 0) > parseFloat(priceRange.max)) return false;
    return true;
  });

  return (
    <div className="search-results-page">
      <Header />

      {/* LUXE SPACER & MINIMAL COUNT */}
      <div className="search-minimal-header">
        <div className="minimal-meta">
           <span className="minimal-label">{query ? "KẾT QUẢ TÌM KIẾM" : "TẤT CẢ SẢN PHẨM"}</span>
           <span className="minimal-divider"></span>
           <span className="minimal-count">{filteredResults.length} SẢN PHẨM</span>
        </div>
      </div>


      <FilterBar
        onPriceChange={(min, max) => setPriceRange({ min, max })}
        onBrandChange={setSelectedBrand}
        onReset={() => { setPriceRange({ min: '', max: '' }); setSelectedBrand(''); }}
        brands={availableBrands}
      />

      <section className="products-grid-container">
        <div className="product-grid">
          {filteredResults.map((p) => {
            const price = p.variants?.[0]?.price || 0;
            const isFav = favorites.has(p.id);
            return (
              <article key={p.id} className="product-card-light">
                <div className="card-img-wrap">
                  <button 
                    className={`fav-btn ${isFav ? 'fav-btn--active' : ''}`}
                    onClick={() => toggleFavorite(p.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 14S2 10 2 6a4 4 0 0 1 6-3.46A4 4 0 0 1 14 6c0 4-6 8-6 8z"
                        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
                        fill={isFav ? 'currentColor' : 'none'} />
                    </svg>
                  </button>
                  <img src={getProductImage(p.image)} alt={p.productName} />
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
                  <p className="card-brand">{p.brand || 'Cửa hàng LUXE'}</p>
                  <p className="card-name">{p.productName}</p>
                  <div className="card-footer">
                    <span className="card-price">{price.toLocaleString('vi-VN')}₫</span>
                    <button 
                      className="btn-add-light"
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
      </section>

      {showModal && selectedProduct && (
        <ProductSelectModal
          product={selectedProduct}
          onConfirm={addToCart}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
