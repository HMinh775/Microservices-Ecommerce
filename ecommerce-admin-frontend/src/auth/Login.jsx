import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

import './Login.css';

const API_GATEWAY = "http://localhost:8900";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', userPassword: '' });
  const [error, setError] = useState('');
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
      navigate('/');
    } catch (err) {
      if (err.response?.status === 401) setError('Tài khoản hoặc mật khẩu không chính xác');
      else if (err.response?.status === 403) setError('Tài khoản của bạn đã bị khóa');
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
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="••••••••"
                  value={form.userPassword}
                  onChange={e => setForm({...form, userPassword: e.target.value})}
                />
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
