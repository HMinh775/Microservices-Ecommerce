import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute Component
 * Kiểm tra xem người dùng đã đăng nhập và có quyền Admin (ROLE_ADMIN) hay chưa.
 * Nếu không thỏa mãn, điều hướng về trang /admin/login.
 */
const ProtectedRoute = ({ children }) => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    // Chưa đăng nhập
    return <Navigate to="/admin/login" replace />;
  }

  const user = JSON.parse(userStr);
  const isAdmin = user.role && (user.role.roleName === 'ROLE_ADMIN' || user.role.id === 2);

  if (!isAdmin) {
    // Đã đăng nhập nhưng không phải Admin
    // Xóa user cũ để đăng nhập lại đúng tài khoản Admin
    localStorage.removeItem('user');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
