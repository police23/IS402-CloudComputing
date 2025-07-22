import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faIdBadge, faUserShield, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../contexts/AuthContext.jsx';
import ConfirmationModal from '../modals/ConfirmationModal';
import './Header.css';

const Header = ({ title, userRole, sidebarCollapsed }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirmation(false);
    logout();
    navigate('/');
  };

  const getRoleLabel = (roleId) => {
    switch (roleId) {
      case 1: return 'Quản trị viên';
      case 2: return 'Nhân viên bán hàng';
      case 3: return 'Nhân viên thủ kho';
      case 4: return 'Người dùng cuối';
      case 5: return 'Nhân viên quản lý đơn hàng';
      case 6: return 'Shipper';
      default: return 'Người dùng';
    }
  };
  const displayRole = user ? getRoleLabel(user.role_id) : userRole || 'Người dùng';

  // Hàm tạo kiểu cho tiêu đề đẹp mắt hơn
  const renderStyledTitle = () => {
    // List các route cần hiển thị title với style đẹp
    const managementRoutes = [
      "Quản lý đầu sách", 
      "Quản lý thể loại sách", 
      "Quản lý nhà xuất bản",
      "Quản lý nhập sách",
      "Quản lý nhà cung cấp",
      "Quản lý bán hàng",
      "Quản lý khuyến mãi",
      "Quản lý tài khoản",
    ];

    // Nếu tiêu đề là một trong những route quản lý, áp dụng style đẹp
    if (managementRoutes.includes(title)) {
      const mainText = title.replace("Quản lý ", "");
      return (
        <div className="styled-title">
          <span className="title-prefix">Quản lý</span>
          <span className="title-main">{mainText.toUpperCase()}</span>
        </div>
      );
    }
    
    // Với các route khác (Báo cáo, Thay đổi quy định, Tài khoản), áp dụng style khác
    return (
      <div className="styled-title">
        <span className="title-main special">{title}</span>
      </div>
    );
  };

  // Lấy icon phù hợp với vai trò
  const getRoleIcon = (roleId) => {
    switch (roleId) {
      case 1: return <FontAwesomeIcon icon={faUserShield} />;
      default: return <FontAwesomeIcon icon={faUser} />;
    }
  };
  
  return (
    <>
      <header className={`header${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="header-container">
          <div className="header-left">
            {renderStyledTitle()}
          </div>

          <div className="header-right">
            <div className="user-logout">
              <div className="user-info">
                <span className="username">{user?.full_name || 'Người dùng'}</span>
                <div className="user-role">
                  <span className="role-icon">{user ? getRoleIcon(user.role_id) : <FontAwesomeIcon icon={faUser} />}</span>
                  <span className="role-label">{displayRole}</span>
                </div>
              </div>

              <button className="logout-btn" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal xác nhận đăng xuất */}
      <ConfirmationModal
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleLogoutConfirm}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất?"
      />
    </>
  );
};

export default Header;