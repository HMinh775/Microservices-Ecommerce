import { orderStatusBadge } from '../../../utils/constants';

export default function OrdersPage({ loading, orders = [], search, onView, onDelete }) {
  // Xử lý an toàn với dữ liệu
  const safeOrders = Array.isArray(orders) ? orders : [];
  
  const filtered = safeOrders.filter(o =>
    String(o.id).includes(search) ||
    (o.userName || o.userId || '').toString().toLowerCase().includes(search.toLowerCase()) ||
    (o.shippingAddress || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = safeOrders
    .filter(o => o.status === 'DELIVERED')
    .reduce((s, o) => s + (o.totalAmount || 0), 0);

  const pending   = safeOrders.filter(o => o.status === 'PENDING').length;
  const shipping  = safeOrders.filter(o => o.status === 'SHIPPING').length;

  return (
    <>
      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <span className="stat-label">Tổng đơn hàng</span>
          <span className="stat-value gold">{safeOrders.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Chờ xác nhận</span>
          <span className="stat-value orange">{pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Đang giao</span>
          <span className="stat-value purple">{shipping}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Doanh thu giao</span>
          <span className="stat-value green">${totalRevenue.toLocaleString()}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">Danh Sách Đơn Hàng</span>
          <span className="table-count">{filtered.length} đơn hàng</span>
        </div>
         <table>
          <thead>
             <tr>
              <th>Mã ĐH</th>
              <th>Khách Hàng</th>
              <th>Địa Chỉ Giao</th>
              <th>Ngày Đặt</th>
              <th>Tổng Tiền</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
             </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan={7}><span className="spinner" />Đang tải dữ liệu...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📦</div>
                    Không tìm thấy đơn hàng
                  </div>
                </td>
              </tr>
            ) : filtered.map(o => {
              const badge = orderStatusBadge(o.status);
              return (
                <tr key={o.id}>
                  <td><span style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace' }}>#{o.id}</span></td>
                  <td><span style={{ fontWeight: 600 }}>{o.userName || o.userId || '—'}</span></td>
                  <td><span style={{ color: 'var(--muted)', fontSize: 13 }}>{o.shippingAddress || '—'}</span></td>
                  <td><span style={{ color: 'var(--muted)', fontSize: 13 }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '—'}</span></td>
                  <td><span style={{ fontWeight: 700, color: 'var(--accent)' }}>${(o.totalAmount || 0).toLocaleString()}</span></td>
                  <td><span className={badge.className}>{badge.label}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-view" onClick={() => onView(o)}>🔍 Xem</button>
                      <button className="btn-del"  onClick={() => onDelete({ type: 'order', id: o.id, name: `#${o.id}` })}>🗑️ Xóa</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}