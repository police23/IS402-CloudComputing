import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import PublicHeader from '../../components/common/PublicHeader';
import { getCart, updateQuantity, removeFromCart } from '../../services/CartService';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { getAllBooksPricing } from '../../services/BookService';

function CartPage() {
  const navigate = useNavigate();
  const { user, loadCartCount } = useAuth();
  const [cartItems, setCartItems] = useState([]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = appliedCoupon 
    ? (appliedCoupon.type === 'percent' || appliedCoupon.discountType === 'percent')
      ? Math.round(subtotal * (appliedCoupon.discount / 100))
      : Number(appliedCoupon.discount)
    : 0;
  const total = subtotal - discount;

  // Load cart data khi component mount
  useEffect(() => {
    loadCartData();
  }, []);

  // Lấy khuyến mãi khả dụng khi subtotal thay đổi
  useEffect(() => {
    if (subtotal > 0) {
      fetchAvailablePromotions();
    } else {
      setAvailablePromotions([]);
    }
  }, [subtotal]);

  useEffect(() => {
    if (
      appliedCoupon &&
      !availablePromotions.some(p => p.id === appliedCoupon.id)
    ) {
      setAppliedCoupon(null);
    }
  }, [availablePromotions, appliedCoupon]);

  const fetchAvailablePromotions = async () => {
    try {
      const res = await axios.get('/api/promotions/available', {
        params: { total_price: subtotal }
      });
      setAvailablePromotions(res.data || []);
    } catch (err) {
      setAvailablePromotions([]);
    }
  };

  const loadCartData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCart();
      console.log('Cart API response:', response); // Debug log
      if (response.success) {
        console.log('Cart items from backend:', response.data); // Debug log
        // Transform data để phù hợp với format hiện tại
  const transformedItems = response.data.map(item => {
          console.log('Processing cart item:', item); // Debug log
          console.log('Item images:', item.images); // Debug log
          // Nếu không có images/imageUrls nhưng có image_path thì tạo mảng images
          let images = item.images;
          if ((!images || images.length === 0) && item.image_path) {
            images = [{ image_path: item.image_path }];
          }
          // Nếu có imageUrls thì giữ nguyên
          let imageUrls = item.imageUrls;
          if ((!imageUrls || imageUrls.length === 0) && item.image_path) {
            imageUrls = [item.image_path];
          }
          const currentPrice = (typeof item.discounted_price !== 'undefined' && item.discounted_price !== null)
            ? Number(item.discounted_price)
            : Number(item.price);
          const origPrice = (typeof item.original_price !== 'undefined' && item.original_price !== null)
            ? Number(item.original_price)
            : Number(item.price);
          const discountPercent = origPrice > 0 && currentPrice < origPrice
            ? Math.round(((origPrice - currentPrice) / origPrice) * 100)
            : 0;

          const transformedItem = {
            id: item.id,
            bookId: item.book_id,
            title: item.title,
            author: item.author,
            price: currentPrice,
            originalPrice: origPrice,
            discount: discountPercent,
            image_path: item.image_path,
            images,
            imageUrls,
            quantity: item.quantity,
            stock: item.stock
          };
          console.log('Transformed item:', transformedItem); // Debug log
          return transformedItem;
        });
        // Enrich prices from pricing view (discounted/original)
        try {
          const pricingRows = await getAllBooksPricing();
          const priceById = new Map(pricingRows.map(r => [r.id, r]));
          const mergedItems = transformedItems.map(it => {
            const pv = priceById.get(it.bookId);
            if (!pv) return it;
            const pvOriginal = Number(pv.original_price ?? it.originalPrice ?? it.price ?? 0);
            const pvDiscounted = pv.discounted_price != null ? Number(pv.discounted_price) : pvOriginal;
            const pvPercent = pvOriginal > 0 && pvDiscounted < pvOriginal
              ? Math.round(((pvOriginal - pvDiscounted) / pvOriginal) * 100)
              : 0;
            return {
              ...it,
              price: pvDiscounted,
              originalPrice: pvOriginal,
              discount: pvPercent,
            };
          });
          setCartItems(mergedItems);
        } catch (e) {
          console.warn('Failed to merge pricing view into cart items:', e);
          setCartItems(transformedItems);
        }
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

  // Xử lý thay đổi số lượng
  const handleQuantityChange = async (bookId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const item = cartItems.find(item => item.bookId === bookId);
      if (!item) return;
      const response = await updateQuantity(bookId, Math.min(newQuantity, item.stock));
      if (response.success) {
        await loadCartData();
        await loadCartCount();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi cập nhật số lượng');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Có lỗi xảy ra khi cập nhật số lượng');
    }
  };

  // Xử lý xóa sản phẩm
  const handleRemoveItem = async (bookId) => {
    try {
      const item = cartItems.find(item => item.bookId === bookId);
      if (!item) return;
      const response = await removeFromCart(bookId);
      if (response.success) {
        await loadCartData();
        await loadCartCount();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  // Xử lý chọn khuyến mãi
  const handleApplyPromotion = (promo) => {
    setAppliedCoupon(promo);
  };
  // Xử lý bỏ chọn khuyến mãi
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };



  // Xử lý chuyển bước
  const handleNextStep = () => {
    // Chuyển đến trang checkout với dữ liệu giỏ hàng
    navigate('/checkout', {
      state: {
        cartData: {
          cartItems: cartItems,
          appliedCoupon: appliedCoupon
        }
      }
    });
  };

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  // Hàm lấy URL ảnh đúng chuẩn backend cho item
  const getBookImageUrl = (item) => {
    console.log('getBookImageUrl - item:', item); // Debug log
    // Ưu tiên lấy từ images (mảng)
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
      const imagePath = item.images[0].image_path;
      console.log('Using images[0].image_path:', imagePath); // Debug log
      return imagePath.startsWith('http') ? imagePath : `http://localhost:5000${imagePath}`;
    }
    // Fallback cho imageUrls (mảng)
    if (item.imageUrls && Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
      const url = item.imageUrls[0];
      console.log('Using imageUrls[0]:', url); // Debug log
      return url.startsWith('http') ? url : `http://localhost:5000${url}`;
    }
    // Fallback cho image_path
    if (item.image_path) {
      console.log('Using image_path:', item.image_path); // Debug log
      return item.image_path.startsWith('http') ? item.image_path : `http://localhost:5000${item.image_path}`;
    }
    // Fallback cho image hoặc cover
    if (item.image) {
      console.log('Using image:', item.image); // Debug log
      return item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`;
    }
    if (item.cover) {
      console.log('Using cover:', item.cover); // Debug log
      return item.cover.startsWith('http') ? item.cover : `http://localhost:5000${item.cover}`;
    }
    // Ảnh mặc định
    console.log('Using default image'); // Debug log
    return '/assets/book-default.jpg';
  };

  // Kiểm tra user đã đăng nhập chưa
  if (!user) {
    return (
      <div className="cart-page">
        <PublicHeader />
        <div className="checkout-container">
          <div className="checkout-header">
            <h1>Giỏ hàng & Thanh toán</h1>
          </div>
          <div className="checkout-content">
            <div className="cart-section">
              <div className="empty-cart">
                <div className="empty-cart-icon">🔒</div>
                <h3>Vui lòng đăng nhập</h3>
                <p>Bạn cần đăng nhập để xem giỏ hàng.</p>
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
      </div>
    );
  }

  return (
    <div className="cart-page">
      <PublicHeader />
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Giỏ hàng</h1>
          <div className="checkout-steps">
            <div className="step active">
              <span className="step-number">1</span>
              <span className="step-text">Giỏ hàng</span>
            </div>
            <div className="step-line"></div>
            <div className="step">
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
          <div className="cart-section">
            <h2>Sản phẩm trong giỏ hàng</h2>
            
            {loading ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">⏳</div>
                <h3>Đang tải...</h3>
                <p>Vui lòng chờ trong giây lát.</p>
              </div>
            ) : error ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">❌</div>
                <h3>Có lỗi xảy ra</h3>
                <p>{error}</p>
                <button 
                  className="btn-continue-shopping"
                  onClick={loadCartData}
                >
                  Thử lại
                </button>
              </div>
            ) : cartItems.length === 0 ? (
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
            ) : (
              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.bookId} className="cart-item">
                    <div className="item-image">
                      <img src={getBookImageUrl(item)} alt={item.title} />
                    </div>
                    <div className="item-info">
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-author">Tác giả: {item.author}</p>
                      <div className="item-price">
                        <span className="current-price">{formatCurrency(item.price)}</span>
                        {item.originalPrice > item.price && (
                          <span className="original-price">{formatCurrency(item.originalPrice)}</span>
                        )}
                      </div>
                    </div>
                    <div className="item-quantity">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => handleQuantityChange(item.bookId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item.bookId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="item-total">
                      <span className="total-price">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => handleRemoveItem(item.bookId)}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="order-summary">
            <h2>Tổng đơn hàng</h2>
            {/* Chi tiết đơn hàng */}
            <div className="order-details">
              <div className="detail-row">
                <span>Tạm tính ({cartItems.length} sản phẩm):</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>              
              <div className="detail-row total">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Nút điều hướng */}
              <button 
                className="btn-place-order"
                onClick={handleNextStep}
                disabled={cartItems.length === 0}
              >
              Tiếp tục thanh toán
                </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage; 