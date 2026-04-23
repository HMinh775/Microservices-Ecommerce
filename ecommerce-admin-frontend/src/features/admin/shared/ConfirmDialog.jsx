import React from 'react';

export default function ConfirmDialog({ name, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-confirm animate-pop">
        <div className="modal-confirm-icon">
          <div className="icon-pulse"></div>
          <span>⚠️</span>
        </div>
        <div className="modal-header center">
          <h3>Xác nhận xóa</h3>
        </div>
        <div className="modal-body center">
          <p className="confirm-text">Bạn có chắc muốn xóa <strong>"{name}"</strong>?</p>
          <p className="confirm-subtext">Hành động này sẽ xóa dữ liệu vĩnh viễn và không thể hoàn tác.</p>
        </div>
        <div className="modal-footer-confirm">
          <button className="btn-confirm-cancel" onClick={onCancel}>Để tôi xem lại</button>
          <button className="btn-confirm-delete" onClick={onConfirm}>Xác nhận xóa</button>
        </div>
      </div>
    </div>
  );
}