import React from 'react';
import ReactDOM from 'react-dom';
import './DamageReportDetailsModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const DamageReportDetailsModal = ({ isOpen, onClose, damageReportData }) => {
  if (!isOpen || !damageReportData) return null;

  // Định dạng ngày: giờ:phút ngày/tháng/năm
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  // Định dạng số
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '0';
    let numberValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
    if (isNaN(numberValue)) return '0';
    return numberValue.toLocaleString('vi-VN');
  };

  // Lấy danh sách sách bị hỏng (ưu tiên trường 'items' theo backend mới)
  const bookList =
    damageReportData.items ||
    damageReportData.books ||
    damageReportData.damageBooks ||
    damageReportData.bookDetails ||
    damageReportData.damaged_books ||
    damageReportData.details ||
    [];

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Chi tiết phiếu sách hỏng #{damageReportData.id}</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal-body">
          <div className="report-info">
            <h3>Thông tin phiếu sách hỏng</h3>
            <div className="info-columns">
              <div className="info-column">
                <div className="info-item">
                  <label>Mã phiếu:</label>
                  <span>{damageReportData.id}</span>
                </div>
                <div className="info-item">
                  <label>Ngày lập:</label>
                  <span>{formatDate(damageReportData.created_at)}</span>
                </div>
              </div>
              <div className="info-column">
                <div className="info-item">
                  <label>Người tạo:</label>
                  <span>{damageReportData.created_by_name || damageReportData.created_by || '---'}</span>
                </div>
                <div className="info-item">
                  <label>Ghi chú:</label>
                  <span>{damageReportData.note || '---'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="damage-details">
            <h3>Danh sách sách bị hỏng</h3>
            <table className="details-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sách</th>
                  <th>Số lượng</th>
                  <th>Lý do/Mô tả</th>
                </tr>
              </thead>
              <tbody>
                {bookList.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#888' }}>Không có dữ liệu</td>
                  </tr>
                ) : (
                  bookList.map((book, idx) => (
                    <tr key={book.id || idx}>
                      <td>{idx + 1}</td>
                      <td>{book.book_title}</td>
                      <td>{formatNumber(book.quantity)}</td>
                      <td>{book.reason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default DamageReportDetailsModal;
