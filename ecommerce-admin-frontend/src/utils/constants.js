// src/utils/constants.js
// Các service endpoints - gọi trực tiếp để tránh CORS
export const USER_SERVICE = 'http://localhost:8811'
export const PRODUCT_SERVICE = 'http://localhost:8810'
export const ORDER_SERVICE = 'http://localhost:8813'
export const PAYMENT_SERVICE = 'http://localhost:8814'

// Giữ nguyên API_GATEWAY nếu sau này muốn dùng
export const API_GATEWAY = 'http://localhost:8900'

export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'];

// Dịch status sang tiếng Việt
export const statusTranslations = {
  // Order statuses
  'PENDING': '⏳ Chờ xác nhận',
  'CONFIRMED': '✅ Đã xác nhận',
  'SHIPPING': '🚚 Đang giao',
  'DELIVERED': '📦 Đã giao',
  'CANCELLED': '❌ Đã hủy',
  // Payment statuses
  'SUCCESS': '✅ Thành công',
  'FAILED': '❌ Thất bại',
  'REFUNDED': '↩️ Hoàn tiền'
};

export const orderStatusBadge = (s) => {
  const map = {
    PENDING:   'badge-orange',
    CONFIRMED: 'badge-blue',
    SHIPPING:  'badge-purple',
    DELIVERED: 'badge-green',
    CANCELLED: 'badge-red',
  };
  const label = {
    PENDING:   '⏳ Chờ xác nhận',
    CONFIRMED: '✅ Đã xác nhận',
    SHIPPING:  '🚚 Đang giao',
    DELIVERED: '📦 Đã giao',
    CANCELLED: '❌ Đã hủy',
  };
  return { className: `badge ${map[s] || 'badge-muted'}`, label: label[s] || s };
};

export const paymentStatusBadge = (s) => {
  const map   = { PENDING: 'badge-orange', SUCCESS: 'badge-green', FAILED: 'badge-red', REFUNDED: 'badge-purple' };
  const label = { PENDING: '⏳ Chờ TT', SUCCESS: '✅ Thành công', FAILED: '❌ Thất bại', REFUNDED: '↩️ Hoàn tiền' };
  return { className: `badge ${map[s] || 'badge-muted'}`, label: label[s] || s };
};

export const paymentMethodBadge = (m) => {
  const map   = { COD: 'badge-gold', VNPAY: 'badge-blue', MOMO: 'badge-purple', BANK: 'badge-muted' };
  const label = { COD: '💵 COD', VNPAY: '🏦 VNPay', MOMO: '📱 MoMo', BANK: '🏧 Bank' };
  return { className: `badge ${map[m] || 'badge-muted'}`, label: label[m] || m };
};