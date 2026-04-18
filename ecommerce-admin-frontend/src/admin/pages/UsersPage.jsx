export default function UsersPage({ loading, users = [], products = [], search, onEdit, onDelete }) {
  // Xử lý an toàn với dữ liệu
  const safeUsers = Array.isArray(users) ? users : [];
  const safeProducts = Array.isArray(products) ? products : [];
  
  const activeUsers = safeUsers.filter(u => u.active === 1 || u.active === true).length;
  const totalStock = safeProducts.reduce((s, p) => {
    const variants = p.variants;
    if (Array.isArray(variants)) {
      return s + variants.reduce((a, v) => a + (v.stockQuantity || 0), 0);
    }
    return s;
  }, 0);

  const filtered = safeUsers.filter(u =>
    u.userName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <span className="stat-label">Tổng khách hàng</span>
          <span className="stat-value gold">{safeUsers.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Đang hoạt động</span>
          <span className="stat-value green">{activeUsers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tổng sản phẩm</span>
          <span className="stat-value blue">{safeProducts.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tổng kho hàng</span>
          <span className="stat-value gold">{totalStock.toLocaleString()}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">Danh Sách Khách Hàng</span>
          <span className="table-count">{filtered.length} người dùng</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tài Khoản</th>
              <th>Email</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan={5}><span className="spinner" />Đang tải dữ liệu...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon">👤</div>
                    Không tìm thấy người dùng
                  </div>
                </td>
              </tr>
            ) : filtered.map(u => (
              <tr key={u.id}>
                <td><span style={{ color: 'var(--muted)', fontSize: 12 }}>#{u.id}</span></td>
                <td><span style={{ fontWeight: 600 }}>{u.userName || u.username || '—'}</span></td>
                <td><span style={{ color: 'var(--muted)' }}>{u.userDetails?.email || u.email || '—'}</span></td>
                <td>
                  <span className={`badge ${(u.active === 1 || u.active === true) ? 'badge-green' : 'badge-red'}`}>
                    {(u.active === 1 || u.active === true) ? '● Hoạt động' : '● Bị khóa'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="btn-edit" onClick={() => onEdit(u)}>✏️ Sửa</button>
                    <button className="btn-del" onClick={() => onDelete({ type: 'user', id: u.id, name: u.userName || u.username || `User ${u.id}` })}>🗑️ Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}