import React, { useState } from "react";
import "../modals/Modals.css";

const AssignShipperModal = ({ isOpen, onClose, onAssign, shippers, orderId }) => {
  const [selectedShipper, setSelectedShipper] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: 400, padding: '28px 24px' }}>
        <div className="modal-header">
          <h2>Phân công shipper</h2>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: 16 }}>
            <b>Chọn shipper giao đơn #{orderId}:</b>
          </div>
          <div className="shipper-list-modern" style={{ marginTop: 8 }}>
            {shippers && shippers.length > 0 ? (
              shippers.map(shipper => (
                <div
                  key={shipper.id}
                  className={`shipper-card${selectedShipper === shipper.id ? " selected" : ""}`}
                  onClick={() => setSelectedShipper(shipper.id)}
                  tabIndex={0}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, border: selectedShipper === shipper.id ? '2px solid #1e90ff' : '1px solid #e0e0e0', background: selectedShipper === shipper.id ? '#f0f8ff' : '#fff', cursor: 'pointer', marginBottom: 12, transition: 'border 0.2s, background 0.2s', width: '100%' }}
                >
                  {/* Avatar icon */}
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#e3eefd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#1e90ff', fontWeight: 600 }}>
                    <span role="img" aria-label="Shipper">🚚</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{shipper.full_name}</div>
                    <div style={{ color: '#555', fontSize: 14 }}>{shipper.phone}</div>
                  </div>
                  {/* Custom radio indicator */}
                  <div style={{ marginLeft: 8 }}>
                    <span style={{
                      display: 'inline-block',
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: selectedShipper === shipper.id ? '6px solid #1e90ff' : '2px solid #bbb',
                      background: selectedShipper === shipper.id ? '#fff' : '#f5f5f5',
                      transition: 'border 0.2s, background 0.2s'
                    }}></span>
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
        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
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
