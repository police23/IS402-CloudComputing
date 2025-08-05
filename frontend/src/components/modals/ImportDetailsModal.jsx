import React from 'react';
import ReactDOM from 'react-dom';
import './ImportDetailsModal.css'; // Sử dụng style riêng
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const ImportDetailsModal = ({ isOpen, onClose, importData }) => {
  if (!isOpen || !importData) return null;

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "0 VNĐ";
    
    // Chuyển đổi thành số nếu đầu vào là chuỗi
    let numberValue;
    if (typeof value === "string") {
      numberValue = parseFloat(value.replace(/[^\d.-]/g, ''));
    } else if (typeof value === "number") {
      numberValue = value;
    } else {
      return value;
    }
    
    if (isNaN(numberValue)) return "0 VNĐ";
    
    // Định dạng số với dấu chấm phân cách hàng nghìn cho định dạng tiền Việt Nam
    return numberValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + " VNĐ";
  };

  // Định dạng ngày: giờ:phút ngày/tháng/năm (ví dụ: 09:41 22/06/2025)
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Chi tiết phiếu nhập #{importData.importCode}</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-body">
          <div className="customer-info">
            <h3>Thông tin phiếu nhập</h3>
            <div className="info-columns">
              <div className="info-column">
                <div className="info-item">
                  <label>Mã phiếu nhập:</label>
                  <span>{importData.importCode}</span>
                </div>
                <div className="info-item">
                  <label>Ngày nhập:</label>
                  <span>{formatDate(importData.date)}</span>
                </div>
              </div>
              <div className="info-column">
                <div className="info-item">
                  <label>Nhà cung cấp:</label>
                  <span>{importData.supplier?.name || importData.supplier || "---"}</span>
                </div>
                <div className="info-item">
                  <label>Người nhập:</label>
                  <span>{importData.employee?.full_name || importData.employee?.username || importData.importedBy || "Admin"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-details">
            <h3>Chi tiết sách nhập</h3>
            <table className="details-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sách</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {importData.bookDetails.map((book, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{book.book?.title || book.book || book.book_title || "---"}</td>
                    <td>{book.quantity}</td>
                    <td>{formatCurrency(book.price)}</td>
                    <td>{formatCurrency(book.price * book.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="4" className="total-label">Tổng tiền:</td>
                  <td className="total-amount">{formatCurrency(importData.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default ImportDetailsModal;