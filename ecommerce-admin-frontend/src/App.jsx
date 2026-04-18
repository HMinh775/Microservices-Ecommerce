import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './user/pages/Home';
import Login from './auth/Login';
import Register from './auth/Register';
import AdminDashboard from './admin/AdminDashboard';
import AdminLogin from './auth/AdminLogin';
import ProtectedRoute from './auth/ProtectedRoute';
import Cart from './user/pages/Cart';
import Checkout from './user/pages/Checkout';
import Favorites from './user/pages/Favorites';
import PaymentResult from './user/pages/PaymentResult';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import ChatAI from './user/components/ChatAI';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/payment/vnpay-return" element={<PaymentResult />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      
      {/* AI Chatbot - Tự động hiển thị trên các trang (Check route để ẩn nếu cần) */}
      {!window.location.pathname.startsWith('/admin') && <ChatAI />}
    </BrowserRouter>
  );
}