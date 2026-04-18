export default function ConfirmDialog({ name, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal confirm-modal">
        <div className="modal-body">
          <div className="confirm-icon">🗑️</div>
          <p className="confirm-msg">
            Bạn có chắc muốn xóa <span className="confirm-name">"{name}"</span>?
            <br />Hành động này không thể hoàn tác.
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Hủy</button>
          <button className="btn-confirm-del" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
}