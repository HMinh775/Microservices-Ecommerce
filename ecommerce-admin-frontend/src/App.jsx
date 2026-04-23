import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages - User
import Home from './pages/user/Home';
import SearchResults from './pages/user/SearchResults';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Favorites from './pages/user/Favorites';
import OrderHistory from './pages/user/OrderHistory';
import OrderTracking from './pages/user/OrderTracking';
import UserProfile from './pages/user/UserProfile';
import PaymentResult from './pages/user/PaymentResult';
import About from './pages/user/About';

// Pages - Admin
import AdminDashboard from './features/admin/dashboard/AdminDashboard';

// Pages - Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLogin from './pages/auth/AdminLogin';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Shared Components
import ProtectedRoute from './pages/auth/ProtectedRoute';
import ChatAI from './components/common/ChatAI';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* User Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/tracking" element={<OrderTracking />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/payment/vnpay-return" element={<PaymentResult />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
      
      {/* AI Chatbot - Hiển thị ở phía người dùng */}
      {!window.location.pathname.startsWith('/admin') && <ChatAI />}
    </BrowserRouter>
  );
}