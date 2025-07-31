import React, { useState } from "react";
import OrderTable from "../../components/tables/OrderTable";
import "./OrderManagementPage.css";

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

const OrderManagementPage = () => {
  const [activeTab, setActiveTab] = useState("processing");

  const renderTable = () => {
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

  return (
    <div className="order-management-page">
      <h2 className="order-management-title">Quản lý đơn hàng</h2>
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
      {renderTable()}
    </div>
  );
};

export default OrderManagementPage;
