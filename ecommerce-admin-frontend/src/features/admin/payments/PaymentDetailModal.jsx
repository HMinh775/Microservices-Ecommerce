import React from 'react';
import QRCodeGenerator from '../../../components/common/QRCodeGenerator';

const statusMap = {
  PENDING: '⏳ Chờ thanh toán',
  SUCCESS: '✅ Thành công',
  FAILED: '❌ Thất bại',
  REFUNDED: '↩️ Hoàn tiền'
};

const orderStatusMap = {
  PENDING: '⏳ Chờ xử lý', PAID: '💳 Đã thanh toán', CONFIRMED: '✅ Đã xác nhận',
  SHIPPING: '🚚 Đang giao', DELIVERING: '🚚 Đang giao', DELIVERED: '📦 Đã giao',
  COMPLETED: '✅ Hoàn thành', CANCELLED: '❌ Đã hủy'
};

export default function PaymentDetailModal({ payment, order, onClose, onDelete }) {
  const pStatus = payment.status?.toUpperCase();
  const isSuccess = pStatus === 'SUCCESS';

  const badge = (text, color, bg) => (
    <span style={{ padding: '5px 14px', borderRadius: 30, fontSize: 12, fontWeight: 700, color, background: bg, display: 'inline-block' }}>
      {text}
    </span>
  );

  const handleDelete = async () => {
    if (!window.confirm('Xóa bản ghi thanh toán này?')) return;
    await onDelete?.(payment.id);
  };

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
              Chi tiết giao dịch
            </div>
            <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#1a1a1c' }}>
              #TRX_{payment.id}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {badge(
              statusMap[pStatus] || payment.status,
              isSuccess ? '#166534' : pStatus === 'PENDING' ? '#92400e' : '#991b1b',
              isSuccess ? '#dcfce7' : pStatus === 'PENDING' ? '#fef3c7' : '#fee2e2'
            )}
            <button
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 30,
                border: '1.5px solid #e5e7eb', background: '#f8f9fa',
                cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#374151',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1c'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1a1a1c'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
            >
              × Đóng
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Row 1: Thông tin GD + QR */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
            {/* Thông tin giao dịch */}
            <div style={{ background: '#fafafa', borderRadius: 20, padding: '24px 28px', border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#b8860b', marginBottom: 18, textTransform: 'uppercase' }}>
                💰 Thông tin giao dịch
              </div>
              {[
                ['Mã đơn hàng', `#ORD_${payment.orderId}`],
                ['Phương thức', payment.paymentMethod || '—'],
                ['Ngày tạo', payment.createdAt ? new Date(payment.createdAt).toLocaleString('vi-VN') : '—'],
                ['Mã tham chiếu', payment.transactionId || 'N/A'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, gap: 12 }}>
                  <span style={{ color: '#9ca3af', fontSize: 13, whiteSpace: 'nowrap' }}>{label}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right', color: '#1a1a1c' }}>{val}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #eee' }}>
                <span style={{ color: '#9ca3af', fontSize: 13 }}>Số tiền</span>
                <span style={{ fontWeight: 800, fontSize: 24, color: '#b8860b' }}>
                  {(Number(payment.amount) || 0).toLocaleString()} ₫
                </span>
              </div>
            </div>

            {/* QR / Thông tin thanh toán */}
            <div style={{
              background: '#fafafa', borderRadius: 20, padding: '24px 28px',
              border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#b8860b', textTransform: 'uppercase', width: '100%' }}>
                🔗 {payment.paymentMethod === 'COD' ? 'Thanh toán COD' : 'Mã QR Thanh toán'}
              </div>
              <QRCodeGenerator
                orderId={payment.orderId}
                amount={payment.amount || 0}
                paymentMethod={payment.paymentMethod}
              />
              {payment.transactionId && (
                <code style={{ fontSize: 11, background: '#f1f5f9', padding: '4px 10px', borderRadius: 8, color: '#475569', wordBreak: 'break-all', textAlign: 'center' }}>
                  {payment.transactionId}
                </code>
              )}
            </div>
          </div>

          {/* Row 2: Đơn hàng liên quan */}
          {order && (
            <div style={{ background: '#fafafa', borderRadius: 20, padding: '24px 28px', border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#b8860b', marginBottom: 18, textTransform: 'uppercase' }}>
                📦 Đơn hàng liên quan — #REF_{order.id}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
                {[
                  ['Khách hàng', order.userName || `User_${order.userId}`],
                  ['Trạng thái đơn', orderStatusMap[order.status?.toUpperCase()] || order.status || '—'],
                  ['Tổng đơn hàng', `${(Number(order.totalAmount) || 0).toLocaleString()} ₫`],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 6, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1c' }}>{val}</div>
                  </div>
                ))}
                <div style={{ gridColumn: 'span 3' }}>
                  <div style={{ color: '#9ca3af', fontSize: 11, marginBottom: 6, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>Địa chỉ giao hàng</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1c' }}>{order.shippingAddress || '—'}</div>
                </div>
              </div>

              {/* Kiểm tra khớp số tiền */}
              {order.totalAmount && payment.amount && (
                <div style={{
                  marginTop: 16, padding: '10px 16px', borderRadius: 10,
                  background: order.totalAmount === payment.amount ? '#f0fdf4' : '#fef9c3',
                  border: `1px solid ${order.totalAmount === payment.amount ? '#bbf7d0' : '#fde68a'}`,
                  fontSize: 12, fontWeight: 600,
                  color: order.totalAmount === payment.amount ? '#166534' : '#92400e'
                }}>
                  {order.totalAmount === payment.amount
                    ? '✅ Số tiền thanh toán khớp với tổng đơn hàng'
                    : '⚠️ Số tiền thanh toán không khớp với tổng đơn hàng'}
                </div>
              )}
            </div>
          )}

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
            🗑️ Xóa bản ghi
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 40px', borderRadius: 24, border: 'none',
              background: '#1a1a1c', color: '#fff',
              cursor: 'pointer', fontWeight: 700, fontSize: 14
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#000'}
            onMouseLeave={e => e.currentTarget.style.background = '#1a1a1c'}
          >
            Đóng lại
          </button>
        </div>
      </div>
    </div>
  );
}