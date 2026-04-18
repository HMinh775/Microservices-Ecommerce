import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PaymentDetailModal from './components/PaymentDetailModal';
import OrderDetailModal from './components/OrderDetailModal';

import './AdminDashboard.css'; // CSS mới

const API_GATEWAY = "http://localhost:8900";
const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='54' height='68'%3E%3Crect width='54' height='68' fill='%23242429'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%237a7a8a' font-family='sans-serif' font-size='14'%3E%E2%80%94%3C/text%3E%3C/svg%3E";

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  return <div className="toast"><span className="toast-icon">{icon}</span>{message}</div>;
}

// ─── CONFIRM DIALOG ──────────────────────────────────────────────────────────
function ConfirmDialog({ name, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal confirm-modal">
        <div className="modal-body">
          <div className="confirm-icon">🗑️</div>
          <p className="confirm-msg">Bạn có chắc muốn xóa <span className="confirm-name">"{name}"</span>?<br />Hành động này không thể hoàn tác.</p>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onCancel}>Hủy</button>
          <button className="btn-confirm-del" onClick={onConfirm}>Xóa</button>
        </div>
      </div>
    </div>
  );
}

// ─── USER MODAL ───────────────────────────────────────────────────────────────
function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user ? {
    userName: user.userName || '',
    email: user.userDetails?.email || '',
    roleId: user.role?.id || 1,
    active: user.active === 1 || user.active === true
  } : { userName: '', email: '', password: '', roleId: 1, active: true });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!user?.id;

  const handleSubmit = async () => {
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
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Tên tài khoản</label>
              <input className="form-input" placeholder="username..." value={form.userName} onChange={e => set('userName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" placeholder="email@..." value={form.email || ''} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            {!isEdit && (
              <div className="form-group">
                <label>Mật khẩu</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.password || ''} onChange={e => set('password', e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label>Quyền hạn (Role)</label>
              <select className="form-input" value={form.roleId} onChange={e => set('roleId', parseInt(e.target.value))}>
                <option value={1}>Khách Hàng</option>
                <option value={2}>Quản Trị Viên (Admin)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ margin: 0 }}>Trạng thái hoạt động</label>
            <label className="toggle">
              <input type="checkbox" checked={form.active} onChange={e => set('active', e.target.checked)} />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontSize: 13, color: form.active ? 'var(--success)' : 'var(--danger)' }}>
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

// ─── PRODUCT MODAL ────────────────────────────────────────────────────────────
const emptyVariant = () => ({ size: '', color: '', price: '', stockQuantity: '' });

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState(product || {
    productName: '', brand: '', material: '', category: '', imageUrl: '', variants: []
  });
  const [variants, setVariants] = useState(product?.variants || []);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isEdit = !!product?.id;

  const addVariant = () => setVariants(v => [...v, emptyVariant()]);
  const delVariant = i => setVariants(v => v.filter((_, idx) => idx !== i));
  const setVariant = (i, k, v) => setVariants(vs => vs.map((row, idx) => idx === i ? { ...row, [k]: v } : row));

  const handleSubmit = async () => {
    const formData = new FormData();
    if (form.imageFile) {
      formData.append('image', form.imageFile);
    }
    const productData = {
      productName: form.productName,
      brand: form.brand,
      material: form.material,
      category: form.category,
      description: form.description || '',
      variants: variants.map(v => ({
        ...v, price: parseFloat(v.price) || 0, stockQuantity: parseInt(v.stockQuantity) || 0
      }))
    };
    formData.append('product', JSON.stringify(productData));
    try {
      if (isEdit) {
        await axios.post(`${API_GATEWAY}/product-catalog-service/products/${product.id}`, formData);
      } else {
        await axios.post(`${API_GATEWAY}/product-catalog-service/products`, formData);
      }
      onSave(isEdit ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công');
    } catch { onSave(null); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wide">
        <div className="modal-header">
          <h3>{isEdit ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label>Tên sản phẩm</label>
              <input className="form-input" placeholder="Áo thun oversize..." value={form.productName} onChange={e => set('productName', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Thương hiệu</label>
              <input className="form-input" placeholder="Nike, Zara..." value={form.brand || ''} onChange={e => set('brand', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Chất liệu</label>
              <input className="form-input" placeholder="Cotton, Polyester..." value={form.material || ''} onChange={e => set('material', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Danh mục</label>
              <select className="form-select" value={form.category || ''} onChange={e => set('category', e.target.value)}>
                <option value="">-- Chọn --</option>
                {['Áo', 'Quần', 'Váy', 'Phụ kiện', 'Giày dép', 'Túi xách', 'Đồ thể thao'].map(c =>
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Hình ảnh sản phẩm</label>
            <input
              type="file"
              className="form-input"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0];
                if (file) set('imageFile', file);
              }}
            />
            {form.imageFile && (
              <div style={{ marginTop: 10 }}>
                <img src={URL.createObjectURL(form.imageFile)} alt="Preview" style={{ width: 100, borderRadius: 8, border: '1px solid var(--border-subtle)' }} />
              </div>
            )}
          </div>

          <div className="variant-editor">
            <div className="variant-editor-title">
              <span>🏷️ Biến thể (Size / Màu / Giá / Kho)</span>
              <button className="btn-add-variant" style={{ width: 'auto', padding: '4px 12px' }} onClick={addVariant}>+ Thêm</button>
            </div>
            {variants.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '8px 0' }}>Chưa có biến thể nào.</p>}
            {variants.map((v, i) => (
              <div className="variant-row" key={i}>
                <input className="variant-input" placeholder="Size" value={v.size} onChange={e => setVariant(i, 'size', e.target.value)} />
                <input className="variant-input" placeholder="Màu" value={v.color} onChange={e => setVariant(i, 'color', e.target.value)} />
                <input className="variant-input" placeholder="Giá ($)" type="number" value={v.price} onChange={e => setVariant(i, 'price', e.target.value)} />
                <input className="variant-input" placeholder="Kho" type="number" value={v.stockQuantity} onChange={e => setVariant(i, 'stockQuantity', e.target.value)} />
                <button className="btn-del-variant" onClick={() => delVariant(i)}>×</button>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Hủy</button>
          <button className="btn-save" onClick={handleSubmit}>💾 Lưu Sản Phẩm</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const orderStatusMap = { PENDING: '⏳ Chờ xử lý', PAID: '💳 Đã thanh toán', CONFIRMED: '✅ Đã xác nhận', SHIPPING: '🚚 Đang giao', DELIVERING: '🚚 Đang giao', DELIVERED: '📦 Đã giao', COMPLETED: '✅ Hoàn thành', CANCELLED: '❌ Đã hủy' };
const paymentStatusMap = { PENDING: '⏳ Chờ TT', SUCCESS: '✅ Thành công', FAILED: '❌ Thất bại', REFUNDED: '↩️ Hoàn tiền' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const [userModal, setUserModal] = useState(null);
  const [prodModal, setProdModal] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirm, setConfirm] = useState(null);
  
  // PAGINATION STATE
  const [userPage, setUserPage] = useState(0);
  const [prodPage, setProdPage] = useState(0);
  const [orderPage, setOrderPage] = useState(0);
  const [payPage, setPayPage] = useState(0);

  const [totalUserPages, setTotalUserPages] = useState(0);
  const [totalProdPages, setTotalProdPages] = useState(0);
  const [totalOrderPages, setTotalOrderPages] = useState(0);
  const [totalPayPages, setTotalPayPages] = useState(0);

  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalProdsCount, setTotalProdsCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);
  const [totalPaymentsCount, setTotalPaymentsCount] = useState(0);

  const PAGE_SIZE = 10;

  const showToast = (msg, type = 'success') => setToast({ msg, type });

  const fetchUsers = async (p = userPage) => {
    try {
      const res = await axios.get(`${API_GATEWAY}/user-service/users?page=${p}&size=${PAGE_SIZE}`);
      const data = res.data;
      if (data.content) {
        setUsers(data.content);
        setTotalUserPages(data.totalPages || 0);
        setTotalUsersCount(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setUsers(data);
        setTotalUsersCount(data.length);
        setTotalUserPages(Math.ceil(data.length / PAGE_SIZE));
      }
    } catch { showToast('Không thể tải dữ liệu Khách hàng', 'error'); }
  };

  const fetchProducts = async (p = prodPage) => {
    try {
      const res = await axios.get(`${API_GATEWAY}/product-catalog-service/products?page=${p}&size=${PAGE_SIZE}`);
      const data = res.data;
      if (data.content) {
        setProducts(data.content);
        setTotalProdPages(data.totalPages || 0);
        setTotalProdsCount(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalProdsCount(data.length);
        setTotalProdPages(Math.ceil(data.length / PAGE_SIZE));
      }
    } catch { showToast('Không thể tải dữ liệu Sản phẩm', 'error'); }
  };

  const fetchOrders = async (p = orderPage) => {
    try {
      const res = await axios.get(`${API_GATEWAY}/order-service/orders?page=${p}&size=${PAGE_SIZE}`);
      const data = res.data;
      if (data.content) {
        setOrders(data.content);
        setTotalOrderPages(data.totalPages || 0);
        setTotalOrdersCount(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setOrders(data);
        setTotalOrdersCount(data.length);
        setTotalOrderPages(Math.ceil(data.length / PAGE_SIZE));
      }
    } catch { showToast('Không thể tải dữ liệu Đơn hàng', 'error'); }
  };

  const fetchPayments = async (p = payPage) => {
    try {
      const res = await axios.get(`${API_GATEWAY}/payment-service/payments?page=${p}&size=${PAGE_SIZE}`);
      const data = res.data;
      if (data.content) {
        setPayments(data.content);
        setTotalPayPages(data.totalPages || 0);
        setTotalPaymentsCount(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setPayments(data);
        setTotalPaymentsCount(data.length);
        setTotalPayPages(Math.ceil(data.length / PAGE_SIZE));
      }
    } catch { showToast('Không thể tải dữ liệu Thanh toán', 'error'); }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchUsers(0),
      fetchProducts(0),
      fetchOrders(0),
      fetchPayments(0)
    ]);
    setLoading(false);
  };

  useEffect(() => {
    if (tab === 'users') fetchUsers(userPage);
    if (tab === 'products') fetchProducts(prodPage);
    if (tab === 'orders') fetchOrders(orderPage);
    if (tab === 'payments') fetchPayments(payPage);
  }, [tab, userPage, prodPage, orderPage, payPage]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }
    const user = JSON.parse(userStr);
    if (!user.role || (user.role.roleName !== 'ROLE_ADMIN' && user.role.id !== 2)) {
      navigate('/');
      return;
    }
    fetchData();
  }, [navigate]);

  const renderPaginationControls = (currentPage, totalPages, setPage) => {
    if (totalPages <= 1) return null;
    return (
      <div className="pagination-controls">
        <button className="pagination-btn" onClick={() => currentPage > 0 && setPage(currentPage - 1)} disabled={currentPage === 0}>
          ← Trước
        </button>
        {Array.from({ length: totalPages }, (_, i) => i).map(page => (
          <button key={page} className={`pagination-btn ${page === currentPage ? 'active' : ''}`} onClick={() => setPage(page)}>
            {page + 1}
          </button>
        ))}
        <button className="pagination-btn" onClick={() => currentPage < totalPages - 1 && setPage(currentPage + 1)} disabled={currentPage === totalPages - 1}>
          Sau →
        </button>
      </div>
    );
  };

  const handleDelete = async () => {
    const { type, id } = confirm;
    try {
      if (type === 'user') await axios.delete(`${API_GATEWAY}/user-service/users/${id}`);
      else await axios.delete(`${API_GATEWAY}/product-catalog-service/products/${id}`);
      showToast('Xóa thành công');
      fetchData();
    } catch { showToast('Xóa thất bại', 'error'); }
    setConfirm(null);
  };

  const handleSaved = (msg, type = 'success') => {
    if (msg) { showToast(msg); fetchData(); }
    else showToast('Có lỗi xảy ra', 'error');
    setUserModal(null); setProdModal(null);
  };

  const totalVariants = products.reduce((s, p) => s + (p.variants?.length || 0), 0);

  return (
    <div className="admin-scope">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>✦ LUXE</h2>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${tab === 'users' ? 'active' : ''}`} onClick={() => { setTab('users'); setSearch(''); }}>
            <span className="nav-icon">👤</span> <span>Khách Hàng</span>
          </button>
          <button className={`nav-item ${tab === 'products' ? 'active' : ''}`} onClick={() => { setTab('products'); setSearch(''); }}>
            <span className="nav-icon">👗</span> <span>Sản Phẩm</span>
          </button>
          <button className={`nav-item ${tab === 'orders' ? 'active' : ''}`} onClick={() => { setTab('orders'); setSearch(''); }}>
            <span className="nav-icon">📦</span> <span>Đơn Hàng</span>
          </button>
          <button className={`nav-item ${tab === 'payments' ? 'active' : ''}`} onClick={() => { setTab('payments'); setSearch(''); }}>
            <span className="nav-icon">💳</span> <span>Thanh Toán</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <span className="status-dot" />
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            {tab === 'users' && <>Quản lý <span>Khách Hàng</span></>}
            {tab === 'products' && <>Quản lý <span>Sản Phẩm</span></>}
            {tab === 'orders' && <>Quản lý <span>Đơn Hàng</span></>}
            {tab === 'payments' && <>Quản lý <span>Thanh Toán</span></>}
          </div>
          <div className="topbar-actions">
            <div className="actions-row">
              <input className="search-bar" placeholder="Tìm kiếm nhanh..." value={search} onChange={e => setSearch(e.target.value)} />
              <button className="add-btn" onClick={() => tab === 'users' ? setUserModal({}) : setProdModal({})}>
                + Thêm {tab === 'users' ? 'Người Dùng' : 'Sản Phẩm'}
              </button>
            </div>
            <div className="actions-row">
              <button className="refresh-btn" style={{ background: 'transparent', border: 'none', color: 'var(--lux-text-dim)', cursor: 'pointer', fontSize: 13 }} onClick={fetchData}>↻ Đồng bộ Dữ liệu</button>
              <button className="btn-del" style={{ fontWeight: 600 }} onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>Đăng Xuất</button>
            </div>
          </div>
        </header>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-label">Khách Hàng</span>
            <span className="stat-value gold">{totalUsersCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Sản Phẩm</span>
            <span className="stat-value blue">{totalProdsCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Đơn Hàng</span>
            <span className="stat-value green">{totalOrdersCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Thanh Toán</span>
            <span className="stat-value gold">{totalPaymentsCount}</span>
          </div>
        </section>

        {tab === 'users' && (
          <div className="table-card">
            <div className="table-card-header">
              <span style={{ fontSize: 18, fontWeight: 700 }}>Hồ Sơ Khách Hàng</span>
              <span style={{ color: 'var(--lux-text-dim)', fontSize: 12 }}>Tổng cộng {totalUsersCount} thành viên</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Định danh</th>
                  <th>Tài khoản</th>
                  <th>Địa chỉ Email</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row"><td colSpan={5}>Đang tải danh sách...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--lux-text-dim)' }}>Không tìm thấy dữ liệu</td></tr>
                ) : users.map(u => (
                  <tr key={u.id}>
                    <td><span style={{ color: 'var(--lux-text-dim)', fontSize: 12 }}>ID_{u.id}</span></td>
                    <td><span style={{ fontWeight: 600 }}>{u.userName}</span></td>
                    <td><span style={{ color: 'var(--lux-text-dim)' }}>{u.userDetails?.email || '—'}</span></td>
                    <td><span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>{u.active ? 'hoạt động' : 'ĐÃ KHÓA'}</span></td>
                    <td><div style={{ display: 'flex', gap: 10 }}><button className="add-btn" style={{ padding: '6px 14px', fontSize: 11, background: '#f3f4f6', color: '#1a1a1c', border: '1px solid #e5e7eb' }} onClick={() => setUserModal(u)}>Chỉnh sửa</button><button className="btn-del" onClick={() => setConfirm({ type: 'user', id: u.id, name: u.userName })}>Xóa</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPaginationControls(userPage, totalUserPages, setUserPage)}
          </div>
        )}

        {tab === 'products' && (
          <div className="table-card">
            <div className="table-card-header">
              <span style={{ fontSize: 18, fontWeight: 700 }}>Danh Mục Kho Hàng</span>
              <span style={{ color: 'var(--lux-text-dim)', fontSize: 12 }}>Đang niêm yết {totalProdsCount} sản phẩm</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Thông tin cơ bản</th>
                  <th>Phân loại</th>
                  <th>Biến thể</th>
                  <th>Tồn kho</th>
                  <th>Quản lý</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row"><td colSpan={6}>Đang truy xuất kho...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--lux-text-dim)' }}>Danh mục trống</td></tr>
                ) : products.map(p => {
                  const totalQ = p.variants?.reduce((a, v) => a + v.stockQuantity, 0) || 0;
                  return (
                    <tr key={p.id}>
                      <td><img style={{ width: 40, height: 50, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' }} src={p.image ? `${API_GATEWAY}/product-catalog-service/products/images/${p.image}` : fallbackImg} alt={p.productName} onError={e => { e.target.src = fallbackImg; }} /></td>
                      <td><div style={{ fontWeight: 600 }}>{p.productName}</div><div style={{ fontSize: 11, color: '#b8860b' }}>{p.brand}</div></td>
                      <td><span className="badge badge-gray">{p.category || 'N/A'}</span></td>
                      <td><div style={{ fontSize: 11, color: 'var(--lux-text-dim)' }}>{p.variants?.length || 0} cấu hình</div></td>
                      <td><span style={{ fontWeight: 700, color: totalQ > 0 ? '#10b981' : '#ef4444' }}>{totalQ}</span> chiếc</td>
                      <td><div style={{ display: 'flex', gap: 10 }}><button className="add-btn" style={{ padding: '6px 14px', fontSize: 11, background: '#f3f4f6', color: '#1a1a1c', border: '1px solid #e5e7eb' }} onClick={() => setProdModal(p)}>Sửa</button><button className="btn-del" onClick={() => setConfirm({ type: 'product', id: p.id, name: p.productName })}>Xóa</button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {renderPaginationControls(prodPage, totalProdPages, setProdPage)}
          </div>
        )}

        {tab === 'orders' && (
          <div className="table-card">
            <div className="table-card-header">
              <span style={{ fontSize: 18, fontWeight: 700 }}>Luồng Đơn Hàng</span>
              <span style={{ color: 'var(--lux-text-dim)', fontSize: 12 }}>{totalOrdersCount} sự kiện mới</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Mã tham chiếu</th>
                  <th>Khách hàng</th>
                  <th>Trạng thái hiện tại</th>
                  <th>Giá trị đơn</th>
                  <th>Thời gian đặt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row"><td colSpan={6}>Đang đồng bộ đơn hàng...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--lux-text-dim)' }}>Không có đơn hàng nào</td></tr>
                ) : orders.map(o => {
                  const orderUser = users.find(u => u.id === o.userId);
                  return (
                    <tr key={o.id}>
                      <td><span style={{ fontWeight: 600 }}>REF_{o.id}</span></td>
                      <td>{orderUser ? orderUser.userName : `ID_${o.userId}`}</td>
                      <td><span className="badge badge-gray">{orderStatusMap[o.status?.toUpperCase()] || o.status || 'Chưa rõ'}</span></td>
                      <td><span style={{ fontWeight: 700, color: '#b8860b' }}>{o.totalAmount?.toLocaleString()} ₫</span></td>
                      <td><span style={{ color: 'var(--lux-text-dim)', fontSize: 12 }}>{new Date(o.orderedDate).toLocaleDateString('vi-VN')}</span></td>
                      <td><button className="add-btn" style={{ padding: '6px 14px', fontSize: 11, background: '#f3f4f6', color: '#1a1a1c', border: '1px solid #e5e7eb' }} onClick={() => setSelectedOrder(o)}>Xem chi tiết</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {renderPaginationControls(orderPage, totalOrderPages, setOrderPage)}
          </div>
        )}

        {tab === 'payments' && (
          <div className="table-card">
            <div className="table-card-header">
              <span style={{ fontSize: 18, fontWeight: 700 }}>Sổ Cái Tài Chính</span>
              <span style={{ color: 'var(--lux-text-dim)', fontSize: 12 }}>{totalPaymentsCount} giao dịch đã xác thực</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Mã giao dịch</th>
                  <th>Đơn hàng</th>
                  <th>Kênh thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Số tiền</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row"><td colSpan={7}>Đang đọc sổ cái...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--lux-text-dim)' }}>Chưa có lịch sử giao dịch</td></tr>
                ) : payments.map(p => {
                  return (
                    <tr key={p.id}>
                      <td><span style={{ fontWeight: 600 }}>TRX_{p.id}</span></td>
                      <td>ORD_{p.orderId}</td>
                      <td><span className="badge badge-blue">{p.paymentMethod || 'N/A'}</span></td>
                      <td><span className={`badge ${p.status?.toUpperCase() === 'SUCCESS' ? 'badge-green' : 'badge-red'}`}>{paymentStatusMap[p.status?.toUpperCase()] || p.status || 'Chưa rõ'}</span></td>
                      <td><span style={{ fontWeight: 700, color: '#b8860b' }}>{p.amount?.toLocaleString()} ₫</span></td>
                      <td><span style={{ color: 'var(--lux-text-dim)', fontSize: 12 }}>{new Date(p.createdAt || new Date()).toLocaleDateString('vi-VN')}</span></td>
                      <td><button className="add-btn" style={{ padding: '6px 14px', fontSize: 11, background: '#f3f4f6', color: '#1a1a1c', border: '1px solid #e5e7eb' }} onClick={() => setSelectedPayment(p)}>Kiểm tra</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {renderPaginationControls(payPage, totalPayPages, setPayPage)}
          </div>
        )}
      </main>

      {/* MODALS */}
      {userModal !== null && <UserModal user={userModal?.id ? userModal : null} onClose={() => setUserModal(null)} onSave={handleSaved} />}
      {prodModal !== null && <ProductModal product={prodModal?.id ? prodModal : null} onClose={() => setProdModal(null)} onSave={handleSaved} />}
      {selectedOrder && <OrderDetailModal order={selectedOrder} payment={payments.find(p => p.orderId === selectedOrder.id)} onClose={() => setSelectedOrder(null)} onStatusChange={(msg, type) => { if (msg) { showToast(msg, type); fetchData(); } else showToast('Đồng bộ thất bại', 'error'); }} onDelete={() => { setSelectedOrder(null); fetchData(); }} />}
      {selectedPayment && <PaymentDetailModal payment={selectedPayment} order={orders.find(o => o.id === selectedPayment.orderId)} onClose={() => setSelectedPayment(null)} onDelete={async (paymentId) => { try { await axios.delete(`${API_GATEWAY}/payment-service/payments/${paymentId}`); showToast('Đã xóa bản ghi'); setSelectedPayment(null); fetchData(); } catch (err) { showToast('Lỗi đồng bộ', 'error'); } }} />}
      {confirm && <ConfirmDialog name={confirm.name} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}