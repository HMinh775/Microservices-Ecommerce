import { paymentStatusBadge, paymentMethodBadge } from '../../utils/constants';

export default function PaymentsPage({ loading, payments = [], search, onView }) {
  // Xử lý an toàn với dữ liệu
  const safePayments = Array.isArray(payments) ? payments : [];
  
  const filtered = safePayments.filter(p =>
    String(p.id).includes(search) ||
    String(p.orderId || '').includes(search) ||
    (p.transactionId || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalSuccess = safePayments
    .filter(p => p.status === 'SUCCESS')
    .reduce((s, p) => s + (p.amount || 0), 0);
  
  const countSuccess = safePayments.filter(p => p.status === 'SUCCESS').length;
  const countFailed  = safePayments.filter(p => p.status === 'FAILED').length;
  const countPending = safePayments.filter(p => p.status === 'PENDING').length;

  return (
    <>
      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <span className="stat-label">Tổng giao dịch</span>
          <span className="stat-value gold">{safePayments.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Thành công</span>
          <span className="stat-value green">{countSuccess}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Chờ xử lý</span>
          <span className="stat-value orange">{countPending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tổng thu</span>
          <span className="stat-value blue">${totalSuccess.toLocaleString()}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">Lịch Sử Thanh Toán</span>
          <span className="table-count">{filtered.length} giao dịch · {countFailed} thất bại</span>
        </div>
         <table>
          <thead>
            <tr>
              <th>Mã TT</th>
              <th>Mã ĐH</th>
              <th>Số Tiền</th>
              <th>Phương Thức</th>
              <th>Mã Giao Dịch</th>
              <th>Thời Gian</th>
              <th>Trạng Thái</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan={8}><span className="spinner" />Đang tải dữ liệu...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon">💳</div>
                    Không tìm thấy giao dịch
                  </div>
                </td>
              </tr>
            ) : filtered.map(p => {
              const statusBadge = paymentStatusBadge(p.status);
              const methodBadge = paymentMethodBadge(p.paymentMethod);
              return (
                <tr key={p.id}>
                  <td><span style={{ color: 'var(--accent)', fontWeight: 700, fontFamily: 'monospace' }}>#{p.id}</span></td>
                  <td><span style={{ color: 'var(--blue)', fontFamily: 'monospace' }}>#{p.orderId || '—'}</span></td>
                  <td><span style={{ fontWeight: 700, color: 'var(--green)' }}>${(p.amount || 0).toLocaleString()}</span></td>
                  <td><span className={methodBadge.className}>{methodBadge.label}</span></td>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{p.transactionId || '—'}</span></td>
                  <td><span style={{ color: 'var(--muted)', fontSize: 13 }}>{p.createdAt ? new Date(p.createdAt).toLocaleString('vi-VN') : '—'}</span></td>
                  <td><span className={statusBadge.className}>{statusBadge.label}</span></td>
                  <td>
                    <button className="btn-view" onClick={() => onView(p)}>🔍 Xem</button>
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