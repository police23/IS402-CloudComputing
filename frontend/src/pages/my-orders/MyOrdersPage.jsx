import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUserOrders,
  getProcessingOrdersByUserID,
  getConfirmedOrdersByUserID,
  getDeliveredOrdersByUserID,
  getCancelledOrdersByUserID,
  cancelOrder,
  getDeliveringOrdersByUserID
} from '../../services/OrderService';
import './MyOrdersPage.css';
import PublicHeader from '../../components/common/PublicHeader';
import MyOrderDetailsModal from '../../components/modals/MyOrderDetailsModal';

const MyOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Fetch user orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let response;
        if (filter === 'all') {
          response = await getUserOrders(page, pageSize);
        } else if (filter === 'pending') {
          response = await getProcessingOrdersByUserID(page, pageSize);
        } else if (filter === 'confirmed') {
          response = await getConfirmedOrdersByUserID(page, pageSize);
        } else if (filter === 'delivering') {
          response = await getDeliveringOrdersByUserID(page, pageSize);
        } else if (filter === 'delivered') {
          response = await getDeliveredOrdersByUserID(page, pageSize);
        } else if (filter === 'cancelled') {
          response = await getCancelledOrdersByUserID(page, pageSize);
        } else {
          response = await getUserOrders(page, pageSize);
        }
        
        // API trả về { success: true, data: { orders, total } }
        console.log('Full API response:', response);
        const apiData = response.data || response;
        const ordersData = apiData.orders || [];
        
        if (!Array.isArray(ordersData)) {
          console.error('Orders data is not an array:', ordersData);
          setOrders([]);
          setTotal(0);
          setLoading(false);
          return;
        }
        
        const mappedOrders = ordersData.map(order => ({
          id: order.id,
          orderNumber: String(order.id),
          orderDate: order.order_date,
          status: order.status,
          totalAmount: order.total_amount,
          discountAmount: order.discount_amount,
          shippingFee: order.shipping_fee,
          finalAmount: order.final_amount,
          items: (order.details || order.orderDetails || []).map(item => ({
            id: item.id,
            name: item.Book?.title || item.title,
            quantity: item.quantity,
            price: item.unit_price
          })),
          shippingAddress: order.shipping_address,
          shippingMethod: order.shippingMethod?.name || order.shipping_method_name,
          paymentMethod: order.payment_method === 'online' ? 'ZaloPay' : 'Thanh toán khi nhận hàng'
        }));
        
        setOrders(mappedOrders);
        setTotal(apiData.total || 0);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
        setOrders([]);
        setTotal(0);
      }
    };
    fetchOrders();
  }, [filter, page, pageSize]);

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã duyệt';
      case 'delivering': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#2196f3';
      case 'delivering': return '#9c27b0';
      case 'delivered': return '#4caf50';
      case 'cancelled': return '#f44336';
      default: return '#666';
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

  const handleViewDetails = (order) => {
    console.log('Order detail:', order);
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      try {
        await cancelOrder(orderId);
        alert('Đã hủy đơn hàng thành công!');
        setShowOrderDetails(false);
        setSelectedOrder(null);
        // Gọi lại API để cập nhật danh sách đơn hàng
        setLoading(true);
        let response;
        if (filter === 'all') {
          response = await getUserOrders();
        } else if (filter === 'pending') {
          response = await getProcessingOrdersByUserID();
        } else if (filter === 'confirmed') {
          response = await getConfirmedOrdersByUserID();
        } else if (filter === 'delivering') {
          response = await getDeliveringOrdersByUserID();
        } else if (filter === 'delivered') {
          response = await getDeliveredOrdersByUserID();
        } else if (filter === 'cancelled') {
          response = await getCancelledOrdersByUserID();
        } else {
          response = await getUserOrders();
        }
        const mappedOrders = (response.data || response).map(order => ({
          id: order.id,
          orderNumber: String(order.id),
          orderDate: order.order_date,
          status: order.status,
          totalAmount: order.total_amount,
          discountAmount: order.discount_amount,
          shippingFee: order.shipping_fee,
          finalAmount: order.final_amount,
          items: (order.orderDetails || []).map(item => ({
            id: item.id,
            name: item.title,
            quantity: item.quantity,
            price: item.unit_price
          })),
          shippingAddress: order.shipping_address,
          shippingMethod: order.shipping_method_name,
          paymentMethod: order.payment_method === 'online' ? 'ZaloPay' : 'Thanh toán khi nhận hàng'
        }));
        setOrders(mappedOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error canceling order:', error);
        alert('Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại!');
      }
    }
  };


  // Pagination controls
  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <>
        <PublicHeader />
        <div className="my-orders-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Đang tải đơn hàng...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <div className="my-orders-page">
        <div className="orders-container">
          <div className="orders-header">
            <h1>Đơn hàng của tôi</h1>
            <p>Quản lý và theo dõi đơn hàng của bạn</p>
          </div>

          <div className="orders-filters">
            <div className="filter-tabs">
              <button
                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tất cả
              </button>
              <button
                className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Chờ xác nhận
              </button>
              <button
                className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
                onClick={() => setFilter('confirmed')}
              >
                Đã duyệt
              </button>
              <button
                className={`filter-tab ${filter === 'delivering' ? 'active' : ''}`}
                onClick={() => setFilter('delivering')}
              >
                Đang giao
              </button>
              <button
                className={`filter-tab ${filter === 'delivered' ? 'active' : ''}`}
                onClick={() => setFilter('delivered')}
              >
                Đã giao
              </button>
              <button
                className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilter('cancelled')}
              >
                Đã hủy
              </button>
            </div>
          </div>

          <div className="orders-list">
            {orders.length === 0 ? (
              <div className="no-orders">
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3>Không có đơn hàng nào</h3>
                <p>Bạn chưa có đơn hàng nào hoặc không tìm thấy đơn hàng phù hợp với bộ lọc.</p>
              </div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Ngày đặt</th>
                      <th>Số lượng sách</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.orderNumber}</td>
                        <td>{formatDate(order.orderDate)}</td>
                        <td>{order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0}</td>
                        <td><strong>{formatCurrency(order.totalAmount)}</strong></td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td>
                          <button
                            className="view-details-btn"
                            onClick={() => handleViewDetails(order)}
                          >
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  &lt;
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    className={`pagination-button${page === idx + 1 ? ' active' : ''}`}
                    onClick={() => setPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="pagination-button"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  &gt;
                </button>
                {/* Optional: page size selector */}
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  style={{ marginLeft: 8 }}
                >
                  {[10, 20, 50].map(size => (
                    <option key={size} value={size}>{size} / trang</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <MyOrderDetailsModal
          order={selectedOrder}
          open={showOrderDetails}
          onClose={closeOrderDetails}
          onCancelOrder={handleCancelOrder}
        />
      </div>
    </>
  );
}

export default MyOrdersPage;