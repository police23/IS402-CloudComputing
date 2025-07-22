import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faListUl,
  faBuilding,
  faFileImport,
  faTruck,
  faFileInvoice,
  faTag,
  faChartBar,
  faCog,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import Sidebar from "../../components/common/Sidebar.jsx";
import Header from "../../components/common/Header.jsx";
import BookTable from "../../components/tables/BookTable.jsx";
import ImportTable from "../../components/tables/ImportTable.jsx";
import SupplierTable from "../../components/tables/SupplierTable.jsx";
import InvoiceTable from "../../components/tables/InvoiceTable.jsx";
import PromotionTable from "../../components/tables/PromotionTable.jsx";
import DamageReportTable from "../../components/tables/DamageReportTable.jsx";
import DamageReportDetailsModal from "../../components/modals/DamageReportDetailsModal.jsx";
import ReportStatistics from "../../pages/reports/ReportStatistics.jsx";
import RulesSettings from "../../components/rules/RulesSettings.jsx";
import AccountManagementPage from "../account-management/AccountManagementPage.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";  // Add .jsx extension
import "./Panel.css";
import "../../styles/SearchBar.css";

// Dữ liệu menu sidebar cho quản trị viên - có thể truy cập tất cả chức năng
const adminMenuItems = [
  {
    path: "books",
    label: "Đầu sách",
    icon: <FontAwesomeIcon icon={faBook} />,
    showActions: true,
  },
  {
    path: "imports",
    label: "Phiếu nhập sách",
    icon: <FontAwesomeIcon icon={faFileImport} />,
    showActions: true,
  },
  {
    path: "damage-reports",
    label: "Phiếu sách hỏng",
    icon: <FontAwesomeIcon icon={faListUl} />,
    showActions: true,
  },
  {
    path: "suppliers",
    label: "Nhà cung cấp",
    icon: <FontAwesomeIcon icon={faTruck} />,
    showActions: true,
  },
  {
    path: "invoices",
    label: "Bán hàng",
    icon: <FontAwesomeIcon icon={faFileInvoice} />,
    showActions: true,
  },
  {
    path: "promotions",
    label: "Khuyến mãi",
    icon: <FontAwesomeIcon icon={faTag} />,
    showActions: true,
  },
  {
    path: "reports",
    label: "Báo cáo/ Thống kê",
    icon: <FontAwesomeIcon icon={faChartBar} />,
    showActions: false,
  },
  {
    path: "rules",
    label: "Thay đổi quy định",
    icon: <FontAwesomeIcon icon={faCog} />,
    showActions: false,
  },
  {
    path: "accounts",
    label: "Quản lý tài khoản",
    icon: <FontAwesomeIcon icon={faUser} />,
    showActions: true,
  },
];

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  console.log("AdminDashboard rendering with path:", location.pathname);

  // Fix path handling to work with /admin prefix
  const currentPath = location.pathname;

  // Extract the relevant part of the path by removing the /admin prefix
  let routePath = currentPath;
  if (currentPath === "/admin" || currentPath === "/admin/") {
    routePath = "books";  // Default to books if at root admin path
  } else if (currentPath.startsWith("/admin/")) {
    routePath = currentPath.replace("/admin/", "");
  }

  console.log("Resolved routePath:", routePath);

  // Find the matching menu item based on the extracted path
  const currentMenuItem = adminMenuItems.find((item) =>
    location.pathname.startsWith("/admin/" + item.path)
  ) || adminMenuItems[0];
  const pageTitle = currentMenuItem?.label || "Dashboard";
  const showHeaderActions = currentMenuItem?.showActions || false;

  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login");
      navigate('/');
      return;
    }

    // Check for admin role
    if (user.role_id !== 1) {
      console.log("Not admin, redirecting");
      // Chuyển hướng đến dashboard tương ứng với vai trò
      if (user.role_id === 2) {
        navigate('/sales-dashboard');
      } else if (user.role_id === 3) {
        navigate('/inventory-dashboard');
      } else {
        navigate('/login');
      }
    }

    // Handle navigation at admin root
    if (currentPath === "/admin" || currentPath === "/admin/") {
      console.log("At admin root, redirecting to books");
      navigate('/admin/books');
    }
  }, [user, navigate, currentPath]);

  // Các hàm xử lý chung cho tất cả các bảng
  const handleEdit = (item) => {
    alert(`Đang sửa ${JSON.stringify(item, null, 2)}`);
  };

  const handleDelete = (id) => {
    alert(`Đang xóa mục có ID: ${id}`);
  };

  // Modal chi tiết phiếu hư hỏng
  const [showDamageDetails, setShowDamageDetails] = useState(false);
  const [selectedDamageReport, setSelectedDamageReport] = useState(null);

  const handleView = (item) => {
    setSelectedDamageReport(item);
    setShowDamageDetails(true);
  };

  const handlePrint = (item) => {
    alert(`In hóa đơn: ${JSON.stringify(item, null, 2)}`);
  };

  // Render bảng dữ liệu tùy theo trang hiện tại
  const renderTable = () => {
    // Remove leading slash for switch statement
    const route = routePath.replace(/^\//, "");

    console.log("Rendering table for route:", route);

    switch (route) {
      case "books":
        return <BookTable onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />;
      case "imports":
        return (
          <ImportTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        );
      case "damage-reports":
        return <DamageReportTable onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />;
      case "suppliers":
        return <SupplierTable onEdit={handleEdit} onDelete={handleDelete} />;
      case "invoices":
        return (
          <InvoiceTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onPrint={handlePrint}
          />
        );
      case "promotions":
        return (
          <PromotionTable
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        );
      case "reports":
        return <ReportStatistics />;
      case "rules":
        return <RulesSettings />;
      case "accounts":
        return <AccountManagementPage sidebarCollapsed={sidebarCollapsed} />;
      default:
        console.log("No matching route found for:", route);
        return <div>Không tìm thấy nội dung cho đường dẫn này.</div>;
    }
  };

  if (!user || user.role_id !== 1) {
    console.log("Not rendering AdminDashboard - no user or not admin");
    return null;
  }

  console.log("Rendering full AdminDashboard");

  return (
    <div className="dashboard">
      <Sidebar menuItems={adminMenuItems} onCollapse={setSidebarCollapsed} />

      <div className={`dashboard-content${sidebarCollapsed ? ' collapsed' : ''}`}>
        {routePath !== 'accounts' && (
          <Header
            title={pageTitle}
            userRole="Quản trị viên"
            sidebarCollapsed={sidebarCollapsed}
          />
        )}

        <div className="content-wrapper">
          <div className="dashboard-heading">
            <h2 className="dashboard-title"></h2>
          </div>

          {renderTable()}
        </div>
      </div>

      {/* Modal chi tiết phiếu hư hỏng */}
      {showDamageDetails && (
        <DamageReportDetailsModal
          isOpen={showDamageDetails}
          onClose={() => setShowDamageDetails(false)}
          damageReportData={selectedDamageReport}
        />
      )}
    </div>
  );
};

export default AdminDashboard;