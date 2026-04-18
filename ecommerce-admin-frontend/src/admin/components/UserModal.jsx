import { useState } from 'react';
import axios from 'axios';
import { API_GATEWAY } from '../../utils/constants';
import './UserModal.css';

export default function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(() => {
    if (user?.id) {
      return {
        ...user,
        email: user.userDetails?.email || user.email || '',
        active: user.active === 1 || user.active === true,
      };
    }
    return { userName: '', email: '', password: '', active: true };
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!user?.id;

  const handleSubmit = async () => {
    const payload = {
      ...form,
      active: form.active ? 1 : 0,
      userDetails: { email: form.email },
    };

    try {
      if (isEdit) {
        await axios.put(`${API_GATEWAY}/user-service/users/${user.id}`, payload);
      } else {
        await axios.post(`${API_GATEWAY}/user-service/users`, payload);
      }
      onSave(isEdit ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công');
    } catch (error) {
      console.error('Lỗi gửi dữ liệu:', error.response?.data);
      onSave(null);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Tên tài khoản</label>
              <input
                className="form-input"
                placeholder="username..."
                value={form.userName}
                onChange={e => set('userName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                className="form-input"
                placeholder="email@..."
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>
          </div>

          {!isEdit && (
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password || ''}
                onChange={e => set('password', e.target.value)}
              />
            </div>
          )}

          <div className="toggle-container">
            <label className="toggle-label">Trạng thái hoạt động</label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => set('active', e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
            <span className={`toggle-status ${form.active ? 'status-active' : 'status-locked'}`}>
              {form.active ? 'Hoạt động' : 'Bị khóa'}
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={handleSubmit}>💾 Lưu</button>
        </div>
      </div>
    </div>
  );
}