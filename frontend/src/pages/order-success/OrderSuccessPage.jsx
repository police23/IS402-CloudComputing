import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PublicHeader from '../../components/common/PublicHeader';
import './OrderSuccessPage.css';

function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderInfo } = location.state || {};

  return (
    <div className="order-success-page">
      <PublicHeader />
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Đặt hàng thành công</h1>
          <div className="checkout-steps">
            <div className="step completed">
              <span className="step-number">✓</span>
              <span className="step-text">Giỏ hàng</span>
            </div>
            <div className="step-line"></div>
            <div className="step completed">
              <span className="step-number">✓</span>
              <span className="step-text">Thông tin giao hàng</span>
            </div>
            <div className="step-line"></div>
            <div className="step active">
              <span className="step-number">3</span>
              <span className="step-text">Đặt hàng thành công</span>
            </div>
          </div>
        </div>
        <div className="order-success-container">
          <div className="order-success-icon-wrapper">
            <div className="order-success-icon-bg">
              <span className="order-success-emoji">🎉</span>
              <svg className="order-success-check" width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="#38d9a9"/><path d="M11 19l5 5 9-9" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <h1 className="order-success-title">Đặt hàng thành công!</h1>
          <p className="order-success-desc">Cảm ơn bạn đã mua hàng tại <b>nhà sách Cánh Diều</b>.<br/>Chúng tôi sẽ liên hệ xác nhận và giao hàng sớm nhất.</p>
          {orderInfo && (
            <div className="order-info-box">
              <h3 className="order-info-title">Thông tin đơn hàng</h3>
              <div className="order-info-row"><b>Mã đơn hàng:</b> <span className="order-info-code">{orderInfo.orderCode || orderInfo.id || '-'}</span></div>
              <div className="order-info-row"><b>Phương thức thanh toán:</b> <span className="order-info-method">{orderInfo.paymentMethod === 'online' ? 'ZaloPay' : 'Thanh toán khi nhận hàng (COD)'}</span></div>
              <div className="order-info-row"><b>Tổng tiền:</b> <span className="order-info-total">{orderInfo.total && orderInfo.total.toLocaleString('vi-VN')}đ</span></div>
            </div>
          )}
          <div className="order-success-actions">
            <button className="btn-back-home" onClick={() => navigate('/')}>Về trang chủ</button>
            <button className="btn-view-orders" onClick={() => navigate('/my-orders')}>Xem đơn hàng của tôi</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
