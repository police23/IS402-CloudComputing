import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faMapMarkerAlt, faKey } from "@fortawesome/free-solid-svg-icons";
import "./TabNavigation.css";

const TabNavigation = ({ activeTab, setActiveTab }) => (
  <div className="tab-navigation">
    <button 
      className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
      onClick={() => setActiveTab('profile')}
    >
      <FontAwesomeIcon icon={faEdit} />
      <span>Thông tin tài khoản</span>
    </button>
    <button 
      className={`tab-button ${activeTab === 'address' ? 'active' : ''}`}
      onClick={() => setActiveTab('address')}
    >
      <FontAwesomeIcon icon={faMapMarkerAlt} />
      <span>Địa chỉ giao hàng</span>
    </button>
    <button 
      className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
      onClick={() => setActiveTab('password')}
    >
      <FontAwesomeIcon icon={faKey} />
      <span>Đổi mật khẩu</span>
    </button>
  </div>
);

export default TabNavigation;
