import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import AdminDashboard from '../pages/AdminDashboard';
import SalesDashboard from '../pages/SalesDashboard';
import InventoryDashboard from '../pages/InventoryDashboard';
import Loading from '../components/common/Loading';
import { useAuth } from '../contexts/AuthContext';
import { useAuthorization } from '../contexts/AuthorizationContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ZaloPayResultPage from '../pages/ZaloPayResultPage';
import Top10BooksReportPage from '../pages/reports/Top10BooksReportPage';

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const { hasPermission, initialized } = useAuthorization();

  // Debug
  useEffect(() => {
    console.log("AppRoutes rendered - Auth state:", { user, loading });
    console.log("Authorization initialized:", initialized);
  }, [user, loading, initialized]);

  // Hiển thị loading nếu đang kiểm tra xác thực HOẶC nếu AuthorizationContext chưa được khởi tạo
  if (loading || !initialized) {
    return <Loading message="Đang khởi tạo ứng dụng..." />;
  }
  
  // Quyết định trang mặc định dựa trên vai trò
  const getDefaultRoute = () => {
    if (!user) return '/login';
    
    const role = user.role ? String(user.role).toUpperCase() : null;
    
    // Chuyển hướng dựa theo vai trò đến trang đầu tiên tương ứng
    switch(role) {
      case 'ADMIN': 
        return '/books'; // Trang đầu tiên cho Admin
      case 'SALESPERSON': 
        return '/invoices'; // Trang đầu tiên cho Sales
      case 'INVENTORY': 
        return '/books'; // Trang đầu tiên cho Inventory
      default:
        return '/login';
    }
  };

  // Lấy component dashboard dựa trên vai trò
  const getDashboardComponent = () => {
    if (!user) return null;
    
    const role = user.role ? String(user.role).toUpperCase() : null;
    
    switch(role) {
      case 'ADMIN': 
        return <AdminDashboard />;
      case 'SALESPERSON': 
        return <SalesDashboard />;
      case 'INVENTORY': 
        return <InventoryDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  // Đối với tất cả các điều kiện khác, chúng tôi đã sẵn sàng để render routes
  return (
    <Routes>
      {/* Route công khai - không cần xác thực */}
      <Route path="/login" element={
        user ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />
      } />

      {/* Route mặc định chuyển hướng tùy thuộc vào vai trò */}
      <Route path="/" element={
        user ? <Navigate to={getDefaultRoute()} replace /> : <Navigate to="/login" replace />
      } />
      
      {/* Routes cho các dashboard tương ứng với từng vai trò */}
      <Route path="/admin-dashboard/*" element={
        <ProtectedRoute isAllowed={!!user && user.role === 'ADMIN'}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/sales-dashboard/*" element={
        <ProtectedRoute isAllowed={!!user && user.role === 'SALESPERSON'}>
          <SalesDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/inventory-dashboard/*" element={
        <ProtectedRoute isAllowed={!!user && user.role === 'INVENTORY'}>
          <InventoryDashboard />
        </ProtectedRoute>
      } />
      
      {/* Routes cần xác thực và phân quyền - chuyển hướng đến dashboard tương ứng */}
      <Route path="/books" element={
        <ProtectedRoute isAllowed={!!user && hasPermission('/books')}>
          {getDashboardComponent()}
        </ProtectedRoute>
      } />
      
      <Route path="/categories" element={
        <ProtectedRoute isAllowed={!!user && hasPermission('/categories')}>
          {getDashboardComponent()}
        </ProtectedRoute>
      } />
      
      <Route path="/publishers" element={
        <ProtectedRoute isAllowed={!!user && hasPermission('/publishers')}>
          {getDashboardComponent()}
        </ProtectedRoute>
      } />
      
      <Route path="/imports" element={
        <ProtectedRoute isAllowed={!!user && hasPermission('/imports')}>
          {getDashboardComponent()}
        </ProtectedRoute>
      } />
      
      <Route path="/suppliers" element={
        <ProtectedRoute isAllowed={!!user && hasPermission('/suppliers')}>
          {getDashboardComponent()}
        </ProtectedRoute>
      } />
      
      <Route path="/promotions" element={
        <ProtectedRoute isAllowed={!!user && hasPermission('/promotions')}>
          {getDashboardComponent()}
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute isAllowed={!!user && hasPermission('/reports')}>
          {getDashboardComponent()}
        </ProtectedRoute>
      } />

      <Route path="/reports/top10-books" element={
        <ProtectedRoute isAllowed={!!user && hasPermission('/reports')}>
          <Top10BooksReportPage />
        </ProtectedRoute>
      } />
      
      <Route path="/rules" element={
        <ProtectedRoute isAllowed={!!user && hasPermission('/rules')}>
          {getDashboardComponent()}
        </ProtectedRoute>
      } />
      
      <Route path="/accounts" element={
        <ProtectedRoute isAllowed={!!user && hasPermission('/accounts')}>
          {getDashboardComponent()}
        </ProtectedRoute>
      } />

      <Route path="/zalopay-result" element={<ZaloPayResultPage />} />

      {/* Fallback - nếu không khớp route nào */}
      <Route path="*" element={
        user ? <Navigate to={getDefaultRoute()} replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
};

export default AppRoutes;