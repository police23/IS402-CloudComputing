import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBuilding, faMapMarkerAlt, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import "../modals/Modals.css";
import "./SupplierForm.css";

const SupplierForm = ({ supplier, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
      });
    }
  }, [supplier]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên nhà cung cấp";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    const phoneRegex = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const modalContent = (
    <div className="supplier-modal-backdrop">
      <div className="supplier-modal-content">
        <div className="supplier-modal-header">
          <h3>
            <FontAwesomeIcon
              icon={faBuilding}
              className="supplier-modal-header-icon"
            />
            {supplier ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}
          </h3>
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="supplier-modal-body">
          <form onSubmit={handleSubmit} className="account-form">
            <div className="supplier-form-layout">
              {/* Cột bên trái */}
              <div className="supplier-form-column">
                <div className="form-group supplier-form-group">
                  <label htmlFor="name" className="supplier-form-label">
                    <FontAwesomeIcon icon={faBuilding} className="supplier-form-icon" />
                    Tên nhà cung cấp
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? "error" : ""}
                    placeholder="Nhập tên nhà cung cấp"
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="form-group supplier-form-group">
                  <label htmlFor="phone" className="supplier-form-label">
                    <FontAwesomeIcon icon={faPhone} className="supplier-form-icon" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "error" : ""}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && <div className="error-message">{errors.phone}</div>}
                </div>
              </div>

              {/* Cột bên phải */}
              <div className="supplier-form-column">
                <div className="form-group supplier-form-group">
                  <label htmlFor="email" className="supplier-form-label">
                    <FontAwesomeIcon icon={faEnvelope} className="supplier-form-icon" />
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "error" : ""}
                    placeholder="Nhập địa chỉ email"
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-group supplier-form-group">
                  <label htmlFor="address" className="supplier-form-label">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="supplier-form-icon" />
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? "error" : ""}
                    placeholder="Nhập địa chỉ"
                  />
                  {errors.address && <div className="error-message">{errors.address}</div>}
                </div>
              </div>
            </div>

            <div className="form-actions supplier-form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="save-button"
              >
                {supplier ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default SupplierForm;