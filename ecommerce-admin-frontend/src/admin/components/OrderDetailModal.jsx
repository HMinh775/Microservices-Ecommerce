import React, { useState } from 'react';
import axios from 'axios';
import { API_GATEWAY } from '../../utils/constants';

const orderStatusMap = {
  PENDING: '⏳ Chờ xử lý', PAID: '💳 Đã thanh toán', CONFIRMED: '✅ Đã xác nhận',
  SHIPPING: '🚚 Đang giao', DELIVERING: '🚚 Đang giao', DELIVERED: '📦 Đã giao',
  COMPLETED: '✅ Hoàn thành', CANCELLED: '❌ Đã hủy'
};
const paymentStatusMap = {
  PENDING: '⏳ Chờ TT', SUCCESS: '✅ Thành công', FAILED: '❌ Thất bại', REFUNDED: '↩️ Hoàn tiền'
};

export default function OrderDetailModal({ order, payment, onClose, onStatusChange, onDelete }) {
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const getAvailableStatuses = () => {
    const flow = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      PAID: ['CONFIRMED', 'DELIVERING', 'CANCELLED'],
      CONFIRMED: ['DELIVERING', 'SHIPPING', 'CANCELLED'],
      SHIPPING: ['DELIVERED', 'COMPLETED'],
      DELIVERING: ['DELIVERED', 'COMPLETED'],
      DELIVERED: ['COMPLETED'],
      COMPLETED: [], CANCELLED: []
    };
    return flow[order.status?.toUpperCase()] || ['CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_GATEWAY}/order-service/orders/${order.id}/status?status=${status}`);
      onStatusChange('✅ Cập nhật trạng thái thành công', 'success');
    } catch (err) {
      console.error('Status update error:', err.response?.data || err.message);
      onStatusChange('❌ Lỗi cập nhật trạng thái', 'error');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Xóa đơn hàng này? Không thể hoàn tác.')) return;
    try {
      await axios.delete(`${API_GATEWAY}/order-service/orders/${order.id}`);
      onStatusChange('✅ Đã xóa đơn hàng', 'success');
      onDelete?.();
    } catch {
      onStatusChange('❌ Lỗi xóa đơn hàng', 'error');
    }
  };

  const orderStatus = order.status?.toUpperCase();
  const badge = (text, color, bg) => (
    <span style={{ padding: '5px 14px', borderRadius: 30, fontSize: 12, fontWeight: 700, color, background: bg, display: 'inline-block' }}>
      {text}
    </span>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '30px'
    }}>
      <div style={{
        background: '#fff',
        width: '100%', maxWidth: 980,
        maxHeight: '90vh',
        borderRadius: 28,
        boxShadow: '0 40px 120px rgba(0,0,0,0.28)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'modalUp 0.4s cubic-bezier(0.16,1,0.3,1)'
      }}>
        <style>{`@keyframes modalUp { from { transform: translateY(25px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

        {/* ── HEADER ── */}
        <div style={{
          padding: '24px 32px', borderBottom: '1px solid #f0f0f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fff', flexShrink: 0
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#b8860b', textTransform: 'uppercase', marginBottom: 4 }}>
              Chi tiết đơn hàng
            </div>
            <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1a1a1c' }}>
              #REF_{order.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 30,
              border: '1.5px solid #e5e7eb', background: '#f8f9fa',
              cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#374151',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.target.style.background = '#1a1a1c'; e.target.style.color = '#fff'; e.target.style.borderColor = '#1a1a1c'; }}
            onMouseLeave={e => { e.target.style.background = '#f8f9fa'; e.target.style.color = '#374151'; e.target.style.borderColor = '#e5e7eb'; }}
          >
            × Đóng
          </button>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Row 1: 2 cột - Thông tin chung + Thanh toán */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Thông tin chung */}
            <div style={{ background: '#fafafa', borderRadius: 20, padding: '24px 28px', border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#b8860b', marginBottom: 18, textTransform: 'uppercase' }}>
                📦 Thông tin chung
              </div>
              {[
                ['Khách hàng', order.userName || `User_${order.userId}`],
                ['Ngày đặt', new Date(order.orderedDate || order.createdAt).toLocaleString('vi-VN')],
                ['Địa chỉ', order.shippingAddress || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
                  <span style={{ color: '#9ca3af', fontSize: 13, whiteSpace: 'nowrap' }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', color: '#1a1a1c' }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #eee' }}>
                <span style={{ color: '#9ca3af', fontSize: 13 }}>Tổng tiền</span>
                <span style={{ fontWeight: 800, fontSize: 22, color: '#b8860b' }}>
                  {(Number(order.totalAmount) || 0).toLocaleString()} ₫
                </span>
              </div>
            </div>

            {/* Thanh toán */}
            <div style={{ background: '#fafafa', borderRadius: 20, padding: '24px 28px', border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#b8860b', marginBottom: 18, textTransform: 'uppercase' }}>
                💳 Thanh toán
              </div>
              {payment ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ color: '#9ca3af', fontSize: 13 }}>Phương thức</span>
                    {badge(payment.paymentMethod, '#1e40af', '#dbeafe')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ color: '#9ca3af', fontSize: 13 }}>Trạng thái</span>
                    {payment.status?.toUpperCase() === 'SUCCESS'
                      ? badge('✅ Thành công', '#166534', '#dcfce7')
                      : badge(paymentStatusMap[payment.status?.toUpperCase()] || payment.status, '#991b1b', '#fee2e2')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#9ca3af', fontSize: 13 }}>Mã giao dịch</span>
                    <code style={{ fontSize: 11, background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, color: '#475569' }}>
                      {payment.transactionId || 'N/A'}
                    </code>
                  </div>
                </>
              ) : (
                <div style={{ color: '#ef4444', fontSize: 13, background: '#fef2f2', padding: '14px 18px', borderRadius: 12, border: '1px solid #fecaca', marginTop: 8 }}>
                  ⚠️ Chưa có dữ liệu thanh toán
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Danh sách sản phẩm */}
          {order.items?.length > 0 && (
            <div style={{ background: '#fafafa', borderRadius: 20, padding: '24px 28px', border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#b8860b', marginBottom: 18, textTransform: 'uppercase' }}>
                🛍️ Danh sách sản phẩm ({order.items.length} mặt hàng)
              </div>
              {order.items.map((item, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: i < order.items.length - 1 ? '1px solid #efefef' : 'none'
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1c' }}>
                      {item.productName || `Sản phẩm #${item.productId}`}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                      SL: {item.quantity} · Size: {item.size || 'N/A'} · Màu: {item.color || 'N/A'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#b8860b' }}>
                    {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()} ₫
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Row 3: Cập nhật trạng thái */}
          <div style={{ background: '#fafafa', borderRadius: 20, padding: '24px 28px', border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#b8860b', marginBottom: 18, textTransform: 'uppercase' }}>
              ⚙️ Cập nhật trạng thái
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Hiện tại</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1c' }}>
                  {orderStatusMap[orderStatus] || order.status}
                </div>
              </div>
              <div style={{ color: '#d1d5db', fontSize: 20 }}>→</div>
              <div style={{ flex: 2 }}>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>Chọn trạng thái mới</div>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    border: '1.5px solid #e5e7eb', fontSize: 14, fontWeight: 600,
                    outline: 'none', background: '#fff', cursor: 'pointer'
                  }}
                >
                  {['PENDING','PAID','CONFIRMED','SHIPPING','DELIVERING','DELIVERED','COMPLETED','CANCELLED'].map(s => (
                    <option key={s} value={s}>
                      {orderStatusMap[s] || s}{s === order.status ? ' (Hiện tại)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {status !== order.status && (
              <div style={{ marginTop: 12, padding: '8px 14px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', fontSize: 12, color: '#92400e', fontWeight: 600 }}>
                ⚠️ Sắp đổi: {orderStatusMap[orderStatus]} → {orderStatusMap[status?.toUpperCase()] || status}
              </div>
            )}
          </div>

        </div>

        {/* ── FOOTER ── */}
        <div style={{
          padding: '20px 32px', borderTop: '1px solid #f0f0f0',
          background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0
        }}>
          <button
            onClick={handleDelete}
            style={{
              padding: '10px 20px', borderRadius: 20, border: '1px solid #fecaca',
              background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontWeight: 600, fontSize: 13
            }}
          >
            🗑️ Xóa đơn hàng
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 28px', borderRadius: 24, border: '1.5px solid #e5e7eb',
                background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#374151'
              }}
            >
              Đóng lại
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '12px 32px', borderRadius: 24, border: 'none',
                background: saving ? '#9ca3af' : '#1a1a1c',
                color: '#fff', cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 14, transition: 'all 0.2s'
              }}
            >
              {saving ? '⏳ Đang lưu...' : '💾 Cập nhật trạng thái'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}