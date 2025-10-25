import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BooksPage.css';
import PublicHeader from '../../components/common/PublicHeader';
import { getAllBooks, getAllBooksPricing } from '../../services/BookService';
import { addToCart } from '../../services/CartService';
import { useAuth } from '../../contexts/AuthContext';

function BooksPage() {
  const navigate = useNavigate();
  const { user, loadCartCount } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPublishers, setSelectedPublishers] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [priceRange, setPriceRange] = useState([20000, 1000000]);
  const [page, setPage] = useState(1);
  const [showAuthorDropdown, setShowAuthorDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showPublisherDropdown, setShowPublisherDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const pageSize = 16;

  // Danh sách năm từ 2018-2025
  const years = Array.from({length: 8}, (_, i) => 2018 + i);

  // Lấy sách từ API khi component mount
  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        const [baseBooks, pricingRows] = await Promise.all([
          getAllBooks(),
          getAllBooksPricing(),
        ]);
        // Index pricing by id for quick merge
        const priceById = new Map(pricingRows.map(r => [r.id, r]));
        const merged = baseBooks.map(b => {
          const pv = priceById.get(b.id);
          if (!pv) return b;
          return {
            ...b,
            original_price: pv.original_price ?? b.price,
            discounted_price: pv.discounted_price ?? null,
            // keep names for any UI use
            category_name: pv.category_name ?? b.category?.name ?? b.category,
            publisher_name: pv.publisher_name ?? b.publisher?.name ?? b.publisher,
          };
        });
        setBooks(merged);
        setLoading(false);
      } catch (err) {
        setError('Lỗi khi tải sách');
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  // Tìm min/max giá động
  const minBookPrice = 20000;
  const maxBookPrice = 1000000;

  // Cập nhật background của range slider
  useEffect(() => {
    const rangeWrap = document.querySelector('.range-slider-wrap');
    if (rangeWrap) {
      const min = minBookPrice;
      const max = maxBookPrice;
      const minPercentage = max - min === 0 ? 0 : ((priceRange[0] - min) * 100) / (max - min);
      const maxPercentage = max - min === 0 ? 100 : ((priceRange[1] - min) * 100) / (max - min);
      rangeWrap.style.setProperty('--min-percent', `${minPercentage}%`);
      rangeWrap.style.setProperty('--max-percent', `${maxPercentage}%`);
    }
  }, [priceRange, minBookPrice, maxBookPrice]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.multi-select')) {
        setShowAuthorDropdown(false);
        setShowCategoryDropdown(false);
        setShowPublisherDropdown(false);
        setShowYearDropdown(false);
      }
    };
    if (showAuthorDropdown || showCategoryDropdown || showPublisherDropdown || showYearDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAuthorDropdown, showCategoryDropdown, showPublisherDropdown, showYearDropdown]);

  // Xử lý click vào label (không phải checkbox)
  const handleLabelClick = (e) => {
    e.stopPropagation();
  };

  // Xử lý chọn/bỏ chọn tác giả
  const handleAuthorChange = (author, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedAuthors(prev => {
      if (prev.includes(author)) {
        return prev.filter(a => a !== author);
      } else {
        return [...prev, author];
      }
    });
    setPage(1);
  };

  // Xử lý chọn/bỏ chọn thể loại
  const handleCategoryChange = (category, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
    setPage(1);
  };

  // Xử lý chọn/bỏ chọn nhà xuất bản
  const handlePublisherChange = (publisher, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPublishers(prev => {
      if (prev.includes(publisher)) {
        return prev.filter(p => p !== publisher);
      } else {
        return [...prev, publisher];
      }
    });
    setPage(1);
  };

  // Xử lý chọn/bỏ chọn năm xuất bản
  const handleYearChange = (year, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        return prev.filter(y => y !== year);
      } else {
        return [...prev, year];
      }
    });
    setPage(1);
  };

  // Xử lý toggle dropdown
  const handleToggleDropdown = (type, e) => {
    e.preventDefault();
    e.stopPropagation();
    switch (type) {
      case 'author':
        setShowAuthorDropdown(!showAuthorDropdown);
        break;
      case 'category':
        setShowCategoryDropdown(!showCategoryDropdown);
        break;
      case 'publisher':
        setShowPublisherDropdown(!showPublisherDropdown);
        break;
      case 'year':
        setShowYearDropdown(!showYearDropdown);
        break;
      default:
        break;
    }
  };

  // Lấy danh sách tác giả, thể loại, NXB động từ books
  const authors = Array.from(new Set(books.map(b => b.author))).filter(Boolean);
  const categories = Array.from(new Set(books.map(b => b.category?.name || b.category_name || b.category))).filter(Boolean);
  const publishers = Array.from(new Set(books.map(b => b.publisher?.name || b.publisher_name || b.publisher))).filter(Boolean);

  // Lọc sách theo từng tiêu chí
  const filteredBooks = books.filter(book => {
    const matchName = name === '' || (book.title || book.name || '').toLowerCase().includes(name.toLowerCase());
    const matchAuthor = selectedAuthors.length === 0 || selectedAuthors.includes(book.author);
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(book.category?.name || book.category_name || book.category);
    const matchPublisher = selectedPublishers.length === 0 || selectedPublishers.includes(book.publisher?.name || book.publisher_name || book.publisher);
    const matchYear = selectedYears.length === 0 || selectedYears.includes(book.publication_year || book.publicationYear);
    // Lọc theo giá KM (nếu có), nếu không thì dùng giá gốc
    const displayPrice = book.discounted_price != null ? Number(book.discounted_price) : Number(book.original_price ?? book.price ?? 0);
    const matchPrice = displayPrice >= priceRange[0] && displayPrice <= priceRange[1];
    return matchName && matchAuthor && matchCategory && matchPublisher && matchYear && matchPrice;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const booksToShow = filteredBooks.slice((page-1)*pageSize, page*pageSize);

  // Xử lý xóa bộ lọc
  const handleClearFilters = (e) => {
    e.preventDefault();
    setSelectedAuthors([]);
    setSelectedCategories([]);
    setSelectedPublishers([]);
    setSelectedYears([]);
    setPriceRange([20000, 1000000]);
    setPage(1);
  };

  // Xử lý kéo range
  const handleRangeChange = (e, idx) => {
    let newRange = [...priceRange];
    newRange[idx] = Number(e.target.value);
    if (idx === 0 && newRange[0] > newRange[1]) newRange[0] = newRange[1];
    if (idx === 1 && newRange[1] < newRange[0]) newRange[1] = newRange[0];
    setPriceRange(newRange);
    setPage(1);
  };

  // Hàm lấy URL ảnh đúng chuẩn backend
  const getBookImageUrl = (book) => {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '');
    // Kiểm tra nếu có images từ backend (BookImages model)
    if (book.images && book.images.length > 0) {
      const imagePath = book.images[0].image_path;
      return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}${imagePath}`;
    }
    // Fallback cho imageUrls (nếu có)
    if (book.imageUrls && book.imageUrls.length > 0) {
      const url = book.imageUrls[0];
      return url.startsWith('http') ? url : `${BACKEND_URL}${url}`;
    }
    // Trả về ảnh mặc định nếu không có ảnh
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NSA5MEgxMTVWMTIwSDEwNVYxMTBIOTVWMTIwSDg1VjkwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNODUgMTQwSDE2NVYxNjBIODVWMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNODUgMTgwSDE1NVYyMDBIODVWMTgwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4=';
  };

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async (book, e) => {
    e.stopPropagation();
    
    if (!user) {
      alert('Vui lòng đăng nhập để thêm sách vào giỏ hàng');
      navigate('/login');
      return;
    }

    try {
      const response = await addToCart(book.id, 1);
      if (response.success) {
        alert(`Đã thêm "${book.title || book.name}" vào giỏ hàng!`);
        // Cập nhật số lượng trong context
        await loadCartCount();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  if (loading) return <div>Đang tải sách...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <PublicHeader />
      <div className="books-page-layout">
        {/* Sidebar bộ lọc */}
        <aside className="books-sidebar">
          <h2>Bộ lọc nâng cao</h2>
          <form className="books-search-advanced" onSubmit={e => {e.preventDefault(); setPage(1);}}>
            <label>
              Tác giả
              <div className="multi-select">
                <div 
                  className={`multi-select-header ${showAuthorDropdown ? 'active' : ''}`}
                  onClick={(e) => handleToggleDropdown('author', e)}
                >
                  <span className="multi-select-text">
                    {selectedAuthors.length === 0 
                      ? 'Chọn tác giả...' 
                      : selectedAuthors.length === 1 
                        ? selectedAuthors[0]
                        : `${selectedAuthors.length} tác giả đã chọn`
                    }
                  </span>
                  <span className="multi-select-arrow">▼</span>
                </div>
                {showAuthorDropdown && (
                  <div className="multi-select-dropdown">
                    {authors.map(author => (
                      <label 
                        key={author} 
                        className={`multi-select-item ${selectedAuthors.includes(author) ? 'checked' : ''}`}
                        onClick={handleLabelClick}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAuthors.includes(author)}
                          onChange={(e) => handleAuthorChange(author, e)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span>{author}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </label>
            <label>
              Thể loại
              <div className="multi-select">
                <div 
                  className={`multi-select-header ${showCategoryDropdown ? 'active' : ''}`}
                  onClick={(e) => handleToggleDropdown('category', e)}
                >
                  <span className="multi-select-text">
                    {selectedCategories.length === 0 
                      ? 'Chọn thể loại...' 
                      : selectedCategories.length === 1 
                        ? selectedCategories[0]
                        : `${selectedCategories.length} thể loại đã chọn`
                    }
                  </span>
                  <span className="multi-select-arrow">▼</span>
                </div>
                {showCategoryDropdown && (
                  <div className="multi-select-dropdown">
                    {categories.map(category => (
                      <label 
                        key={category} 
                        className={`multi-select-item ${selectedCategories.includes(category) ? 'checked' : ''}`}
                        onClick={handleLabelClick}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => handleCategoryChange(category, e)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </label>
            <label>
              Nhà xuất bản
              <div className="multi-select">
                <div 
                  className={`multi-select-header ${showPublisherDropdown ? 'active' : ''}`}
                  onClick={(e) => handleToggleDropdown('publisher', e)}
                >
                  <span className="multi-select-text">
                    {selectedPublishers.length === 0 
                      ? 'Chọn nhà xuất bản...' 
                      : selectedPublishers.length === 1 
                        ? selectedPublishers[0]
                        : `${selectedPublishers.length} nhà xuất bản đã chọn`
                    }
                  </span>
                  <span className="multi-select-arrow">▼</span>
                </div>
                {showPublisherDropdown && (
                  <div className="multi-select-dropdown">
                    {publishers.map(publisher => (
                      <label 
                        key={publisher} 
                        className={`multi-select-item ${selectedPublishers.includes(publisher) ? 'checked' : ''}`}
                        onClick={handleLabelClick}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPublishers.includes(publisher)}
                          onChange={(e) => handlePublisherChange(publisher, e)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span>{publisher}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </label>
            <label>
              Năm xuất bản
              <div className="multi-select">
                <div 
                  className={`multi-select-header ${showYearDropdown ? 'active' : ''}`}
                  onClick={(e) => handleToggleDropdown('year', e)}
                >
                  <span className="multi-select-text">
                    {selectedYears.length === 0 
                      ? 'Chọn năm xuất bản...' 
                      : selectedYears.length === 1 
                        ? selectedYears[0]
                        : `${selectedYears.length} năm đã chọn`
                    }
                  </span>
                  <span className="multi-select-arrow">▼</span>
                </div>
                {showYearDropdown && (
                  <div className="multi-select-dropdown">
                    {years.map(year => (
                      <label 
                        key={year} 
                        className={`multi-select-item ${selectedYears.includes(year) ? 'checked' : ''}`}
                        onClick={handleLabelClick}
                      >
                        <input
                          type="checkbox"
                          checked={selectedYears.includes(year)}
                          onChange={(e) => handleYearChange(year, e)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span>{year}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </label>
            <label className="range-label">
              Giá từ
              <div className="range-slider-wrap">
                <input
                  type="range"
                  min={minBookPrice}
                  max={maxBookPrice}
                  value={priceRange[0]}
                  onChange={e => handleRangeChange(e, 0)}
                  step={1000}
                />
                <input
                  type="range"
                  min={minBookPrice}
                  max={maxBookPrice}
                  value={priceRange[1]}
                  onChange={e => handleRangeChange(e, 1)}
                  step={1000}
                />
              </div>
              <div className="range-values">
                <span>{priceRange[0].toLocaleString()}đ</span>
                <span> - </span>
                <span>{priceRange[1].toLocaleString()}đ</span>
              </div>
            </label>
            <button type="submit" onClick={handleClearFilters}>Xóa bộ lọc</button>
          </form>
        </aside>
        {/* Danh sách sách */}
        <main className="books-main">
          <div className="books-search-simple">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sách..."
              value={name}
              onChange={e => { setName(e.target.value); setPage(1); }}
            />
          </div>
          <h1 className="books-title">Danh sách Sách</h1>
          <div className="books-list books-grid">
            {booksToShow.map(book => (
              <div className="book-card" key={book.id}>
                <div className="book-card-content" onClick={() => navigate(`/book/${book.id}`)}>
                  <img src={getBookImageUrl(book)} alt={book.title || book.name} />
                  <div className="book-info">
                    <h3>{book.title || book.name}</h3>
                    {book.discounted_price != null ? (
                      <div className="book-price-wrap">
                        <span className="book-price-discount">{Number(book.discounted_price).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</span>
                        <span className="book-price-original">{Number(book.original_price ?? book.price).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</span>
                      </div>
                    ) : (
                      <p className="book-price">{Number(book.original_price ?? book.price).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} VNĐ</p>
                    )}
                  </div>
                </div>
                <div className="book-actions">
                  <button 
                    className="btn-add-to-cart"
                    onClick={(e) => handleAddToCart(book, e)}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
            {booksToShow.length === 0 && <div className="no-books">Không tìm thấy sách phù hợp.</div>}
          </div>
          {/* Phân trang */}
          <div className="books-pagination">
            {Array.from({length: totalPages}, (_, i) => (
              <button
                key={i+1}
                className={page === i+1 ? 'active' : ''}
                onClick={() => setPage(i+1)}
              >{i+1}</button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default BooksPage;
