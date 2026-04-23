import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import './OrderHistory.css';

const API_GATEWAY = "http://localhost:8900";
// Sử dụng ảnh placeholder từ Unsplash để ổn định hơn và khớp với LUXE theme
const fallbackImg = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=150&h=200';

const getProductImage = (image) => {
    if (!image) return fallbackImg;
    if (image.startsWith('http')) return image;
    return `${API_GATEWAY}/product-catalog-service/products/images/${image}`;
};

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const [reorderingId, setReorderingId] = useState(null);
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = (userId) => {
        setLoading(true);
        axios.get(`${API_GATEWAY}/order-service/orders/user/${userId}`)
            .then(res => {
                const sortedOrders = (res.data || []).sort((a, b) => 
                    new Date(b.orderedDate) - new Date(a.orderedDate)
                );
                setOrders(sortedOrders);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching orders:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            setLoading(false);
            return;
        }
        const currentUser = JSON.parse(userStr);
        setUser(currentUser);
        fetchOrders(currentUser.id);
    }, []);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId} không?`)) {
            return;
        }

        setCancellingId(orderId);
        try {
            await axios.put(`${API_GATEWAY}/order-service/orders/${orderId}/status?status=CANCELLED`);
            fetchOrders(user.id);
        } catch (err) {
            console.error("Error cancelling order:", err);
            alert("Không thể hủy đơn hàng vào lúc này.");
        } finally {
            setCancellingId(null);
        }
    };

    const handleReorder = async (order) => {
        setReorderingId(order.id);
        
        try {
            const freshItems = [];

            // Fetch dữ liệu mới nhất cho từng sản phẩm trong đơn hàng
            for (const item of order.items) {
                try {
                    const res = await axios.get(`${API_GATEWAY}/product-catalog-service/products/variants/${item.variantId}`);
                    const realData = res.data;

                    freshItems.push({
                        productId: realData.productId,
                        productName: realData.productName,
                        brand: realData.brand,
                        quantity: item.quantity,
                        image: realData.image,
                        variantId: realData.id,
                        variantInfo: {
                            size: realData.size,
                            color: realData.color,
                            price: realData.price,
                            stockQuantity: realData.stockQuantity
                        }
                    });
                } catch (err) {
                    console.warn(`Không thể lấy dữ liệu mới cho ${item.productName}, dùng dữ liệu cũ.`);
                    freshItems.push({
                        productName: item.productName,
                        quantity: item.quantity,
                        image: item.image,
                        variantId: item.variantId,
                        variantInfo: {
                            size: item.variantInfo?.split('/')[0]?.trim(),
                            color: item.variantInfo?.split('/')[1]?.trim(),
                            price: item.priceAtPurchase,
                            stockQuantity: 99
                        }
                    });
                }
            }

            // Lưu vào cartItems để đồng bộ với context nếu cần
            localStorage.setItem('cartItems', JSON.stringify(freshItems));
            
            // Chuyển THẲNG đến trang checkout, bỏ qua giỏ hàng
            navigate('/checkout', { state: { reorderItems: freshItems } });
        } catch (err) {
            console.error("Reorder failed:", err);
            alert("Có lỗi xảy ra khi chuẩn bị đơn hàng. Vui lòng thử lại.");
        } finally {
            setReorderingId(null);
        }
    };


    const getStatusInfo = (status) => {
        switch (status) {
            case 'PAID': return { label: 'Đã thanh toán', class: 'status-paid', icon: '✓' };
            case 'PENDING': return { label: 'Đang xử lý', class: 'status-pending', icon: '○' };
            case 'CANCELLED': return { label: 'Đã hủy', class: 'status-cancelled', icon: '✕' };
            case 'SHIPPING': return { label: 'Đang giao hàng', class: 'status-shipping', icon: '🚚' };
            case 'DELIVERED': return { label: 'Đã giao thành công', class: 'status-delivered', icon: '🎁' };
            default: return { label: status, class: 'status-default', icon: '•' };
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const openDetails = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    return (
        <div className="orders-wrapper">
            <Header />
            
            <main className="orders-container">
                <header className="orders-page-header">
                    <h1 className="orders-title">Lịch Sử Đơn Hàng</h1>
                    <p className="orders-subtitle">Hành trình trải nghiệm sự tinh tế và đẳng cấp của riêng bạn.</p>
                    <div style={{ marginTop: '28px' }}>
                        <button
                            onClick={() => navigate('/tracking')}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '10px',
                                padding: '14px 32px',
                                background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                                color: '#0a0a0a',
                                border: 'none', borderRadius: '100px',
                                fontWeight: '700', fontSize: '0.85rem',
                                letterSpacing: '1px', textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)'
                            }}
                            onMouseEnter={e => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 10px 32px rgba(212,175,55,0.4)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(212,175,55,0.3)'; }}
                        >
                            🚚 Theo Dõi Đơn Hàng
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="orders-loading">
                        <div className="premium-loader"></div>
                        <p>Đang truy xuất dữ liệu đơn hàng...</p>
                    </div>
                ) : !user ? (
                    <div className="orders-empty">
                        <p>Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.</p>
                        <button className="btn-go-login" onClick={() => navigate('/login')}>Đăng Nhập Ngay</button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="orders-empty">
                        <div className="empty-state-icon">✦</div>
                        <h3>Chưa có dấu ấn giao dịch nào</h3>
                        <p>Hãy bắt đầu hành trình mua sắm của bạn với bộ sưu tập mới nhất.</p>
                        <button className="btn-shop-now" onClick={() => navigate('/')}>Tiếp Tục Mua Sắm</button>
                    </div>
                ) : (
                    <div className="orders-grid">
                        {orders.map(order => {
                            const status = getStatusInfo(order.status);
                            return (
                                <div key={order.id} className="order-lux-card">
                                    <div className="order-lux-header">
                                        <div className="order-id-group">
                                            <span className="order-label">MÃ ĐƠN HÀNG</span>
                                            <span className="order-value">#{order.id}</span>
                                        </div>
                                        <div className="order-date-group">
                                            <span className="order-label">NGÀY ĐẶT</span>
                                            <span className="order-value">{formatDate(order.orderedDate)}</span>
                                        </div>
                                        <div className={`status-badge ${status.class}`}>
                                            <i className="status-icon">{status.icon}</i>
                                            {status.label}
                                        </div>
                                    </div>

                                    <div className="order-lux-body">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="order-lux-item">
                                                <div className="item-lux-image">
                                                    <img 
                                                        src={getProductImage(item.image)} 
                                                        alt={item.productName} 
                                                        onError={(e) => { e.target.src = fallbackImg }}
                                                    />
                                                </div>
                                                <div className="item-lux-details">
                                                    <h4 className="item-lux-name">{item.productName}</h4>
                                                    <div className="item-lux-meta">
                                                        <span>{item.variantInfo}</span>
                                                        <span className="item-lux-qty"> | Số lượng: {item.quantity}</span>
                                                    </div>
                                                </div>
                                                <div className="item-lux-price">
                                                    {(item.priceAtPurchase || 0).toLocaleString('vi-VN')}₫
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-lux-footer">
                                        <div className="order-lux-shipping">
                                            <span className="footer-label">ĐỊA CHỈ GIAO HÀNG</span>
                                            <p className="footer-value">{order.shippingAddress || 'Chưa cập nhật'}</p>
                                        </div>
                                        <div className="order-lux-summary">
                                            <div className="total-row">
                                                <span className="total-label">Tổng thanh toán:</span>
                                                <span className="total-amount">{order.totalAmount.toLocaleString('vi-VN')}₫</span>
                                            </div>
                                            <div className="order-actions">
                                                {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
                                                    <button 
                                                        className="btn-reorder"
                                                        onClick={() => handleReorder(order)}
                                                        disabled={reorderingId === order.id}
                                                    >
                                                        {reorderingId === order.id ? 'Đang Xử Lý...' : 'Đặt Hàng Lại'}
                                                    </button>
                                                )}
                                                {order.status === 'PENDING' && (
                                                    <button 
                                                        className="btn-cancel-order"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        disabled={cancellingId === order.id}
                                                    >
                                                        {cancellingId === order.id ? 'Đang hủy...' : 'Hủy Đơn Hàng'}
                                                    </button>
                                                )}
                                                <button className="btn-view-details" onClick={() => openDetails(order)}>Chi Tiết</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* ORDER DETAILS MODAL */}
            {showModal && selectedOrder && (
                <div className="lux-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="lux-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
                        
                        <div className="modal-header">
                            <span className="modal-badge">{getStatusInfo(selectedOrder.status).label}</span>
                            <h2 className="modal-title">Chi Tiết Đơn Hàng #{selectedOrder.id}</h2>
                            <p className="modal-date">Đặt ngày {formatDate(selectedOrder.orderedDate)}</p>
                        </div>

                        <div className="modal-body">
                            <div className="modal-section">
                                <h3 className="section-title">Sản Phẩm</h3>
                                <div className="modal-item-list">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="modal-item-row">
                                            <img 
                                                src={getProductImage(item.image)} 
                                                alt={item.productName} 
                                                className="modal-item-img"
                                                onError={e => e.target.src = fallbackImg}
                                            />
                                            <div className="modal-item-info">
                                                <p className="modal-item-name">{item.productName}</p>
                                                <p className="modal-item-variant">{item.variantInfo}</p>
                                                <p className="modal-item-qty">Số lượng: {item.quantity}</p>
                                            </div>
                                            <div className="modal-item-price">
                                                {(item.priceAtPurchase || 0).toLocaleString('vi-VN')}₫
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-info-grid">
                                <div className="modal-section">
                                    <h3 className="section-title">Giao Hàng</h3>
                                    <p className="modal-text"><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</p>
                                    <p className="modal-text"><strong>Người nhận:</strong> {user?.firstName} {user?.lastName}</p>
                                </div>
                                <div className="modal-section">
                                    <h3 className="section-title">Thanh Toán</h3>
                                    <p className="modal-text"><strong>Phương thức:</strong> {selectedOrder.paymentMethod || 'COD'}</p>
                                    <p className="modal-text"><strong>Trạng thái:</strong> {selectedOrder.status === 'PAID' ? 'Đã thanh toán' : 'Chờ xử lý'}</p>
                                </div>
                            </div>

                            <div className="modal-footer-sum">
                                <div className="sum-row">
                                    <span>Tạm tính</span>
                                    <span>{(selectedOrder.totalAmount - (selectedOrder.totalAmount > 500000 ? 0 : 30000)).toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="sum-row">
                                    <span>Phí giao hàng</span>
                                    <span>{selectedOrder.totalAmount > 500000 ? 'Miễn phí' : '30.000₫'}</span>
                                </div>
                                <div className="sum-row total">
                                    <span>Tổng cộng</span>
                                    <span className="total-val">{selectedOrder.totalAmount.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            {selectedOrder.status === 'PENDING' && (
                                <button 
                                    className="btn-modal-cancel" 
                                    onClick={() => {
                                        setShowModal(false);
                                        handleCancelOrder(selectedOrder.id);
                                    }}
                                    disabled={cancellingId === selectedOrder.id}
                                >
                                    {cancellingId === selectedOrder.id ? 'Đang hủy...' : 'HỦY ĐƠN HÀNG'}
                                </button>
                            )}
                            
                            {(selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'DELIVERED') && (
                                <button className="btn-modal-reorder" onClick={() => {
                                    setShowModal(false);
                                    handleReorder(selectedOrder);
                                }}>ĐẶT HÀNG LẠI</button>
                            )}

                            <button className="btn-modal-close" onClick={() => setShowModal(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
