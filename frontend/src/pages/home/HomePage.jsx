import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import PublicHeader from '../../components/common/PublicHeader';
import { getLatestBooks, getTop10MostSoldBooksAll, getAllBooksPricing } from '../../services/BookService';
import { addToCart as addToCartAPI } from '../../services/CartService';
import { getAllPromotions } from '../../services/PromotionService';

const banners = [
  {
    id: 1,
    image: '/src/assets/img/banner1.png',
  },
  {
    id: 2,
    image: '/src/assets/img/banner2.png',
  },
  {
    id: 3,
    image: '/src/assets/img/banner3.jpg',
  }
];

// Xóa bestSellers cứng, sẽ lấy động từ backend

const promotions = [
  {
    id: 1,
    title: 'Mua 2 tặng 1',
    desc: 'Áp dụng cho sách thiếu nhi đến hết 31/7.',
    image: '/assets/promo1.jpg'
  },
  {
    id: 2,
    title: 'Giảm 30% sách kỹ năng',
    desc: 'Chỉ trong tháng này, số lượng có hạn!',
    image: '/assets/promo2.jpg'
  }
];

function BannerSlider() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="banner-slider">
      {banners.map((banner, idx) => (
        <div
          className={`banner-slide${idx === current ? ' active' : ''}`}
          key={banner.id}
          style={{ backgroundImage: `url(${banner.image})` }}
        >
        </div>
      ))}
      <div className="banner-controls">
        <button onClick={() => setCurrent((current - 1 + banners.length) % banners.length)}>&lt;</button>
        <button onClick={() => setCurrent((current + 1) % banners.length)}>&gt;</button>
      </div>
      <div className="banner-dots">
        {banners.map((_, idx) => (
          <span
            key={idx}
            className={idx === current ? 'active' : ''}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
}

function BookSection({ title, books }) {
  const navigate = useNavigate();
  const formatCurrency = (n) => (Number(n || 0)).toLocaleString('vi-VN') + 'đ';
  
  const handleAddToCart = async (book) => {
    if (!book.id) {
      alert('Không xác định được sách để thêm vào giỏ hàng!');
      return;
    }
    try {
      const res = await addToCartAPI(book.id, 1);
      if (res && res.success) {
        alert(`Đã thêm "${book.name || book.title || ''}" vào giỏ hàng!`);
      } else {
        alert(res && res.message ? res.message : 'Thêm vào giỏ hàng thất bại!');
      }
    } catch (err) {
      alert('Có lỗi khi thêm vào giỏ hàng!');
    }
  };
  
  const handleViewBook = (book) => {
    navigate(`/book/${book.id}`);
  };
  
  return (
    <section className="homepage-section">
      <h2>{title}</h2>
      <div className="products-slider">
        {books.map((book) => {
          const hasDiscount = Number(book.originalPrice) > Number(book.discountedPrice);
          return (
            <div className="product-card" key={book.id}>
              <img src={book.image} alt={book.name} onClick={() => handleViewBook(book)} style={{cursor: 'pointer'}} />
              <h3 onClick={() => handleViewBook(book)} style={{cursor: 'pointer'}}>{book.name}</h3>
              <div className="card-price-wrap">
                <span className="price-discount">{formatCurrency(book.discountedPrice ?? book.price)}</span>
                {hasDiscount && (
                  <span className="price-original">{formatCurrency(book.originalPrice)}</span>
                )}
              </div>
              <button onClick={() => handleAddToCart(book)}>Thêm vào giỏ</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PromoSection({ promotions }) {
  return (
    <section className="homepage-section homepage-promo-list">
      <h2>Khuyến mãi nổi bật</h2>
      <div className="promo-list">
        {promotions.map((promo) => (
          <div className="promo-card promo-card-custom" key={promo.id}>
            <div className="promo-header">
              <span className="promo-code">{promo.promotion_code || promo.code}</span>
              <span className="promo-discount">
                {(promo.type === 'percent' || promo.discountType === 'percent')
                  ? `-${promo.discount}%`
                  : `-${promo.discount ? Number(promo.discount).toLocaleString('vi-VN') : ''}đ`}
              </span>
            </div>
            <div className="promo-name">{promo.name || promo.title}</div>
            <div className="promo-time">
              <span>
                {promo.start_date
                  ? `Từ ${new Date(promo.start_date).toLocaleDateString()}`
                  : ''}
                {promo.end_date
                  ? ` đến ${new Date(promo.end_date).toLocaleDateString()}`
                  : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  const [latestBooks, setLatestBooks] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [pricingMap, setPricingMap] = useState({});
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '');

  useEffect(() => {
    getLatestBooks()
      .then(data => setLatestBooks(Array.isArray(data) ? data : []))
      .catch(() => setLatestBooks([]));
    getAllPromotions()
      .then(data => setPromotions(Array.isArray(data) ? data : []))
      .catch(() => setPromotions([]));

    // Lấy tháng/năm hiện tại
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    getTop10MostSoldBooksAll(month, year)
      .then(data => setBestSellers(Array.isArray(data) ? data : []))
      .catch(() => setBestSellers([]));

    // Pricing view for discounts
    getAllBooksPricing()
      .then(rows => {
        const map = {};
        (Array.isArray(rows) ? rows : []).forEach(pv => {
          const k = pv.book_id ?? pv.id;
          if (k != null) map[k] = pv;
        });
        setPricingMap(map);
      })
      .catch(() => setPricingMap({}));
  }, []);

  // Helper to build image url from book record
  const resolveImage = (book) => {
    if (book.image) return book.image;
    if (book.images && Array.isArray(book.images) && book.images.length > 0) {
      const path = book.images[0].image_path;
      return path?.startsWith('/uploads') ? BACKEND_URL + path : path;
    }
    return '/assets/no-image.png';
  };

  // Merge pricing for Latest
  const latestCards = (latestBooks || []).map(book => {
    const pv = pricingMap[book.id] || {};
    const original = pv.original_price ?? book.original_price ?? book.price;
    const discounted = pv.discounted_price ?? book.discounted_price ?? book.price;
    return {
      id: book.id,
      name: book.title || book.name,
      image: resolveImage(book),
      originalPrice: Number(original || 0),
      discountedPrice: Number(discounted || 0)
    };
  });

  // Merge pricing for Best Sellers
  const bestSellerCards = (bestSellers || []).map(book => {
    const pv = pricingMap[book.id] || {};
    const original = pv.original_price ?? book.original_price ?? book.price;
    const discounted = pv.discounted_price ?? book.discounted_price ?? book.price;
    return {
      id: book.id,
      name: book.name || book.title,
      image: resolveImage(book),
      originalPrice: Number(original || 0),
      discountedPrice: Number(discounted || 0)
    };
  });

  return (
    <div className="homepage-container">
      <PublicHeader />
      <BannerSlider />
      <BookSection title="Sách mới" books={latestCards} />
      <BookSection title="Sách bán chạy" books={bestSellerCards} />
      <PromoSection promotions={promotions} />
    </div>
  );
}

export default HomePage;
