export default function ProductsPage({ loading, products = [], search, onEdit, onDelete }) {
  // Xử lý an toàn với dữ liệu
  const safeProducts = Array.isArray(products) ? products : [];
  
  const totalStock = safeProducts.reduce((s, p) => {
    const variants = p.variants;
    if (Array.isArray(variants)) {
      return s + variants.reduce((a, v) => a + (v.stockQuantity || 0), 0);
    }
    return s;
  }, 0);
  
  const totalVariants = safeProducts.reduce((s, p) => {
    const variants = p.variants;
    return s + (Array.isArray(variants) ? variants.length : 0);
  }, 0);

  const filtered = safeProducts.filter(p =>
    (p.productName?.toLowerCase().includes(search.toLowerCase()) || false) ||
    (p.brand?.toLowerCase().includes(search.toLowerCase()) || false)
  );

  const outOfStockCount = safeProducts.filter(p => {
    const variants = p.variants;
    if (!Array.isArray(variants)) return true;
    const total = variants.reduce((a, v) => a + (v.stockQuantity || 0), 0);
    return total === 0;
  }).length;

  return (
    <>
      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <span className="stat-label">Tổng sản phẩm</span>
          <span className="stat-value gold">{safeProducts.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tổng biến thể</span>
          <span className="stat-value blue">{totalVariants}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tổng kho</span>
          <span className="stat-value green">{totalStock.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Hết hàng</span>
          <span className="stat-value red">{outOfStockCount}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div className="table-card-header">
          <span className="table-card-title">Kho Hàng Thời Trang</span>
          <span className="table-count">{filtered.length} sản phẩm · {totalVariants} biến thể</span>
        </div>
         <table>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Sản Phẩm</th>
              <th>Danh Mục</th>
              <th>Biến Thể</th>
              <th>Tổng Kho</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="loading-row">
                <td colSpan={6}><span className="spinner" />Đang tải dữ liệu...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">👗</div>
                    Không tìm thấy sản phẩm
                  </div>
                </td>
              </tr>
            ) : filtered.map(p => {
              const variants = Array.isArray(p.variants) ? p.variants : [];
              const totalQ = variants.reduce((a, v) => a + (v.stockQuantity || 0), 0);
              return (
                <tr key={p.id}>
                  <td>
                    <img
                      className="prod-img"
                      src={p.image
                        ? `http://localhost:8810/products/images/${p.image}`
                        : 'https://via.placeholder.com/54x68?text=—'}
                      alt={p.productName || 'Product'}
                      onError={e => { e.target.src = 'https://via.placeholder.com/54x68?text=—'; }}
                    />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{p.productName || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent)' }}>{p.brand || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.material || '—'}</div>
                  </td>
                  <td><span className="badge badge-blue">{p.category || '—'}</span></td>
                  <td>
                    {variants.length > 0 ? variants.map((v, i) => (
                      <span key={i} className="variant-pill">
                        {v.size || '?'} · {v.color || '?'} · <span className="variant-price">${v.price || 0}</span>
                      </span>
                    )) : <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    <span style={{ fontSize: 18, fontWeight: 700, color: totalQ > 0 ? 'var(--green)' : 'var(--red)' }}>
                      {totalQ}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 4 }}>cái</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-edit" onClick={() => onEdit(p)}>✏️ Sửa</button>
                      <button className="btn-del" onClick={() => onDelete({ type: 'product', id: p.id, name: p.productName || `Product ${p.id}` })}>🗑️ Xóa</button>
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