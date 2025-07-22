import React, { useEffect, useState } from "react";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import OrderTable from "../../components/tables/OrderTable";
import ShipperTable from "../../components/tables/ShipperTable";
import ProfilePage from "../profile/ProfilePage";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./ShipperPanel.css";

const shipperMenuItems = [
  {
    path: "orders",
    label: "Đơn hàng của tôi",
    icon: <i className="fa fa-motorcycle"></i>,
    showActions: true,
  },
  {
    path: "profile",
    label: "Thông tin tài khoản",
    icon: <i className="fa fa-user"></i>,
    showActions: false,
  }
];

const shipperTabs = [
  {
    key: "delivering",
    label: "Đơn đang giao",
    icon: <i className="fa fa-truck"></i>,
  },
  {
    key: "delivered",
    label: "Đơn đã giao",
    icon: <i className="fa fa-check-circle"></i>,
  },
];

const ShipperDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("delivering");

  // Lấy route hiện tại
  const route = location.pathname.split('/').pop() || "orders";
  const currentMenuItem =
    shipperMenuItems.find((item) => item.path === route) || shipperMenuItems[0];
  const pageTitle = currentMenuItem.label;
  const showHeaderActions = currentMenuItem.showActions;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Chỉ cho phép shipper
    if (user.role_id !== 6) {
      navigate('/login');
    }
    if (location.pathname === '/shipper' || location.pathname === '/shipper/') {
      navigate('/shipper/orders', { replace: true });
    }
  }, [user, navigate, location.pathname]);

  // Render bảng dữ liệu tùy theo tab
  const renderTable = () => {
    if (route === "profile") {
      return <ProfilePage />;
    }
    if (route === "orders") {
      switch (activeTab) {
        case "delivering":
          return <ShipperTable type="delivering" />;
        case "delivered":
          return <ShipperTable type="delivered" />;
        default:
          return null;
      }
    }
    return null;
  };

  if (!user) {
    return <div style={{ textAlign: 'center', marginTop: 60, fontSize: 18 }}>Đang tải thông tin người dùng...</div>;
  }
  if (user.role_id !== 6) {
    return <div style={{ textAlign: 'center', marginTop: 60, fontSize: 18, color: '#d32f2f' }}>Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="dashboard">
      <Sidebar menuItems={shipperMenuItems} onCollapse={setSidebarCollapsed} />
      <div className={`dashboard-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Header
          title={pageTitle}
          showActions={showHeaderActions}
          userRole="Shipper"
          sidebarCollapsed={sidebarCollapsed}
        />
        <div className="content-wrapper">
          <div className="dashboard-heading">
            <h2 className="dashboard-title"></h2>
          </div>
          {/* Tabs cho shipper */}
          {route === "orders" && (
            <div className="order-tabs">
              {shipperTabs.map(tab => (
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
          {renderTable()}
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboard;
