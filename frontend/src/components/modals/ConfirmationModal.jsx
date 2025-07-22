import React from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faExclamationTriangle, 
  faTrash, faKey, faLock, faLockOpen 
} from "@fortawesome/free-solid-svg-icons";
import "./Modals.css";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (title.includes('xóa')) return faTrash;
    if (title.includes('mật khẩu')) return faKey;
    if (title.includes('trạng thái')) {
      if (message.includes('kích hoạt')) return faLockOpen;
      if (message.includes('khóa')) return faLock;
    }
    return faExclamationTriangle;
  };

  // Xác định màu sắc biểu tượng
  const getIconColor = () => {
    if (title.includes('xóa')) return '#dc3545';
    if (title.includes('mật khẩu')) return '#fd7e14';
    if (title.includes('trạng thái')) {
      if (message.includes('kích hoạt')) return '#28a745';
      if (message.includes('khóa')) return '#dc3545';
    }
    return '#f59e0b';
  };

  const modalContent = (
    <div className="modal-backdrop">
      <div className="modal-content confirmation-modal">
        <div className="modal-header">
          <h3>
            <FontAwesomeIcon 
              icon={getIcon()} 
              className="warning-icon" 
              style={{ color: getIconColor() }}
            />
            {title}
          </h3>
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Hủy bỏ
          </button>
          <button 
            className="confirm-button" 
            onClick={onConfirm}
            style={{
              backgroundColor: title.includes('xóa') ? '#dc3545' : 
                              title.includes('mật khẩu') ? '#fd7e14' :
                              message.includes('kích hoạt') ? '#28a745' :
                              message.includes('khóa') ? '#dc3545' : '#095e5a',
            }}
          >
            Xác nhận
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

export default ConfirmationModal;