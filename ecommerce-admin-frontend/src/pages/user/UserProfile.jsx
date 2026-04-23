import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/common/Header';
import './UserProfile.css';

const API_GATEWAY = "http://localhost:8900";

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    // Profile form states
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        street: '',
        streetNumber: '',
        zipCode: '',
        locality: '',
        country: 'Việt Nam'
    });

    // Password form states
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            setLoading(false);
            return;
        }
        const currentUser = JSON.parse(userStr);
        
        axios.get(`${API_GATEWAY}/user-service/users/${currentUser.id}`)
            .then(res => {
                const userData = res.data;
                setUser(userData);
                
                if (userData.userDetails) {
                    setProfileData({
                        firstName: userData.userDetails.firstName || '',
                        lastName: userData.userDetails.lastName || '',
                        email: userData.userDetails.email || '',
                        phoneNumber: userData.userDetails.phoneNumber || '',
                        street: userData.userDetails.street || '',
                        streetNumber: userData.userDetails.streetNumber || '',
                        zipCode: userData.userDetails.zipCode || '',
                        locality: userData.userDetails.locality || '',
                        country: userData.userDetails.country || 'Việt Nam',
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching profile:", err);
                setLoading(false);
            });
    };

    const handleProfileUpdate = (e) => {
        e.preventDefault();

        // VALIDATION
        if (!profileData.firstName || !profileData.lastName || !profileData.email) {
            setMessage({ type: 'error', content: 'Vui lòng nhập đầy đủ các trường bắt buộc: Họ, Tên, Email.' });
            return;
        }

        setSaving(true);
        setMessage({ type: '', content: '' });

        const updatedUser = {
            ...user,
            userDetails: {
                ...user.userDetails, // This preserves the ID if it exists
                ...profileData
            }
        };

        console.log("Saving user profile Data:", updatedUser);

        axios.put(`${API_GATEWAY}/user-service/users/${user.id}`, updatedUser)
            .then(res => {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);
                setMessage({ type: 'success', content: 'Cập nhật thông tin thành công!' });
                setSaving(false);
            })
            .catch(err => {
                console.error("Update Error:", err.response?.data);
                const errorMsg = err.response?.data?.message || err.response?.data || 'Lỗi khi cập nhật thông tin.';
                setMessage({ type: 'error', content: errorMsg });
                setSaving(false);
            });
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', content: 'Mật khẩu mới không khớp.' });
            return;
        }

        if (passwordData.newPassword.length < 4) {
            setMessage({ type: 'error', content: 'Mật khẩu mới phải có ít nhất 4 ký tự.' });
            return;
        }

        // Mật khẩu hiện tại sẽ được Backend xác thực bằng BCrypt nên không cần check ở đây nữa.

        const changePasswordRequest = {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        };

        axios.post(`${API_GATEWAY}/user-service/users/${user.id}/change-password`, changePasswordRequest)
            .then(res => {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setMessage({ type: 'success', content: 'Đổi mật khẩu thành công!' });
                setSaving(false);
            })
            .catch(err => {
                const errorMsg = err.response?.data?.message || 'Lỗi khi cập nhật mật khẩu.';
                setMessage({ type: 'error', content: errorMsg });
                setSaving(false);
            });
    };

    if (loading) return (
        <>
            <Header />
            <div className="profile-loading"><div className="spinner"></div></div>
        </>
    );

    return (
        <>
            <Header />
            <div className="profile-container">
                <aside className="profile-sidebar">
                    <div className="profile-avatar-wrap">
                        <div className="avatar-circle">
                            {user?.userName?.charAt(0).toUpperCase()}
                        </div>
                        <h2>{user?.userName}</h2>
                        <p>{user?.userDetails?.email || 'Chưa cập nhật Email'}</p>
                    </div>
                    <nav className="profile-nav">
                        <button className="active">Thông Tin Cá Nhân</button>
                        <button onClick={() => {
                            const section = document.getElementById('password-section');
                            section?.scrollIntoView({ behavior: 'smooth' });
                        }}>Đổi Mật Khẩu</button>
                        <button onClick={() => window.location.href = '/orders'}>Lịch Sử Đơn Hàng</button>
                    </nav>
                </aside>

                <main className="profile-content">
                    {message.content && (
                        <div className={`message-banner ${message.type}`}>
                            {message.content}
                            <button onClick={() => setMessage({ type: '', content: '' })}>✕</button>
                        </div>
                    )}

                    <section className="profile-section">
                        <h1 className="section-title">Hồ Sơ Cá Nhân</h1>
                        <form onSubmit={handleProfileUpdate} className="profile-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Họ <span className="req">*</span></label>
                                    <input 
                                        type="text" 
                                        value={profileData.lastName} 
                                        onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                                        placeholder="Nguyễn"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Tên <span className="req">*</span></label>
                                    <input 
                                        type="text" 
                                        value={profileData.firstName} 
                                        onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                                        placeholder="Văn A"
                                        required
                                    />
                                </div>
                                <div className="form-group large">
                                    <label>Email <span className="req">*</span></label>
                                    <input 
                                        type="email" 
                                        value={profileData.email} 
                                        onChange={e => setProfileData({...profileData, email: e.target.value})}
                                        placeholder="ten@vi-du.com"
                                        disabled={user?.userDetails?.email ? true : false}
                                        required
                                    />
                                    <small>
                                        {user?.userDetails?.email 
                                            ? "Email không thể thay đổi sau khi đã thiết lập." 
                                            : "Vui lòng nhập email chính xác để nhận các thông báo từ hệ thống."}
                                    </small>
                                </div>
                                <div className="form-group large">
                                    <label>Số điện thoại</label>
                                    <input 
                                        type="tel" 
                                        value={profileData.phoneNumber} 
                                        onChange={e => setProfileData({...profileData, phoneNumber: e.target.value})}
                                        placeholder="VD: 0987654321"
                                    />
                                </div>
                            </div>

                            <h3 className="sub-title">Địa chỉ mặc định</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Số nhà</label>
                                    <input 
                                        type="text" 
                                        value={profileData.streetNumber} 
                                        onChange={e => setProfileData({...profileData, streetNumber: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Đường</label>
                                    <input 
                                        type="text" 
                                        value={profileData.street} 
                                        onChange={e => setProfileData({...profileData, street: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Quận/Huyện/Thành phố</label>
                                    <input 
                                        type="text" 
                                        value={profileData.locality} 
                                        onChange={e => setProfileData({...profileData, locality: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Quốc gia</label>
                                    <input 
                                        type="text" 
                                        value={profileData.country} 
                                        disabled
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-save" disabled={saving}>
                                {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                            </button>
                        </form>
                    </section>

                    <section className="profile-section" id="password-section">
                        <h2 className="section-title">Đổi Mật Khẩu</h2>
                        <form onSubmit={handlePasswordChange} className="password-form">
                            <div className="form-group large">
                                <div className="label-flex">
                                    <label>Mật khẩu hiện tại</label>
                                    <Link to="/forgot-password" title="Khôi phục mật khẩu qua email" className="forgot-pass-link">Quên mật khẩu?</Link>
                                </div>
                                <input 
                                    type="password" 
                                    value={passwordData.currentPassword} 
                                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        value={passwordData.newPassword} 
                                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <input 
                                        type="password" 
                                        value={passwordData.confirmPassword} 
                                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-change-pass" disabled={saving}>
                                {saving ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                            </button>
                        </form>
                    </section>
                </main>
            </div>
        </>
    );
};

export default UserProfile;
