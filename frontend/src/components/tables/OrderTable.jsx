import React, { useEffect, useState } from "react";
import "./OrderTable.css";
import {
  getAllProcessingOrders,
  getConfirmedOrders,
  getAllDeliveredOrders,
  getAllDeliveringOrders,
  confirmOrder,
  getDeliveringOrdersByUserID
} from "../../services/OrderService";
import { assignOrderToShipper } from '../../services/OrderService';
import MyOrderDetailsModal from "../modals/MyOrderDetailsModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import AssignShipperModal from "../modals/AssignShipperModal";
import { getAllShippers } from "../../services/UserService";

const STATUS_BADGE = {
  pending: { class: "status-badge status-upcoming", text: "Chờ xác nhận" },
  confirmed: { class: "status-badge status-active", text: "Đã xác nhận" },
  delivered: { class: "status-badge status-expired", text: "Đã giao" },
  cancelled: { class: "status-badge status-inactive", text: "Đã hủy" },
};

const RECORDS_PER_PAGE = 10;

const OrderTable = ({ type = "processing", isShipper = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [shippers, setShippers] = useState([]);
  const [assignOrderId, setAssignOrderId] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [type, isShipper]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let response;
      if (type === "delivering") {
        response = await getAllDeliveringOrders();
      } else if (type === "delivered") {
        response = await getAllDeliveredOrders();
      } else if (type === "processing") {
        response = await getAllProcessingOrders();
      } else if (type === "confirmed") {
        response = await getConfirmedOrders();
      } else if (type === "cancelled") {
        response = await getCancelledOrders();
      } else {
        response = await getAllProcessingOrders();
      }
      const mappedOrders = (response.data || response).map(order => ({
        id: order.id,
        orderNumber: String(order.id),
        customer: order.full_name || order.user_name || order.customer_name || "",
        phone: order.phone,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: order.final_amount,
        items: order.orderDetails || [],
        shippingAddress: order.shipping_address,
        shippingMethod: order.shipping_method_name,
        paymentMethod: order.payment_method === 'online' ? 'ZaloPay' : 'Thanh toán khi nhận hàng',
        discountAmount: order.discount_amount,
        shippingFee: order.shipping_fee,
        finalAmount: order.final_amount,
        shipper_name: order.shipper_name || '',
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!selectedRows.length) return;
    const pendingOrders = orders.filter(o => selectedRows.includes(o.id) && o.status === 'pending');
    if (!pendingOrders.length) return;
    setShowConfirmModal(true);
  };

  const handleConfirmModal = async () => {
    const pendingOrders = orders.filter(o => selectedRows.includes(o.id) && o.status === 'pending');
    setShowConfirmModal(false);
    if (!pendingOrders.length) return;
    try {
      await Promise.all(pendingOrders.map(order => confirmOrder(order.id)));
      setNotification({ message: `Xác nhận ${pendingOrders.length} đơn hàng thành công!`, type: "success" });
      fetchOrders();
      setSelectedRows([]);
    } catch (e) {
      setNotification({ message: "Lỗi xác nhận đơn hàng!", type: "error" });
    } finally {
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    }
  };

  // Phân công shipper
  const handleAssignShipperClick = () => {
    if (!selectedRows.length) return;
    // Chỉ cho phép phân công 1 đơn/lần để đơn giản UI
    setAssignOrderId(selectedRows[0]);
    setShowAssignModal(true);
    setAssignLoading(true);
    getAllShippers().then(data => {
      setShippers(data);
      setAssignLoading(false);
    }).catch(() => {
      setShippers([]);
      setAssignLoading(false);
    });
  };
  const handleAssignShipper = async (shipperId) => {
    setAssignLoading(true);
    console.log('[DEBUG] handleAssignShipper:', { assignOrderId, shipperId });
    try {
      const res = await assignOrderToShipper(assignOrderId, shipperId);
      console.log('[DEBUG] assignOrderToShipper result:', res);
      setNotification({ message: "Phân công shipper thành công!", type: "success" });
      setShowAssignModal(false);
      setSelectedRows([]);
      fetchOrders();
    } catch (e) {
      console.error('[DEBUG] assignOrderToShipper error:', e);
      setNotification({ message: "Lỗi phân công shipper!", type: "error" });
    } finally {
      setAssignLoading(false);
      setTimeout(() => setNotification({ message: "", type: "" }), 3000);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * RECORDS_PER_PAGE;
  const indexOfFirstRecord = indexOfLastRecord - RECORDS_PER_PAGE;
  const currentRecords = orders.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(orders.length / RECORDS_PER_PAGE);

  if (loading) return <div className="order-table-loading">Đang tải đơn hàng...</div>;

  // Determine if any selected order is pending
  const canConfirm = orders.some(o => selectedRows.includes(o.id) && o.status === 'pending');

  return (
    <>
      <div className="order-table-container">
        {/* Action buttons on top */}
        <div className="action-buttons">
          {type === "processing" && (
            <button
              className="btn btn-confirm"
              onClick={handleConfirm}
              disabled={!canConfirm}
            >
              Xác nhận
            </button>
          )}
          {type === "confirmed" && (
            <button
              className="btn btn-confirm"
              onClick={handleAssignShipperClick}
              disabled={selectedRows.length !== 1}
            >
              Phân công shipper
            </button>
          )}
        </div>
        <table className="order-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={currentRecords.length > 0 && currentRecords.every(order => selectedRows.includes(order.id))}
                  onChange={e => {
                    if (e.target.checked) {
                      // Add all current page orders to selectedRows
                      setSelectedRows(prev => ([...new Set([...prev, ...currentRecords.map(o => o.id)])]));
                    } else {
                      // Remove all current page orders from selectedRows
                      setSelectedRows(prev => prev.filter(id => !currentRecords.some(o => o.id === id)));
                    }
                  }}
                  aria-label="Chọn tất cả"
                />
              </th>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Số ĐT</th>
              <th>SL sách</th>
              <th>Ngày đặt</th>
              {type === 'delivering' && <th>Người giao</th>}
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="order-table-empty">Không có dữ liệu</td>
              </tr>
            ) : (
              currentRecords.flatMap(order => [
                <tr
                  key={order.id}
                  className={selectedRows.includes(order.id) ? "selected" : ""}
                  onClick={() => setExpandedRowId(expandedRowId === order.id ? null : order.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(order.id)}
                      onChange={e => {
                        e.stopPropagation();
                        setSelectedRows(prev =>
                          e.target.checked
                            ? [...prev, order.id]
                            : prev.filter(id => id !== order.id)
                        );
                      }}
                      onClick={e => e.stopPropagation()}
                      aria-label={`Chọn đơn hàng #${order.orderNumber}`}
                    />
                  </td>
                  <td>#{order.orderNumber}</td>
                  <td>{order.customer}</td>
                  <td>{order.phone || ''}</td>
                  <td>{Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0}</td>
                  <td>{formatDate(order.orderDate)}</td>
                  {type === 'delivering' && <td>{order.shipper_name || 'Chưa có'}</td>}
                  <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                </tr>,
                expandedRowId === order.id && (
                  <tr key={order.id + '-details'}>
                    <td colSpan={type === 'delivering' ? 8 : 7} className="order-details-cell">
                      <div className="order-details-inline">
                        <div className="order-details-row">
                          <div className="order-details-col order-details-col-1">
                            <div className="order-details-item"><b>Mã đơn:</b> #{order.orderNumber}</div>
                            <div className="order-details-item"><b>Ngày đặt:</b> {formatDate(order.orderDate)}</div>
                            <div className="order-details-item"><b>Khách hàng:</b> {order.customer}</div>
                            <div className="order-details-item"><b>SĐT:</b> {order.phone || ''}</div>
                          </div>
                          <div className="order-details-col order-details-col-2">
                            <div className="order-details-item"><b>Địa chỉ giao hàng:</b> {order.shippingAddress}</div>
                            <div className="order-details-item"><b>Phương thức thanh toán:</b> {order.paymentMethod}</div>
                            <div className="order-details-item"><b>Phương thức vận chuyển:</b> {order.shippingMethod || order.shipping_method_name || 'Không rõ'}</div>
                          </div>
                        </div>
                        <div className="order-items-table-wrapper">
                          <table className="order-items-table">
                            <thead>
                              <tr>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items && order.items.length > 0 ? (
                                order.items.map((item, idx) => (
                                  <tr key={item.id || idx}>
                                    <td>{item.name || item.title}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatCurrency(item.unit_price || item.price)}</td>
                                    <td>{formatCurrency((item.unit_price || item.price) * item.quantity)}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr><td colSpan={4} className="order-items-empty">Không có sản phẩm</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {(() => {
                          const totalProductAmount = order.items && order.items.length > 0
                            ? order.items.reduce((sum, item) => sum + ((item.unit_price || item.price) * item.quantity), 0)
                            : 0;
                          return (
                            <div className="order-details-summary">
                              <div className="order-details-summary-row"><span>Tổng tiền hàng:</span> <strong>{formatCurrency(totalProductAmount)}</strong></div>
                              <div className="order-details-summary-row"><span>Phí vận chuyển:</span> <strong>{formatCurrency(order.shippingFee)}</strong></div>
                              <div className="order-details-summary-row"><span>Khuyến mãi:</span> <strong className="order-details-discount">-{formatCurrency(order.discountAmount)}</strong></div>
                              <div className="order-details-summary-row order-details-final"><span>Thành tiền:</span> <span>{formatCurrency(order.finalAmount)}</span></div>
                            </div>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                )
              ]).filter(Boolean)
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {orders.length > 0 && (
        <div className="pagination">
          <div className="pagination-info">
            Hiển thị {indexOfFirstRecord + 1} đến {Math.min(indexOfLastRecord, orders.length)} của {orders.length} đơn hàng
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`pagination-button ${currentPage === index + 1 ? "active" : ""}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              className="pagination-button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      )}
      {/* Notification */}
      {notification.message && (
        <div className={`notification ${notification.type === "error" ? "error" : ""}`} style={{ marginTop: 16 }}>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}
      {/* Confirmation Modal for confirming orders */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmModal}
        title="Xác nhận đơn hàng"
        message={`Bạn có chắc chắn muốn xác nhận ${orders.filter(o => selectedRows.includes(o.id) && o.status === 'pending').length} đơn hàng đã chọn?`}
      />
      {/* Modal phân công shipper */}
      <AssignShipperModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onAssign={handleAssignShipper}
        shippers={shippers}
        orderId={assignOrderId}
      />
    </>
  );
};

export default OrderTable; 