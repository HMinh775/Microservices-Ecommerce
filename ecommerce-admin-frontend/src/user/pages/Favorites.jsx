import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ProductSelectModal from '../components/ProductSelectModal';

import './Favorites.css';

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = 'https://via.placeholder.com/300x400?text=No+Image';


export default function Favorites() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));

    // Load all products and check favorites
    axios.get(`${API_GATEWAY}/product-catalog-service/products?page=0&size=100`)
      .then(res => {
        const data = res.data;
        const allProducts = data.content ? data.content : (Array.isArray(data) ? data : []);
        
        // Get saved favorite IDs
        const savedFav = localStorage.getItem('favorites') || '[]';
        const favIds = JSON.parse(savedFav);
        const favIdSet = new Set(favIds.map(id => String(id)));
        
        // Filter products that are favorited (handle both string and number IDs)
        const favorited = allProducts.filter(p => favIdSet.has(String(p.id)));
        
        // THÊM: Xóa IDs không còn tồn tại trong DB
        const validIds = allProducts.map(p => p.id);
        const cleanedFavIds = favIds.filter(id => validIds.includes(parseInt(id)));
        localStorage.setItem('favorites', JSON.stringify(cleanedFavIds));
        
        setFavorites(favorited);
        setProducts(allProducts);
      })
      .catch(err => console.error('Lỗi tải sản phẩm:', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    localStorage.removeItem('cartItems');
    navigate('/login');
  };

  const removeFavorite = (productId) => {
    const savedFav = localStorage.getItem('favorites') || '[]';
    let favIds = JSON.parse(savedFav);
    favIds = favIds.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(favIds));
    
    setFavorites(prev => prev.filter(p => p.id !== productId));
  };

  const addToCart = (product, variant, quantity = 1) => {
    const savedCart = localStorage.getItem('cartItems') || '[]';
    const cart = JSON.parse(savedCart);

    const existingItem = cart.find(item => 
      item.productId === product.id && 
      item.variantId === variant.id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        productId: product.id,
        productName: product.productName,
        brand: product.brand,
        image: product.image,
        variantId: variant.id,
        variantInfo: {
          size: variant.size,
          color: variant.color,
          price: variant.price,
          stockQuantity: variant.stockQuantity
        },
        quantity: quantity
      });
    }

    localStorage.setItem('cartItems', JSON.stringify(cart));
    alert(`✅ Thêm "${product.productName}" vào giỏ hàng!`);
    navigate('/cart');
  };

  const handleAddToCart = (product) => {
    if (!product.variants || product.variants.length === 0) {
      alert('Sản phẩm này không có biến thể!');
      return;
    }
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <>


      <nav className="navbar">
        <Link to="/" className="nav-brand">✦ LUXE<span>✧</span></Link>
        <div className="nav-links">
          <Link to="/">Cửa Hàng</Link>
          <a href="#">Blog</a>
          <a href="#">Liên Hệ</a>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <button className="icon-btn" onClick={() => navigate('/cart')}>🛒</button>
              <button className="icon-btn" onClick={() => navigate('/favorites')} style={{ color: 'var(--gold)' }}>❤️</button>
              <button className="btn-logout" onClick={handleLogout}>Đăng Xuất</button>
            </>
          ) : (
            <button className="btn-logout" onClick={() => navigate('/login')}>Đăng Nhập</button>
          )}
        </div>
      </nav>

      <div className="container">
        <div className="page-title">❤️ Mục Yêu Thích</div>
        <div className="page-desc">
          {favorites.length > 0 
            ? `Bạn có ${favorites.length} sản phẩm yêu thích` 
            : 'Bạn chưa thêm sản phẩm nào vào yêu thích'}
        </div>

        {favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">😔</div>
            <div className="empty-title">Chưa có sản phẩm yêu thích</div>
            <div className="empty-msg">Khám phá bộ sưu tập thời trang của chúng tôi và lưu những sản phẩm mà bạn yêu thích!</div>
            <Link to="/" className="btn-shop">← Quay Lại Mua Sắm</Link>
          </div>
        ) : (
          <div className="fav-grid">
            {favorites.map(product => {
              const price = product.variants && product.variants.length > 0 ? product.variants[0].price : 0;
              return (
                <div key={product.id} className="fav-card">
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1.25', backgroundColor: '#f5f5f5', overflow: 'hidden' }}>
                    <img 
                      className="card-img"
                      src={product.image ? `${API_GATEWAY}/product-catalog-service/products/images/${product.image}` : fallbackImg}
                      onError={e => e.target.src = fallbackImg}
                      alt={product.productName}
                    />
                    <button 
                      className="remove-btn"
                      onClick={() => removeFavorite(product.id)}
                      title="Xóa khỏi yêu thích"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="card-info">
                    <div className="card-brand">{product.brand}</div>
                    <div className="card-name">{product.productName}</div>
                    <div className="card-price">{price.toLocaleString('vi-VN')} ₫</div>
                    
                    <div className="card-actions">
                      <button 
                        className="btn-add"
                        onClick={() => handleAddToCart(product)}
                      >
                        🛒 Thêm Vào Giỏ
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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
