import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CheckoutPage.css';
import PublicHeader from '../../components/common/PublicHeader';
import { getCart } from '../../services/CartService';
import { useAuth } from '../../contexts/AuthContext';
import { getAddresses } from '../../services/AddressService';
import { getShippingMethods } from '../../services/ShippingMethodService';
import { createZaloPayPayment } from '../../services/PaymentService';
import axiosInstance from '../../utils/axiosInstance';

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Lấy thông tin từ CartPage nếu có
  const cartData = location.state?.cartData;
  
  const [cartItems, setCartItems] = useState(cartData?.cartItems || []);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    phone: '',
    address: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(cartData?.appliedCoupon || null);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(!cartData);
  const [error, setError] = useState(null);
  const [addressList, setAddressList] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState('');

  // Load cart data nếu không có từ CartPage
  useEffect(() => {
    if (!cartData) {
      loadCartData();
    } else {
      setLoading(false);
    }
  }, [cartData]);

  useEffect(() => {
    console.log(user);
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user.full_name || '',
        phone: user.phone || ''
      }));
      // Fetch address list
      getAddresses().then(res => {
        if (res.success) setAddressList(res.data);
      });
      // Fetch shipping methods
      getShippingMethods().then(data => {
        setShippingMethods(data);
        if (data.length > 0) {
          setSelectedShippingMethod(data[0].id);
        }
      }).catch(error => {
        console.error('Error loading shipping methods:', error);
      });
    }
  }, [user]);

  // Khi chọn địa chỉ đã lưu
  useEffect(() => {
    if (selectedAddressId && addressList.length > 0) {
      const addr = addressList.find(a => a.id === selectedAddressId);
      if (addr) {
        setShippingInfo(prev => ({
          ...prev,
          address: addr.address_line || ''
        }));
      }
    } else if (selectedAddressId === '') {
      setShippingInfo(prev => ({
        ...prev,
        address: ''
      }));
    }
  }, [selectedAddressId, addressList]);

  // Nếu không có dữ liệu giỏ hàng và đang loading, hiển thị loading
  if (loading) {
    return (
      <div className="checkout-page">
        <PublicHeader />
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Thanh toán</h1>
          </div>
          <div className="checkout-content">
            <div className="empty-cart">
              <div className="empty-cart-icon">⏳</div>
              <h3>Đang tải...</h3>
              <p>Vui lòng chờ trong giây lát.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const loadCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCart();
      if (response.success) {
        const transformedItems = response.data.map(item => ({
          id: item.id,
          bookId: item.book_id,
          title: item.title,
          author: item.author,
          price: item.price,
          originalPrice: item.original_price || item.price,
          discount: item.original_price ? Math.round(((item.original_price - item.price) / item.original_price) * 100) : 0,
          image_path: item.image_path,
          quantity: item.quantity,
          stock: item.stock
        }));
        setCartItems(transformedItems);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Có lỗi xảy ra khi tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  // Tính toán tổng tiền
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const discount = appliedCoupon ? Math.round(subtotal * (appliedCoupon.discount / 100)) : 0;
  
  // Lấy phí vận chuyển từ shipping method được chọn
  const selectedMethod = shippingMethods.find(method => method.id === selectedShippingMethod);
  const shippingFee = selectedMethod ? Number(selectedMethod.fee) || 0 : 0;
  const total = subtotal - discount + shippingFee;

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    
    const coupons = {
      'SALE10': { discount: 10, description: 'Giảm 10% cho đơn hàng' },
      'FREESHIP': { discount: 0, description: 'Miễn phí vận chuyển', freeShipping: true },
      'NEW20': { discount: 20, description: 'Giảm 20% cho khách hàng mới' }
    };
    
    const coupon = coupons[couponCode.toUpperCase()];
    if (coupon) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), ...coupon });
      alert('Áp dụng mã giảm giá thành công!');
    } else {
      alert('Mã giảm giá không hợp lệ!');
    }
    setCouponCode('');
  };

  // Xử lý xóa mã giảm giá
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  // Xử lý thay đổi thông tin giao hàng
  const handleShippingInfoChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Xử lý quay lại giỏ hàng
  const handleBackToCart = () => {
    navigate('/cart');
  };

  // Xử lý đặt hàng
  const handlePlaceOrder = async () => {
    console.log('handlePlaceOrder called');
    // Kiểm tra thông tin giao hàng
    if (!shippingInfo.fullName || !shippingInfo.phone) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    if (addressList.length > 0 && !selectedAddressId) {
      alert('Vui lòng chọn địa chỉ giao hàng!');
      return;
    }

    if (addressList.length === 0 && !shippingInfo.address) {
      alert('Vui lòng nhập địa chỉ giao hàng!');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    setIsLoading(true);
    try {
      if (paymentMethod === 'online') {
        const orderInfo = `Thanh toán đơn hàng cho ${shippingInfo.fullName}`;
        const redirectUrl = window.location.origin + '/zalopay-result';
        const res = await createZaloPayPayment({
          amount: total,
          orderInfo,
          redirectUrl
        });
        if (res.data && res.data.order_url) {
          window.location.href = res.data.order_url;
        } else {
          alert('Không lấy được link thanh toán ZaloPay');
        }
        setIsLoading(false);
        return;
      }
      // Debug địa chỉ
      console.log('selectedAddressId:', selectedAddressId);
      console.log('addressList:', addressList);
      const selectedAddress = addressList.find(a => a.id == selectedAddressId);
      console.log('selectedAddress:', selectedAddress);
      const fullAddress = selectedAddress
        ? [
            selectedAddress.address_line,
            selectedAddress.ward,
            selectedAddress.district && getDistrictName(selectedAddress.district),
            selectedAddress.province && getCityName(selectedAddress.province)
          ].filter(Boolean).join(', ')
        : shippingInfo.address;
      console.log('Shipping address gửi lên backend:', fullAddress);
      const orderPayload = {
        userID: user.id,
        shipping_method_id: selectedShippingMethod,
        shipping_address: fullAddress,
        promotion_code: appliedCoupon?.promotion_code || appliedCoupon?.code || '',
        total_amount: subtotal,
        shipping_fee: shippingFee,
        discount_amount: discount,
        final_amount: total,
        payment_method: paymentMethod,
        orderDetails: cartItems.map(item => ({
          book_id: item.bookId,
          quantity: item.quantity,
          unit_price: item.price
        }))
      };
      console.log('Order payload gửi lên backend:', orderPayload);
      const res = await axiosInstance.post('/orders', orderPayload);
      const orderInfo = {
        orderCode: res.data.orderId,
        paymentMethod,
        total
      };
      navigate('/order-success', { state: { orderInfo } });
    } catch (error) {
      console.error('Order error:', error);
      let msg = 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!';
      if (error.response && error.response.data && error.response.data.detail) {
        msg += '\n' + JSON.stringify(error.response.data.detail);
      } else if (error.response && error.response.data && error.response.data.error) {
        msg += '\n' + error.response.data.error;
      }
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  // Hàm lấy URL ảnh đúng chuẩn backend
  const getBookImageUrl = (imagePath) => {
    if (!imagePath) return '/assets/book-default.jpg';
    return imagePath.startsWith('http')
      ? imagePath
      : `http://localhost:5000${imagePath}`;
  };

  const getCityName = (cityCode) => {
    const cities = {
      'hanoi': 'Hà Nội',
      'hcm': 'TP. Hồ Chí Minh',
      'danang': 'Đà Nẵng',
      'cantho': 'Cần Thơ'
    };
    return cities[cityCode] || cityCode;
  };

  const getDistrictName = (districtCode) => {
    const districts = {
      'district1': 'Quận 1',
      'district2': 'Quận 2',
      'district3': 'Quận 3'
    };
    return districts[districtCode] || districtCode;
  };

  // Kiểm tra user đã đăng nhập chưa
  if (!user) {
    return (
      <div className="checkout-page">
        <PublicHeader />
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Thanh toán</h1>
          </div>
          <div className="checkout-content">
            <div className="empty-cart">
              <div className="empty-cart-icon">🔒</div>
              <h3>Vui lòng đăng nhập</h3>
              <p>Bạn cần đăng nhập để tiếp tục thanh toán.</p>
              <button 
                className="btn-continue-shopping"
                onClick={() => navigate('/login')}
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Kiểm tra giỏ hàng trống
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <PublicHeader />
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Thanh toán</h1>
          </div>
          <div className="checkout-content">
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Giỏ hàng trống</h3>
              <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
              <button 
                className="btn-continue-shopping"
                onClick={() => navigate('/books')}
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <PublicHeader />
      
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Thanh toán</h1>
          <div className="checkout-steps">
            <div className="step completed">
              <span className="step-number">✓</span>
              <span className="step-text">Giỏ hàng</span>
            </div>
            <div className="step-line"></div>
            <div className="step active">
              <span className="step-number">2</span>
              <span className="step-text">Thông tin giao hàng</span>
            </div>
            <div className="step-line"></div>
            <div className="step">
              <span className="step-number">3</span>
              <span className="step-text">Đặt hàng thành công</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-left">
            <div className="shipping-section">
              <h2>Thông tin giao hàng</h2>
              <div className="shipping-form">
                {/* Các trường thông tin khác */}
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <input
                    type="text"
                    value={shippingInfo.fullName}
                    onChange={(e) => handleShippingInfoChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => handleShippingInfoChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                    readOnly
                  />
                </div>
                {/* Combobox chọn địa chỉ đã lưu */}
                {addressList.length > 0 ? (
                  <div className="form-group">
                    <label>Địa chỉ giao hàng *</label>
                    <select
                      value={selectedAddressId}
                      onChange={e => setSelectedAddressId(e.target.value)}
                    >
                      <option value="">-- Chọn địa chỉ --</option>
                      {addressList.map(addr => (
                        <option key={addr.id} value={addr.id}>
                          {addr.address_line}
                          {addr.ward && `, ${addr.ward}`}
                          {addr.district && `, ${getDistrictName(addr.district)}`}
                          {addr.province && `, ${getCityName(addr.province)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Chọn địa chỉ giao hàng *</label>
                    <div style={{color: 'red', fontWeight: 500}}>
                      Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ trong tài khoản trước khi đặt hàng.
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="payment-section">
              <h2>Phương thức thanh toán</h2>
              <div className="payment-methods">
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                />
                <span className="method-icon">💵</span>
                <span className="method-text">Thanh toán khi nhận hàng (COD)</span>
              </label>
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                />
                <span className="method-icon">💳</span>
                <span className="method-text">ZaloPay</span>
              </label>
              </div>
            </div>
          </div>
          <div className="checkout-right">
            <div className="shipping-methods-section">
              <h2>Phương thức vận chuyển</h2>
              <div className="shipping-methods">
                {shippingMethods.map(method => (
                  <label key={method.id} className="shipping-method">
                    <input
                      type="radio"
                      name="shippingMethod"
                      value={method.id}
                      checked={selectedShippingMethod === method.id}
                      onChange={() => setSelectedShippingMethod(method.id)}
                    />
                    <div className="method-info">
                      <span className="method-name">{method.name}</span>
                      <span className="method-description">{method.description}</span>
                    </div>
                    <span className="method-fee">
                      {method.fee === 0 ? 'Miễn phí' : `${Number(method.fee).toLocaleString('vi-VN')}đ`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="order-summary">
              <h2>Tổng đơn hàng</h2>
              
              {/* Khuyến mãi */}
              {!appliedCoupon && (
                <div className="coupon-section" style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#4a5568' }}>Mã khuyến mãi</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã khuyến mãi"
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      style={{
                        padding: '10px 16px',
                        background: '#6ec6c6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              )}
              
              {/* Chi tiết sản phẩm */}
              <div className="order-items">
                <h3>Sản phẩm đã chọn</h3>
                <div className="order-items-list">
                  {cartItems.map(item => (
                    <div key={item.id} className="order-item">
                      <div className="item-image">
                        <img src={getBookImageUrl(item.image_path)} alt={item.title} />
                      </div>
                      <div className="item-info">
                        <h4 className="item-title">{item.title}</h4>
                        <p className="item-author">Tác giả: {item.author}</p>
                        <div className="item-price">
                          <span className="current-price">{formatCurrency(item.price)}</span>
                          {item.originalPrice > item.price && (
                            <span className="original-price">{formatCurrency(item.originalPrice)}</span>
                          )}
                        </div>
                      </div>
                      <div className="item-quantity">
                        <span>SL: {item.quantity}</span>
                      </div>
                      <div className="item-total">
                        <span className="total-price">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Chi tiết đơn hàng */}
              <div className="order-details">
                <div className="detail-row">
                  <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="detail-row">
                    <span>Khuyến mãi áp dụng:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#48bb78', fontWeight: '500' }}>
                        {(appliedCoupon.promotion_code || appliedCoupon.code || appliedCoupon.id)} - Giảm {appliedCoupon.discount}%
                      </span>
                      <button 
                        onClick={handleRemoveCoupon}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e53e3e',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #e53e3e'
                        }}
                        title="Bỏ chọn khuyến mãi"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                {discount > 0 && (
                  <div className="detail-row">
                    <span>Giảm giá:</span>
                    <span style={{ color: '#48bb78' }}>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span>Phí vận chuyển ({selectedMethod?.name || 'Chưa chọn'}):</span>
                  <span>{shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}</span>
                </div>
                <div className="detail-row total">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              {/* Nút điều hướng */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn-place-order"
                  onClick={handleBackToCart}
                  style={{ flex: 1, background: '#718096' }}
                >
                  Quay lại giỏ hàng
                </button>
                <button 
                  className="btn-place-order"
                  onClick={handlePlaceOrder}
                  disabled={isLoading || cartItems.length === 0}
                  style={{ flex: 1 }}
                >
                  {isLoading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
