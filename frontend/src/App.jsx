import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import LoginPage from './pages/auth/LoginPage';
import AdminPanel from './pages/panel/AdminPanel.jsx';
import SalesPanel from './pages/panel/SalesPanel.jsx';
import InventoryPanel from './pages/panel/InventoryPanel.jsx';
import HomePage from './pages/home/HomePage';
import BooksPage from './pages/books/BooksPage';
import BookDetailPage from './pages/book-detail/BookDetailPage';
import CartPage from './pages/cart/CartPage.jsx';
import CheckoutPage from './pages/checkout/CheckoutPage.jsx';
import OrderSuccessPage from './pages/order-success/OrderSuccessPage.jsx';
import ZaloPayResultPage from './pages/ZaloPayResultPage';
import AboutPage from './pages/about/AboutPage';
import RegisterForm from './components/auth/RegisterForm';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import MyOrdersPage from './pages/my-orders/MyOrdersPage.jsx';
import OrderManagementPanel from './pages/panel/OrderManagerPanel.jsx';
import ShipperPanel from './pages/panel/ShipperPanel.jsx';
import AccountManagementPage from './pages/account-management/AccountManagementPage';

// Protected route wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  console.log("Protected route check:", { user, requiredRole });

  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/" replace />;
  }

  if (requiredRole && user.role_id !== requiredRole) {
    console.log("Wrong role, redirecting");
    // Redirect based on role
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

function App() {
  const { user } = useAuth();
  console.log("App rendering, current user:", user);

  // Đã xóa useEffect xóa token/user khỏi localStorage để giữ đăng nhập khi reload

  return (
    <Routes>
      {/* Public route - HomePage for guests */}
      <Route path="/" element={
        !user || user.role_id === 4 ? <HomePage /> :
        <Navigate to={`/${user.role_id === 1 ? 'admin' :
          user.role_id === 2 ? 'sales' :
            user.role_id === 3 ? 'inventory' :
              user.role_id === 5 ? 'order-manager' :
                user.role_id === 6 ? 'shipper' : ''
          }`} replace />
      } />

      {/* Books page for guests */}
      <Route path="/books" element={<BooksPage />} />
      
      {/* Book detail page for guests */}
      <Route path="/book/:id" element={<BookDetailPage />} />

      {/* Checkout page - accessible for both guests and logged in users */}
      <Route path="/cart" element={<CartPage />} />
      

      {/* Checkout page - accessible for both guests and logged in users */}
      <Route path="/checkout" element={<CheckoutPage />} />
      {/* Order success page */}
      <Route path="/order-success" element={<OrderSuccessPage />} />

      {/* About page - accessible for both guests and logged in users */}
      <Route path="/about" element={<AboutPage />} />

      {/* Login route */}
      <Route path="/login" element={<LoginPage />} />
      {/* Register route dùng chung LoginPage */}
      <Route path="/register" element={<LoginPage />} />

      {/* Account page - accessible for both guests and logged in users */}
      <Route path="/account" element={<ProfilePage />} />

      {/* My Orders page - accessible for logged in users */}
      <Route path="/my-orders" element={<MyOrdersPage />} />

      {/* Role-specific routes */}
  
      <Route path="/sales/*" element={<ProtectedRoute requiredRole={2}><SalesPanel /></ProtectedRoute>} />
      <Route path="/inventory/*" element={<ProtectedRoute requiredRole={3}><InventoryPanel /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute requiredRole={1}><AdminPanel /></ProtectedRoute>} />
      <Route path="/order-manager/*" element={<ProtectedRoute requiredRole={5}><OrderManagementPanel /></ProtectedRoute>} />
      <Route path="/shipper/*" element={<ProtectedRoute requiredRole={6}><ShipperPanel /></ProtectedRoute>} />
    
      {/* Redirect all other URLs to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;