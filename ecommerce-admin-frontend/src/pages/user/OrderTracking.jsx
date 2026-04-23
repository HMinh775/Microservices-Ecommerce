import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/common/Header';
import './OrderTracking.css';

const API_GATEWAY = 'http://localhost:8900';
const fallbackImg =
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const getProductImage = (image) => {
  if (!image) return fallbackImg;
  if (image.startsWith('http')) return image;
  return `${API_GATEWAY}/product-catalog-service/products/images/${image}`;
};

const getStatusConfig = (status) => {
  const configs = {
    PENDING:   { label: 'Đang xử lý',        color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '⏳' },
    PAID:      { label: 'Đã thanh toán',      color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '✓'  },
    SHIPPING:  { label: 'Đang vận chuyển',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  icon: '🚚' },
    DELIVERED: { label: 'Đã giao thành công', color: '#d4af37', bg: 'rgba(212,175,55,0.12)',  icon: '✦'  },
    CANCELLED: { label: 'Đã hủy',             color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '✕'  },
  };
  return configs[status] || { label: status, color: '#888', bg: '#f5f5f5', icon: '•' };
};

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

/**
 * Tạo timeline giả lập dựa trên trạng thái thật của đơn hàng.
 */
const buildTimeline = (order) => {
  const baseDate = new Date(order.orderedDate || order.createdAt).getTime();
  const addMins = (m) => new Date(baseDate + m * 60 * 1000).toISOString();

  const STEPS = [
    { key: 'PENDING',   label: 'Đơn hàng đã đặt',       note: 'Đơn hàng đã được ghi nhận' },
    { key: 'PAID',      label: 'Thanh toán xác nhận',    note: `Phương thức: ${order.paymentMethod || 'VNPay'}` },
    { key: 'SHIPPING',  label: 'Đang vận chuyển',        note: 'Đơn hàng đang trên đường giao' },
    { key: 'DELIVERED', label: 'Giao hàng thành công',   note: 'Cảm ơn bạn đã mua sắm tại LUXE!' },
  ];

  const RANK = { PENDING: 0, PAID: 1, SHIPPING: 2, DELIVERED: 3 };
  const currentRank = RANK[order.status?.toUpperCase()] ?? 0;

  if (order.status?.toUpperCase() === 'CANCELLED') {
    return [
      { label: 'Đơn hàng đã đặt', time: addMins(0), done: true },
      { label: 'Đơn hàng đã bị hủy', time: addMins(15), done: true, active: true, note: 'Liên hệ hỗ trợ để biết thêm chi tiết.' },
    ];
  }

  return STEPS.map((s, i) => {
    const isDone = i <= currentRank;
    const isActive = i === currentRank;
    const offsets = [0, 10, 60 * 24, 60 * 24 * 3];
    return {
      label: s.label,
      time: isDone ? addMins(offsets[i]) : null,
      done: isDone,
      active: isActive,
      note: isDone ? s.note : 'Sẽ cập nhật sớm',
    };
  });
};

const getProgressPercent = (timeline) => {
  const done = timeline.filter((t) => t.done).length;
  return Math.round((done / timeline.length) * 100);
};

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
const TimelineStep = ({ step, index, total }) => {
  const isLast = index === total - 1;
  return (
    <div className={`ot-timeline-step ${step.done ? 'done' : ''} ${step.active ? 'active' : ''}`}>
      <div className="ot-step-connector">
        <div className={`ot-step-dot ${step.done ? 'done' : ''} ${step.active ? 'active pulse' : ''}`}>
          {step.done && !step.active ? '✓' : step.active ? <span className="ot-dot-inner" /> : null}
        </div>
        {!isLast && <div className={`ot-step-line ${step.done ? 'done' : ''}`} />}
      </div>
      <div className="ot-step-content">
        <div className="ot-step-header">
          <span className="ot-step-label">{step.label}</span>
          {step.time && <span className="ot-step-time">{formatDate(step.time)}</span>}
        </div>
        {step.note && <p className="ot-step-note">{step.note}</p>}
      </div>
    </div>
  );
};

const OrderCard = ({ order, isSelected, onClick }) => {
  const cfg = getStatusConfig(order.status);
  return (
    <div className={`ot-order-card ${isSelected ? 'selected' : ''}`} onClick={() => onClick(order)}>
      <div className="ot-card-top">
        <div>
          <p className="ot-card-id">#{order.id}</p>
          <p className="ot-card-date">{formatDate(order.orderedDate || order.createdAt)}</p>
        </div>
        <span className="ot-card-badge" style={{ color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
      </div>
      <div className="ot-card-items">
        {(order.items || []).slice(0, 3).map((it, i) => (
          <img key={i} src={getProductImage(it.image)} className="ot-card-thumb" alt="" />
        ))}
        <div className="ot-card-amount">{(order.totalAmount || 0).toLocaleString()}₫</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────
const OrderTracking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [searchError, setSearchError] = useState('');

  const fetchOrders = useCallback(async (userId) => {
    try {
      const res = await axios.get(`${API_GATEWAY}/order-service/orders/user/${userId}`);
      const data = res.data || [];
      const sorted = data.sort((a, b) => new Date(b.orderedDate || b.createdAt) - new Date(a.orderedDate || a.createdAt));
      setOrders(sorted);

      // Check URL or State
      const params = new URLSearchParams(location.search);
      const urlId = params.get('id');
      const stateOrder = location.state?.order;

      if (stateOrder) {
        setSelectedOrder(stateOrder);
      } else if (urlId) {
        const found = sorted.find(o => String(o.id) === urlId);
        setSelectedOrder(found || sorted[0]);
      } else {
        setSelectedOrder(sorted[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setLoading(false);
      return;
    }
    const user = JSON.parse(userStr);
    fetchOrders(user.id);
  }, [fetchOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchId.trim();
    const found = orders.find(o => String(o.id).includes(q));
    if (found) {
      setSelectedOrder(found);
      setSearchError('');
    } else {
      setSearchError('Không tìm thấy đơn hàng này trong danh sách của bạn.');
    }
  };

  const timeline = selectedOrder ? buildTimeline(selectedOrder) : [];
  const cfg = selectedOrder ? getStatusConfig(selectedOrder.status) : {};
  const progress = getProgressPercent(timeline);

  if (loading) return <div className="ot-wrapper"><Header /><div className="ot-state-center"><div className="ot-spinner" /></div></div>;

  return (
    <div className="ot-wrapper">
      <Header />
      <section className="ot-hero">
        <div className="ot-hero-bg" />
        <div className="ot-hero-content">
          <span className="ot-hero-eyebrow">✦ LUXE DELIVERY</span>
          <h1 className="ot-hero-title">Theo Dõi Đơn Hàng</h1>
          
          <div className="ot-hero-links">
            <button className="ot-history-link" onClick={() => navigate('/orders')}>📋 Lịch sử đơn hàng</button>
            <button className="ot-admin-link" onClick={() => navigate('/admin')}>⚙️ Quản trị Admin</button>
          </div>

          <form className="ot-search-form" onSubmit={handleSearch}>
            <div className="ot-search-inner">
              <input 
                className="ot-search-input" 
                placeholder="Nhập mã đơn hàng của bạn..." 
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
              />
              <button className="ot-search-btn" type="submit">Tra Cứu</button>
            </div>
            {searchError && <p className="ot-search-error">{searchError}</p>}
          </form>
        </div>
      </section>

      <div className="ot-main">
        <aside className="ot-sidebar">
          <div className="ot-sidebar-header">
            <h2 className="ot-sidebar-title">Đơn Hàng Của Bạn</h2>
            <span className="ot-sidebar-count">{orders.length}</span>
          </div>
          <div className="ot-orders-list">
            {orders.map(o => (
              <OrderCard key={o.id} order={o} isSelected={selectedOrder?.id === o.id} onClick={setSelectedOrder} />
            ))}
          </div>
        </aside>

        <main className="ot-detail">
          {selectedOrder ? (
            <>
              <div className="ot-detail-header">
                <div className="ot-detail-status-row">
                  <div className="ot-status-icon-wrap" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</div>
                  <div>
                    <p className="ot-detail-order-id">Đơn hàng #{selectedOrder.id}</p>
                    <h2 className="ot-detail-status" style={{ color: cfg.color }}>{cfg.label}</h2>
                  </div>
                </div>
                <div className="ot-progress-wrap">
                  <div className="ot-progress-bar"><div className="ot-progress-fill" style={{ width: `${progress}%`, background: cfg.color }} /></div>
                  <span className="ot-progress-label">{progress}% hoàn thành</span>
                </div>
              </div>

              <div className="ot-content-grid">
                <section className="ot-section">
                  <h3 className="ot-section-title">Hành Trình</h3>
                  <div className="ot-timeline">
                    {timeline.map((s, i) => <TimelineStep key={i} step={s} index={i} total={timeline.length} />)}
                  </div>
                </section>
                <div className="ot-info-column">
                  <section className="ot-section">
                    <h3 className="ot-section-title">Thông Tin</h3>
                    <div className="ot-info-card">
                      <div className="ot-info-row"><span className="ot-info-label">Người nhận</span><span className="ot-info-value">{selectedOrder.userName || '—'}</span></div>
                      <div className="ot-info-row"><span className="ot-info-label">Địa chỉ</span><span className="ot-info-value">{selectedOrder.shippingAddress || '—'}</span></div>
                      <div className="ot-info-row total"><span className="ot-info-label">Tổng tiền</span><span className="ot-total-amount">{(selectedOrder.totalAmount || 0).toLocaleString()}₫</span></div>
                    </div>
                  </section>
                </div>
              </div>

              <section className="ot-section">
                <h3 className="ot-section-title">Sản Phẩm Đã Đặt</h3>
                <div className="ot-products-list">
                  {(selectedOrder.items || []).map((it, i) => (
                    <div key={i} className="ot-product-row">
                      <div className="ot-product-img-wrap"><img src={getProductImage(it.image)} className="ot-product-img" alt="" /></div>
                      <div className="ot-product-info">
                        <p className="ot-product-name">{it.productName}</p>
                        <p className="ot-product-variant">{it.variantInfo || 'N/A'} · SL: {it.quantity}</p>
                      </div>
                      <div className="ot-product-price">{((it.priceAtPurchase || it.price || 0) * it.quantity).toLocaleString()}₫</div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="ot-state-center"><p className="ot-state-text">Chọn một đơn hàng để xem chi tiết.</p></div>
          )}
        </main>
      </div>
    </div>
  );
};

export default OrderTracking;
