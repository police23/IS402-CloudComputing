import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faListUl,
  faBuilding,
  faFileImport,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../components/common/Sidebar.jsx";
import Header from "../../components/common/Header.jsx";
import BookTable from "../../components/tables/BookTable.jsx";
import ImportTable from "../../components/tables/ImportTable.jsx";
import ProfilePage from "../profile/ProfilePage.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";  // Make sure the extension is .jsx
import "./Panel.css";
import "../../styles/SearchBar.css";

// Dữ liệu menu sidebar cho nhân viên thủ kho - giới hạn quyền truy cập
const inventoryMenuItems = [
  {
    path: "books",
    label: "Quản lý đầu sách",
    icon: <FontAwesomeIcon icon={faBook} />,
    showActions: true,
  },  {
    path: "imports",
    label: "Quản lý nhập sách",
    icon: <FontAwesomeIcon icon={faFileImport} />,
    showActions: true,
  },
  {
    path: "profile",
    label: "Thông tin tài khoản",
    icon: <FontAwesomeIcon icon={faUser} />,
    showActions: false,
  }
];

const InventoryDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Lấy phần cuối của path để xác định bảng
  const route = location.pathname.split('/').pop() || "books";
  const currentMenuItem =
    inventoryMenuItems.find((item) => item.path === route) || inventoryMenuItems[0];
  const pageTitle = currentMenuItem.label;  const showHeaderActions = currentMenuItem.showActions;

  // Handler for sidebar collapse state
  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Kiểm tra xem người dùng có phải là nhân viên thủ kho không
    if (user.role_id !== 3) {
      if (user.role_id === 1) {
        navigate('/admin');
      } else if (user.role_id === 2) {
        navigate('/sales');
      } else {
        navigate('/login');
      }
    }

    // Nếu đang ở trang gốc inventory, chuyển hướng đến trang đầu tiên (Books)
    if (location.pathname === '/inventory' || location.pathname === '/inventory/') {
      navigate('/inventory/books', { replace: true });
    }
  }, [user, navigate, location.pathname]);

  // Các hàm xử lý chung cho tất cả các bảng
  const handleEdit = (item) => {
    alert(`Đang sửa ${JSON.stringify(item, null, 2)}`);
  };

  const handleDelete = (id) => {
    alert(`Đang xóa mục có ID: ${id}`);
  };

  const handleView = (item) => {
    alert(`Xem chi tiết: ${JSON.stringify(item, null, 2)}`);
  };  // Render bảng dữ liệu tùy theo route
  const renderTable = () => {
    switch (route) {
      case "books":
        return <BookTable onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />;
      case "categories":
        return <CategoryTable onEdit={handleEdit} onDelete={handleDelete} />;
      case "imports":
        return <ImportTable onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />;
      case "profile":
        return <ProfilePage />;
      default:
        return null;
    }
  };
  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: 60, fontSize: 18 }}>Đang tải thông tin người dùng...</div>;
  }
  if (user.role_id !== 3) {
    return <div style={{ textAlign: 'center', marginTop: 60, fontSize: 18, color: '#d32f2f' }}>Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="dashboard">
      <Sidebar menuItems={inventoryMenuItems} onCollapse={handleSidebarCollapse} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Header
          title={pageTitle}
          showActions={showHeaderActions}
          userRole="Nhân viên thủ kho"
          sidebarCollapsed={sidebarCollapsed} // Thêm prop sidebarCollapsed vào Header
        />
        <div className="content-wrapper">
          <div className="dashboard-heading">
            <h2 className="dashboard-title"></h2>
          </div>
          {renderTable()}
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;