
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBoxOpen, faBook, faTrash, faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import "../modals/Modals.css";
import "./DamageReportForm.css";

const DamageReportForm = ({ onSubmit, onClose, books = [], users = [] }) => {
  const [formData, setFormData] = useState({
    createdBy: "",
    note: "",
    damagedBooks: [
      { bookId: "", quantity: 1, reason: "" }
    ]
  });
  const [errors, setErrors] = useState({});

  // Lấy user hiện tại từ localStorage (nếu có)
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.id) {
        setCurrentUser(user);
        setFormData(prev => ({ ...prev, createdBy: user.id }));
      }
    } catch {}
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleBookChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      damagedBooks: prev.damagedBooks.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddBook = () => {
    setFormData(prev => ({
      ...prev,
      damagedBooks: [...prev.damagedBooks, { bookId: "", quantity: 1, reason: "" }]
    }));
  };

  const handleRemoveBook = (index) => {
    setFormData(prev => ({
      ...prev,
      damagedBooks: prev.damagedBooks.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.createdBy) newErrors.createdBy = "Vui lòng chọn người lập phiếu";
    if (formData.damagedBooks.length === 0) newErrors.damagedBooks = "Vui lòng thêm ít nhất một sách";
    formData.damagedBooks.forEach((item, idx) => {
      if (!item.bookId) newErrors[`damagedBooks_${idx}_bookId`] = "Chọn sách";
      if (!item.quantity || parseInt(item.quantity) <= 0) newErrors[`damagedBooks_${idx}_quantity`] = "Số lượng > 0";
      if (!item.reason || item.reason.trim() === "") newErrors[`damagedBooks_${idx}_reason`] = "Nhập lý do";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        ...formData,
        damagedBooks: formData.damagedBooks.map(item => ({
          bookId: item.bookId,
          quantity: parseInt(item.quantity),
          reason: item.reason
        }))
      });
    }
  };

  const modalContent = (
    <div className="damagereportform-backdrop">
      <div className="damagereportform-modal-content">
        <div className="damagereportform-header">
          <h3 className="importform-header-title">
            <FontAwesomeIcon icon={faBoxOpen} className="importform-header-icon" />
            Thêm phiếu hư hỏng mới
          </h3>
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="damagereportform-body">
          <form onSubmit={handleSubmit} className="account-form">
            <div className="form-group">
              <label>
                <FontAwesomeIcon icon={faUser} className="importform-icon" />
                Người lập phiếu
              </label>
              <input
                type="text"
                value={
                  currentUser?.full_name ||
                  currentUser?.fullName ||
                  currentUser?.displayName ||
                  currentUser?.username ||
                  ""
                }
                readOnly
                className="importform-readonly-input"
              />
            </div>
            <div className="form-group importform-group-margin-top">
              <div className="importform-label-row">
                <label className="importform-section-label">
                  <FontAwesomeIcon icon={faBook} className="importform-icon" />
                  Danh sách sách hư hỏng
                </label>
                <button
                  type="button"
                  onClick={handleAddBook}
                  className="save-button importform-add-btn"
                >
                  <FontAwesomeIcon icon={faPlus} /> Thêm sách
                </button>
              </div>
              <div className="importform-table-container">
                <table className="importform-table">
                  <thead>
                    <tr className="importform-table-header-row">
                      <th className="importform-th-book">Tên sách</th>
                      <th className="importform-th-qty">Số lượng</th>
                      <th className="importform-th-book">Lý do</th>
                      <th className="importform-th-action"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.damagedBooks.map((item, idx) => (
                      <tr key={idx}>
                        <td className="importform-td-book">
                          <select
                            value={item.bookId}
                            onChange={e => handleBookChange(idx, "bookId", e.target.value)}
                            className={errors[`damagedBooks_${idx}_bookId`] ? "error importform-book-select" : "importform-book-select"}
                          >
                            <option value="">Chọn sách</option>
                            {books && books.length > 0 && books.map(book => (
                              <option key={book.id} value={book.id}>{book.title}</option>
                            ))}
                          </select>
                          {errors[`damagedBooks_${idx}_bookId`] && <div className="error-message">{errors[`damagedBooks_${idx}_bookId`]}</div>}
                        </td>
                        <td className="importform-td-qty">
                          <input
                            type="number"
                            value={item.quantity}
                            min="1"
                            onChange={e => handleBookChange(idx, "quantity", e.target.value)}
                            className={errors[`damagedBooks_${idx}_quantity`] ? "error importform-quantity-input" : "importform-quantity-input"}
                          />
                          {errors[`damagedBooks_${idx}_quantity`] && <div className="error-message">{errors[`damagedBooks_${idx}_quantity`]}</div>}
                        </td>
                        <td className="importform-td-book">
                          <input
                            type="text"
                            value={item.reason}
                            onChange={e => handleBookChange(idx, "reason", e.target.value)}
                            className={errors[`damagedBooks_${idx}_reason`] ? "error importform-book-select" : "importform-book-select"}
                            placeholder="Nhập lý do sách hỏng"
                          />
                          {errors[`damagedBooks_${idx}_reason`] && <div className="error-message">{errors[`damagedBooks_${idx}_reason`]}</div>}
                        </td>
                        <td className="importform-td-action">
                          <button
                            type="button"
                            onClick={() => handleRemoveBook(idx)}
                            className="importform-remove-btn"
                            title="Xóa sách"
                          >
                            <FontAwesomeIcon icon={faTrash} className="fa-trash" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {errors.damagedBooks && <div className="error-message">{errors.damagedBooks}</div>}
            </div>
            <div className="form-group importform-group-margin-top">
              <label>Ghi chú</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                className="importform-full-width"
                rows={2}
                placeholder="Nhập ghi chú (nếu có)"
              />
            </div>
            <div className="form-actions importform-actions-margin-top">
              <button
                type="button"
                className="cancel-button importform-button"
                onClick={onClose}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="save-button importform-button"
              >
                Thêm mới
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default DamageReportForm;