import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import './Cart.css';

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150&h=200';

const getProductImage = (image) => {
    if (!image) return fallbackImg;
    if (image.startsWith('http')) return image;
    return `${API_GATEWAY}/product-catalog-service/products/images/${image}`;
};

import { useApp } from '../../context/AppContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useApp();
  const [favorites, setFavorites] = useState(new Set());
  const [removingIdx, setRemovingIdx] = useState(null);

  useEffect(() => {
    const fav = localStorage.getItem('favorites') || '[]';
    setFavorites(new Set(JSON.parse(fav)));
  }, []);

  const handleUpdateQuantity = (item, qty) => {
    updateQuantity(item.productId, item.variantId, qty);
  };

  const handleRemove = (item, idx) => {
    setRemovingIdx(idx);
    setTimeout(() => {
      removeFromCart(item.productId, item.variantId);
      setRemovingIdx(null);
    }, 320);
  };

  const addToFavorites = (item) => {
    const newFav = new Set(favorites);
    if (newFav.has(item.productId)) {
      newFav.delete(item.productId);
    } else {
      newFav.add(item.productId);
    }
    setFavorites(newFav);
    localStorage.setItem('favorites', JSON.stringify(Array.from(newFav)));
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.variantInfo?.price || 0) * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = totalPrice > 0 ? (totalPrice > 500000 ? 0 : 30000) : 0;
  const finalTotal = totalPrice + shippingFee;
  const freeShipThreshold = 500000;
  const progressPct = Math.min((totalPrice / freeShipThreshold) * 100, 100);

  return (
    <>
      <Header />

      <div className="cart-container-main">
        {cartItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-visual">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <circle cx="36" cy="36" r="35" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d="M22 28h28l-3.5 18H25.5L22 28z" stroke="var(--primary)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                <path d="M29 28c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="var(--primary)" strokeWidth="1.5" fill="none" />
                <circle cx="30" cy="51" r="2" fill="var(--primary)" />
                <circle cx="42" cy="51" r="2" fill="var(--primary)" />
              </svg>
            </div>
            <h2 className="empty-title">Túi mua sắm của bạn trống</h2>
            <p className="empty-sub">Những thiết kế tinh tế đang chờ được khám phá.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Khám Phá Cửa Hàng</button>
          </div>
        ) : (
          <div className="cart-content-wrap">
            <header className="cart-page-header">
                <h1 className="page-title">Túi Mua Sắm</h1>
                <p className="page-sub">{totalItems} món đồ đã được chọn lọc</p>
            </header>

            <div className="cart-grid-layout">
              <div className="cart-items-column">
                {cartItems.map((item, idx) => (
                  <div key={idx} className={`cart-row-item ${removingIdx === idx ? 'item-removing' : ''}`}>
                    <div className="row-img-wrap">
                      <img
                        src={getProductImage(item.image)}
                        onError={e => e.target.src = fallbackImg}
                        alt={item.productName}
                        className="row-img"
                      />
                    </div>

                    <div className="row-details">
                      <div className="details-header">
                        <div>
                          <p className="row-brand">{item.brand}</p>
                          <h3 className="row-name">{item.productName}</h3>
                          <div className="row-variant-tags">
                            <span className="var-tag">Màu {item.variantInfo?.color}</span>
                            <span className="var-tag">Size {item.variantInfo?.size}</span>
                          </div>
                        </div>
                        <p className="row-total-price">
                          {((item.variantInfo?.price || 0) * item.quantity).toLocaleString('vi-VN')}₫
                        </p>
                      </div>

                      <div className="details-footer">
                         <div className="quantity-controls">
                            <button className="q-btn" onClick={() => handleUpdateQuantity(item, item.quantity - 1)}>–</button>
                            <span className="q-val">{item.quantity}</span>
                            <button className="q-btn" onClick={() => handleUpdateQuantity(item, item.quantity + 1)}>+</button>
                         </div>

                         <div className="item-row-actions">
                            <button className={`row-action-btn ${favorites.has(item.productId) ? 'is-fav' : ''}`} onClick={() => addToFavorites(item)}>
                                {favorites.has(item.productId) ? '★ Đã Lưu' : '☆ Lưu'}
                            </button>
                            <button className="row-action-btn del-color" onClick={() => handleRemove(item, idx)}>Xóa</button>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="order-summary-sidebar">
                <h2 className="summary-sidebar-title">Chi Tiết Đơn Hàng</h2>
                
                {shippingFee > 0 && (
                  <div className="free-ship-checker">
                    <p>Mua thêm <strong>{(freeShipThreshold - totalPrice).toLocaleString('vi-VN')}₫</strong> để nhận ưu đãi miễn phí vận chuyển</p>
                    <div className="progress-track"><div className="progress-fill" style={{width: `${progressPct}%`}}></div></div>
                  </div>
                )}

                <div className="summary-calc-rows">
                  <div className="calc-row"><span>Tạm tính</span><span>{totalPrice.toLocaleString('vi-VN')}₫</span></div>
                  <div className="calc-row"><span>Vận chuyển</span><span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}</span></div>
                </div>

                <div className="summary-final-total">
                   <span>Tổng số tiền</span>
                   <span className="total-val">{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>

                <button 
                  className="btn-luxe-checkout" 
                  onClick={() => navigate('/checkout', { state: { cart: cartItems, total: finalTotal } })}
                >
                  THANH TOÁN AN TOÀN
                </button>

                <div className="trust-mentions">
                    <span>Đảm Bảo Chính Hãng</span>
                    <span>Giao Hàng An Toàn & Riêng Tư</span>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </>
  );
}