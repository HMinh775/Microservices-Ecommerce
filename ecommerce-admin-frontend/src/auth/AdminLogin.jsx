import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './AdminLogin.css';

const API_GATEWAY = "http://localhost:8900";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: '', userPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName || !form.userPassword) {
      setError('Vui lòng nhập tài khoản quản trị');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_GATEWAY}/user-service/users/login`, form);
      const user = res.data;
      
      const isAdmin = user.role && (user.role.roleName === 'ROLE_ADMIN' || user.role.id === 2);
      
      if (isAdmin) {
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/admin');
      } else {
        setError('Tài khoản này không có quyền truy cập quản trị!');
      }
    } catch (err) {
      if (err.response?.status === 401) setError('Tài khoản hoặc mật khẩu không chính xác');
      else setError('Lỗi kết nối máy chủ quản trị');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <Link to="/" className="admin-logo">LUXE<span>✦</span></Link>
        <div className="admin-subtitle">Hệ Thống Quản Trị</div>
        
        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label>Tài Khoản</label>
            <input 
              type="text" 
              className="admin-input" 
              placeholder="Username"
              value={form.userName}
              onChange={e => setForm({...form, userName: e.target.value})}
            />
          </div>
          <div className="admin-form-group">
            <label>Mật Khẩu</label>
            <input 
              type="password" 
              className="admin-input" 
              placeholder="••••••••"
              value={form.userPassword}
              onChange={e => setForm({...form, userPassword: e.target.value})}
            />
          </div>
          <button type="submit" className="admin-btn-login" disabled={loading}>
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
          </button>
        </form>
        
        <Link to="/" className="admin-back-link">
          ← Quay lại cửa hàng
        </Link>
      </div>
    </div>
  );
}
