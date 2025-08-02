import React from 'react';
import './MyOrderDetailsModal.css';

const getStatusText = (status) => {
  switch (status) {
    case 'pending': return 'Chờ xử lý';
    case 'processing': return 'Đang xử lý';
    case 'shipped': return 'Đã gửi hàng';
    case 'delivering': return 'Đang giao';
    case 'delivered': return 'Đã giao';
    case 'completed': return 'Hoàn thành';
    case 'cancelled': return 'Đã hủy';
    default: return status;
  }
};
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
};
const toNumber = (val) => Number(val) || 0;

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#ff9800'; // Màu cam - chờ xử lý
    case 'processing': return '#2196f3'; // Màu xanh dương - đang xử lý
    case 'confirmed': return '#2196f3'; // Màu xanh dương - đã duyệt
    case 'shipping': return '#9c27b0'; // Màu tím - đang gửi hàng
    case 'delivering': return '#9c27b0'; // Màu tím - đang giao
    case 'delivered': return '#4caf50'; // Màu xanh lá - đã giao
    case 'completed': return '#4caf50'; // Màu xanh lá - hoàn thành
    case 'cancelled': return '#f44336'; // Màu đỏ - đã hủy
    default: return '#757575'; // Màu xám - mặc định
  }
};

const MyOrderDetailsModal = ({ order, open, onClose, onCancelOrder }) => {
  if (!open || !order) return null;
  console.log('Order detail:', order); // debug

  return (
    <div className="modal-overlay">
      <div className="order-details-modal">
        <div className="modal-header">
          <h2>Chi tiết đơn hàng</h2>
          <button className="close-btn" onClick={onClose} title="Đóng">&times;</button>
        </div>
        <div className="modal-content">
          <div className="order-details-grid">
            <div className="order-info-col">
              <div className="order-info-row"><span>Mã đơn:</span> <span>#{order.orderNumber}</span></div>
              <div className="order-info-row"><span>Ngày đặt:</span> <span>{formatDate(order.orderDate)}</span></div>
              <div className="order-info-row"><span>Trạng thái:</span> <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>{getStatusText(order.status)}</span></div>
            </div>
            <div className="order-info-col">
              <div className="order-info-row"><span>Địa chỉ giao hàng:</span> <span>{order.shippingAddress}</span></div>
              <div className="order-info-row"><span>Phương thức thanh toán:</span> <span>{order.paymentMethod}</span></div>
              <div className="order-info-row"><span>Phương thức vận chuyển:</span> <span>{order.shippingMethod || order.shipping_method_name || 'Không rõ'}</span></div>
            </div>
          </div>
          <div className="order-items-table-wrapper">
            <table className="order-items-table">
              <thead>
                <tr>
                  <th style={{minWidth: 180}}>Tên sản phẩm</th>
                  <th style={{minWidth: 80, textAlign: 'right'}}>Số lượng</th>
                  <th style={{minWidth: 100, textAlign: 'right'}}>Đơn giá</th>
                  <th style={{minWidth: 120, textAlign: 'right'}}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={item.id || idx}>
                      <td>{item.name}</td>
                      <td style={{textAlign: 'right'}}>{item.quantity}</td>
                      <td style={{textAlign: 'right'}}>{formatCurrency(item.price)}</td>
                      <td style={{textAlign: 'right'}}>{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="order-items-empty">Không có sản phẩm nào trong đơn hàng này.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="order-summary-box">
            <div className="order-summary-row"><span>Tổng tiền hàng:</span> <strong>{formatCurrency(toNumber(order.totalAmount))}</strong></div>
            <div className="order-summary-row"><span>Phí vận chuyển:</span> <strong>{formatCurrency(toNumber(order.shippingFee))}</strong></div>
            <div className="order-summary-row"><span>Khuyến mãi:</span> <strong style={{ color: '#2196f3' }}>-{formatCurrency(toNumber(order.discountAmount))}</strong></div>
            <div className="order-summary-row order-summary-final"><span>Thành tiền:</span> <strong>{formatCurrency(toNumber(order.finalAmount))}</strong></div>
          </div>
          {(order.status === 'pending' || order.status === 'processing') && (
            <div className="modal-actions" style={{ marginTop: 20, justifyContent: 'flex-end' }}>
              <button className="cancel-order-btn" onClick={() => onCancelOrder(order.id)}>
                Hủy đơn hàng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrderDetailsModal;
