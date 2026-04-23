import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './Login.css';

const API_GATEWAY = "http://localhost:8900";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ 
    email: location.state?.email || '', 
    otp: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.otp || !form.newPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.newPassword.length < 4) {
      setError('Mật khẩu phải có ít nhất 4 ký tự');
      return;
    }

    setLoading(true);
    setError('');
    setMsg('');
    try {
      await axios.post(`${API_GATEWAY}/user-service/users/reset-password`, {
        email: form.email,
        otp: form.otp,
        newPassword: form.newPassword
      });
      setMsg('Đặt lại mật khẩu thành công! Chuyển hướng về trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errorData = err.response?.data;
      setError(typeof errorData === 'string' ? errorData : (errorData?.message || 'Có lỗi xảy ra, vui lòng thử lại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <Link to="/" className="brand">✦ LUXE<span>.</span></Link>
        
        <div className="login-box">
          <h2>Đặt Lại Mật Khẩu</h2>
          <p>Nhập mã OTP vừa nhận được và mật khẩu mới của bạn.</p>
          
          {error && <div className="error-msg">{error}</div>}
          {msg && <div className="success-msg" style={{ color: '#4caf50', marginBottom: '1rem', background: 'rgba(76, 175, 80, 0.1)', padding: '0.8rem', borderRadius: '8px' }}>{msg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Mã OTP</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="6 chữ số"
                maxLength="6"
                value={form.otp}
                onChange={e => setForm({...form, otp: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Mật Khẩu Mới</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={form.newPassword}
                onChange={e => setForm({...form, newPassword: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Xác Nhận Mật Khẩu</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
              />
            </div>
            
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang Xử Lý...' : 'ĐỔI MẬT KHẨU'}
            </button>
          </form>
        </div>
      </div>
      <div className="login-right"></div>
    </div>
  );
}
