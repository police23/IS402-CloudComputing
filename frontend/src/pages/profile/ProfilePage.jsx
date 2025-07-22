import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import "./ProfilePage.css";
import "../../styles/global-buttons.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEdit, 
  faCheck, 
  faTimes, 
  faKey, 
  faSpinner, 
  faExclamationCircle,
  faEye,           // Thêm icon con mắt
  faEyeSlash       // Thêm icon con mắt đóng
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const ProfilePage = () => {
  const { user } = useAuth();
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
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordChanging, setPasswordChanging] = useState(false);

  // Add notification state
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Add these states for password validation
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  // Remove or keep the password strength state but don't display it
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ""
  });

  // Format user data consistently (moved from backend userService.js)
  const formatUserData = (user) => {
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name || "", // Default to empty string if null
      email: user.email || "",
      phone: user.phone || "",
      // Ensure gender is a number (0 or 1) or null if not set/invalid
      gender: (user.gender === 0 || user.gender === 1) ? Number(user.gender) : null,
      role_id: user.role_id,
      is_active: user.is_active,
      created_at: user.created_at || null, // Thêm ngày tạo
    };
  };
  
  // Password validation function
  const validatePassword = (password) => {
    if (!password) return { valid: false, message: "Mật khẩu không được để trống" };
    if (password.length < 8) return { valid: false, message: "Mật khẩu phải có ít nhất 8 ký tự" };
    
    // Kiểm tra có ít nhất một chữ cái
    if (!password.match(/[a-zA-Z]/)) return { valid: false, message: "Mật khẩu phải chứa ít nhất một chữ cái" };
    
    // Kiểm tra có ít nhất một chữ số
    if (!password.match(/\d/)) return { valid: false, message: "Mật khẩu phải chứa ít nhất một chữ số" };

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^a-zA-Z\d]/)) strength += 1;

    let message = "";
    if (strength === 1) message = "Yếu";
    else if (strength === 2) message = "Trung bình";
    else if (strength === 3) message = "Khá";
    else if (strength === 4) message = "Mạnh";

    return {
      valid: true, // Nếu đã qua các kiểm tra ở trên, mật khẩu hợp lệ
      score: strength,
      message
    };
  };

  // Fetch user data from database with better error handling
  const fetchUserData = async () => {
    if (!user || !user.id) return;
    
    setLoading(true);
    setError(null);
    
    try {      
      // Try with and without localhost prefix
      let response;
      try {
        // First try with localhost URL
        response = await axios.get(`http://localhost:5000/api/users/${user.id}`);
      } catch (localErr) {
        // If that fails, try relative URL
        response = await axios.get(`/api/users/${user.id}`);
      }
        const rawUserData = response.data;
      
      // Format user data using the helper function
      const userData = formatUserData(rawUserData);
        // Update state with the received data
      setProfileData({
        username: userData.username || user.username,
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        gender: userData.gender,
        created_at: userData.created_at
      });
    } catch (err) {
      // Error handling
      
      // More detailed error message
      let errorMessage = "Không thể tải thông tin người dùng. ";
      if (err.response) {
        errorMessage += `Lỗi ${err.response.status}: ${err.response.data?.error || 'Lỗi không xác định'}`;
      } else if (err.request) {
        errorMessage += "Không nhận được phản hồi từ máy chủ.";
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
        // Fallback to context data if API fails
      if (user) {
        // Format user data from context using the helper function
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
    // Reset to original data if canceling edit
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

  // Helper function to get notification icon
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
      // Ensure gender is a number
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
        is_active: 1 // Keep active
      };
      try {
        const response = await axios.put(`http://localhost:5000/api/users/${user.id}`, updateData);
      } catch (localErr) {
        // Nếu lỗi từ localhost có chứa thông báo cụ thể, ném lỗi đó ra
        if (localErr.response && localErr.response.data && localErr.response.data.error) {
          throw localErr;
        }
        // Nếu không, thử endpoint tương đối
        const response = await axios.put(`/api/users/${user.id}`, updateData);
      }
      setNotification({ message: "Thông tin đã được cập nhật thành công!", type: "success" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      
      setEditing(false);
      
      // Refresh user data
      fetchUserData();
    } catch (err) {
      // Handle error
      console.log("Error caught:", err); // Debug log
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    
    // Clear errors when the user types
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: ""
      });
    }
    
    // Validate new password on change
    if (name === "newPassword") {
      const validation = validatePassword(value);
      setPasswordStrength({
        score: validation.score || 0,
        message: validation.message || ""
      });
      
      if (value && !validation.valid) {
        setPasswordErrors({
          ...passwordErrors,
          newPassword: "Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số"
        });
      }
      
      // Check if it matches confirmation if that exists
      if (passwordData.confirmNewPassword && value !== passwordData.confirmNewPassword) {
        setPasswordErrors(prev => ({
          ...prev,
          confirmNewPassword: "Mật khẩu xác nhận không khớp"
        }));
      } else if (passwordData.confirmNewPassword) {
        setPasswordErrors(prev => ({
          ...prev,
          confirmNewPassword: ""
        }));
      }
    }
    
    // Check confirmation matches on change
    if (name === "confirmNewPassword") {
      if (value && value !== passwordData.newPassword) {
        setPasswordErrors({
          ...passwordErrors,
          confirmNewPassword: "Mật khẩu xác nhận không khớp"
        });
      } else {
        setPasswordErrors({
          ...passwordErrors,
          confirmNewPassword: ""
        });
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.id) return;

    // Validate form before submission
    let hasErrors = false;
    const newErrors = { ...passwordErrors };
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
      hasErrors = true;
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
      hasErrors = true;
    } else {
      const validation = validatePassword(passwordData.newPassword);
      if (!validation.valid) {
        newErrors.newPassword = "Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số";
        hasErrors = true;
      }
    }
    
    if (!passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Vui lòng xác nhận mật khẩu mới";
      hasErrors = true;
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = "Mật khẩu xác nhận không khớp";
      hasErrors = true;
    }
    
    setPasswordErrors(newErrors);
    if (hasErrors) return;

    setPasswordChanging(true);
    setError(null);
    setNotification({ message: "", type: "" });

    try {      // Send password change request
      
      // Thêm thử cả hai cách gọi API
      try {
        // Thử với localhost trước
        await axios.post(`http://localhost:5000/api/users/${user.id}/change-password`, {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
      } catch (localErr) {
        // Nếu lỗi trả về từ localhost là sai mật khẩu, bắt luôn ở đây
        if (
          localErr.response &&
          (localErr.response.status === 401 ||
            (localErr.response.data &&
              typeof localErr.response.data.error === "string" &&
              (
                localErr.response.data.error.toLowerCase().includes("incorrect") ||
                localErr.response.data.error.toLowerCase().includes("wrong") ||
                localErr.response.data.error.toLowerCase().includes("mật khẩu") ||
                localErr.response.data.error.toLowerCase().includes("không đúng") ||
                localErr.response.data.error.toLowerCase().includes("sai")
              )
            )
          )
        ) {
          setPasswordErrors({
            ...passwordErrors,
            currentPassword: "Mật khẩu cũ không đúng"
          });
          setNotification({
            message: "Mật khẩu cũ không đúng",
            type: "error"
          });
          setTimeout(() => setNotification({ message: "", type: "" }), 5000);
          setPasswordChanging(false);
          return;
        }
        // Nếu không phải lỗi sai mật khẩu, thử tiếp endpoint tương đối
        await axios.post(`/api/users/${user.id}/change-password`, {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
      }
      
      setNotification({ message: "Mật khẩu đã được thay đổi thành công!", type: "success" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      
      setShowPasswordChange(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordStrength({ score: 0, message: "" });
    } catch (err) {
      // Handle password change error
      
      if (err.response) {
        if (
          err.response.status === 401 ||
          (err.response.data &&
            typeof err.response.data.error === "string" &&
            (
              err.response.data.error.toLowerCase().includes("incorrect") ||
              err.response.data.error.toLowerCase().includes("wrong") ||
              err.response.data.error.toLowerCase().includes("mật khẩu") ||
              err.response.data.error.toLowerCase().includes("không đúng") ||
              err.response.data.error.toLowerCase().includes("sai")
            )
          )
        ) {
          setPasswordErrors({
            ...passwordErrors,
            currentPassword: "Mật khẩu cũ không đúng"
          });
          setNotification({
            message: "Mật khẩu cũ không đúng",
            type: "error"
          });
        } else if (err.response.data && err.response.data.error) {
          setNotification({
            message: `Lỗi: ${err.response.data.error}`,
            type: "error"
          });
        } else {
          setNotification({
            message: "Không thể thay đổi mật khẩu. Vui lòng thử lại sau.",
            type: "error"
          });
        }
      } else {
        setNotification({
          message: "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.",
          type: "error"
        });
      }
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } finally {
      setPasswordChanging(false);
    }
  };

  // Thêm state để quản lý hiển thị/ẩn mật khẩu cho từng trường
  const [showPasswordFields, setShowPasswordFields] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });

  // Hàm toggle hiển thị/ẩn mật khẩu
  const togglePasswordField = (field) => {
    setShowPasswordFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
      default: return "Nhân viên";
    }
  };

  if (!user) {
    return <div className="loading-text">Đang tải thông tin người dùng...</div>;
  }

  return (
    <div className="profile-container">
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
        <h2>Thông tin tài khoản</h2>
        {!editing && !showPasswordChange && !loading && (
          <button 
            className="profile-edit-btn btn btn-edit"
            onClick={handleEditToggle}
            title="Chỉnh sửa thông tin"
          >
            <FontAwesomeIcon icon={faEdit} /> Chỉnh sửa
          </button>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          <FontAwesomeIcon icon={faExclamationCircle} style={{ marginRight: "8px" }} />
          {error}
        </div>
      )}
      
      <div className="profile-card">
        <div className="profile-avatar-section" style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 18}}>
          <div className="profile-avatar">
            {profileData.full_name ? profileData.full_name.charAt(0).toUpperCase() : "U"}
          </div>
          <span className="role-badge">
            {getRoleLabel(user.role_id)}
          </span>
        </div>
        {loading ? (
          <div className="loading-container">
            <FontAwesomeIcon icon={faSpinner} spin size="lg" /> 
            <span>Đang tải thông tin tài khoản...</span>
          </div>
        ) : !showPasswordChange ? (
          <div className="profile-details">
            <form onSubmit={handleSubmit} style={{width: '100%'}}>
              <div className="profile-form-columns">
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
                  <label>Họ và tên:</label>
                  <span>{profileData.full_name || "Chưa cập nhật"}</span>
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
            {!editing && (
              <div className="change-password-section">
                <button 
                  className="change-password-btn btn btn-edit"
                  onClick={() => setShowPasswordChange(true)}
                >
                  <FontAwesomeIcon icon={faKey} /> Đổi mật khẩu
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="password-change-form">
            <h3>
              <FontAwesomeIcon icon={faKey} style={{ marginRight: "10px", color: "#4A7CAE" }} />
              Đổi mật khẩu
            </h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-row">
                <label>Mật khẩu hiện tại:</label>
                <div className="password-input-container">
                  <input
                    type={showPasswordFields.currentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.currentPassword ? "error" : ""}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => togglePasswordField("currentPassword")}
                    aria-label={showPasswordFields.currentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <FontAwesomeIcon icon={showPasswordFields.currentPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <div className="input-error-message">{passwordErrors.currentPassword}</div>
                )}
              </div>

              <div className="form-row">
                <label>Mật khẩu mới:</label>
                <div className="password-input-container">
                  <input
                    type={showPasswordFields.newPassword ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.newPassword ? "error" : ""}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => togglePasswordField("newPassword")}
                    aria-label={showPasswordFields.newPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <FontAwesomeIcon icon={showPasswordFields.newPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <div className="input-error-message">{passwordErrors.newPassword}</div>
                )}
              </div>

              <div className="form-row">
                <label>Xác nhận mật khẩu mới:</label>
                <div className="password-input-container">
                  <input
                    type={showPasswordFields.confirmNewPassword ? "text" : "password"}
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className={passwordErrors.confirmNewPassword ? "error" : ""}
                    required
                  />
                  <button 
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => togglePasswordField("confirmNewPassword")}
                    aria-label={showPasswordFields.confirmNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <FontAwesomeIcon icon={showPasswordFields.confirmNewPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
                {passwordErrors.confirmNewPassword && (
                  <div className="input-error-message">{passwordErrors.confirmNewPassword}</div>
                )}
              </div>

              <div className="profile-actions">
                <button type="submit" className="save-btn btn btn-add" disabled={passwordChanging}>
                  {passwordChanging ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...
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
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmNewPassword: "",
                    });
                    setPasswordErrors({
                      currentPassword: "",
                      newPassword: "",
                      confirmNewPassword: ""
                    });
                    setPasswordStrength({ score: 0, message: "" });
                  }}
                  disabled={passwordChanging}
                >
                  <FontAwesomeIcon icon={faTimes} /> Hủy
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;