import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import OrderTable from "../../components/tables/OrderTable";
import ProfilePage from "../profile/ProfilePage";
import { useAuth } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

const orderManagerMenuItems = [
  {
    path: "orders",
    label: "Quản lý đơn hàng",
    icon: <i className="fa fa-shopping-cart"></i>,
    showActions: true,
  },

  {
    path: "profile",
    label: "Thông tin tài khoản",
    icon: <i className="fa fa-user"></i>,
    showActions: false,
  }
];

const orderManagerTabs = [
  {
    key: "processing",
    label: "Đơn hàng chờ xử lý",
    icon: <i className="fa fa-hourglass-half"></i>,
  },
  {
    key: "confirmed",
    label: "Đơn hàng chờ giao",
    icon: <i className="fa fa-check-circle"></i>,
  },
  {
    key: "delivering",
    label: "Đơn hàng đang giao",
    icon: <i className="fa fa-motorcycle"></i>,
  },
  {
    key: "delivered",
    label: "Đơn hàng đã giao",
    icon: <i className="fa fa-truck"></i>,
  },
];

const OrderManagementDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("processing");

  // Lấy route hiện tại
  const route = location.pathname.split('/').pop() || "orders";
  const currentMenuItem =
    orderManagerMenuItems.find((item) => item.path === route) || orderManagerMenuItems[0];
  const pageTitle = currentMenuItem.label;
  const showHeaderActions = currentMenuItem.showActions;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Chỉ cho phép nhân viên xử lý đơn hàng (role_id === 5)
    if (user.role_id !== 5) {
      navigate('/login');
    }
    if (location.pathname === '/order-manager' || location.pathname === '/order-manager/') {
      navigate('/order-manager/orders', { replace: true });
    }
  }, [user, navigate, location.pathname]);

  // Render bảng dữ liệu tùy theo route
  const renderTable = () => {
    if (route === "profile") {
      return <ProfilePage />;
    }
    switch (activeTab) {
      case "processing":
        return <OrderTable type="processing" />;
      case "confirmed":
        return <OrderTable type="confirmed" />;
      case "delivering":
        return <OrderTable type="delivering" />;
      case "delivered":
        return <OrderTable type="delivered" />;
      default:
        return null;
    }
  };

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: 60, fontSize: 18 }}>Đang tải thông tin người dùng...</div>;
  }
  if (user.role_id !== 5) {
    return <div style={{ textAlign: 'center', marginTop: 60, fontSize: 18, color: '#d32f2f' }}>Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="dashboard">
      <Sidebar menuItems={orderManagerMenuItems} onCollapse={setSidebarCollapsed} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Header
          title={pageTitle}
          showActions={showHeaderActions}
          userRole="Nhân viên xử lý đơn hàng"
          sidebarCollapsed={sidebarCollapsed}
        />
        <div className="content-wrapper">
          <div className="dashboard-heading">
            <h2 className="dashboard-title"></h2>
          </div>
          {/* Tabs cho quản lý đơn hàng */}
          {route === "orders" && (
            <div className="order-tabs">
              {orderManagerTabs.map(tab => (
                <button
                  key={tab.key}
                  className={`order-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          )}
          {route === "orders" ? renderTable() : renderTable()}
        </div>
      </div>
    </div>
  );
};

export default OrderManagementDashboard; 