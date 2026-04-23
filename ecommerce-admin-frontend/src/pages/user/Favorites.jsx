import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductSelectModal from '../../components/user/ProductSelectModal';
import Header from '../../components/common/Header';
import { useApp } from '../../context/AppContext';

import './Favorites.css';

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = 'https://via.placeholder.com/300x400?text=Khong+Co+Anh';

export default function Favorites() {
  const navigate = useNavigate();
  const [favoritesList, setFavoritesList] = useState([]);
  const { toggleFavorite, favoritesCount, addToCart } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    axios.get(`${API_GATEWAY}/product-catalog-service/products?page=0&size=100`)
      .then(res => {
        const data = res.data;
        const allProducts = data.content ? data.content : (Array.isArray(data) ? data : []);
        
        // Get saved favorite IDs from context/localStorage
        const storedFavs = JSON.parse(localStorage.getItem('favorites') || '[]');
        const favorited = allProducts.filter(p => storedFavs.includes(p.id));
        
        setFavoritesList(favorited);
      })
      .catch(err => console.error('Lỗi tải sản phẩm:', err));
  }, [favoritesCount]); // Re-run when count changes to keep list in sync

  const removeFavorite = (e, productId) => {
    e.stopPropagation(); // BUG FIX 1: Ngăn hiện bảng chọn mua khi ấn X
    toggleFavorite(productId); // BUG FIX 2: Đồng bộ số lượng trên Header
    setFavoritesList(prev => prev.filter(p => p.id !== productId));
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
      <Header />

      <div className="favorites-container">
        <header className="favorites-header">
            <h1 className="fav-title">❤️ Mục Yêu Thích</h1>
            <p className="fav-desc">
            {favoritesList.length > 0 
                ? `Bạn đang lưu giữ ${favoritesList.length} sản phẩm tinh tế trong danh sách yêu thích.` 
                : 'Cùng khám phá và lưu giữ những thiết kế ấn tượng nhất của LUXE.'}
            </p>
        </header>

        {favoritesList.length === 0 ? (
          <div className="fav-empty">
            <div className="empty-visual">✨</div>
            <h2 className="empty-title">Danh sách đang chờ bạn</h2>
            <p className="empty-text">Hãy duyệt qua bộ sưu tập của chúng tôi để tìm thấy món đồ hoàn hảo nhất.</p>
            <button className="btn-browse" onClick={() => navigate('/')}>Khám Phá Cửa Hàng</button>
          </div>
        ) : (
          <div className="fav-grid">
            {favoritesList.map(product => {
              const price = product.variants && product.variants.length > 0 ? product.variants[0].price : 0;
              return (
                <div key={product.id} className="fav-card">
                  <div 
                    className="fav-img-wrap"
                    onClick={() => handleAddToCart(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img 
                      className="fav-img"
                      src={product.image ? `${API_GATEWAY}/product-catalog-service/products/images/${product.image}` : fallbackImg}
                      onError={e => e.target.src = fallbackImg}
                      alt={product.productName}
                    />
                    <button 
                      className="fav-remove-btn"
                      onClick={(e) => removeFavorite(e, product.id)}
                      title="Xóa khỏi yêu thích"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                         <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className="fav-info">
                    <p className="fav-brand">{product.brand}</p>
                    <h3 className="fav-name">{product.productName}</h3>
                    <p className="fav-price">{price.toLocaleString('vi-VN')} ₫</p>
                    
                    <button 
                       className="fav-add-btn"
                       onClick={() => handleAddToCart(product)}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 4h2l1 7h7l1-5H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        THÊM VÀO GIỎ
                    </button>
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
