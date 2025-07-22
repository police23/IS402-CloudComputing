import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import PublicHeader from '../../components/common/PublicHeader';
import AddressManagement from '../../components/address/AddressManagement';
import PasswordChange from '../../components/password/PasswordChange';
import "./AccountPage.css";
import "../../styles/global-buttons.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEdit, faCheck, faTimes, faKey, faSpinner, faExclamationCircle, faMapMarkerAlt, faTruck, faClipboardList
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import AccountTable from '../../components/tables/AccountTable';

const AccountPage = () => {
  const { user } = useAuth();
  console.log('DEBUG user:', user);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
    gender: null
  });

  const [notification, setNotification] = useState({ message: "", type: "" });

  // Tab management state
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'address', 'password', 'order_manager', 'shipper'

  // Address management states - removed local state since it's now managed by API

  const formatUserData = (user) => {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: (user.gender === 0 || user.gender === 1) ? Number(user.gender) : null,
      role_id: user.role_id,
      is_active: user.is_active,
      created_at: user.created_at || null,
    };
  };

  // Hàm lấy tên vai trò từ role_id
  const getRoleLabel = (roleId) => {
    switch (roleId) {
      case 1: return "Admin";
      case 2: return "Nhân viên bán hàng";
      case 3: return "Nhân viên kho";
      case 4: return "Người dùng cuối";
      case 5: return "Nhân viên quản lý đơn hàng";
      case 6: return "Shipper";
      default: return "Khách hàng";
    }
  };


  const fetchUserData = async () => {
    if (!user || !user.id) return;
    setLoading(true);
    setError(null);
    try {
      let response;
      try {
        response = await axios.get(`http://localhost:5000/api/users/${user.id}`);
      } catch (localErr) {
        response = await axios.get(`/api/users/${user.id}`);
      }
      const rawUserData = response.data;
      const userData = formatUserData(rawUserData);
      setProfileData({
        username: userData.username || user.username,
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        gender: userData.gender,
        created_at: userData.created_at
      });
    } catch (err) {
      let errorMessage = "Không thể tải thông tin người dùng. ";
      if (err.response) {
        errorMessage += `Lỗi ${err.response.status}: ${err.response.data?.error || 'Lỗi không xác định'}`;
      } else if (err.request) {
        errorMessage += "Không nhận được phản hồi từ máy chủ.";
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
      if (user) {
        const formattedUser = formatUserData(user);
        setProfileData({
          username: formattedUser.username,
          full_name: formattedUser.full_name,
          email: formattedUser.email,
          phone: formattedUser.phone,
          gender: formattedUser.gender,
          created_at: formattedUser.created_at
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleEditToggle = () => {
    setEditing(!editing);
    if (editing) {
      fetchUserData();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return faCheck;
      case "error":
        return faExclamationCircle;
      default:
        return faCheck;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) return;
    setSaving(true);
    setError(null);
    try {
      const genderValue = profileData.gender !== null && profileData.gender !== undefined 
        ? Number(profileData.gender) 
        : 0;
      const updateData = {
        username: profileData.username,
        fullName: profileData.full_name,
        email: profileData.email,
        phone: profileData.phone,
        gender: genderValue,
        role: user.role_id === 1 ? 'admin' : 
              user.role_id === 2 ? 'sales' : 
              user.role_id === 3 ? 'warehouse' : 'sales',
        is_active: 1
      };
      try {
        await axios.put(`http://localhost:5000/api/users/${user.id}`, updateData);
      } catch (localErr) {
        if (localErr.response && localErr.response.data && localErr.response.data.error) {
          throw localErr;
        }
        await axios.put(`/api/users/${user.id}`, updateData);
      }
      setNotification({ message: "Thông tin đã được cập nhật thành công!", type: "success" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      setEditing(false);
      fetchUserData();
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        const errorMessage = err.response.data.error;
        setError(`${errorMessage}`);
        setNotification({ message: `${errorMessage}`, type: "error" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      } else {
        setError("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
        setNotification({ message: "Không thể cập nhật thông tin. Vui lòng thử lại sau.", type: "error" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      }
    } finally {
      setSaving(false);
    }
  };

    const handleNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  if (!user) {
    return <div className="loading-text">Đang tải thông tin người dùng...</div>;
  }

  return (
    <div className="profile-container">
      <PublicHeader />
      {notification.message && (
        <div className={`notification ${notification.type === "error" ? "error" : ""}`}>
          <FontAwesomeIcon 
            icon={getNotificationIcon(notification.type)} 
            style={{ marginRight: "8px" }} 
          />
          <span className="notification-message">{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => setNotification({ message: "", type: "" })}
            aria-label="Đóng thông báo"
          >
            &times;
          </button>
          <div className="progress-bar"></div>
        </div>
      )}
      
      <div className="profile-header">
        <h2>Quản lý tài khoản</h2>
        {!editing && !loading && activeTab === 'profile' && (
          <button 
            className="profile-edit-btn btn btn-edit"
            onClick={handleEditToggle}
            title="Chỉnh sửa thông tin"
          >
            <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
          </button>
        )}
      </div>

      {/* Tab Navigation */}
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
      
      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationCircle} style={{ marginRight: "8px" }} />
          {error}
        </div>
      )}
      
      <div className="profile-card">
        {activeTab === 'profile' && (
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="role-badge">
            {getRoleLabel(user.role_id)}
          </span>
        </div>
        )}

        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="lg" /> 
            <span>Đang tải thông tin tài khoản...</span>
          </div>
        ) : (
          <>
            {/* Profile Tab Content */}
            {activeTab === 'profile' && (
              <div className="profile-details">
                <form onSubmit={handleSubmit}>
                  <div className="profile-form-columns">
                    <div className="profile-form-column">
                      <div className="form-row">
                        <label>Username:</label>
                        {editing ? (
                          <input
                            type="text"
                            name="username"
                            value={profileData.username || user.username}
                            onChange={handleChange}
                            required
                          />
                        ) : (
                          <span>{profileData.username || user.username || "Chưa cập nhật"}</span>
                        )}
                      </div>
                      
                      <div className="form-row">
                        <label>Số điện thoại:</label>
                        {editing ? (
                          <input
                            type="text"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleChange}
                          />
                        ) : (
                          <span>{profileData.phone || "Chưa cập nhật"}</span>
                        )}
                      </div>

                      <div className="form-row">
                        <label>Email:</label>
                        {editing ? (
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleChange}
                            required
                          />
                        ) : (
                          <span>{profileData.email || "Chưa cập nhật"}</span>
                        )}
                      </div>
                    </div>

                    <div className="profile-form-column">
                      <div className="form-row">
                        <label>Họ và tên:</label>
                        <span>{profileData.full_name || "Chưa cập nhật"}</span>
                      </div>

                      <div className="form-row">
                        <label>Giới tính:</label>
                        {editing ? (
                          <select 
                            name="gender" 
                            value={profileData.gender !== null && profileData.gender !== undefined ? profileData.gender : ""} 
                            onChange={handleChange}
                            required
                          >
                            <option value="">Chọn giới tính</option>
                            <option value="0">Nam</option>
                            <option value="1">Nữ</option>
                          </select>
                        ) : (
                          <span>
                            {profileData.gender === 0 ? "Nam" : 
                             profileData.gender === 1 ? "Nữ" : "Chưa cập nhật"}
                          </span>
                        )}
                      </div>

                      <div className="form-row">
                        <label>Ngày tạo:</label>
                        <span>
                          {profileData.created_at ? new Date(profileData.created_at).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : "Không có dữ liệu"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {editing && (
                    <div className="profile-actions">
                      <button type="submit" className="save-btn btn btn-add" disabled={saving}>
                        {saving ? (
                          <>
                            <FontAwesomeIcon icon={faSpinner} spin /> Đang lưu...
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCheck} /> Lưu
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        className="cancel-btn btn" 
                        onClick={handleEditToggle}
                        disabled={saving}
                      >
                        <FontAwesomeIcon icon={faTimes} /> Hủy
                      </button>
                    </div>
                  )}
                </form>

              </div>
            )}

            {/* Address Tab Content */}
            {activeTab === 'address' && (
              <AddressManagement 
                onNotification={handleNotification}
              />
            )}

            {/* Password Tab Content */}
            {activeTab === 'password' && (
              <PasswordChange 
                user={user}
                onNotification={handleNotification}
              />
            )}
          </>
        )}
      </div>


    </div>
  );
};

export default AccountPage; 