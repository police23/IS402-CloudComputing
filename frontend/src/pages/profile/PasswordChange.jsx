import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faKey, faSpinner, faCheck, faTimes, faEye, faEyeSlash 
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import './PasswordChange.css';

const PasswordChange = ({ user, onNotification, onCancel }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [passwordChanging, setPasswordChanging] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ""
  });
  const [showPasswordFields, setShowPasswordFields] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false
  });

  const validatePassword = (password) => {
    if (!password) return { valid: false, message: "Mật khẩu không được để trống" };
    if (password.length < 8) return { valid: false, message: "Mật khẩu phải có ít nhất 8 ký tự" };
    if (!password.match(/[a-zA-Z]/)) return { valid: false, message: "Mật khẩu phải chứa ít nhất một chữ cái" };
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
      valid: true,
      score: strength,
      message
    };
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    if (passwordErrors[name]) {
      setPasswordErrors({
        ...passwordErrors,
        [name]: ""
      });
    }
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
    
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL;
      await axios.post(`${API_BASE}/users/${user.id}/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      onNotification("Mật khẩu đã được thay đổi thành công!", "success");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPasswordStrength({ score: 0, message: "" });
    } catch (err) {
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
          onNotification("Mật khẩu cũ không đúng", "error");
        } else if (err.response.data && err.response.data.error) {
          onNotification(`Lỗi: ${err.response.data.error}`, "error");
        } else {
          onNotification("Không thể thay đổi mật khẩu. Vui lòng thử lại sau.", "error");
        }
      } else {
        onNotification("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.", "error");
      }
    } finally {
      setPasswordChanging(false);
    }
  };

  const togglePasswordField = (field) => {
    setShowPasswordFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleResetForm = () => {
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
    if (onCancel) onCancel();
  };

  return (
    <div className="password-tab-content">
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
              onClick={handleResetForm}
              disabled={passwordChanging}
            >
              <FontAwesomeIcon icon={faTimes} /> Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChange; 