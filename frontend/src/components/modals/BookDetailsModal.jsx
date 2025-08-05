import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faBook,
  faUser,
  faTags,
  faBuilding,
  faCalendar,
  faMoneyBill,
  faBoxes,
  faInfoCircle,
  faBarcode,
  faLanguage,
  faFileAlt
} from "@fortawesome/free-solid-svg-icons";
import "../modals/Modals.css";
import "./BookDetailsModal.css";

const BookDetailsModal = ({ book, onClose }) => {
  const [details, setDetails] = useState({});

  useEffect(() => {
    if (book) {
      setDetails({
        title: book.title || "-",
        author: book.author || "-",
        category: book.category?.name || book.category || "-",
        publisher: book.publisher?.name || book.publisher || "-",
        publicationYear: book.publication_year || book.publicationYear || "-",
        price: book.price ? book.price.toLocaleString("vi-VN") + " ₫" : "-",
        stock: book.quantity_in_stock ?? book.stock ?? "-",
        status: (book.quantity_in_stock ?? book.stock ?? 0) > 0 ? "Còn hàng" : "Hết hàng",
        // isbn: book.isbn || "-",
        // language: book.language || "-",
        description: book.description || "-"
      });
    }
  }, [book]);

  if (!book) return null;

  // Xử lý đường dẫn ảnh bìa
  let imageUrls = [];
  if (book && Array.isArray(book.images) && book.images.length > 0) {
    imageUrls = book.images.map(img => 
      img.image_path.startsWith('http') ? img.image_path : `http://localhost:5000${img.image_path}`
    );
  } else if (book && Array.isArray(book.imageUrls) && book.imageUrls.length > 0) {
    imageUrls = book.imageUrls.map(url =>
      url.startsWith('http') ? url : `http://localhost:5000${url}`
    );
  } else if (book && book.imageUrl) {
    imageUrls = [
      book.imageUrl.startsWith('http')
        ? book.imageUrl
        : `http://localhost:5000${book.imageUrl}`
    ];
  }

  const modalContent = (
    <div className="modal-backdrop">
      <div className="modal-content book-details-modal-content">
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon icon={faBook} className="book-details-header-icon" />
            Thông tin chi tiết sách
          </h3>
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal-body">
          {/* Ảnh bìa sách */}
          <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24}}>
            {imageUrls.length > 0 ? (
              <div style={{display: 'flex', gap: 12}}>
                {imageUrls.slice(0, 5).map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Ảnh bìa sách ${idx + 1}`}
                    style={{maxWidth: 140, maxHeight: 180, borderRadius: 6, border: '1px solid #eee', marginBottom: 8}}
                  />
                ))}
              </div>
            ) : (
              <div style={{fontSize: '13px', color: '#888', marginBottom: 8}}>Chưa có ảnh bìa.</div>
            )}
          </div>
          <div className="book-details-layout">
            <div className="book-details-column">
              <div className="details-group">
                <span className="details-label">
                  <FontAwesomeIcon icon={faBook} className="details-icon" /> Tên sách:
                </span>
                <span className="details-value">{details.title}</span>
              </div>
              <div className="details-group">
                <span className="details-label">
                  <FontAwesomeIcon icon={faUser} className="details-icon" /> Tác giả:
                </span>
                <span className="details-value">{details.author}</span>
              </div>
              <div className="details-group">
                <span className="details-label">
                  <FontAwesomeIcon icon={faTags} className="details-icon" /> Thể loại:
                </span>
                <span className="details-value">{details.category}</span>
              </div>
              <div className="details-group">
                <span className="details-label">
                  <FontAwesomeIcon icon={faBuilding} className="details-icon" /> Nhà xuất bản:
                </span>
                <span className="details-value">{details.publisher}</span>
              </div>
            </div>
            <div className="book-details-column">
              <div className="details-group">
                <span className="details-label">
                  <FontAwesomeIcon icon={faCalendar} className="details-icon" /> Năm xuất bản:
                </span>
                <span className="details-value">{details.publicationYear}</span>
              </div>
              <div className="details-group">
                <span className="details-label">
                  <FontAwesomeIcon icon={faMoneyBill} className="details-icon" /> Giá bán:
                </span>
                <span className="details-value">{details.price}</span>
              </div>
              <div className="details-group">
                <span className="details-label">
                  <FontAwesomeIcon icon={faBoxes} className="details-icon" /> Tồn kho:
                </span>
                <span className="details-value">{details.stock}</span>
              </div>
              <div className="details-group">
                <span className="details-label">
                  <FontAwesomeIcon icon={faInfoCircle} className="details-icon" /> Trạng thái:
                </span>
                <span className="details-value">{details.status}</span>
              </div>
              <div className="details-group" style={{ alignItems: "flex-start" }}>
                <span className="details-label">
                  <FontAwesomeIcon icon={faFileAlt} className="details-icon" /> Mô tả:
                </span>
                <span className="details-value" style={{ whiteSpace: "pre-line" }}>{details.description}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};

export default BookDetailsModal;
