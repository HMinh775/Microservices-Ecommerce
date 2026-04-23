import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

import './Login.css';

const API_GATEWAY = "http://localhost:8900";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', userPassword: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName || !form.userPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_GATEWAY}/user-service/users/login`, form);
      const user = res.data;
      localStorage.setItem('user', JSON.stringify(user));
      window.location.href = '/';
    } catch (err) {
      if (err.response?.status === 401) setError('Tài khoản hoặc mật khẩu không chính xác');
      else if (err.response?.status === 403) setError('Tài khoản của bạn đã bị khóa');
      else if (err.response?.status === 400) {
        // Hiển thị lỗi validation từ backend (ví dụ: mật khẩu quá ngắn)
        const msg = err.response.data?.message || err.response.data || 'Dữ liệu không hợp lệ';
        setError(typeof msg === 'object' ? 'Vui lòng kiểm tra lại thông tin' : msg);
      }
      else setError('Có lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-page">
        <div className="login-left">
          <Link to="/" className="brand">✦ LUXE<span>.</span></Link>
          
          <div className="login-box">
            <h2>Đăng Nhập</h2>
            <p>Nhập thông tin truy cập cửa hàng Luxe.</p>
            
            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tài Khoản</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="admin..."
                  value={form.userName}
                  onChange={e => setForm({...form, userName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Mật Khẩu</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-input" 
                    placeholder="••••••••"
                    value={form.userPassword}
                    onChange={e => setForm({...form, userPassword: e.target.value})}
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Đang Xử Lý...' : 'ĐĂNG NHẬP'}
              </button>
            </form>
            
            <div className="login-footer">
              <Link to="/forgot-password" style={{ display: 'block', marginBottom: '10px', color: '#666', fontSize: '0.9rem' }}>
                Quên mật khẩu?
              </Link>
              Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </div>
          </div>
        </div>
        <div className="login-right"></div>
      </div>
    </>
  );
}
