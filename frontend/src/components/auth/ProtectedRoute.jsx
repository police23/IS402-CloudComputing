import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthorization } from '../../contexts/AuthorizationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Loading from '../common/Loading';
import './AccessDenied.css';

const ProtectedRoute = ({ redirectPath = '/login', isAllowed = true, children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const { initialized } = useAuthorization();
  const location = useLocation();

  // Debug log
  useEffect(() => {
    console.log('ProtectedRoute rendered:', {
      path: location.pathname,
      isAllowed,
      isAuthenticated,
      loading,
      initialized
    });
  }, [location.pathname, isAllowed, isAuthenticated, loading, initialized]);

  // Hiển thị trạng thái loading nếu đang kiểm tra xác thực
  if (loading || !initialized) {
    return <Loading message="Đang kiểm tra thông tin đăng nhập..." />;
  }

  // Điều hướng đến trang đăng nhập nếu chưa xác thực
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Nếu đã xác thực nhưng không có quyền truy cập
  if (!isAllowed) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <FontAwesomeIcon icon={faLock} size="3x" className="lock-icon" />
          <h2>Không có quyền truy cập</h2>
          <p>Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>
          <button onClick={() => window.history.back()} className="btn">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị children hoặc outlet nếu có quyền truy cập
  return children ? children : <Outlet />;
};

ProtectedRoute.propTypes = {
  redirectPath: PropTypes.string,
  isAllowed: PropTypes.bool,
  children: PropTypes.node
};

export default ProtectedRoute;