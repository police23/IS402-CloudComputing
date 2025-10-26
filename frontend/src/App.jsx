import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import LoginPage from './pages/auth/LoginPage';
import AdminPanel from './pages/panel/AdminPanel.jsx';
import InventoryPanel from './pages/panel/InventoryPanel.jsx';
import HomePage from './pages/home/HomePage';
import BooksPage from './pages/books/BooksPage';
import BookDetailPage from './pages/book-detail/BookDetailPage';
import CartPage from './pages/cart/CartPage.jsx';
import CheckoutPage from './pages/checkout/CheckoutPage.jsx';
import OrderSuccessPage from './pages/order-success/OrderSuccessPage.jsx';
import AboutPage from './pages/about/AboutPage';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import MyOrdersPage from './pages/my-orders/MyOrdersPage.jsx';
import OrderManagementPanel from './pages/panel/OrderManagerPanel.jsx';
import ShipperPanel from './pages/panel/ShipperPanel.jsx';
import axios from "axios";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  console.log("Protected route check:", { user, requiredRole });

  // Chờ auth khởi tạo xong để tránh redirect oan khi reload
  if (loading) {
    return null; // hoặc spinner nhẹ nếu muốn
  }

  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role_id !== requiredRole) {
    console.log("Wrong role, redirecting");
    if (user.role_id === 1) {
      return <Navigate to="/admin" replace />;
    } else if (user.role_id === 2) {
      return <Navigate to="/sales" replace />;
    } else if (user.role_id === 3) {
      return <Navigate to="/inventory" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
const HomeRoute = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && user.role_id !== 4) {
      const redirectPath = user.role_id === 1 ? '/admin' :
        user.role_id === 2 ? '/sales' :
        user.role_id === 3 ? '/inventory' :
        user.role_id === 5 ? '/order-manager' :
        user.role_id === 6 ? '/shipper' : '/';
      
      if (redirectPath !== '/') {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    axios
      .get("https://my-bookstore-backend-linux-bzcyc3bncbgwhyfq.southeastasia-01.azurewebsites.net/api-test")
      .then((res) => {
        console.log("Backend connected successfully:", res.data);
      })
      .catch((err) => {
        console.error("Backend connection failed:", err);
      });
  }, []);

  return <HomePage />;
};

function App() {
  const { user, loading } = useAuth();
  console.log("App rendering, current user:", user, "loading:", loading);

  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />

      <Route path="/books" element={<BooksPage />} />
      <Route path="/book/:id" element={<BookDetailPage />} />

      <Route path="/cart" element={<CartPage />} />

      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-success" element={<OrderSuccessPage />} />

      <Route path="/about" element={<AboutPage />} />


      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />

      <Route path="/account" element={<ProfilePage />} />

      <Route path="/my-orders" element={<MyOrdersPage />} />
      <Route path="/inventory/*" element={<ProtectedRoute requiredRole={3}><InventoryPanel /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute requiredRole={1}><AdminPanel /></ProtectedRoute>} />
      <Route path="/order-manager/*" element={<ProtectedRoute requiredRole={5}><OrderManagementPanel /></ProtectedRoute>} />
      <Route path="/shipper/*" element={<ProtectedRoute requiredRole={6}><ShipperPanel /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;