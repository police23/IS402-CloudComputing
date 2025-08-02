import React, { useState } from "react";
import "./AssignShipperModal.css";

const AssignShipperModal = ({ isOpen, onClose, onAssign, shippers, orderId }) => {
  const [selectedShipper, setSelectedShipper] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay assign-shipper-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Phân công shipper</h2>
        </div>
        <div className="modal-body">
          <div><b>Chọn shipper giao đơn #{orderId}:</b></div>
          <div className="shipper-list">
            {shippers && shippers.length > 0 ? (
              shippers.map(shipper => (
                <div
                  key={shipper.id}
                  className={`shipper-card${selectedShipper === shipper.id ? " selected" : ""}`}
                  onClick={() => setSelectedShipper(shipper.id)}
                  tabIndex={0}
                >
                  {/* Avatar icon */}
                  <div className="shipper-avatar">
                    <span role="img" aria-label="Shipper">🚚</span>
                  </div>
                  <div className="shipper-info">
                    <div className="name">{shipper.full_name}</div>
                    <div className="phone">{shipper.phone}</div>
                  </div>
                  {/* Custom radio indicator */}
                  <div className="shipper-radio">
                    <span></span>
                  </div>
                  {/* Hidden radio for accessibility */}
                  <input
                    type="radio"
                    name="shipper"
                    value={shipper.id}
                    checked={selectedShipper === shipper.id}
                    onChange={() => setSelectedShipper(shipper.id)}
                    style={{ display: 'none' }}
                  />
                </div>
              ))
            ) : (
              <div>Không có shipper nào khả dụng.</div>
            )}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Hủy</button>
          <button
          className="btn btn-confirm"
          onClick={() => {
            console.log('[DEBUG][AssignShipperModal] onAssign', { orderId, selectedShipper });
            if (selectedShipper) onAssign(selectedShipper);
          }}
          disabled={!selectedShipper}
          style={{ minWidth: 110 }}
        >
          Phân công
        </button>
        </div>
      </div>
    </div>
  );
};

export default AssignShipperModal;
