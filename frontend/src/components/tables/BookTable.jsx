import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faPencilAlt,
  faSearch,
  faCheck,
  faTrashAlt,
  faExclamationCircle,
  faFilter,
  faInfo
} from "@fortawesome/free-solid-svg-icons";
import BookForm from "../forms/BookForm";
import BookDetailsModal from "../modals/BookDetailsModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { getAllBooks, createBook, updateBook, deleteBook } from "../../services/bookService";
import "./BookTable.css";
import "../../styles/SearchBar.css";
import { formatCurrency } from "../../utils/format";

const BookTable = ({ onEdit, onDelete, onView }) => {
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  
  // Replace single search state with advanced search object
  const [advancedSearch, setAdvancedSearch] = useState({
    title: "",
    author: "",
    category_id: "",
    publisher_id: "",
    priceRange: { min: "", max: "" },
    status: ""
  });
  
  // Changed default for advanced search panel to false (hidden)
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  
  // Add state for simple search
  const [simpleSearch, setSimpleSearch] = useState({
    field: "title", // default search field
    value: ""
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Modal xác nhận xóa
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Add notification state at the top
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Define fetchBooks function to load books from backend:
  const fetchBooks = async () => {
    try {
      const data = await getAllBooks();
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
      setNotification({ message: `Không thể tải danh sách sách: ${error.message}`, type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    }
  };

  // Call fetchBooks in useEffect:
  useEffect(() => {
    fetchBooks();
  }, []);

  // Add initialization for categories and publishers to avoid 'undefined' errors
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);

  // Fix the categories and publishers fetch with proper error handling
  useEffect(() => {
    const fetchCategoriesAndPublishers = async () => {
      try {
        // Fetch categories
        try {
          const catResponse = await fetch("http://localhost:5000/api/categories");
          if (catResponse.ok) {
            const catData = await catResponse.json();
            setCategories(catData.success ? catData.data : catData || []);
          } else {
            console.error("Failed to fetch categories:", catResponse.statusText);
            setCategories([]);
          }
        } catch (catError) {
          console.error("Error fetching categories:", catError);
          setCategories([]);
        }

        // Fetch publishers
        try {
          const pubResponse = await fetch("http://localhost:5000/api/publishers");
          if (pubResponse.ok) {
            const pubData = await pubResponse.json();
            setPublishers(pubData.success ? pubData.data : pubData || []);
          } else {
            console.error("Failed to fetch publishers:", pubResponse.statusText);
            setPublishers([]);
          }
        } catch (pubError) {
          console.error("Error fetching publishers:", pubError);
          setPublishers([]);
        }
      } catch (error) {
        console.error("Error in fetchCategoriesAndPublishers:", error);
      }
    };

    fetchCategoriesAndPublishers();
  }, []);

  // Filter books based on search criteria
  const filteredBooks = books.filter((book) => {
    // Check if we have any advanced search criteria
    const hasAdvancedSearch = advancedSearch.title || 
                             advancedSearch.author || 
                             advancedSearch.category_id || 
                             advancedSearch.publisher_id || 
                             advancedSearch.priceRange.min || 
                             advancedSearch.priceRange.max || 
                             advancedSearch.status;
    
    // Debug logging
    if (hasAdvancedSearch) {
      console.log("Advanced search criteria:", advancedSearch);
      console.log("Sample book:", book);
    }
    
    if (!hasAdvancedSearch) {
      // Simple search logic
      if (!simpleSearch.value) return true;
      
      const searchValue = simpleSearch.value.toLowerCase();
      switch (simpleSearch.field) {
        case "title":
          return book.title.toLowerCase().includes(searchValue);
        case "author":
          return book.author.toLowerCase().includes(searchValue);
        case "category":
          // For category, match by category_id if it's a number, otherwise by name
          if (!isNaN(simpleSearch.value)) {
            return book.category_id === parseInt(simpleSearch.value);
          }
          return book.category && book.category.toLowerCase().includes(searchValue);
        case "publisher":
          // For publisher, match by publisher_id if it's a number, otherwise by name
          if (!isNaN(simpleSearch.value)) {
            return book.publisher_id === parseInt(simpleSearch.value);
          }
          return book.publisher && book.publisher.toLowerCase().includes(searchValue);
        case "all":
          return book.title.toLowerCase().includes(searchValue) ||
                 book.author.toLowerCase().includes(searchValue) ||
                 (book.category && book.category.toLowerCase().includes(searchValue)) ||
                 (book.publisher && book.publisher.toLowerCase().includes(searchValue));
        default:
          return true;
      }
    } else {
      // Advanced search logic
      const matchesTitle = !advancedSearch.title || 
        book.title.toLowerCase().includes(advancedSearch.title.toLowerCase());
        
      const matchesAuthor = !advancedSearch.author || 
        book.author.toLowerCase().includes(advancedSearch.author.toLowerCase());
        
      const matchesCategory = !advancedSearch.category_id || 
        book.category_id === parseInt(advancedSearch.category_id);
        
      const matchesPublisher = !advancedSearch.publisher_id || 
        book.publisher_id === parseInt(advancedSearch.publisher_id);
    
      // Handle price range with better validation
      let matchesPrice = true;
      if (advancedSearch.priceRange.min || advancedSearch.priceRange.max) {
        const bookPrice = parseFloat(book.price);
        const minPrice = advancedSearch.priceRange.min ? parseFloat(advancedSearch.priceRange.min) : 0;
        const maxPrice = advancedSearch.priceRange.max ? parseFloat(advancedSearch.priceRange.max) : Infinity;
        matchesPrice = bookPrice >= minPrice && bookPrice <= maxPrice;
      }
      
      const matchesStatus = !advancedSearch.status || 
        (advancedSearch.status === "instock" && book.stock > 0) || 
        (advancedSearch.status === "outofstock" && book.stock <= 0);
      
      return matchesTitle && matchesAuthor && matchesCategory && 
             matchesPublisher && matchesPrice && matchesStatus;
    }
  });

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredBooks.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredBooks.length / recordsPerPage);

  // Kiểm tra xem tất cả các mục trên tất cả các trang đã được chọn chưa
  const areAllItemsSelected = filteredBooks.length > 0 &&
    filteredBooks.every(book => selectedRows.includes(book.id));

  // Xử lý khi chọn/bỏ chọn tất cả - hai trạng thái: chọn tất cả các trang hoặc bỏ chọn tất cả
  const handleSelectAllToggle = () => {
    if (areAllItemsSelected) {
      // Nếu đã chọn tất cả, bỏ chọn tất cả
      setSelectedRows([]);
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả trên mọi trang
      setSelectedRows(filteredBooks.map(book => book.id));
    }
  };

  const handleAddBook = () => {
    setSelectedBook(null);
    setShowForm(true);
  };

  const handleEditBook = (book) => {
    setSelectedBook(book);
    setShowForm(true);
  };

  const handleDeleteBooks = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedRows) {
        await deleteBook(id);
      }
      await fetchBooks(); // re-fetch the updated books list
      setSelectedRows([]);
      setShowDeleteConfirmation(false);
      setNotification({ message: "Xóa đầu sách thành công.", type: "delete" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } catch (error) {
      console.error("Error deleting book(s):", error);
      setNotification({ message: `Xóa đầu sách thất bại: ${error.message}`, type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    }
  };

  const handleBookSubmit = async (formData) => {
    if (selectedBook) {
      try {
        const response = await updateBook(selectedBook.id, formData);
        await fetchBooks();
        setShowForm(false);
        setNotification({ message: "Sửa đầu sách thành công.", type: "update" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      } catch (error) {
        console.error("Error updating book:", error);
        setNotification({ message: `Sửa đầu sách thất bại: ${error.message}`, type: "error" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      }
    } else {
      try {
        const response = await createBook(formData);
        await fetchBooks();
        setShowForm(false);
        setNotification({ message: "Thêm đầu sách thành công.", type: "add" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      } catch (error) {
        console.error("Error adding book:", error);
        setNotification({ message: `Thêm đầu sách thất bại: ${error.message}`, type: "error" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      }
    }
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  // Add this helper function to get the appropriate icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "add":
        return faCheck;
      case "update":
        return faPencilAlt;
      case "delete":
        return faTrashAlt;
      case "error":
        return faExclamationCircle;
      default:
        return null;
    }
  };

  // Handle changes to advanced search fields
  const handleAdvancedSearchChange = (field, value) => {
    setAdvancedSearch(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset simple search when using advanced search
    setSimpleSearch({
      field: "title",
      value: ""
    });
    
    // Reset to first page when searching
    setCurrentPage(1);
  };

  // Handle changes to price range
  const handlePriceRangeChange = (field, value) => {
    setAdvancedSearch(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: value
      }
    }));
    
    // Reset simple search when using advanced search
    setSimpleSearch({
      field: "title",
      value: ""
    });
    
    // Reset to first page when searching
    setCurrentPage(1);
  };

  // Handle simple search changes
  const handleSimpleSearchChange = (field, value) => {
    setSimpleSearch(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset to empty value when field changes
    if (field === 'field') {
      setSimpleSearch(prev => ({
        ...prev,
        value: ""
      }));
    }
    
    // Reset advanced search when using simple search
    if (field === 'value' && value !== '') {
      setAdvancedSearch({
        title: "",
        author: "",
        category_id: "",
        publisher_id: "",
        priceRange: { min: "", max: "" },
        status: ""
      });
    }
    
    // Reset to first page when searching
    setCurrentPage(1);
  };

  // Reset all search fields
  const resetSearch = () => {
    setAdvancedSearch({
      title: "",
      author: "",
      category_id: "",
      publisher_id: "",
      priceRange: { min: "", max: "" },
      status: ""
    });
    setSimpleSearch({
      field: "title",
      value: ""
    });
    // Reset to first page when clearing search
    setCurrentPage(1);
  };

  // Advanced search panel toggle: giữ lại bộ lọc khi đóng panel
  const handleAdvancedSearchToggle = () => {
    const newState = !isAdvancedSearchOpen;
    setIsAdvancedSearchOpen(newState);
    if (newState) setSimpleSearch({ field: 'title', value: '' });
    setCurrentPage(1);
  };

  return (
    <>
      {notification.message && (
        <div className={`notification ${notification.type === "error" ? "error" : ""}`}>
          <FontAwesomeIcon 
            icon={getNotificationIcon(notification.type)} 
            style={{ marginRight: "8px" }} 
          />
          <span className="notification-message">{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => setNotification({ message: "", type: "" })}
            aria-label="Đóng thông báo"
          >
            &times;
          </button>
          <div className="progress-bar"></div>
        </div>
      )}
      <div className="table-actions">
        <div className="search-filter-container">
          {/* Simple search with field selector and dynamic input */}
          <div className="search-container">
            <select
              className="search-field-selector"
              value={simpleSearch.field}
              onChange={(e) => handleSimpleSearchChange("field", e.target.value)}
            >
              
              <option value="title">Tên sách</option>
              <option value="author">Tác giả</option>
              <option value="category">Thể loại</option>
              <option value="publisher">Nhà xuất bản</option>
            </select>
            
            {/* Dynamic input based on selected field */}
            {simpleSearch.field === "category" ? (
              <select
                value={simpleSearch.value}
                onChange={(e) => handleSimpleSearchChange("value", e.target.value)}
                className="search-input"
              >
                <option value="">-- Chọn thể loại --</option>
                {Array.isArray(categories) && categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            ) : simpleSearch.field === "publisher" ? (
              <select
                value={simpleSearch.value}
                onChange={(e) => handleSimpleSearchChange("value", e.target.value)}
                className="search-input"
              >
                <option value="">-- Chọn NXB --</option>
                {Array.isArray(publishers) && publishers.map(publisher => (
                  <option key={publisher.id} value={publisher.id}>{publisher.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={`Nhập ${
                  simpleSearch.field === "all" ? "tất cả" :
                  simpleSearch.field === "title" ? "tên sách" :
                  simpleSearch.field === "author" ? "tác giả" :
                  simpleSearch.field === "category" ? "thể loại" :
                  simpleSearch.field === "publisher" ? "nhà xuất bản" : ""
                }...`}
                value={simpleSearch.value}
                onChange={(e) => handleSimpleSearchChange("value", e.target.value)}
                className="search-input"
              />
            )}
            
            <button 
              className={`filter-button ${isAdvancedSearchOpen ? 'active' : ''}`}
              onClick={handleAdvancedSearchToggle}
              title="Tìm kiếm nâng cao"
            >
              <FontAwesomeIcon icon={faFilter} />
            </button>
          </div>
          
          {/* Advanced search panel - only shown when filter button clicked */}
          {isAdvancedSearchOpen && (
            <div className="advanced-search-panel">
              <div className="search-row">
                <div className="search-field">
                  <label htmlFor="title-search">Tên sách</label>
                  <input
                    id="title-search"
                    type="text"
                    placeholder="Nhập tên sách"
                    value={advancedSearch.title}
                    onChange={(e) => handleAdvancedSearchChange("title", e.target.value)}
                  />
                </div>
                
                <div className="search-field">
                  <label htmlFor="author-search">Tác giả</label>
                  <input
                    id="author-search"
                    type="text"
                    placeholder="Nhập tên tác giả"
                    value={advancedSearch.author}
                    onChange={(e) => handleAdvancedSearchChange("author", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="search-row">
                <div className="search-field">
                  <label htmlFor="category-search">Thể loại</label>
                  <select
                    id="category-search"
                    value={advancedSearch.category_id}
                    onChange={(e) => handleAdvancedSearchChange("category_id", e.target.value)}
                  >
                    <option value="">-- Chọn thể loại --</option>
                    {Array.isArray(categories) && categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="search-field">
                  <label htmlFor="publisher-search">Nhà xuất bản</label>
                  <select
                    id="publisher-search"
                    value={advancedSearch.publisher_id}
                    onChange={(e) => handleAdvancedSearchChange("publisher_id", e.target.value)}
                  >
                    <option value="">-- Chọn NXB --</option>
                    {Array.isArray(publishers) && publishers.map(publisher => (
                      <option key={publisher.id} value={publisher.id}>{publisher.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="search-row">
                <div className="search-field price-field">
                  <label>Khoảng giá</label>
                  <div className="price-range-container">
                    <input
                      type="number"
                      placeholder="Giá từ"
                      value={advancedSearch.priceRange.min}
                      onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                      min="0"
                    />
                    <span className="price-range-separator">-</span>
                    <input
                      type="number"
                      placeholder="Đến"
                      value={advancedSearch.priceRange.max}
                      onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
                
                <div className="search-field status-field">
                  <label htmlFor="status-search">Trạng thái</label>
                  <select
                    id="status-search"
                    value={advancedSearch.status}
                    onChange={(e) => handleAdvancedSearchChange("status", e.target.value)}
                  >
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="instock">Còn hàng</option>
                    <option value="outofstock">Hết hàng</option>
                  </select>
                </div>
                
                {/* Empty field for layout balance */}
                <div className="search-field" style={{ flex: '1.55' }}></div>
              </div>
              
              {/* Replace the search panel action buttons section - remove search button */}
              <div className="search-actions">
                <button className="search-reset-button" onClick={resetSearch}>
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="action-buttons">
          <button className="btn btn-add" onClick={handleAddBook}>
            <FontAwesomeIcon icon={faPlus} /> Thêm
          </button>
          <button
            className="btn btn-delete"
            onClick={handleDeleteBooks}
            disabled={selectedRows.length === 0}
          >
            <FontAwesomeIcon icon={faTrash} /> Xóa
          </button>
          <button
            className="btn btn-edit"
            onClick={() => {
              if (selectedRows.length === 1) {
                const book = books.find((b) => b.id === selectedRows[0]);
                handleEditBook(book);
              }
            }}
            disabled={selectedRows.length !== 1}
          >
            <FontAwesomeIcon icon={faPencilAlt} /> Sửa
          </button>
          <button
            className="btn btn-detail"
            disabled={selectedRows.length !== 1}
            onClick={() => {
              if (selectedRows.length === 1) {
                const book = books.find((b) => b.id === selectedRows[0]);
                setSelectedBook(book);
                setShowDetails(true);
              }
            }}
          >
            <FontAwesomeIcon icon={faInfo} />Chi tiết
          </button>
        </div>
      </div>

      <div className="book-table-container">
        <table className="book-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={areAllItemsSelected}
                  onChange={handleSelectAllToggle}
                  title={areAllItemsSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                />
              </th>
              <th>Tên sách</th>
              <th>Tác giả</th>
              <th>Thể loại</th>
              <th>Nhà xuất bản</th>
              <th>Năm xuất bản</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((book) => (
              <tr
                key={book.id}
                className={selectedRows.includes(book.id) ? "selected" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(book.id)}
                    onChange={() => toggleRowSelection(book.id)}
                  />
                </td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.category}</td>
                <td>{book.publisher}</td>
                <td>{book.publicationYear || "-"}</td>
                <td>{formatCurrency(book.price)}</td>
                <td>{book.stock}</td>
                <td>
                  <span className={`status-badge status-${book.stock > 0 ? "active" : "out"}`}>
                    {book.stock > 0 ? "Còn hàng" : "Hết hàng"}
                  </span>
                </td>
              </tr>
            ))}

            {currentRecords.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "20px" }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {areAllItemsSelected && filteredBooks.length > currentRecords.length && (
          <div className="all-pages-selected-info">
            Đã chọn tất cả {filteredBooks.length} mục trên {totalPages} trang
          </div>
        )}
        <div className="pagination-info">
          Hiển thị {indexOfFirstRecord + 1} đến{" "}
          {Math.min(indexOfLastRecord, filteredBooks.length)} của{" "}
          {filteredBooks.length} mục
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
              className={`pagination-button ${currentPage === index + 1 ? "active" : ""
                }`}
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


      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <BookForm
              book={selectedBook}
              onSubmit={handleBookSubmit}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {showDetails && (
        <div className="modal">
          <div className="modal-content">
            <BookDetailsModal
              book={selectedBook}
              onClose={() => setShowDetails(false)}
            />
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa sách"
        message={`Bạn có chắc chắn muốn xóa ${selectedRows.length} sách đã chọn? Hành động này không thể hoàn tác.`}
      />
    </>
  );
};

export default BookTable;