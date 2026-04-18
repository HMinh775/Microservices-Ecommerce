import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Cart.css';

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = 'https://via.placeholder.com/100x100?text=No+Image';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [user, setUser] = useState(null);
  const [removingIdx, setRemovingIdx] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setUser(JSON.parse(userStr));
    const saved = localStorage.getItem('cartItems') || '[]';
    const fav = localStorage.getItem('favorites') || '[]';
    setCartItems(JSON.parse(saved));
    setFavorites(new Set(JSON.parse(fav)));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('favorites');
    localStorage.removeItem('cartItems');
    navigate('/login');
  };

  const updateCart = (newItems) => {
    setCartItems(newItems);
    localStorage.setItem('cartItems', JSON.stringify(newItems));
  };

  const updateQuantity = (idx, qty) => {
    if (qty <= 0) return removeItem(idx);
    const updated = [...cartItems];
    updated[idx].quantity = qty;
    updateCart(updated);
  };

  const removeItem = (idx) => {
    setRemovingIdx(idx);
    setTimeout(() => {
      updateCart(cartItems.filter((_, i) => i !== idx));
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
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <span className="brand-luxe">LUXE</span>
          <span className="brand-dot">✦</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Cửa Hàng</Link>
          <a href="#">Blog</a>
          <a href="#">Liên Hệ</a>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="greeting">Xin chào, <strong>{user.userDetails?.lastName || user.userName}</strong></span>
              <button className="btn-logout" onClick={handleLogout}>Đăng Xuất</button>
            </>
          ) : (
            <button className="btn-logout" onClick={() => navigate('/login')}>Đăng Nhập</button>
          )}
        </div>
      </nav>

      <div className="container">
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
            <h2 className="empty-title">Túi của bạn đang trống</h2>
            <p className="empty-sub">Hãy để LUXE giúp bạn tìm những món đồ hoàn hảo nhất.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Khám Phá Cửa Hàng
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        ) : (
          <>
            <header className="page-header">
              <div>
                <h1 className="page-title">Giỏ Hàng</h1>
                <p className="page-sub">{totalItems} sản phẩm đang chờ bạn</p>
              </div>
              <Link to="/" className="link-back">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13 8H3M7 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Tiếp tục mua sắm
              </Link>
            </header>

            <div className="cart-layout">
              {/* LEFT */}
              <div className="cart-left">
                <div className="items-list">
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`cart-item ${removingIdx === idx ? 'removing' : ''}`}
                    >
                      <div className="item-img-wrap">
                        <img
                          src={item.image ? `${API_GATEWAY}/product-catalog-service/products/images/${item.image}` : fallbackImg}
                          onError={e => e.target.src = fallbackImg}
                          alt={item.productName}
                          className="item-img"
                        />
                        <span className="item-qty-badge">{item.quantity}</span>
                      </div>

                      <div className="item-body">
                        <div className="item-top">
                          <div>
                            <p className="item-brand">{item.brand}</p>
                            <p className="item-name">{item.productName}</p>
                          </div>
                          <p className="item-line-total">
                            {((item.variantInfo?.price || 0) * item.quantity).toLocaleString('vi-VN')}₫
                          </p>
                        </div>

                        <div className="item-tags">
                          <span className="tag">Size {item.variantInfo?.size}</span>
                          <span className="tag">{item.variantInfo?.color}</span>
                        </div>

                        <div className="item-bottom">
                          <div className="qty-row">
                            <button className="qty-btn" onClick={() => updateQuantity(idx, item.quantity - 1)}>
                              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </button>
                            <span className="qty-num">{item.quantity}</span>
                            <button className="qty-btn" onClick={() => updateQuantity(idx, item.quantity + 1)}>
                              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </button>
                            <span className="unit-price">{(item.variantInfo?.price || 0).toLocaleString('vi-VN')}₫ / cái</span>
                          </div>

                          <div className="item-actions">
                            <button
                              className={`action-btn fav-btn ${favorites.has(item.productId) ? 'active' : ''}`}
                              onClick={() => addToFavorites(item)}
                              title={favorites.has(item.productId) ? 'Bỏ yêu thích' : 'Lưu yêu thích'}
                            >
                              <svg width="15" height="15" viewBox="0 0 15 15" fill={favorites.has(item.productId) ? 'currentColor' : 'none'}>
                                <path d="M7.5 13S2 9.5 2 5.5A3.5 3.5 0 0 1 7.5 3.2 3.5 3.5 0 0 1 13 5.5C13 9.5 7.5 13 7.5 13z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                              </svg>
                              {favorites.has(item.productId) ? 'Đã lưu' : 'Lưu'}
                            </button>
                            <button className="action-btn del-btn" onClick={() => removeItem(idx)} title="Xóa">
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M2 3.5h10M5 3.5V2.5h4v1M5.5 6v4M8.5 6v4M3 3.5l.7 7.5h6.6L11 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {favorites.size > 0 && (
                  <div className="favorites-block">
                    <div className="fav-header">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M7 12.5S1.5 9 1.5 5A3 3 0 0 1 7 2.8 3 3 0 0 1 12.5 5C12.5 9 7 12.5 7 12.5z" /></svg>
                      Đã Lưu ({favorites.size})
                    </div>
                    <p className="fav-note">Các sản phẩm yêu thích của bạn được lưu tại đây.</p>
                  </div>
                )}
              </div>

              {/* RIGHT — SUMMARY */}
              <aside className="cart-summary">
                <h2 className="summary-title">Đơn Hàng</h2>

                {/* Free shipping progress */}
                {shippingFee > 0 && (
                  <div className="ship-progress-wrap">
                    <p className="ship-progress-label">
                      Mua thêm <strong>{(freeShipThreshold - totalPrice).toLocaleString('vi-VN')}₫</strong> để miễn phí ship
                    </p>
                    <div className="ship-bar">
                      <div className="ship-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                  </div>
                )}

                <div className="summary-rows">
                  <div className="summary-row">
                    <span>Tạm tính ({totalItems} sp)</span>
                    <span>{totalPrice.toLocaleString('vi-VN')}₫</span>
                  </div>
                  <div className="summary-row">
                    <span>Phí vận chuyển</span>
                    <span className={shippingFee === 0 ? 'free-label' : ''}>
                      {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}₫`}
                    </span>
                  </div>
                </div>

                <div className="summary-total">
                  <span>Tổng cộng</span>
                  <span className="total-amount">{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>

                <button
                  className="btn-primary checkout-btn"
                  onClick={() => navigate('/checkout', { state: { cart: cartItems, total: finalTotal } })}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1.5" y="4" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" /><path d="M5 4V3a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                  Thanh Toán Ngay
                </button>

                <div className="trust-badges">
                  <span>🔒 Bảo mật SSL</span>
                  <span>🚚 Giao hàng nhanh</span>
                  <span>↩️ Đổi trả 30 ngày</span>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </>
  );
}