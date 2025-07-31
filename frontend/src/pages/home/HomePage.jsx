import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import PublicHeader from '../../components/common/PublicHeader';
import { getLatestBooks, getTop10MostSoldBooksAll } from '../../services/BookService';
import { addToCart as addToCartAPI } from '../../services/CartService';
import { getAllPromotions } from '../../services/PromotionService';

const banners = [
  {
    id: 1,
    image: '/assets/banner1.jpg',
    title: 'Mua 2 tặng 1 - Sách thiếu nhi',
    desc: 'Ưu đãi tháng 7 cho mọi đơn hàng sách thiếu nhi.'
  },
  {
    id: 2,
    image: '/assets/banner2.jpg',
    title: 'Sách mới về liên tục',
    desc: 'Khám phá những đầu sách hot nhất vừa cập bến.'
  },
  {
    id: 3,
    image: '/assets/banner3.jpg',
    title: 'Giảm giá 30% sách kỹ năng',
    desc: 'Nâng cấp bản thân với sách kỹ năng sống.'
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
          <div className="banner-content">
            <h2>{banner.title}</h2>
            <p>{banner.desc}</p>
          </div>
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
        {books.map((book) => (
          <div className="product-card" key={book.id}>
            <img src={book.image} alt={book.name} onClick={() => handleViewBook(book)} style={{cursor: 'pointer'}} />
            <h3 onClick={() => handleViewBook(book)} style={{cursor: 'pointer'}}>{book.name}</h3>
            <p>{book.price}</p>
            <button onClick={() => handleAddToCart(book)}>Thêm vào giỏ</button>
          </div>
        ))}
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
                {promo.type === 'percent'
                  ? `-${promo.discount}%`
                  : `-${promo.discount ? Number(promo.discount).toLocaleString('vi-VN') : ''}đ`}
              </span>
            </div>
            <div className="promo-name">{promo.name || promo.title}</div>
            <div className="promo-min">
              Đơn tối thiểu: <b>{promo.min_price ? `${Number(promo.min_price).toLocaleString('vi-VN')}đ` : 'Không'}</b>
            </div>
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
  const BACKEND_URL = "http://localhost:5000";

  useEffect(() => {
    getLatestBooks()
      .then(data => setLatestBooks(data))
      .catch(() => setLatestBooks([]));
    getAllPromotions()
      .then(data => setPromotions(Array.isArray(data) ? data : []))
      .catch(() => setPromotions([]));

    // Lấy tháng/năm hiện tại
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    getTop10MostSoldBooksAll(month, year)
      .then(data => setBestSellers(data))
      .catch(() => setBestSellers([]));
  }, []);

  return (
    <div className="homepage-container">
      <PublicHeader />
      <BannerSlider />
      <BookSection
        title="Sách mới"
        books={latestBooks.map(book => ({
          id: book.id,
          name: book.title,
          price: book.price ? `${book.price.toLocaleString()}đ` : '',
          image: book.imageUrls && book.imageUrls.length > 0
            ? (book.imageUrls[0].startsWith('/uploads')
                ? BACKEND_URL + book.imageUrls[0]
                : book.imageUrls[0])
            : '/assets/no-image.png'
        }))}
      />
      <BookSection title="Sách bán chạy" books={bestSellers} />
      <PromoSection promotions={promotions} />
    </div>
  );
}

export default HomePage;
