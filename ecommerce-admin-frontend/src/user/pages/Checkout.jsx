import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import './Checkout.css';

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = 'https://via.placeholder.com/80x80?text=No+Image';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isMomo, setIsMomo] = useState(false);

  const cart = location.state?.cart || [];
  const total = location.state?.total || 0;

  const [form, setForm] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    paymentMethod: 'VNPAY'
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      const details = userData.userDetails || {};
      setForm(prev => ({
        ...prev,
        email: details.email || userData.email || '',
        phone: details.phoneNumber || details.phone_number || details.phone || '',
        firstName: details.firstName || details.first_name || userData.firstName || '',
        lastName: details.lastName || details.last_name || userData.lastName || ''
      }));
    }

    if (cart.length === 0) {
      navigate('/cart');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    // Validate form
    if (!form.email || !form.phone || !form.firstName || !form.lastName || !form.address || !form.city) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    // Kiểm tra stock: validate mỗi item có đủ hàng không
    const emptyStockItems = cart.filter(item =>
      !item.variantInfo?.stockQuantity || item.variantInfo.stockQuantity <= 0
    );

    if (emptyStockItems.length > 0) {
      const itemNames = emptyStockItems.map(i => `${i.productName} (${i.variantInfo?.size}/${i.variantInfo?.color})`).join(', ');
      alert(`❌ Sản phẩm sau đã hết hàng, không thể đặt mua:\n${itemNames}`);
      return;
    }

    setLoading(true);
    try {
      // 1. Tạo đơn hàng tại Order Service (Giữ nguyên logic của bạn)
      const userId = user?.id || user?.userId || user?.userDetails?.userId || 1;
      const orderPayload = {
        userId: userId,
        orderedDate: new Date().toISOString(),
        shippingAddress: `${form.address}, ${form.city}`,
        status: 'PENDING',
        totalAmount: total,
        paymentMethod: form.paymentMethod,
        orderItems: cart.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          priceAtPurchase: item.variantInfo?.price || 0,
          subtotal: (item.variantInfo?.price || 0) * item.quantity,
          variantId: item.variantId,
          variantInfo: `${item.variantInfo?.size || ''} / ${item.variantInfo?.color || ''}`
        }))
      };

      const orderRes = await axios.post(`${API_GATEWAY}/order-service/orders`, orderPayload);
      const newOrderId = orderRes.data.id;
      setOrderId(newOrderId);

      // --- PHẦN TÍCH HỢP THANH TOÁN (VNPAY & MOMO) ---
      if (form.paymentMethod === 'VNPAY' || form.paymentMethod === 'MOMO' || form.paymentMethod === 'BANK_TRANSFER') {
        console.log(`--- ĐANG TẠO LINK THANH TOÁN ${form.paymentMethod} ---`);
        const paymentPayload = {
          orderId: newOrderId,
          amount: total,
          paymentMethod: form.paymentMethod
        };

        const paymentRes = await axios.post(`${API_GATEWAY}/payment-service/payments`, paymentPayload);
        console.log(`Response từ Payment Service (${form.paymentMethod}):`, paymentRes.data);

        let paymentUrl = paymentRes.data;

        // Xử lý chuỗi (loại bỏ dấu ngoặc kép nếu có)
        if (typeof paymentUrl === 'string') {
          paymentUrl = paymentUrl.trim().replace(/^"(.*)"$/, '$1');
        }

        console.log("DEBUG - Kết quả từ Backend:", paymentUrl);

        // Xử lý riêng cho Chuyển khoản Ngân hàng (VietQR) - Kiểm tra linh hoạt hơn
        if (typeof paymentUrl === 'string' && (paymentUrl.startsWith('QRCODE:') || paymentUrl.includes('vietqr.io'))) {
          const cleanUrl = paymentUrl.replace('QRCODE:', '').trim();
          setLoading(false); // Quan trọng: Tắt loading trước khi hiện Modal
          setQrUrl(cleanUrl);
          setIsMomo(false);
          setShowQrModal(true);
          localStorage.removeItem('cartItems');
          return;
        }

        // Xử lý riêng cho MoMo Demo QR
        if (typeof paymentUrl === 'string' && paymentUrl.startsWith('QRCODE_MOMO:')) {
          const cleanUrl = paymentUrl.replace('QRCODE_MOMO:', '').trim();
          setLoading(false);
          setQrUrl(cleanUrl);
          setIsMomo(true);
          setShowQrModal(true);
          localStorage.removeItem('cartItems');
          return;
        }

        // Đảm bảo lấy được chuỗi URL kể cả nếu backend trả về object { url: "..." }
        if (paymentUrl && typeof paymentUrl === 'object') {
          paymentUrl = paymentUrl.url || paymentUrl.paymentUrl || paymentUrl.data;
        }

        if (paymentUrl && typeof paymentUrl === 'string' && paymentUrl.trim().startsWith('http')) {
          console.log('Đang chuyển hướng sang:', paymentUrl);
          window.location.href = paymentUrl.trim();
          return;
        } else {
          console.error(`Kết quả thanh toán không hợp lệ:`, paymentUrl);
          alert(`Lỗi khởi tạo ${form.paymentMethod}. \n\nPhản hồi từ Server: "${paymentUrl}"\n\n(Vui lòng đảm bảo đã Restart Payment Service)`);
          return;
        }
      }
      // -------------------------------

      // 2. Nếu là COD (không chạy vào block VNPAY ở trên)
      localStorage.removeItem('cartItems');
      setSuccess(true); // Hiện Modal thành công cho COD

      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (err) {
      console.error('Order creation error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tạo đơn hàng';
      alert('Lỗi: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>


      <nav className="navbar">
        <div className="nav-brand">✦ LUXE<span>✧</span></div>
      </nav>

      <div className="progress-bar">
        <div className="step completed">
          <div className="step-num">✓</div>
          <span>Giỏ Hàng</span>
        </div>
        <div className="step active">
          <div className="step-num">2</div>
          <span>Thanh Toán</span>
        </div>
        <div className="step">
          <div className="step-num">3</div>
          <span>Hoàn Thành</span>
        </div>
      </div>

      <div className="container">
        <div className="page-title">💳 Thanh Toán</div>

        {cart.length > 0 && (
          <div className="checkout-grid">
            {/* FORM */}
            <div>
              {/* Shipping Info */}
              <div className="form-section">
                <div className="form-title">📍 Thông Tin Giao Hàng</div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Họ</label>
                    <input
                      className="form-input"
                      placeholder="Nguyễn"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên</label>
                    <input
                      className="form-input"
                      placeholder="Văn A"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row full">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="your@email.com"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row full">
                  <div className="form-group">
                    <label>Số Điện Thoại</label>
                    <input
                      className="form-input"
                      placeholder="0901234567"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row full">
                  <div className="form-group">
                    <label>Địa Chỉ</label>
                    <input
                      className="form-input"
                      placeholder="123 Đường ABC, Phường XYZ"
                      name="address"
                      value={form.address}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row full">
                  <div className="form-group">
                    <label>Thành Phố / Tỉnh</label>
                    <select
                      className="form-select"
                      name="city"
                      value={form.city}
                      onChange={handleInputChange}
                    >
                      <option value="">-- Chọn --</option>
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP.HCM">TP.HCM</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="Hải Phòng">Hải Phòng</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="form-section" style={{ marginTop: 30 }}>
                <div className="form-title">💳 Phương Thức Thanh Toán</div>

                <div className="info-box">
                  ℹ️ Chọn phương thức thanh toán yêu thích của bạn
                </div>

                <div className="payment-methods">
                  {[
                    { id: 'VNPAY', name: 'VNPay', icon: '🏦' },
                    { id: 'MOMO', name: 'MoMo', icon: '📱' },
                    { id: 'BANK_TRANSFER', name: 'Ngân hàng', icon: '💳' },
                    { id: 'COD', name: 'Khi nhận hàng', icon: '🚚' }
                  ].map(method => (
                    <div
                      key={method.id}
                      className={`payment-option ${form.paymentMethod === method.id ? 'selected' : ''}`}
                      onClick={() => setForm(prev => ({ ...prev, paymentMethod: method.id }))}
                    >
                      <div className="payment-icon">{method.icon}</div>
                      <div className="payment-name">{method.name}</div>
                    </div>
                  ))}
                </div>

                <div className="info-box" style={{ marginTop: 20 }}>
                  ✅ {form.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : 'Thanh toán trực tuyến'}
                </div>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="order-summary">
              <div className="summary-title">Đơn Hàng</div>

              <div className="summary-items">
                {cart.map((item, idx) => (
                  <div key={idx} className="summary-item">
                    <img
                      className="summary-item-img"
                      src={item.image ? `${API_GATEWAY}/product-catalog-service/products/images/${item.image}` : fallbackImg}
                      onError={e => e.target.src = fallbackImg}
                      alt={item.productName}
                    />
                    <div className="summary-item-info">
                      <div className="summary-item-name">{item.productName}</div>
                      <div className="summary-item-variant">{item.variantInfo?.size} • {item.variantInfo?.color}</div>
                      <div className="summary-item-qty">Số lượng: {item.quantity}</div>
                      <div className="summary-item-price">
                        {((item.variantInfo?.price || 0) * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-row">
                <span className="summary-label">Tạm Tính:</span>
                <span className="summary-value">
                  {cart.reduce((sum, item) => sum + (item.variantInfo?.price || 0) * item.quantity, 0).toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Phí Vận Chuyển:</span>
                <span className="summary-value">
                  {total - cart.reduce((sum, item) => sum + (item.variantInfo?.price || 0) * item.quantity, 0) > 0
                    ? (total - cart.reduce((sum, item) => sum + (item.variantInfo?.price || 0) * item.quantity, 0)).toLocaleString('vi-VN') + ' ₫'
                    : 'Miễn Phí'
                  }
                </span>
              </div>

              <div className="summary-row total">
                <span>Tổng Cộng:</span>
                <span>{total.toLocaleString('vi-VN')} ₫</span>
              </div>

              {cart.some(item => !item.variantInfo?.stockQuantity || item.variantInfo.stockQuantity <= 0) && (
                <div style={{
                  background: 'rgba(248,113,113,0.1)',
                  border: '1px solid #f87171',
                  color: '#f87171',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginTop: '15px',
                  textAlign: 'center'
                }}>
                  ⚠️ Một số sản phẩm đã hết hàng, vui lòng loại bỏ chúng khỏi giỏ
                </div>
              )}

              <button
                className="btn-place-order"
                onClick={handlePlaceOrder}
                disabled={loading || cart.some(item => !item.variantInfo?.stockQuantity || item.variantInfo.stockQuantity <= 0)}
              >
                {loading ? '⏳ Đang Xử Lý...' : '✓ Hoàn Tất Đơn Hàng'}
              </button>
            </div>
          </div>
        )}
      </div>

      {success && (
        <div className="success-modal">
          <div className="success-box">
            <div className="success-icon">✅</div>
            <div className="success-title">Đặt Hàng Thành Công!</div>
            <div className="success-msg">
              Đơn hàng #{orderId} của bạn đã được tạo thành công.<br />
              Vui lòng chờ xác nhận từ nhân viên bán hàng.
            </div>
            <button
              className="btn-back"
              onClick={() => navigate('/')}
            >
              ← Quay Lại Trang Chủ
            </button>
          </div>
        </div>
      )}

      {showQrModal && (
        <div className="success-modal">
          <div className="success-box">
            <button 
              className="close-modal-btn"
              onClick={() => setShowQrModal(false)}
              style={{ 
                position: 'absolute', 
                top: '15px', 
                right: '15px', 
                border: 'none', 
                background: 'none', 
                fontSize: '20px', 
                cursor: 'pointer', 
                color: '#999',
                zIndex: 1001
              }}
            >
              ✕
            </button>
            <div className="success-icon" style={{ 
              background: isMomo ? '#fdf2f8' : '#fef3c7', 
              color: isMomo ? '#db2777' : '#d97706' 
            }}>
              {isMomo ? '📱' : '🏦'}
            </div>
            <div className="success-title">{isMomo ? 'Thanh Toán MoMo' : 'Thanh Toán Chuyển Khoản'}</div>
            <div className="success-msg">
              Vui lòng quét mã QR dưới đây để hoàn tất thanh toán cho đơn hàng <strong>#{orderId}</strong>.
            </div>
            
            <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', margin: '20px 0', border: '1px solid #eee' }}>
              <img src={qrUrl} alt="QR Code" style={{ width: '100%', display: 'block' }} />
            </div>

            <div style={{ textAlign: 'left', fontSize: '13px', color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
              <p>• <strong>{isMomo ? 'Ví MoMo:' : 'Chủ TK:'}</strong> {isMomo ? '0901234567' : 'HỒ CÔNG MINH'}</p>
              <p>• <strong>Số tiền:</strong> {total.toLocaleString('vi-VN')} ₫</p>
              <p>• <strong>Nội dung:</strong> DH{orderId}</p>
            </div>

            <button
              className="btn-place-order"
              style={{ background: isMomo ? '#db2777' : '#1a1a1c', marginTop: '0', zIndex: 1001 }}
              onClick={() => navigate('/')}
            >
              Tôi đã thanh toán thành công
            </button>
          </div>
        </div>
      )}
    </>
  );
}