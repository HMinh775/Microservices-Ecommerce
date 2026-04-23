import React, { useState } from 'react';
import axios from 'axios';

const API_GATEWAY = "http://localhost:8900";

export default function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user ? {
    userName: user.userName || '',
    email: user.userDetails?.email || '',
    roleId: user.role?.id || 1,
    active: user.active === 1 || user.active === true
  } : { userName: '', email: '', password: '', roleId: 1, active: true });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!user?.id;

  const handleSubmit = async () => {
    if (!form.userName || form.userName.length < 3) {
      alert("Tên tài khoản phải có ít nhất 3 ký tự!");
      return;
    }
    if (!isEdit && (!form.password || form.password.length < 4)) {
      alert("Mật khẩu phải có ít nhất 4 ký tự!");
      return;
    }
    if (!form.email || !form.email.includes("@")) {
      alert("Vui lòng nhập định dạng email hợp lệ!");
      return;
    }

    const payload = {
      userName: form.userName,
      userPassword: isEdit ? user.userPassword : form.password,
      active: form.active ? 1 : 0,
      role: { id: parseInt(form.roleId) || 1 },
      userDetails: {
        id: isEdit ? user.userDetails?.id : undefined,
        firstName: isEdit ? user.userDetails?.firstName : 'Khách',
        lastName: isEdit ? user.userDetails?.lastName : 'Hàng',
        email: form.email
      }
    };

    try {
      if (isEdit) await axios.put(`${API_GATEWAY}/user-service/users/${user.id}`, payload);
      else await axios.post(`${API_GATEWAY}/user-service/users`, payload);
      onSave(isEdit ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công');
    } catch { onSave(null); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-user animate-pop">
        <div className="modal-profile-header">
          <div className="avatar-placeholder">
            {form.userName ? form.userName.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="header-info">
            <h3>{isEdit ? 'Chỉnh Sửa Hồ Sơ' : 'Tạo Thành Viên Mới'}</h3>
            <p>{isEdit ? `@${form.userName}` : 'Điền thông tin bên dưới'}</p>
          </div>
          <button className="modal-close-minimal" onClick={onClose}>×</button>
        </div>

        <div className="modal-body-elegant">
          <div className="form-section-title">THÔNG TIN CƠ BẢN</div>
          <div className="form-row">
            <div className="form-group">
              <label>Tên tài khoản</label>
              <input className="form-input-lux" placeholder="username" value={form.userName} onChange={e => set('userName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email liên hệ</label>
              <input className="form-input-lux" placeholder="email@example.com" value={form.email || ''} onChange={e => set('email', e.target.value)} />
            </div>
          </div>

          <div className="form-section-title">PHÂN QUYỀN & BẢO MẬT</div>
          <div className="form-row">
            {!isEdit && (
              <div className="form-group">
                <label>Mật khẩu khởi tạo</label>
                <input className="form-input-lux" type="password" placeholder="••••••••" value={form.password || ''} onChange={e => set('password', e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label>Quyền hạn hệ thống</label>
              <div className="custom-select-wrapper">
                <select className="form-select-lux" value={form.roleId} onChange={e => set('roleId', parseInt(e.target.value))}>
                  <option value={1}>🛒 Khách Hàng (Customer)</option>
                  <option value={2}>🛡️ Quản Trị Viên (Admin)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="status-control">
            <div className="status-info">
              <label>Trạng thái tài khoản</label>
              <p>Tài khoản hiện đang {form.active ? 'Hợp lệ' : 'Bị khóa'}</p>
            </div>
            <label className="lux-toggle">
              <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
              <span className="lux-toggle-slider" />
            </label>
          </div>
        </div>

        <div className="modal-footer-lux">
          <button className="btn-lux-secondary" onClick={onClose}>Hủy bỏ</button>
          <button className="btn-lux-primary" onClick={handleSubmit}>
            {isEdit ? 'Cập nhật hồ sơ' : 'Tạo tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}