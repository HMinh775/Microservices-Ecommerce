import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Re-use Login styles

const API_GATEWAY = "http://localhost:8900";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Vui lòng nhập Email');
      return;
    }

    setLoading(true);
    setError('');
    setMsg('');
    try {
      await axios.post(`${API_GATEWAY}/user-service/users/forgot-password`, { email });
      setMsg('Mã OTP đã được gửi đến email của bạn');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      setError(err.response?.data || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <Link to="/" className="brand">✦ LUXE<span>.</span></Link>
        
        <div className="login-box">
          <h2>Quên Mật Khẩu</h2>
          <p>Nhập email của bạn để nhận mã xác thực OTP.</p>
          
          {error && <div className="error-msg">{error}</div>}
          {msg && <div className="success-msg" style={{ color: '#4caf50', marginBottom: '1rem', background: 'rgba(76, 175, 80, 0.1)', padding: '0.8rem', borderRadius: '8px' }}>{msg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Đăng Ký</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang Gửi...' : 'GỬI MÃ OTP'}
            </button>
          </form>
          
          <div className="login-footer">
            Quay lại <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
      <div className="login-right"></div>
    </div>
  );
}
