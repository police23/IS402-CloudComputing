import React, { useState } from 'react';
import Header from '../../components/common/Header';
import AccountTable from '../../components/tables/AccountTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCog, faUsers, faUserShield, faBoxOpen, faClipboardList, faTruck
} from '@fortawesome/free-solid-svg-icons';
import './AccountManagementPage.css';

const AccountManagementPage = ({ sidebarCollapsed = false }) => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="accounts-page">
      <Header
        title="Quản lý tài khoản"
        showActions={false}
        userRole="Quản trị viên"
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Thêm wrapper để căn giữa và tránh tràn */}
      <div className="account-content-wrapper">
        <div className="account-content">
          {/* Tab điều hướng phụ */}
          <div className="account-tabs">
            <button
              className={`account-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <FontAwesomeIcon icon={faUsers} />
              <span>Tất cả tài khoản</span>
            </button>
            <button
              className={`account-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              <FontAwesomeIcon icon={faUserShield} />
              <span>Quản trị viên</span>
            </button>
            <button
              className={`account-tab ${activeTab === 'sales' ? 'active' : ''}`}
              onClick={() => setActiveTab('sales')}
            >
              <FontAwesomeIcon icon={faUserCog} />
              <span>Nhân viên bán hàng</span>
            </button>
            <button
              className={`account-tab ${activeTab === 'warehouse' ? 'active' : ''}`}
              onClick={() => setActiveTab('warehouse')}
            >
              <FontAwesomeIcon icon={faBoxOpen} />
              <span>Nhân viên thủ kho</span>
            </button>
            <button
              className={`account-tab ${activeTab === 'order_manager' ? 'active' : ''}`}
              onClick={() => setActiveTab('order_manager')}
            >
              <FontAwesomeIcon icon={faClipboardList} />
              <span>Nhân viên QL đơn hàng</span>
            </button>
            <button
              className={`account-tab ${activeTab === 'shipper' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipper')}
            >
              <FontAwesomeIcon icon={faTruck} />
              <span>Shipper</span>
            </button>
            <button
              className={`account-tab ${activeTab === 'end_user' ? 'active' : ''}`}
              onClick={() => setActiveTab('end_user')}
            >
              <FontAwesomeIcon icon={faUserCog} />
              <span>Người dùng cuối</span>
            </button>
          </div>

          {/* Bảng dữ liệu */}
          <AccountTable initialFilterRole={activeTab !== 'all' ? activeTab : 'all'} />
        </div>
      </div>
    </div>
  );
};

export default AccountManagementPage; 