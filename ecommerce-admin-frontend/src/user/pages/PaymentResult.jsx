import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentResult.css';

export default function PaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading | success | failed

  useEffect(() => {
    // 1. Kiểm tra tham số VNPay
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
    const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');

    // 2. Kiểm tra tham số MoMo
    const momo_ResultCode = searchParams.get('resultCode');

    const isVnPaySuccess = vnp_ResponseCode === '00' && vnp_TransactionStatus === '00';
    const isMomoSuccess = momo_ResultCode === '0';

    if (isVnPaySuccess || isMomoSuccess) {
      setStatus('success');
      // CHỈ xóa giỏ hàng khi thanh toán thực sự thành công
      localStorage.removeItem('cartItems');
    } else if (vnp_ResponseCode || momo_ResultCode) {
      // Nếu có mã trả về nhưng không phải thành công
      setStatus('failed');
    } else {
      // Trường hợp không thấy tham số thanh toán (có thể vào trang trực tiếp)
      setStatus('failed');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="payment-result-page">
        <div className="payment-result-card">
          <div className="payment-result-spinner"></div>
          <h2>Đang xử lý kết quả thanh toán...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result-page">
      <div className="payment-result-card">
        {status === 'success' ? (
          <>
            <div className="payment-result-icon success">✅</div>
            <h2 className="payment-result-title success">Thanh Toán Thành Công!</h2>
            <p className="payment-result-msg">
              Đơn hàng của bạn đã được thanh toán thành công.<br />
              Vui lòng chờ xác nhận từ cửa hàng.
            </p>
            <div className="payment-result-details">
              <div className="detail-row">
                <span>Mã GD:</span>
                <span>{searchParams.get('vnp_TransactionNo') || searchParams.get('transId') || '—'}</span>
              </div>
              <div className="detail-row">
                <span>Số tiền:</span>
                <span>
                  {searchParams.get('resultCode') 
                    ? Number(searchParams.get('amount') || 0).toLocaleString('vi-VN') + ' ₫'
                    : Number(searchParams.get('vnp_Amount') / 100 || 0).toLocaleString('vi-VN') + ' ₫'
                  }
                </span>
              </div>
              <div className="detail-row">
                <span>Phương thức:</span>
                <span>{searchParams.get('resultCode') ? 'Ví MoMo' : 'VNPay'}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="payment-result-icon failed">❌</div>
            <h2 className="payment-result-title failed">Thanh Toán Thất Bại</h2>
            <p className="payment-result-msg">
              Giao dịch không thành công hoặc đã bị hủy.<br />
              Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
            </p>
          </>
        )}

        <div className="payment-result-actions">
          <button className="btn-home" onClick={() => navigate('/')}>
            🏠 Về Trang Chủ
          </button>
          <button className="btn-orders" onClick={() => navigate('/cart')}>
            🛒 Quay Lại Giỏ Hàng
          </button>
        </div>
      </div>
    </div>
  );
}
