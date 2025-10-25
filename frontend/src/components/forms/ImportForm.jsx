import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faBoxOpen, faBuilding, faDollarSign, faBook, faTrash, faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import "../modals/Modals.css";
import "./ImportForm.css";

const ImportForm = ({ importData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    supplierId: "",
    bookDetails: [{ bookId: "", quantity: 1, price: "" }],  // Bắt đầu với một dòng trống
    total: "",
  });

  const [errors, setErrors] = useState({});
  const [suppliers, setSuppliers] = useState([]);
  const [books, setBooks] = useState([]);
  const [rules, setRules] = useState({});

  // Load người nhập
  const currentUser = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user"));
      return u;
    } catch {
      return null;
    }
  })();

  // Load suppliers from database
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE}/suppliers`);
        if (response.ok) {
          const data = await response.json();
          setSuppliers(data);
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  // Load books from database
  useEffect(() => {
    // Tải dữ liệu sách với cách đơn giản nhất
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE}/books`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched books data:", data);
        
        // Kiểm tra xem data có phải là đối tượng có thuộc tính data là mảng không
        if (data && data.data && Array.isArray(data.data)) {
          console.log("Sử dụng data.data từ API");
          setBooks(data.data);
        } 
        // Kiểm tra xem data có phải là đối tượng có thuộc tính results là mảy không
        else if (data && data.results && Array.isArray(data.results)) {
          console.log("Sử dụng data.results từ API");
          setBooks(data.results);
        }
        // Kiểm tra xem data có phải là mảng không
        else if (Array.isArray(data)) {
          console.log("Sử dụng data trực tiếp từ API");
          setBooks(data);
        }
        // Nếu không khớp với bất kỳ cấu trúc nào, sử dụng mảng cứng
        else {
          console.error("Không thể xác định cấu trúc dữ liệu books:", data);
          // Sử dụng mảy cứng để có thể tiếp tục
          const hardcodedBooks = [
            { id: 1, title: "Dế Mèn Phiêu Lưu Ký" },
            { id: 2, title: "Tuổi Trẻ Đáng Giá Bao Nhiêu" },
            { id: 3, title: "Bố Già" },
            { id: 4, title: "Đắc Nhân Tâm" },
            { id: 5, title: "Lược Sử Thời Gian" }
          ];
          setBooks(hardcodedBooks);
        }
      })
      .catch(error => {
        console.error("Error fetching books:", error);
      });
  }, []);

  // Load rules from database
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    fetch(`${API_BASE}/rules`)
      .then(res => res.json())
      .then(data => setRules(data));
  }, []);
  
  // Debug effect to monitor the books state
  useEffect(() => {
    console.log("Books state updated:", books);
  }, [books]);

  const computedTotal = formData.bookDetails.reduce((sum, detail) => {
    const quantity = parseInt(detail.quantity) || 0;
    const price = parseInt(detail.price) || 0;
    return sum + quantity * price;
  }, 0);

  useEffect(() => {
    if (importData) {
      setFormData({
        supplierId: importData.supplierId || "",
        bookDetails: importData.bookDetails || [],
        total: importData.total || "",
      });
    }
  }, [importData]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      total: computedTotal
    }));
    // eslint-disable-next-line
  }, [formData.bookDetails]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.supplierId) newErrors.supplierId = "Vui lòng chọn nhà cung cấp";
    if (formData.bookDetails.length === 0) newErrors.bookDetails = "Vui lòng thêm ít nhất một sách";
    if (computedTotal <= 0) newErrors.total = "Tổng tiền phải là số dương";
    // Áp dụng quy định số lượng nhập tối thiểu
    if (rules.min_import_quantity) {
      for (const detail of formData.bookDetails) {
        if (parseInt(detail.quantity) < rules.min_import_quantity) {
          newErrors.bookDetails = `Số lượng nhập tối thiểu cho mỗi sách là ${rules.min_import_quantity}`;
          break;
        }
      }
    }
    // Áp dụng quy định Lượng tồn tối thiểu trước khi nhập
    if (rules.min_stock_before_import) {
      for (const detail of formData.bookDetails) {
        const book = books.find(b => b.id === parseInt(detail.bookId));
        const currentStock = book ? parseInt(book.stock) : 0;
        if (currentStock > rules.min_stock_before_import) {
          newErrors.bookDetails = `Chỉ được nhập sách có tồn kho nhỏ hơn hoặc bằng ${rules.min_stock_before_import}.`;
          break;
        }
      }
    }
    if (rules.max_stock) {
      // Giả sử books là danh sách sách hiện có, kiểm tra tổng tồn kho sau nhập
      for (const detail of formData.bookDetails) {
        const book = books.find(b => b.id === parseInt(detail.bookId));
        const currentStock = book ? parseInt(book.stock) : 0;
        const afterImport = currentStock + parseInt(detail.quantity || 0);
        if (afterImport > rules.max_stock) {
          newErrors.bookDetails = `Tồn kho tối đa cho mỗi sách là ${rules.max_stock}`;
          break;
        }
      }
    }
    // Áp dụng quy định Lượng tồn tối thiểu sau khi bán
    if (rules.min_stock_after_sale) {
      for (const detail of formData.bookDetails) {
        const book = books.find(b => b.id === parseInt(detail.bookId));
        const currentStock = book ? parseInt(book.stock) : 0;
        const afterImport = currentStock + parseInt(detail.quantity || 0);
        // Giả sử sau khi nhập, bán hết số lượng vừa nhập, tồn kho còn lại phải >= min_stock_after_sale
        if (afterImport < rules.min_stock_after_sale) {
          newErrors.bookDetails = `Sau khi bán, mỗi sách phải còn ít nhất ${rules.min_stock_after_sale} cuốn trong kho.`;
          break;
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleAddBook = () => {
    setFormData(prev => ({
      ...prev,
      bookDetails: [...prev.bookDetails, { bookId: "", quantity: 1, price: "" }]
    }));
  };

  const handleRemoveBook = (index) => {
    setFormData(prev => ({
      ...prev,
      bookDetails: prev.bookDetails.filter((_, i) => i !== index)
    }));
  };

  const handleBookDetailChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      bookDetails: prev.bookDetails.map((detail, i) => {
        if (i === index) {
          // Nếu trường là bookId, đảm bảo nó là số nguyên
          if (field === 'bookId') {
            return { ...detail, [field]: value ? parseInt(value) : "" };
          }
          return { ...detail, [field]: value };
        }
        return detail;
      })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const importedBy = currentUser?.id; // Use the id field from currentUser

      if (!importedBy) {
        alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
      }

      console.log("Form data to be submitted:", {
        ...formData,
        total: computedTotal,
        importedBy // Pass the id as importedBy
      });

      onSubmit({
        ...formData,
        total: computedTotal,
        importedBy // Ensure importedBy is included in the payload
      });
    }
  };
  const modalContent = (
    <div className="importform-backdrop">
      <div className="importform-modal-content">
        <div className="importform-header">
          <h3 className="importform-header-title">
            <FontAwesomeIcon
              icon={faBoxOpen}
              className="importform-header-icon"
            />
            {importData ? "Chỉnh sửa phiếu nhập" : "Thêm phiếu nhập mới"}
          </h3>
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="importform-body">
          <form onSubmit={handleSubmit} className="account-form">            
            {/* Layout 2 cột cho Người nhập và Nhà cung cấp */}
            <div className="importform-row-2col">
              <div className="importform-col-half">
                <div className="form-group">
                  <label>
                    <FontAwesomeIcon icon={faUser} className="importform-icon" />
                    Người nhập
                  </label>
                  <input
                    type="text"
                    value={
                      currentUser?.full_name ||
                      currentUser?.fullName ||
                      currentUser?.displayName ||
                      currentUser?.username ||
                      ""
                    }                    readOnly
                    className="importform-readonly-input"
                  />
                </div>
              </div>
              
              <div className="importform-col-half">
                <div className="form-group">
                  <label htmlFor="supplierId">
                    <FontAwesomeIcon icon={faBuilding} className="importform-icon" />
                    Nhà cung cấp
                  </label>
                  <select
                    id="supplierId"
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    className={errors.supplierId ? "error importform-select" : "importform-select"}
                  >
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers && suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Không có nhà cung cấp nào</option>
                )}
                  </select>
                  {errors.supplierId && <div className="error-message">{errors.supplierId}</div>}
                </div>
              </div>
            </div>

            <div className="form-group importform-group-margin-top">
              <div className="importform-label-row">
                <label className="importform-section-label">
                  <FontAwesomeIcon icon={faBook} className="importform-icon" />
                  Danh sách sách nhập
                </label>
                <button
                  type="button"
                  onClick={handleAddBook}
                  className="save-button importform-add-btn"
                >
                  <FontAwesomeIcon icon={faPlus} /> Thêm sách
                </button>
              </div>
              <div className="importform-table-container">
                <table className="importform-table">
                  <thead>
                    <tr className="importform-table-header-row">
                      <th className="importform-th-book">Tên sách</th>
                      <th className="importform-th-qty">Số lượng</th>
                      <th className="importform-th-price">Giá nhập</th>
                      <th className="importform-th-total">Thành tiền</th>
                      <th className="importform-th-action"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {console.log("formData.bookDetails:", formData.bookDetails)}
                    {formData.bookDetails.map((detail, index) => {
                      const quantity = parseInt(detail.quantity) || 0;
                      const price = parseInt(detail.price) || 0;
                      const total = quantity * price;
                      // Định dạng giá nhập
                      const formattedPrice = detail.price ? Number(detail.price).toLocaleString('vi-VN') : "";
                      return (
                        <tr key={index}>
                          <td className="importform-td-book">
                            <select
                              value={detail.bookId || ""}
                              onChange={(e) => handleBookDetailChange(index, 'bookId', e.target.value)}
                              className={errors.bookDetails ? "error importform-book-select" : "importform-book-select"}
                            >
                              <option value="">Chọn sách</option>
                              {books && books.length > 0 ? (
                                books.map(book => (
                                  <option key={book.id} value={book.id}>
                                    {book.title}
                                  </option>
                                ))
                              ) : (
                                <option value="" disabled>Không có sách nào</option>
                              )}
                            </select>
                          </td>
                          <td className="importform-td-qty">
                            <input
                              type="number"
                              value={detail.quantity}
                              onChange={(e) => handleBookDetailChange(index, 'quantity', e.target.value)}
                              placeholder="Số lượng"
                              min="1"
                              className="importform-quantity-input"
                            />
                          </td>
                          <td className="importform-td-price">
                            <input
                              type="text"
                              value={formattedPrice}
                              onChange={(e) => {
                                // Chỉ nhận số, loại bỏ ký tự không phải số
                                const raw = e.target.value.replace(/\D/g, "");
                                handleBookDetailChange(index, 'price', raw);
                              }}
                              placeholder="Giá nhập"
                              min="0"
                              className="importform-price-input"
                              inputMode="numeric"
                            />
                          </td>
                          <td className="importform-td-total">
                            <input
                              type="text"
                              value={total > 0 ? total.toLocaleString('vi-VN') : ""}
                              readOnly
                              tabIndex={-1}
                              className="importform-total-input"
                            />
                          </td>
                          <td className="importform-td-action">
                            <button
                              type="button"
                              onClick={() => handleRemoveBook(index)}
                              className="importform-remove-btn"
                              title="Xóa sách"
                            >
                              <FontAwesomeIcon icon={faTrash} className="fa-trash" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {errors.bookDetails && <div className="error-message">{errors.bookDetails}</div>}
            </div>            <div className="importform-summary">
              <div className="importform-summary-box">
                <div className="importform-summary-final">
                  <span>Tổng tiền:</span>
                  <span>{computedTotal > 0 ? computedTotal.toLocaleString('vi-VN') : 0} VNĐ</span>
                </div>
                {errors.total && <div className="error-message">{errors.total}</div>}
              </div>
            </div><div className="form-actions importform-actions-margin-top">
              <button
                type="button"
                className="cancel-button importform-button"
                onClick={onClose}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="save-button importform-button"
              >
                {importData ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ImportForm;