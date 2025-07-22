import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes, faUser, faEnvelope,
  faPhone, faUserTag, faLock, faVenusMars
} from "@fortawesome/free-solid-svg-icons";
import "../modals/Modals.css";
import "./AccountForm.css";

const AccountForm = ({ account, onSave, onCancel }) => {
  // Schema validation với Formik và Yup
  const AccountSchema = Yup.object().shape({
    username: Yup.string()
      .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
      .max(20, "Tên đăng nhập không được vượt quá 20 ký tự")
      .matches(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới")
      .required("Tên đăng nhập là bắt buộc"),
    fullName: Yup.string()
      .min(2, "Họ và tên phải có ít nhất 2 ký tự")
      .max(50, "Họ và tên không được vượt quá 50 ký tự")
      .required("Họ và tên là bắt buộc"),
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Email là bắt buộc"),
    phone: Yup.string()
      .matches(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số")
      .required("Số điện thoại là bắt buộc"),
    gender: Yup.string()
      .oneOf(['male', 'female'], 'Vui lòng chọn giới tính')
      .required("Giới tính là bắt buộc"),
    role: Yup.string()
      .oneOf(["admin", "sales", "warehouse", "order_manager", "shipper", "end_user"], "Vui lòng chọn một vai trò")
      .required("Vai trò là bắt buộc"),
  });
  // Giá trị ban đầu của form
  const initialValues = {
    username: account ? account.username : "",
    fullName: account ? account.fullName : "",
    email: account ? account.email : "",
    phone: account ? account.phone : "",
    // Sửa: ánh xạ gender từ 0/1 sang "male"/"female" khi chỉnh sửa
    gender: account
      ? account.gender === 0 || account.gender === "0"
        ? "male"
        : account.gender === 1 || account.gender === "1"
          ? "female"
          : ""
      : "",
    // Map role_id sang value cho select
    role: account ? (
      account.role === 2 || account.role === "2" ? "sales" :
      account.role === 3 || account.role === "3" ? "warehouse" :
      account.role === 4 || account.role === "4" ? "end_user" :
      account.role === 5 || account.role === "5" ? "order_manager" :
      account.role === 6 || account.role === "6" ? "shipper" :
      "sales"
    ) : "sales",
    isNew: !account,
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'sales': return 'Nhân viên bán hàng';
      case 'warehouse': return 'Nhân viên thủ kho';
      default: return '';
    }
  };

  const modalContent = (
    <div className="accountform-modal-backdrop">
      <div className="accountform-modal-content">
        <div className="accountform-modal-header">          <h3>
            <FontAwesomeIcon
              icon={faUser}
              className="header-icon"
            />
            {account ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
          </h3>
          <button className="close-button" onClick={onCancel} aria-label="Đóng">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="accountform-modal-body">
          <Formik
            initialValues={initialValues}
            validationSchema={AccountSchema}            onSubmit={(values, { setSubmitting }) => {
              // Loại bỏ isNew trước khi gửi đi
              const { isNew, ...accountData } = values;
              // Map role sang role_id
              let role_id = 2;
              if (accountData.role === "sales") role_id = 2;
              else if (accountData.role === "warehouse") role_id = 3;
              else if (accountData.role === "end_user") role_id = 4;
              else if (accountData.role === "order_manager") role_id = 5;
              else if (accountData.role === "shipper") role_id = 6;
              // Map gender sang số
              let genderValue = 0;
              if (accountData.gender === "male" || accountData.gender === 0 || accountData.gender === "0") genderValue = 0;
              else if (accountData.gender === "female" || accountData.gender === 1 || accountData.gender === "1") genderValue = 1;
              const submitData = { ...accountData, role: role_id, gender: genderValue };
              console.log('DEBUG SUBMIT DATA:', submitData, 'Original role:', accountData.role);
              onSave(submitData);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting, errors, touched, values }) => (              <Form className="account-form">
                <div className="form-columns">
                  {/* Cột bên trái */}
                  <div className="form-column">
                    <div className="form-group">
                      <label htmlFor="username">
                        <FontAwesomeIcon icon={faUser} className="form-icon" />
                        Tên đăng nhập
                      </label>
                      <Field
                        type="text"
                        name="username"
                        id="username"
                        className={errors.username && touched.username ? "error" : ""}
                        disabled={account !== null} // Không cho phép sửa username nếu đang chỉnh sửa
                        placeholder="Nhập tên đăng nhập"
                      />
                      <ErrorMessage name="username" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="fullName">
                        <FontAwesomeIcon icon={faUser} className="form-icon" />
                        Họ và tên
                      </label>
                      <Field
                        type="text"
                        name="fullName"
                        id="fullName"
                        className={errors.fullName && touched.fullName ? "error" : ""}
                        placeholder="Nhập họ và tên"
                      />
                      <ErrorMessage name="fullName" component="div" className="error-message" />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">
                        <FontAwesomeIcon icon={faEnvelope} className="form-icon" />
                        Email
                      </label>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className={errors.email && touched.email ? "error" : ""}
                        placeholder="Nhập địa chỉ email"
                      />
                      <ErrorMessage name="email" component="div" className="error-message" />                    </div>

                   
                  </div>

                  {/* Cột bên phải */}
                  <div className="form-column">
                    <div className="form-group">
                      <label htmlFor="phone">
                        <FontAwesomeIcon icon={faPhone} className="form-icon" />
                        Số điện thoại
                      </label>
                      <Field
                        type="text"
                        name="phone"
                        id="phone"
                        className={errors.phone && touched.phone ? "error" : ""}
                        placeholder="Nhập số điện thoại"
                      />
                      <ErrorMessage name="phone" component="div" className="error-message" />
                    </div>                    <div className="form-group">
                      <label>
                        <FontAwesomeIcon icon={faVenusMars} className="form-icon" />
                        Giới tính
                      </label>                      <div className="gender-options">
                        <div className="radio-option">
                          <Field
                            type="radio"
                            name="gender"
                            value="male"
                            className="radio-input"
                            id="gender-male"
                          />
                          <label htmlFor="gender-male" className="radio-label">Nam</label>
                        </div>
                        <div className="radio-option">
                          <Field
                            type="radio"
                            name="gender"
                            value="female"
                            className="radio-input"
                            id="gender-female"
                          />
                          <label htmlFor="gender-female" className="radio-label">Nữ</label>
                        </div>
                      </div>
                      <ErrorMessage name="gender" component="div" className="error-message" />
                    </div>

                    <div className="form-group">                      <label htmlFor="role">
                        <FontAwesomeIcon icon={faUserTag} className="form-icon" />
                        Vai trò
                      </label>
                      <Field
                        as="select"
                        name="role"
                        id="role"
                        className={errors.role && touched.role ? "error" : ""}
                      >
                        <option value="" disabled>Chọn vai trò</option>
                        <option value="sales">Nhân viên bán hàng</option>
                        <option value="warehouse">Nhân viên thủ kho</option>
                        <option value="end_user">Người dùng cuối</option>
                        <option value="order_manager">Nhân viên quản lý đơn hàng</option>
                        <option value="shipper">Shipper</option>
                      </Field>
                      <ErrorMessage name="role" component="div" className="error-message" />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={onCancel}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="save-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang lưu..." : account ? "Cập nhật" : "Tạo tài khoản"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );

  // Sử dụng React Portal để render ngoài DOM thông thường
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default AccountForm;