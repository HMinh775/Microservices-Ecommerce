import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_GATEWAY } from '../../../utils/constants';

// Extracted Components
import PaymentDetailModal from '../payments/PaymentDetailModal';
import OrderDetailModal from '../orders/OrderDetailModal';
import UserModal from '../users/UserModal';
import ProductModal from '../products/ProductModal';
import ConfirmDialog from '../shared/ConfirmDialog';
import Toast from '../../../shared/Toast';

import './AdminDashboard.css';

const fallbackImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='54' height='68'%3E%3Crect width='54' height='68' fill='%23242429'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%237a7a8a' font-family='sans-serif' font-size='14'%3E%E2%80%94%3C/text%3E%3C/svg%3E";

const orderStatusMap = { PENDING: '⏳ Chờ xử lý', PAID: '💳 Đã thanh toán', CONFIRMED: '✅ Đã xác nhận', SHIPPING: '🚚 Đang giao', DELIVERING: '🚚 Đang giao', DELIVERED: '📦 Đã giao', COMPLETED: '✅ Hoàn thành', CANCELLED: '❌ Đã hủy' };
const paymentStatusMap = { PENDING: '⏳ Chờ TT', SUCCESS: '✅ Thành công', FAILED: '❌ Thất bại', REFUNDED: '↩️ Hoàn tiền' };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
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

  // LOCK BODY SCROLL WHEN MODAL OPEN
  useEffect(() => {
    const isAnyModalOpen = userModal !== null || prodModal !== null || selectedOrder !== null || selectedPayment !== null || confirm !== null;
    if (isAnyModalOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [userModal, prodModal, selectedOrder, selectedPayment, confirm]);
  
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
      if (data && data.content) {
        setProducts(data.content);
        setTotalProdPages(data.totalPages || 0);
        setTotalProdsCount(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalProdsCount(data.length);
        setTotalProdPages(Math.ceil(data.length / PAGE_SIZE));
      } else {
        setProducts([]);
        setTotalProdsCount(0);
      }
    } catch (err) { 
      console.error("Lỗi khi tải sản phẩm:", err);
      showToast('Không thể tải dữ liệu Sản phẩm', 'error'); 
      setProducts([]);
    }
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

    // Handle state from other pages (e.g., OrderTracking)
    if (location.state?.tab) {
      setTab(location.state.tab);
    }
    
    fetchData().then(() => {
      if (location.state?.orderId) {
        // Auto-open order modal if orderId is provided
        // Note: fetchOrders must have completed for this to find the order
        // Since fetchData is async, we do this in the .then or after await
      }
    });
  }, [navigate, location.state]);

  // Secondary effect to handle auto-opening modal once orders are loaded
  useEffect(() => {
    if (location.state?.orderId && orders.length > 0) {
      const found = orders.find(o => String(o.id) === String(location.state.orderId));
      if (found) setSelectedOrder(found);
    }
  }, [orders, location.state]);

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

  const getCustomerName = (uid, savedName) => {
    if (savedName) return savedName;
    const u = users.find(x => x.id === uid);
    return u ? u.userName : `User_${uid}`;
  };

  const handleExport = () => {
    let csvData = "";
    let filename = `LUXE_Export_${tab.toUpperCase()}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '-')}.csv`;

    // Header logic based on current tab
    if (tab === 'users') {
      csvData = "ID,Tên tài khoản,Email,Trạng thái\n" + 
        users.map(u => `${u.id},${u.userName},${u.userDetails?.email || ''},${u.active ? 'Hoạt động' : 'Đã khóa'}`).join("\n");
    } else if (tab === 'products') {
      csvData = "ID,Tên sản phẩm,Thương hiệu,Danh mục,Giá niêm yết\n" + 
        products.map(p => `${p.id},${p.productName},${p.brand},${p.category},${p.variants?.[0]?.price || 0}`).join("\n");
    } else if (tab === 'orders') {
      csvData = "Mã đơn hàng,Khách hàng,Tổng tiền,Trạng thái,Ngày đặt\n" + 
        orders.map(o => `${o.id},${getCustomerName(o.userId, o.userName)},${o.totalAmount},${o.status},${new Date(o.orderedDate).toLocaleDateString('vi-VN')}`).join("\n");
    } else if (tab === 'payments') {
      csvData = "Mã giao dịch,Mã đơn hàng,Phương thức,Trạng thái,Số tiền\n" + 
        payments.map(p => `${p.id},${p.orderId},${p.paymentMethod},${p.status},${p.amount}`).join("\n");
    }

    if (!csvData) {
      showToast('Không có dữ liệu để xuất!', 'error');
      return;
    }

    // Create blob with BOM for Excel UTF-8 support
    const blob = new Blob(["\ufeff" + csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Xuất file ${tab} thành công!`);
  };

  // ADVANCED SEARCH HELPER WITH ACCENT NORMALIZATION
  const normalize = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
  };

  const isMatch = (item, type) => {
    if (!search) return true;
    if (!item) return false;
    const tokens = search.split(' ').filter(t => t).map(t => normalize(t));
    
    let haystack = "";
    if (type === 'user') {
      haystack = `${item.userName || ''} ${item.userDetails?.email || ''} ID_${item.id || ''}`;
    } else if (type === 'product') {
      const variantStr = (item.variants || []).map(v => `${v.size || ''} ${v.color || ''} ${v.sku || ''}`).join(' ');
      haystack = `${item.productName || ''} ${item.brand || ''} ${item.category || ''} ${item.material || ''} ${variantStr}`;
    } else if (type === 'order') {
      const cName = getCustomerName(item.userId, item.userName);
      haystack = `ORD_${item.id || ''} ${cName} ${item.status || ''} ${item.totalAmount || ''} ${item.orderedDate ? new Date(item.orderedDate).toLocaleDateString() : ''}`;
    } else if (type === 'payment') {
      haystack = `TX_${item.id || ''} ORD_${item.orderId || ''} ${item.paymentMethod || ''} ${item.status || ''} ${item.amount || ''}`;
    }

    const normHaystack = normalize(haystack);
    return tokens.every(token => normHaystack.includes(token));
  };

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
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '16px 0' }} />
          <button
            className="nav-item"
            onClick={() => window.open('/tracking', '_blank')}
            style={{ opacity: 0.85 }}
          >
            <span className="nav-icon">🚚</span> <span>Theo Dõi Đơn</span>
          </button>
        </nav>
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
            <input className="search-bar" placeholder="Tìm kiếm nhanh..." value={search} onChange={e => setSearch(e.target.value)} />
            <button 
              className="export-btn" 
              onClick={handleExport}
              style={{
                padding: '10px 20px', borderRadius: 12, border: '1.5px solid #e5e7eb',
                background: '#fff', color: '#374151', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6
              }}
              onMouseEnter={e => { e.target.style.background = '#f9fafb'; e.target.style.borderColor = '#d1d5db'; }}
              onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#e5e7eb'; }}
            >
              📥 Xuất dữ liệu
            </button>
            <button className="add-btn" onClick={() => tab === 'users' ? setUserModal({}) : setProdModal({})}>
              + Thêm {tab === 'users' ? 'Người Dùng' : 'Sản Phẩm'}
            </button>
            <button className="btn-logout" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>Đăng Xuất</button>
          </div>
        </header>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-label">👥 Khách Hàng</span>
            <span className="stat-value gold">{totalUsersCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">👗 Sản Phẩm</span>
            <span className="stat-value blue">{totalProdsCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">📦 Đơn Hàng</span>
            <span className="stat-value green">{totalOrdersCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">💳 Thanh Toán</span>
            <span className="stat-value gold">{totalPaymentsCount}</span>
          </div>
        </section>

        {tab === 'users' && (
          <div className="table-card">
            <div className="table-card-header">
              <span className="table-card-title">Hồ Sơ Khách Hàng</span>
              <span className="table-card-subtitle">Tổng cộng {totalUsersCount} thành viên</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Định danh</th>
                  <th>Tài khoản</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row"><td colSpan={5}>Đang tải...</td></tr>
                ) : users.filter(u => isMatch(u, 'user')).length === 0 ? (
                  <tr><td colSpan={5} className="empty-row">Không tìm thấy dữ liệu</td></tr>
                ) : users.filter(u => isMatch(u, 'user')).map(u => (
                  <tr key={u.id}>
                    <td>ID_{u.id}</td>
                    <td><strong>{u.userName}</strong></td>
                    <td>{u.userDetails?.email || '—'}</td>
                    <td><span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>{u.active ? 'hoạt động' : 'ĐÃ KHÓA'}</span></td>
                    <td>
                      <button className="btn-edit" onClick={() => setUserModal(u)}>Sửa</button>
                      <button className="btn-delete" onClick={() => setConfirm({ type: 'user', id: u.id, name: u.userName })}>Xóa</button>
                    </td>
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
              <span className="table-card-title">Danh Mục Kho Hàng</span>
              <span className="table-card-subtitle">Đang niêm yết {totalProdsCount} sản phẩm</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Tồn kho</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row"><td colSpan={5}>Đang tải...</td></tr>
                ) : products.filter(p => isMatch(p, 'product')).length === 0 ? (
                  <tr><td colSpan={5} className="empty-row">Danh mục trống</td></tr>
                ) : products.filter(p => isMatch(p, 'product')).map(p => {
                  const totalQ = p.variants?.reduce((a, v) => a + v.stockQuantity, 0) || 0;
                  return (
                    <tr key={p.id}>
                      <td><img className="product-thumb" src={p.image ? `${API_GATEWAY}/product-catalog-service/products/images/${p.image}` : fallbackImg} alt={p.productName} onError={e => e.target.src = fallbackImg} /></td>
                      <td>
                        <strong>{p.productName}</strong>
                        <div className="product-brand-sub">{p.brand}</div>
                      </td>
                      <td><span className="badge-gray">{p.category || 'N/A'}</span></td>
                      <td><strong>{totalQ}</strong> chiếc</td>
                      <td>
                        <button className="btn-edit" onClick={() => setProdModal(p)}>Sửa</button>
                        <button className="btn-delete" onClick={() => setConfirm({ type: 'product', id: p.id, name: p.productName })}>Xóa</button>
                      </td>
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
              <span className="table-card-title">Luồng Đơn Hàng</span>
              <span className="table-card-subtitle">{totalOrdersCount} đơn mới</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Ngày đặt</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row"><td colSpan={6}>Đang tải...</td></tr>
                ) : orders.filter(o => isMatch(o, 'order')).length === 0 ? (
                  <tr><td colSpan={6} className="empty-row">Không có đơn hàng nào</td></tr>
                ) : orders.filter(o => isMatch(o, 'order')).map(o => (
                  <tr key={o.id}>
                    <td>ORD_{o.id}</td>
                    <td>
                      <div className="customer-info-cell">
                        <strong>{getCustomerName(o.userId, o.userName)}</strong>
                        <div className="customer-id-sub">ID: {o.userId}</div>
                      </div>
                    </td>
                    <td><span className="badge-gray">{orderStatusMap[o.status?.toUpperCase()] || o.status}</span></td>
                    <td><strong>{o.totalAmount?.toLocaleString()} ₫</strong></td>
                    <td>{new Date(o.orderedDate).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button className="btn-link" onClick={() => setSelectedOrder(o)}>Xem</button>
                        <button
                          className="btn-link"
                          style={{ color: '#3b82f6', borderColor: 'rgba(59,130,246,0.25)', background: 'rgba(59,130,246,0.07)' }}
                          onClick={() => navigate('/tracking', { state: { order: o } })}
                          title="Xem hành trình đơn hàng"
                        >
                          🚚 Track
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPaginationControls(orderPage, totalOrderPages, setOrderPage)}
          </div>
        )}

        {tab === 'payments' && (
          <div className="table-card">
            <div className="table-card-header">
              <span className="table-card-title">Giao Dịch</span>
              <span className="table-card-subtitle">{totalPaymentsCount} giao dịch</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Mã đơn</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Số tiền</th>
                  <th>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr className="loading-row"><td colSpan={6}>Đang tải...</td></tr>
                ) : payments.filter(p => isMatch(p, 'payment')).length === 0 ? (
                  <tr><td colSpan={6} className="empty-row">Chưa có giao dịch nào</td></tr>
                ) : payments.filter(p => isMatch(p, 'payment')).map(p => (
                  <tr key={p.id}>
                    <td>TX_{p.id}</td>
                    <td>ORD_{p.orderId}</td>
                    <td><span className="badge-blue">{p.paymentMethod || 'N/A'}</span></td>
                    <td><span className={`badge ${p.status?.toUpperCase() === 'SUCCESS' ? 'badge-green' : 'badge-red'}`}>{paymentStatusMap[p.status?.toUpperCase()] || p.status}</span></td>
                    <td><strong>{p.amount?.toLocaleString()} ₫</strong></td>
                    <td><button className="btn-link" onClick={() => setSelectedPayment(p)}>Xem</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {renderPaginationControls(payPage, totalPayPages, setPayPage)}
          </div>
        )}
      </main>

      {userModal !== null && <UserModal user={userModal?.id ? userModal : null} onClose={() => setUserModal(null)} onSave={handleSaved} />}
      {prodModal !== null && <ProductModal product={prodModal?.id ? prodModal : null} onClose={() => setProdModal(null)} onSave={handleSaved} />}
      {selectedOrder && <OrderDetailModal order={selectedOrder} payment={payments.find(p => p.orderId === selectedOrder.id)} onClose={() => setSelectedOrder(null)} onStatusChange={handleSaved} onDelete={() => { setSelectedOrder(null); fetchData(); }} onNavigateTracking={() => { setSelectedOrder(null); navigate('/tracking', { state: { order: selectedOrder } }); }} />}
      {selectedPayment && <PaymentDetailModal payment={selectedPayment} order={orders.find(o => o.id === selectedPayment.orderId)} onClose={() => setSelectedPayment(null)} onDelete={fetchData} />}
      {confirm && <ConfirmDialog name={confirm.name} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}