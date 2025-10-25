import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './BookDetailPage.css';
import PublicHeader from '../../components/common/PublicHeader';
import { getBookById, getAllBooksPricing, getBooksByCategory } from '../../services/BookService';
import { addToCart } from '../../services/CartService';
import { useAuth } from '../../contexts/AuthContext';
import { rateBook, getRatingsByBookID, hasPurchasedBook } from '../../services/RatingService';

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loadCartCount } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [relatedBooks, setRelatedBooks] = useState([]);

  // Debug info
  console.log('BookDetailPage render - book state:', book);
  console.log('BookDetailPage render - loading:', loading);
  console.log('BookDetailPage render - error:', error);
  
  // Debug book structure
  if (book) {
    console.log('Book category:', book.category, typeof book.category);
    console.log('Book publisher:', book.publisher, typeof book.publisher);
  }

  useEffect(() => {
    let isMounted = true;
    const fetchBookData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('BookDetailPage - ID from params:', id);
        console.log('BookDetailPage - Location state:', location.state);
        
        // Ưu tiên lấy từ location.state nếu có
        const bookFromState = location.state?.book;
        if (bookFromState && bookFromState.id === Number(id)) {
          console.log('Using book data from state:', bookFromState);
          let mergedFromState = bookFromState;
          try {
            if (mergedFromState.original_price == null || mergedFromState.discounted_price == null) {
              const pricingRows = await getAllBooksPricing();
              const pv = pricingRows.find(r => r.id === Number(id));
              if (pv) {
                mergedFromState = {
                  ...mergedFromState,
                  original_price: pv.original_price ?? mergedFromState.price,
                  discounted_price: pv.discounted_price ?? null,
                  category_name: pv.category_name ?? mergedFromState.category?.name ?? mergedFromState.category,
                  publisher_name: pv.publisher_name ?? mergedFromState.publisher?.name ?? mergedFromState.publisher,
                };
              }
            }
          } catch (e) {
            console.warn('Failed to enrich from pricing view (state path):', e);
          }
          if (isMounted) {
            setBook(mergedFromState);
            setLoading(false);
          }
          return;
        }
        
        // Nếu không có thì gọi API
        console.log('Fetching book data from API for id:', id);
        const data = await getBookById(id);
        console.log('Book data from API:', data);
        let merged = data;
        try {
          const pricingRows = await getAllBooksPricing();
          const pv = pricingRows.find(r => r.id === Number(id));
          if (pv) {
            merged = {
              ...data,
              original_price: pv.original_price ?? data.price,
              discounted_price: pv.discounted_price ?? null,
              category_name: pv.category_name ?? data.category?.name ?? data.category,
              publisher_name: pv.publisher_name ?? data.publisher?.name ?? data.publisher,
            };
          }
        } catch (e) {
          console.warn('Failed to enrich from pricing view (API path):', e);
        }
        
        if (isMounted) {
          if (merged && merged.id) {
            setBook(merged);
          } else {
            console.error('No valid book data received:', merged);
            setError('Không tìm thấy thông tin sách');
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        if (isMounted) {
          setError('Không tìm thấy thông tin sách: ' + err.message);
          setLoading(false);
        }
      }
    };
    fetchBookData();
    return () => { isMounted = false; };
  }, [id, location.state]);

  // Lấy đánh giá từ backend
  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const data = await getRatingsByBookID(id);
        setReviews(data);
        // Nếu user đã đánh giá, điền sẵn
        if (user) {
          const myReview = data.find(r => r.user_id === user.id);
          if (myReview) {
            setMyRating(myReview.rating);
            setMyComment(myReview.comment || '');
          }
        }
      } catch (e) {
        setReviews([]);
      }
    };
    fetchRatings();
  }, [id, user]);

  // Kiểm tra quyền đánh giá (user đã mua sách)
  useEffect(() => {
    const checkCanRate = async () => {
      if (!user) {
        setCanRate(false);
        return;
      }
      try {
        const purchased = await hasPurchasedBook(id);
        setCanRate(purchased);
      } catch {
        setCanRate(false);
      }
    };
    checkCanRate();
  }, [user, id]);

  // Lấy sách liên quan cùng thể loại
  useEffect(() => {
    const fetchRelatedBooks = async () => {
      if (!book || !book.category_id && !book.category) {
        setRelatedBooks([]);
        return;
      }
      try {
        const categoryId = book.category_id || (book.category && typeof book.category === 'object' ? book.category.id : null);
        if (!categoryId) {
          setRelatedBooks([]);
          return;
        }
        const related = await getBooksByCategory(categoryId, id, 6);
        setRelatedBooks(related);
      } catch (error) {
        console.error('Error fetching related books:', error);
        setRelatedBooks([]);
      }
    };
    fetchRelatedBooks();
  }, [book, id]);

  // Tính toán giá gốc và giá sau giảm từ dữ liệu view nếu có
  const originalPrice = book ? Number(book.original_price ?? book.price ?? 0) : 0;
  const discountedPrice = book && book.discounted_price != null ? Number(book.discounted_price) : originalPrice;
  const savings = (originalPrice && discountedPrice) ? (originalPrice - discountedPrice) : 0;
  const discountPercent = originalPrice > 0 && discountedPrice < originalPrice
    ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
    : 0;

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (newQuantity) => {
    if (book && newQuantity >= 1 && newQuantity <= (book.stock || book.quantity_in_stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!book) return;
    
    if (!user) {
      alert('Vui lòng đăng nhập để thêm sách vào giỏ hàng');
      navigate('/login');
      return;
    }

    try {
      const response = await addToCart(book.id, quantity);
      if (response.success) {
        alert(`Đã thêm ${quantity} cuốn "${book.title || book.name}" vào giỏ hàng!`);
        // Cập nhật số lượng trong context
        await loadCartCount();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng: ' + error.message);
    }
  };

  // Xử lý thêm sách liên quan vào giỏ hàng
  const handleAddToCartRelated = async (relatedBook) => {
    if (!user) {
      alert('Vui lòng đăng nhập để thêm sách vào giỏ hàng');
      navigate('/login');
      return;
    }

    try {
      const response = await addToCart(relatedBook.id, 1);
      if (response.success) {
        alert(`Đã thêm "${relatedBook.title || relatedBook.name}" vào giỏ hàng!`);
        await loadCartCount();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding related book to cart:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  // Xử lý mua ngay
  const handleBuyNow = async () => {
    if (!book) return;
    if (!user) {
      alert('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }
    // Tạo dữ liệu sản phẩm mua ngay
    const cartData = {
      cartItems: [
        {
          id: book.id,
          bookId: book.id,
          title: book.title,
          author: book.author,
          price: discountedPrice,
          originalPrice: originalPrice,
          discount: discountPercent,
          image_path: (book.images && book.images[0]?.image_path) || (book.imageUrls && book.imageUrls[0]),
          quantity: quantity,
          stock: book.stock || book.quantity_in_stock || 0
        }
      ],
      appliedCoupon: null
    };
    navigate('/checkout', { state: { cartData } });
  };

  // Xử lý thêm vào yêu thích
  const handleToggleFavorite = async () => {
    if (!book) return;
    try {
      if (isFavorite) {
        console.log('Đã xóa khỏi yêu thích!');
        alert('Đã xóa khỏi yêu thích!');
      } else {
        console.log('Đã thêm vào yêu thích!');
        alert('Đã thêm vào yêu thích! Bạn có thể xem trong trang Yêu thích.');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      alert('Có lỗi xảy ra: ' + error.message);
    }
  };

  // Gửi đánh giá
  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!myRating) {
      alert('Vui lòng chọn số sao!');
      return;
    }
    setSubmitting(true);
    try {
      const res = await rateBook(id, myRating, myComment);
      if (res.error) {
        alert(res.error);
      } else {
        alert(res.message || 'Đánh giá thành công!');
        // Reload lại đánh giá
        const data = await getRatingsByBookID(id);
        setReviews(data);
      }
    } catch (err) {
      alert('Có lỗi khi gửi đánh giá!');
    } finally {
      setSubmitting(false);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <div className="book-detail-page">
        <PublicHeader />
        <div className="book-detail-container">
          <div className="loading">Đang tải thông tin sách...</div>
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="book-detail-page">
        <PublicHeader />
        <div className="book-detail-container">
          <div className="error">
            {error}
            <button onClick={() => navigate('/books')}>Quay lại danh sách sách</button>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-detail-page">
        <PublicHeader />
        <div className="book-detail-container">
          <div className="error">
            Không tìm thấy thông tin sách
            <button onClick={() => navigate('/books')}>Quay lại danh sách sách</button>
          </div>
        </div>
      </div>
    );
  }

  // Tính toán đánh giá trung bình và thống kê
  const averageRating = (reviews && Array.isArray(reviews) && reviews.length > 0) ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  const getRatingStats = () => {
    if (!reviews || !Array.isArray(reviews)) return {
      counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      stats[review.rating]++;
    });
    const total = reviews.length;
    return {
      counts: stats,
      percentages: {
        1: total > 0 ? Math.round((stats[1] / total) * 100) : 0,
        2: total > 0 ? Math.round((stats[2] / total) * 100) : 0,
        3: total > 0 ? Math.round((stats[3] / total) * 100) : 0,
        4: total > 0 ? Math.round((stats[4] / total) * 100) : 0,
        5: total > 0 ? Math.round((stats[5] / total) * 100) : 0
      }
    };
  };
  const ratingStats = getRatingStats();

  const getBookImageUrl = (book, idx = 0) => {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '');
    if (book.images && book.images.length > 0) {
      const imagePath = book.images[idx] ? book.images[idx].image_path : book.images[0].image_path;
      return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}${imagePath}`;
    }
    if (book.imageUrls && book.imageUrls.length > 0) {
      const url = book.imageUrls[idx] || book.imageUrls[0];
      return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
    }
    return '/assets/book-placeholder.jpg';
  };

  const getImageList = (book) => {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '');
    if (book.images && book.images.length > 0) {
      return book.images.map(img => img.image_path.startsWith('http') ? img.image_path : `${BACKEND_URL}${img.image_path}`);
    }
    if (book.imageUrls && book.imageUrls.length > 0) {
      return book.imageUrls.map(url => url.startsWith('http') ? url : `${BACKEND_URL}${url}`);
    }
    return ['/assets/book-placeholder.jpg'];
  };

  return (
    <div className="book-detail-page">
      <PublicHeader />
      <div className="book-detail-container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate('/')}>Trang chủ</span>
          <span> / </span>
          <span onClick={() => navigate('/books')}>Sách</span>
          <span> / </span>
          <span>{book.title || book.name}</span>
        </div>
        {/* Thông tin sách chính */}
        <div className="book-detail-main">
          {/* Hình ảnh sách */}
          <div className="book-images">
            <div className="main-image">
              <img
                src={getBookImageUrl(book, selectedImage) || '/assets/book-placeholder.jpg'}
                alt={book.title || book.name}
              />
            </div>
            <div className="image-thumbnails">
              {getImageList(book).map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`${book.title || book.name} ${idx + 1}`}
                  className={selectedImage === idx ? 'active' : ''}
                  onClick={() => setSelectedImage(idx)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
          {/* Thông tin sách */}
          <div className="book-info">
            <h1 className="book-title">{book.title || book.name || 'Không rõ'}</h1>
            {/* Đánh giá */}
            <div className="book-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={star <= averageRating ? 'star filled' : 'star'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="rating-text">{averageRating.toFixed(1)} ({reviews ? reviews.length : 0} đánh giá)</span>
            </div>
            {/* Giá */}
            <div className="book-price">
              <span className="current-price">{discountedPrice.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ</span>
              {originalPrice > discountedPrice && (
                <>
                  <span className="original-price">{originalPrice.toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ</span>
                  {discountPercent > 0 && <span className="discount">-{discountPercent}%</span>}
                </>
              )}
            </div>
            {/* Thông tin cơ bản */}
            <div className="book-meta">
              <div className="meta-item">
                <span className="label">Thể loại:</span>
                <span className="value">{(book.category && typeof book.category === 'object') ? book.category.name : (book.category_name || book.category || 'Không rõ')}</span>
              </div>
              <div className="meta-item">
                <span className="label">Nhà xuất bản:</span>
                <span className="value">{(book.publisher && typeof book.publisher === 'object') ? book.publisher.name : (book.publisher_name || book.publisher || 'Không rõ')}</span>
              </div>
              <div className="meta-item">
                <span className="label">Năm xuất bản:</span>
                <span className="value">{book.publication_year || book.publicationYear || 'Không rõ'}</span>
              </div>
              <div className="meta-item">
                <span className="label">Tác giả:</span>
                <span className="value">{(book.author && typeof book.author === 'object') ? book.author.name : (book.author_name || book.author || 'Không rõ')}</span>
              </div>
            </div>
            {/* Tình trạng kho */}
            <div className="stock-status">
              <span className={`status ${(book.stock || book.quantity_in_stock) > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {(book.stock || book.quantity_in_stock) > 0 ? 'Còn hàng' : 'Hết hàng'}
              </span>
              {(book.stock || book.quantity_in_stock) > 0 && <span className="stock-count">({book.stock || book.quantity_in_stock} cuốn)</span>}
            </div>
            {/* Chọn số lượng */}
            <div className="quantity-selector">
              <span className="label">Số lượng:</span>
              <div className="quantity-controls">
                <button 
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  min="1"
                  max={book.stock || book.quantity_in_stock || 1}
                />
                <button 
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= (book.stock || book.quantity_in_stock)}
                >
                  +
                </button>
              </div>
            </div>
            {/* Nút hành động */}
            <div className="action-buttons">
              <button className="btn-add-cart" onClick={handleAddToCart}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68L21 13M7 13V6a1 1 0 011-1h6a1 1 0 011 1v7"/>
                </svg>
                Thêm vào giỏ hàng
              </button>
              <button className="btn-buy-now" onClick={handleBuyNow}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Mua ngay
              </button>
            </div>
            {/* Thông tin giao hàng */}
            <div className="delivery-info">
              <div className="delivery-item">
                <span className="icon">🚚</span>
                <span>Miễn phí vận chuyển cho đơn hàng từ 200.000đ</span>
              </div>
              <div className="delivery-item">
                <span className="icon">🔄</span>
                <span>Đổi trả trong 7 ngày</span>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs thông tin chi tiết */}
        <div className="book-detail-tabs">
          <div className="tab-headers">
            <button 
              className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Mô tả
            </button>
            <button 
              className={`tab-header ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Đánh giá ({reviews ? reviews.length : 0})
            </button>
            <button 
              className={`tab-header ${activeTab === 'related' ? 'active' : ''}`}
              onClick={() => setActiveTab('related')}
            >
              Sách liên quan
            </button>
          </div>
          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <h3>Mô tả sản phẩm</h3>
                <p>{book.description || 'Chưa có mô tả chi tiết cho sách này.'}</p>
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <div className="reviews-summary">
                  <div className="rating-overview">
                  <div className="average-rating">
                    <span className="rating-number">{averageRating.toFixed(1)}</span>
                    <div className="stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={star <= averageRating ? 'star filled' : 'star'}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="total-reviews">{reviews ? reviews.length : 0} đánh giá</span>
                    </div>
                    <div className="rating-stats">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="rating-bar-item">
                          <span className="rating-label">{rating} sao</span>
                          <div className="rating-bar">
                            <div 
                              className="rating-bar-fill" 
                              style={{ width: `${ratingStats.percentages?.[rating] || 0}%` }}
                            ></div>
                          </div>
                          <span className="rating-count">{ratingStats.counts?.[rating] || 0}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {user && canRate && (
                  <form className="review-form" onSubmit={handleSubmitRating} style={{marginBottom: 24, background: '#f0f9f9', padding: 16, borderRadius: 8}}>
                    <div style={{marginBottom: 8}}>
                      <span style={{fontWeight: 500}}>Đánh giá của bạn:</span>
                      <div style={{display: 'inline-block', marginLeft: 8}}>
                        {[1,2,3,4,5].map(star => (
                          <span
                            key={star}
                            className={star <= myRating ? 'star filled' : 'star'}
                            style={{fontSize: 22, cursor: 'pointer', color: star <= myRating ? '#fbbf24' : '#e2e8f0'}}
                            onClick={() => setMyRating(star)}
                          >★</span>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={myComment}
                      onChange={e => setMyComment(e.target.value)}
                      placeholder="Viết nhận xét của bạn..."
                      rows={3}
                      style={{width: '100%', borderRadius: 6, border: '1px solid #e2e8f0', padding: 8, marginBottom: 8}}
                    />
                    <button type="submit" className="btn-add-cart" disabled={submitting} style={{width: 180}}>
                      {submitting ? 'Đang gửi...' : (myRating && reviews.find(r => r.user_id === user.id) ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
                    </button>
                  </form>
                )}
                {user && !canRate && (
                  <div style={{marginBottom: 24, color: '#e53e3e', fontStyle: 'italic'}}>
                    Bạn chỉ có thể đánh giá khi đã mua sách này.
                  </div>
                )}
                <div className="reviews-list">
                  {reviews && Array.isArray(reviews) && reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.id} className="review-item">
                        <div className="review-header">
                        <span className="reviewer-name">{review.user_name}</span>
                          <div className="review-rating">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={star <= review.rating ? 'star filled' : 'star'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="review-date">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</span>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="no-reviews">
                      <p>Chưa có đánh giá nào cho sách này.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'related' && (
              <div className="related-content">
                <div className="related-books">
                  {relatedBooks && relatedBooks.length > 0 ? (
                    <div className="related-books-grid">
                      {relatedBooks.map(relatedBook => (
                        <div key={relatedBook.id} className="related-book-card">
                          <div className="related-book-image">
                            <img
                              src={getBookImageUrl(relatedBook) || '/assets/book-placeholder.jpg'}
                              alt={relatedBook.title || relatedBook.name}
                              onClick={() => navigate(`/book/${relatedBook.id}`, { state: { book: relatedBook } })}
                              style={{ cursor: 'pointer' }}
                            />
                          </div>
                          <h4 
                            className="related-book-title"
                            onClick={() => navigate(`/book/${relatedBook.id}`, { state: { book: relatedBook } })}
                            style={{ cursor: 'pointer' }}
                          >
                            {relatedBook.title || relatedBook.name}
                          </h4>
                          <p className="related-book-author">
                            {relatedBook.author && typeof relatedBook.author === 'object' 
                              ? relatedBook.author.name 
                              : (relatedBook.author_name || relatedBook.author || 'Không rõ')}
                          </p>
                          <p className="related-book-price">
                            {Number(relatedBook.price || 0).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}đ
                          </p>
                          <button 
                            className="btn-add-cart"
                            onClick={() => handleAddToCartRelated(relatedBook)}
                            style={{ width: '100%', marginTop: 8 }}
                          >
                            Thêm vào giỏ
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-related">
                      <p>Chưa có sách liên quan cùng thể loại.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailPage; 