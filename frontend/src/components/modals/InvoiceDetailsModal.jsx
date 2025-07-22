import React from 'react';
import ReactDOM from 'react-dom';
import './InvoiceDetailsModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const InvoiceDetailsModal = ({ isOpen, onClose, invoice }) => {
  if (!isOpen || !invoice) return null;

  // Định dạng tiền tệ
  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return value.toLocaleString("vi-VN") + "\u00A0VNĐ";
    }
    if (typeof value === "string" && !isNaN(Number(value))) {
      return Number(value).toLocaleString("vi-VN") + "\u00A0VNĐ";
    }
    return value;
  };

  // Định dạng ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  // bookDetails có thể không có nếu chỉ lấy danh sách hóa đơn, nên cần kiểm tra
  const bookDetails = invoice.bookDetails && Array.isArray(invoice.bookDetails)
    ? invoice.bookDetails
    : [];

  // TÍNH LẠI TỔNG TIỀN, GIẢM GIÁ VÀ THÀNH TIỀN TỪ CHI TIẾT SÁCH
  const totalAmountCalculated = bookDetails.reduce((sum, book) => {
    const qty = Number(book.quantity) || 0;
    const price = Number(book.unit_price || book.price) || 0;
    return sum + qty * price;
  }, 0);

  const discountAmount = Number(invoice.discount_amount) || 0;
  const finalAmountCalculated = totalAmountCalculated - discountAmount;

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-content" style={{ minWidth: 600, maxWidth: 800 }}>
        <div className="modal-header">
          <h2>Chi tiết hóa đơn #{invoice.id}</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="customer-info">
            <h3>Thông tin khách hàng</h3>
            <div className="info-row">
              <div className="info-item">
                <label>Tên khách hàng:</label>
                <span>{invoice.customer_name}</span>
              </div>
              <div className="info-item">
                <label>Số điện thoại:</label>
                <span>{invoice.customer_phone}</span>
              </div>
              <div className="info-item">
                <label>Ngày mua:</label>
                <span>{formatDate(invoice.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="order-details">
            <h3>Chi tiết đơn hàng</h3>
            {bookDetails.length > 0 ? (
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
                  {bookDetails.map((book, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{book.book_title || book.title || ""}</td>
                      <td>{book.quantity}</td>
                      <td>{formatCurrency(book.unit_price || book.price)}</td>
                      <td>{formatCurrency((book.quantity || 0) * (book.unit_price || book.price || 0))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="total-label">Tổng tiền hàng:</td>
                    <td className="total-amount">{formatCurrency(totalAmountCalculated)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="total-label">Giảm giá:</td>
                    <td className="total-amount">{formatCurrency(discountAmount)}</td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="total-label">Thành tiền:</td>
                    <td className="total-amount final-amount">{formatCurrency(finalAmountCalculated)}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <div style={{ textAlign: "center", padding: 16 }}>Không có dữ liệu chi tiết sách.</div>
            )}
          </div>

          <button
            className="export-pdf-btn"
            onClick={() => window.open(`http://localhost:5000/api/invoices/${invoice.id}/pdf`, "_blank")}
          >
            Xuất PDF
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default InvoiceDetailsModal;