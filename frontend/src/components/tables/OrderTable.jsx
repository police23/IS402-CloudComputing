import React, { useEffect, useState } from "react";
import "./OrderTable.css";
import {
  getAllProcessingOrders,
  getAllConfirmedOrders,
  getAllDeliveredOrders,
  getAllDeliveringOrders,
  confirmOrder,
  assignOrderToShipper,
} from "../../services/OrderService";
import MyOrderDetailsModal from "../modals/MyOrderDetailsModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import AssignShipperModal from "../modals/AssignShipperModal";
import { getAllShippers } from "../../services/UserService";

// Constants
const DEFAULT_PAGE_SIZE = 10;

const STATUS_BADGE = {
  pending: { class: "status-badge status-upcoming", text: "Chờ xác nhận" },
  confirmed: { class: "status-badge status-active", text: "Đã xác nhận" },
  delivered: { class: "status-badge status-expired", text: "Đã giao" },
  cancelled: { class: "status-badge status-inactive", text: "Đã hủy" },
};

const OrderTable = ({ type = "processing", isShipper = false }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [shippers, setShippers] = useState([]);
  const [assignOrderId, setAssignOrderId] = useState(null);

  // Auto close notification after 5s
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.message]);

  useEffect(() => {
    fetchOrders();
  }, [type, isShipper, currentPage, pageSize]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let response = { orders: [], total: 0 };
      // Dùng API /all cho OrderManagementPage (admin/manager)
      if (type === "processing") {
        response = await getAllProcessingOrders(currentPage, pageSize);
      } else if (type === "confirmed") {
        response = await getAllConfirmedOrders(currentPage, pageSize);
      } else if (type === "delivering") {
        response = await getAllDeliveringOrders(currentPage, pageSize);
      } else if (type === "delivered") {
        response = await getAllDeliveredOrders(currentPage, pageSize);
      }
      console.log('OrderTable fetchOrders response:', response);
      setOrders(response.orders || []);
      setTotal(response.total || 0);
      console.log('orders after fetch:', response.orders);
    } catch (error) {
      setNotification({ message: "Lỗi khi tải đơn hàng.", type: "error" });
    } finally {
      setLoading(false);
    }
  };



  const handleConfirm = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmModal = async () => {
    try {
      // Gọi API xác nhận
      const pendingOrderIds = selectedRows.filter(id =>
        orders.find(o => o.id === id && o.status === "pending")
      );
      console.log('pendingOrderIds gửi lên xác nhận:', pendingOrderIds);
      const res = await confirmOrder(pendingOrderIds);
      console.log('Kết quả confirmOrder:', res);
      setNotification({ message: "Xác nhận đơn hàng thành công", type: "success" });
      fetchOrders();
      setSelectedRows([]);
    } catch (error) {
      setNotification({ message: `Xác nhận đơn hàng thất bại: ${error?.message || error}`, type: "error" });
      console.error('Lỗi xác nhận đơn hàng:', error);
    } finally {
      setShowConfirmModal(false);
    }
  };

  const handleAssignShipperClick = async () => {
    try {
      const shippers = await getAllShippers();
      setShippers(shippers || []);
      setAssignOrderId(selectedRows[0]);
      setShowAssignModal(true);
    } catch (error) {
      setNotification({ message: "Không tải được danh sách shipper", type: "error" });
    }
  };

  const handleAssignShipper = async (shipperId) => {
    try {
      await assignOrderToShipper(assignOrderId, shipperId);
      setNotification({ message: "Phân công thành công", type: "success" });
      fetchOrders();
    } catch (error) {
      setNotification({ message: "Phân công thất bại", type: "error" });
    } finally {
      setShowAssignModal(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0₫";
  };


  const totalPages = Math.ceil(total / pageSize);

  // Pagination helpers
  const indexOfLastRecord = currentPage * pageSize;
  const indexOfFirstRecord = indexOfLastRecord - pageSize;
  const currentRecords = orders.slice(indexOfFirstRecord, indexOfLastRecord);

  // Tính toán lại canConfirm dựa trên selectedRows và orders
  const canConfirm = selectedRows.some(id => {
    const order = orders.find(o => o.id === id);
    return order && order.status === 'pending';
  });

  // Đảm bảo canConfirm luôn được khai báo trước return
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
                  <td>#{order.id || ''}</td>
                  <td>{order.full_name || ''}</td>
                  <td>{order.phone || ''}</td>
                  <td>{Array.isArray(order.orderDetails) ? order.orderDetails.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) : 0}</td>
                  <td>{formatDate(order.order_date)}</td>
                  {type === 'delivering' && <td>{order.shipper_name || order.shipperName || 'Chưa có'}</td>}
                  <td><strong>{formatCurrency(Number(order.total_amount) || 0)}</strong></td>
                </tr>,
                expandedRowId === order.id && (
                  <tr key={order.id + '-details'}>
                    <td colSpan={type === 'delivering' ? 8 : 7} className="order-details-cell">
                      <div className="order-details-inline">
                        <div className="order-details-row">
                          <div className="order-details-col order-details-col-1">
                            <div className="order-details-item"><b>Mã đơn:</b> #{order.id || ''}</div>
                            <div className="order-details-item"><b>Ngày đặt:</b> {formatDate(order.order_date)}</div>
                            <div className="order-details-item"><b>Khách hàng:</b> {order.full_name || ''}</div>
                            <div className="order-details-item"><b>SĐT:</b> {order.phone || ''}</div>
                          </div>
                          <div className="order-details-col order-details-col-2">
                            <div className="order-details-item"><b>Địa chỉ giao hàng:</b> {order.shipping_address}</div>
                            <div className="order-details-item"><b>Phương thức thanh toán:</b> {order.payment_method}</div>
                            <div className="order-details-item"><b>Phương thức vận chuyển:</b> {order.shipping_method_name || 'Không rõ'}</div>
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
                              {order.orderDetails && order.orderDetails.length > 0 ? (
                                order.orderDetails.map((item, idx) => {
                                  const quantity = Number(item.quantity) || 1;
                                  const unitPrice = Number(item.price || item.unit_price) || 0;
                                  const totalPrice = unitPrice * quantity;
                                  return (
                                    <tr key={item.id || idx}>
                                      <td>{item.title}</td>
                                      <td>{quantity}</td>
                                      <td>{unitPrice ? formatCurrency(unitPrice) : '-'}</td>
                                      <td>{unitPrice ? formatCurrency(totalPrice) : '-'}</td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr><td colSpan={4} className="order-items-empty">Không có sản phẩm</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {(() => {
                          // Không có giá trị đơn giá/SL trong orderDetails, chỉ hiển thị tổng tiền, phí, khuyến mãi
                          return (
                            <div className="order-details-summary">
                              <div className="order-details-summary-row"><span>Tổng tiền hàng:</span> <strong>{formatCurrency(Number(order.total_amount) || 0)}</strong></div>
                              <div className="order-details-summary-row"><span>Phí vận chuyển:</span> <strong>{formatCurrency(Number(order.shipping_fee) || 0)}</strong></div>
                              <div className="order-details-summary-row"><span>Khuyến mãi:</span> <strong className="order-details-discount">-{formatCurrency(Number(order.discount_amount) || 0)}</strong></div>
                              <div className="order-details-summary-row order-details-final"><span>Thành tiền:</span> <span>{formatCurrency(Number(order.final_amount) || 0)}</span></div>
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