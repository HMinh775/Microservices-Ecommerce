import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

import './Register.css';

const API_GATEWAY = "http://localhost:8900";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userName: '', userPassword: '', email: '', firstName: '', lastName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userName || !form.userPassword || !form.email) {
      setError('Vui lòng nhập đầy đủ Tài khoản, Mật khẩu và Email');
      return;
    }

    setLoading(true);
    setError('');

    // Prepare User object matching backend structure
    const payload = {
      userName: form.userName,
      userPassword: form.userPassword,
      active: 1,
      userDetails: {
        firstName: form.firstName || 'Khách',
        lastName: form.lastName || 'Hàng',
        email: form.email
      }
    };

    try {
      await axios.post(`${API_GATEWAY}/user-service/registration`, payload);
      setSuccess('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => { navigate('/login'); }, 1500);
    } catch (err) {
      setError('Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.');
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
            <h2>Tham Gia Luxe</h2>
            <p>Tạo tài khoản để trải nghiệm mua sắm tuyệt vời nhất.</p>

            {error && <div className="error-msg">{error}</div>}
            {success && <div className="success-msg">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="form-group">
                  <label>Họ</label>
                  <input type="text" className="form-input" placeholder="Nguyễn" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Tên</label>
                  <input type="text" className="form-input" placeholder="A" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" className="form-input" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Tên Tài Khoản *</label>
                <input type="text" className="form-input" placeholder="username" value={form.userName} onChange={e => setForm({ ...form, userName: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Mật Khẩu *</label>
                <input type="password" className="form-input" placeholder="••••••••" value={form.userPassword} onChange={e => setForm({ ...form, userPassword: e.target.value })} />
              </div>

              <button type="submit" className="btn-submit" disabled={loading || success}>
                {loading ? 'Đang Xử Lý...' : 'ĐĂNG KÝ'}
              </button>
            </form>

            <div className="login-footer">
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </div>
          </div>
        </div>
        <div className="login-right"></div>
      </div>
    </>
  );
}
