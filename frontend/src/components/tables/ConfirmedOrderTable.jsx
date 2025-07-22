import React, { useEffect, useState } from "react";
import { getConfirmedOrders } from "../../services/orderService";
import "./OrderTable.css";

const STATUS_BADGE = {
  confirmed: { class: "status-badge status-active", text: "Đã xác nhận" },
  delivered: { class: "status-badge status-expired", text: "Đã giao" },
  cancelled: { class: "status-badge status-inactive", text: "Đã hủy" },
};

const ConfirmedOrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getConfirmedOrders();
      const mappedOrders = (response.data || response).map(order => ({
        id: order.id,
        orderNumber: String(order.id),
        customer: order.full_name || order.user_name || order.customer_name || "",
        phone: order.phone,
        orderDate: order.order_date,
        status: order.status,
        totalAmount: order.final_amount,
        shippingAddress: order.shipping_address,
        shippingMethod: order.shipping_method_name,
      }));
      setOrders(mappedOrders);
    } catch (error) {
      setOrders([]);
    }
    setLoading(false);
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

  if (loading) return <div className="order-table-loading">Đang tải đơn hàng...</div>;

  return (
    <div className="order-table-container">
      <table className="order-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Số ĐT</th>
            <th>Ngày đặt</th>
            <th>Thành tiền</th>
            <th>Địa chỉ giao hàng</th>
            <th>Phương thức vận chuyển</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={9} className="order-table-empty">Không có dữ liệu</td>
            </tr>
          ) : (
            orders.map(order => (
              <tr key={order.id}>
                <td>#{order.orderNumber}</td>
                <td>{order.customer}</td>
                <td>{order.phone || ''}</td>
                <td>{formatDate(order.orderDate)}</td>
                <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                <td>{order.shippingAddress}</td>
                <td>{order.shippingMethod || 'Không rõ'}</td>
                <td><span className={STATUS_BADGE[order.status]?.class || ''}>{STATUS_BADGE[order.status]?.text || order.status}</span></td>
                <td>
                  {/* Nút phân công shipper sẽ thêm sau */}
                  <button className="btn btn-confirm" disabled>Phân công shipper</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConfirmedOrderTable; 