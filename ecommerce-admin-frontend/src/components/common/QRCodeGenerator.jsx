import React from 'react';
import './QRCodeGenerator.css';

export default function QRCodeGenerator({ orderId, amount, paymentMethod }) {
  // Tạo chuỗi dữ liệu QR (có thể dùng voidQR generator thực nếu có thư viện)
  // Format: ORDER_ID|AMOUNT|METHOD
  const qrData = `ORDER:${orderId}|AMOUNT:${amount}|METHOD:${paymentMethod}`;
  
  // Đây là placeholder - trong production nên dùng thư viện như qrcode.react
  // Tạm thời dùng giả lập hiển thị QR code
  const generateQRPlaceholder = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 200;
    canvas.height = 200;
    
    // Vẽ pattern giả lập QR code
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);
    
    ctx.fillStyle = '#000000';
    // Position markers (3 góc)
    const drawMarker = (x, y) => {
      ctx.fillRect(x, y, 7, 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 1, y + 1, 5, 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 2, y + 2, 3, 3);
    };
    
    drawMarker(0, 0);
    drawMarker(200 - 7, 0);
    drawMarker(0, 200 - 7);
    
    // Vẽ pattern dữ liệu (grid ngẫu nhiên)
    for (let i = 20; i < 180; i += 15) {
      for (let j = 20; j < 180; j += 15) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 10, 10);
        }
      }
    }
    
    return canvas.toDataURL();
  };

  const qrImage = generateQRPlaceholder();

  const getPaymentIcon = (method) => {
    const icons = {
      'VNPAY': '🏦',
      'MOMO': '📱',
      'ATM_CARD': '💳',
      'CREDIT_CARD': '💎',
      'COD': '🚚',
    };
    return icons[method] || '💰';
  };

  const isCOD = paymentMethod === 'COD';

  return (
    <div className="qr-container">
      {isCOD ? (
        <>
          <div className="qr-icon-large">🚚</div>
          <div className="qr-title">
            Thanh Toán Khi Nhận Hàng
          </div>
          <div className="qr-subtitle">
            Số tiền: <strong>{amount.toLocaleString('vi-VN')} ₫</strong>
          </div>
          <div className="qr-info-box">
            ℹ️ Khách hàng sẽ thanh toán trực tiếp cho shipper
          </div>
        </>
      ) : (
        <>
          <div className="qr-icon-mid">
            {getPaymentIcon(paymentMethod)}
          </div>
          <div className="qr-title">
            Quét để thanh toán
          </div>
          <div className="qr-meta">
            {paymentMethod} • {amount.toLocaleString('vi-VN')} ₫
          </div>
          
          {/* QR Code Placeholder */}
          <img 
            src={qrImage} 
            alt="QR Code" 
            className="qr-image"
          />
          
          <div className="qr-footer">
            <div className="qr-footer-item">Mã đơn hàng: <strong>#{orderId}</strong></div>
            <div>Tổng tiền: <strong>{amount.toLocaleString('vi-VN')} ₫</strong></div>
          </div>
        </>
      )}
    </div>
  );
}
