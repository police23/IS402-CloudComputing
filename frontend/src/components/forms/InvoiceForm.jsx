import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faTimes, faFileInvoiceDollar, faUser, faCalendar, 
  faPhone, faEnvelope, faMapMarkerAlt, faBook, faPlus, faTrash 
} from "@fortawesome/free-solid-svg-icons";
// Chỉ sử dụng Modals.css để tránh xung đột CSS
import "../modals/Modals.css";
import "./InvoiceForm.css";
import { openModal, closeModal } from "../../utils/modalUtils";
import { getAllBooks } from "../../services/BookService";
import { checkPromotion, getAvailablePromotions } from "../../services/PromotionService";
import { exportInvoicePDF } from "../../services/invoiceService";

const InvoiceForm = ({ invoice, onSubmit, onClose, setShowForm }) => {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    total_amount: "",
    discount_amount: "0",
    final_amount: "",
    promotion_code: "",
    created_by: "",
    created_at: "",
    bookDetails: [],
  });
  const [books, setBooks] = useState([]);
  const [errors, setErrors] = useState({});
  const [userInfo, setUserInfo] = useState({ id: "", full_name: "" }); // Thêm state này
  const [promoError, setPromoError] = useState("");
  const [stockErrors, setStockErrors] = useState({}); // Thêm state lưu lỗi tồn kho từng sách
  const [availablePromotions, setAvailablePromotions] = useState([]);

  useEffect(() => {
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch (e) {
      user = null;
    }
    setUserInfo({
      id: user?.id || "",
      full_name: user?.full_name || user?.username || user?.name || ""
    });

    if (invoice) {
      setFormData({
        customer_name: invoice.customer_name || "",
        customer_phone: invoice.customer_phone || "",
        total_amount: invoice.total_amount || "",
        discount_amount: invoice.discount_amount || "0",
        final_amount: invoice.final_amount || "",
        promotion_code: invoice.promotion_code || "",
        created_by: invoice.created_by || "",
        created_at: invoice.created_at || "",
        bookDetails: invoice.bookDetails || [],
      });
    } else {
      // Nếu thêm mới, set ngày lập hóa đơn mặc định là hôm nay và người lập là user đang đăng nhập
      setFormData(prev => ({
        ...prev,
        created_at: new Date().toISOString().slice(0, 10),
        created_by: user?.id || "" // Sửa chỗ này: dùng user.id thay vì tên
      }));
    }
  }, [invoice]);

  useEffect(() => {
    // Khi form được mở, thêm class 'modal-open' vào body
    openModal();
    
    // Cleanup effect - khi component bị unmount
    return () => {
      closeModal();
    };
  }, []);

  useEffect(() => {
    getAllBooks().then(setBooks);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customer_name.trim()) newErrors.customer_name = "Vui lòng nhập tên khách hàng";
    if (!formData.customer_phone.trim()) newErrors.customer_phone = "Vui lòng nhập số điện thoại";
    if (!formData.total_amount) newErrors.total_amount = "Vui lòng nhập tổng tiền";
    if (!formData.final_amount) newErrors.final_amount = "Vui lòng nhập thành tiền";

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Validate phone number format (Vietnamese phone number)
    const phoneRegex = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    // Validate total amount (positive number)
    if (formData.total_amount && (isNaN(formData.total_amount) || formData.total_amount <= 0)) {
      newErrors.total_amount = "Tổng tiền phải là số dương";
    }

    // Validate invoice date (not in the future)
    const today = new Date();
    const invoiceDate = new Date(formData.date);
    if (formData.date && invoiceDate > today) {
      newErrors.date = "Ngày hóa đơn không được lớn hơn ngày hiện tại";
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
      bookDetails: [...prev.bookDetails, { book_id: "", quantity: 1, unit_price: 0 }]
    }));
  };

  const handleRemoveBook = (index) => {
    setFormData(prev => ({
      ...prev,
      bookDetails: prev.bookDetails.filter((_, i) => i !== index)
    }));
  };

  const handleBookDetailChange = (index, field, value) => {
    setFormData(prev => {
      const newDetails = prev.bookDetails.map((detail, i) => {
        if (i === index) {
          let updated = { ...detail, [field]: value };
          if (field === "book_id") {
            const book = books.find(b => b.id === parseInt(value));
            updated.unit_price = book ? book.price : 0;
          }
          return updated;
        }
        return detail;
      });

      // Kiểm tra tồn kho ngay khi thay đổi số lượng hoặc chọn sách
      let newStockErrors = { ...stockErrors };
      const detail = newDetails[index];
      if (detail.book_id && detail.quantity) {
        const book = books.find(b => b.id === parseInt(detail.book_id));
        const stock = book ? (book.stock ?? book.quantity ?? 0) : 0;
        if (Number(detail.quantity) > Number(stock)) {
          newStockErrors[index] = "Số lượng tồn không đủ";
        } else {
          delete newStockErrors[index];
        }
      } else {
        delete newStockErrors[index];
      }
      setStockErrors(newStockErrors);

      return { ...prev, bookDetails: newDetails };
    });
  };


  // Auto tính tổng tiền và load khuyến mãi khả dụng khi tổng tiền thay đổi
  useEffect(() => {
    const total = formData.bookDetails.reduce((sum, d) => sum + (d.quantity * d.unit_price), 0);
    setFormData(prev => ({ ...prev, total_amount: total, discount_amount: "0", final_amount: total }));
    // Gọi API lấy khuyến mãi khả dụng
    if (total > 0) {
      getAvailablePromotions(total)
        .then((data) => {
          // Sort promotions by the final amount (after discount) in ascending order
          if (Array.isArray(data)) {
            const calculateFinalAmount = (promo) => {
              const discountType = promo.discount_type || promo.type;
              const discountValue = promo.discount_value !== undefined ? promo.discount_value : promo.discount;
              let discount = 0;
              if (discountType === 'percent') {
                discount = Math.floor((total * discountValue) / 100);
              } else if (discountType === 'amount' || discountType === 'fixed' || typeof discountValue === 'number') {
                discount = Number(discountValue);
              }
              if (discount > total) discount = total;
              return total - discount;
            };

            const sortedPromotions = [...data].sort((a, b) => calculateFinalAmount(a) - calculateFinalAmount(b));
            setAvailablePromotions(sortedPromotions);
          } else {
            setAvailablePromotions([]);
          }
        })
        .catch(() => setAvailablePromotions([]));
    } else {
      setAvailablePromotions([]);
    }
    // Nếu mã khuyến mãi hiện tại không còn trong danh sách khả dụng thì reset
    if (
      formData.promotion_code &&
      !availablePromotions.some((promo) => promo.code === formData.promotion_code)
    ) {
      setFormData((prev) => ({ ...prev, promotion_code: "" }));
    }
  }, [formData.bookDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStockErrors({}); // Reset lỗi tồn kho trước khi submit
    if (validateForm()) {
      try {
        console.log("Đang gửi dữ liệu hóa đơn:", formData);
        const result = await onSubmit(formData);
        console.log("Kết quả từ backend sau khi submit:", result);
        
        // Sau khi tạo hóa đơn thành công, tải file PDF
        if (result && result.id) {
          console.log("Bắt đầu xuất PDF cho hóa đơn ID:", result.id);
          try {
            await exportInvoicePDF(result.id);
            console.log("Đã xuất PDF thành công");
          } catch (pdfError) {
            console.error("Lỗi khi xuất PDF:", pdfError);
            alert("Đã tạo hóa đơn thành công nhưng không thể xuất PDF tự động.");
          }
        } else {
          console.error("Không nhận được ID hóa đơn hợp lệ:", result);
          alert("Đã tạo hóa đơn thành công nhưng không thể xuất PDF do backend không trả về ID hóa đơn.");
        }
        
        // Luôn đóng form khi đã submit thành công, bất kể có xuất PDF thành công hay không
        if (onClose) {
          onClose();
        } else if (setShowForm) {
          setShowForm(false);
        }
      } catch (err) {
        // Nếu backend trả về lỗi tồn kho hoặc lỗi khác, hiển thị alert hoặc lỗi dưới từng sách
        if (
          err?.response?.data?.message &&
          err?.response?.data?.message.includes("không đủ tồn kho")
        ) {
          // Lấy book_id từ message nếu có
          const match = err.response.data.message.match(/Sách ID (\d+)/);
          if (match) {
            const bookId = match[1];
            // Đánh dấu lỗi cho từng dòng sách
            const newStockErrors = {};
            formData.bookDetails.forEach((detail, idx) => {
              if (String(detail.book_id) === bookId) {
                newStockErrors[idx] = "Số lượng tồn không đủ";
              }
            });
            setStockErrors(newStockErrors);
          } else {
            alert(err.response.data.message);
          }
          // Không đóng form khi lỗi tồn kho
          return;
        } else if (err?.response?.data?.message) {
          alert(err.response.data.message);
        } else {
          alert("Đã xảy ra lỗi khi tạo hóa đơn!");
        }
        // Không đóng form nếu có lỗi
        return;
      }
      // Chỗ này không cần thiết nữa vì đã xử lý trong block try
    }
  };

  // Hàm tự động tính giảm giá và thành tiền khi chọn mã khuyến mãi
  const calculateDiscount = (promotion_code, total_amount) => {
    if (!promotion_code || !total_amount || total_amount <= 0) {
      return { discount: 0, final: total_amount };
    }
    const promo = availablePromotions.find(
      p => (p.code || p.promotion_code) === promotion_code
    );
    if (!promo) return { discount: 0, final: total_amount };
    const discountType = promo.discount_type || promo.type;
    const discountValue = promo.discount_value !== undefined ? promo.discount_value : promo.discount;
    let discount = 0;
    if (discountType === 'percent') {
      discount = Math.floor((total_amount * discountValue) / 100);
    } else if (discountType === 'amount' || discountType === 'fixed' || typeof discountValue === 'number') {
      discount = Number(discountValue);
    }
    if (discount > total_amount) discount = total_amount;
    return { discount, final: total_amount - discount };
  };

  // Khi bấm Áp dụng mới tính giảm giá
  const handleApplyPromotion = () => {
    if (!formData.promotion_code) {
      setPromoError("Vui lòng chọn mã khuyến mãi");
      return;
    }
    if (!formData.total_amount || formData.total_amount <= 0) {
      setPromoError("Vui lòng thêm sách vào hóa đơn trước khi áp dụng mã khuyến mãi");
      return;
    }
    const { discount, final } = calculateDiscount(formData.promotion_code, formData.total_amount);
    setFormData(prev => ({
      ...prev,
      discount_amount: discount,
      final_amount: final
    }));
    setPromoError("");
  };

  // Thêm hàm kiểm tra có lỗi tồn kho không
  const hasStockError = Object.keys(stockErrors).length > 0;

  const modalContent = (
    <div className="modal-backdrop">
      <div className="invoiceform-modal-content">
        <div className="invoiceform-header">
          <h3 className="invoiceform-header-title">
            <FontAwesomeIcon 
              icon={faFileInvoiceDollar} 
              className="invoiceform-header-icon" 
            />
            {invoice ? "Chỉnh sửa hóa đơn" : "Thêm hóa đơn mới"}
          </h3>
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="invoiceform-body">
          <form onSubmit={handleSubmit} className="account-form">
            <div className="invoiceform-flex-row">
              <div className="invoiceform-flex-col invoiceform-flex-column">
                <div className="form-group">
                  <label htmlFor="customer_name">
                    <FontAwesomeIcon icon={faUser} className="invoiceform-icon" />
                    Tên khách hàng
                  </label>
                  <input
                    type="text"
                    id="customer_name"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    className={errors.customer_name ? "error" : ""}
                    placeholder="Nhập tên khách hàng"
                  />
                  {errors.customer_name && <div className="error-message">{errors.customer_name}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="customer_phone">
                    <FontAwesomeIcon icon={faPhone} className="invoiceform-icon" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    id="customer_phone"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className={errors.customer_phone ? "error" : ""}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.customer_phone && <div className="error-message">{errors.customer_phone}</div>}
                </div>
              </div>
              <div className="invoiceform-flex-col invoiceform-flex-column">
                <div className="form-group">
                  <label htmlFor="created_by">
                    <FontAwesomeIcon icon={faUser} className="invoiceform-icon" />
                    Người lập
                  </label>
                  <input
                    type="text"
                    id="created_by"
                    name="created_by"
                    value={userInfo.full_name}
                    readOnly
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="created_at">
                    <FontAwesomeIcon icon={faCalendar} className="invoiceform-icon" />
                    Ngày lập hóa đơn
                  </label>
                  <input
                    type="date"
                    id="created_at"
                    name="created_at"
                    value={formData.created_at ? formData.created_at.slice(0, 10) : ''}
                    onChange={handleChange}
                    className={errors.created_at ? "error" : ""}
                    max={new Date().toISOString().split('T')[0]}
                    readOnly
                    disabled
                  />
                  {errors.created_at && <div className="error-message">{errors.created_at}</div>}
                </div>
              </div>
            </div>
            <div className="form-group invoiceform-group-margin-top">
              <div className="invoiceform-label-row">
                <label className="invoiceform-section-label">
                  <FontAwesomeIcon icon={faBook} className="invoiceform-icon" />
                  Danh sách sách
                </label>
                <button type="button" onClick={handleAddBook} className="save-button invoiceform-add-btn">
                  <FontAwesomeIcon icon={faPlus} /> Thêm sách
                </button>
              </div>
              <table className="invoiceform-table">
                <thead>
                  <tr className="invoiceform-table-header-row">
                    <th className="invoiceform-th-book">Tên sách</th>
                    <th className="invoiceform-th-qty">Số lượng</th>
                    <th className="invoiceform-th-price">Đơn giá</th>
                    <th className="invoiceform-th-total">Thành tiền</th>
                    <th className="invoiceform-th-action"></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.bookDetails.map((detail, index) => {
                    const book = books.find(b => b.id === parseInt(detail.book_id));
                    const thanhTien = detail.quantity * detail.unit_price;
                    const stock = book ? (book.stock ?? book.quantity ?? 0) : 0;
                    return (
                      <React.Fragment key={index}>
                        <tr>
                          <td className="invoiceform-td-book">
                            <select
                              value={detail.book_id}
                              onChange={e => handleBookDetailChange(index, 'book_id', e.target.value)}
                              className="invoiceform-select"
                            >
                              <option value="">Chọn sách</option>
                              {books
                                .filter(book => {
                                  // Chỉ hiển thị sách chưa được chọn ở dòng khác hoặc sách đang chọn tại dòng hiện tại
                                  const selectedElsewhere = formData.bookDetails.some((otherDetail, otherIdx) =>
                                    otherIdx !== index && otherDetail.book_id && String(otherDetail.book_id) === String(book.id)
                                  );
                                  return !selectedElsewhere || String(book.id) === String(detail.book_id);
                                })
                                .map(book => (
                                  <option key={book.id} value={book.id}>
                                    {book.title} (Tồn: {book.stock ?? book.quantity ?? 0})
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td className="invoiceform-td-qty">
                            <input
                              type="number"
                              value={detail.quantity}
                              min="1"
                              onChange={e => handleBookDetailChange(index, 'quantity', parseInt(e.target.value) || 1)}
                              className="invoiceform-full-width"
                            />
                          </td>
                          <td className="invoiceform-td-price">
                            <input
                              type="number"
                              value={detail.unit_price}
                              min="0"
                              onChange={e => handleBookDetailChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              className="invoiceform-full-width"
                              readOnly
                            />
                          </td>
                          <td className="invoiceform-thanh-tien invoiceform-td-total">
                            {thanhTien.toLocaleString('vi-VN')} VNĐ
                          </td>
                          <td className="invoiceform-td-action">
                            <button type="button" onClick={() => handleRemoveBook(index)} className="invoiceform-remove-btn">
                              <FontAwesomeIcon icon={faTrash} className="fa-trash" />
                            </button>
                          </td>
                        </tr>
                        {stockErrors[index] && (
                          <tr>
                            <td colSpan={5}>
                              <div style={{ color: "#d32f2f", fontSize: "12px", marginTop: 2, marginBottom: 2 }}>
                                {stockErrors[index]}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="invoiceform-summary">
              <div className="invoiceform-summary-box">
                {/* Thêm phần nhập mã khuyến mãi vào đây */}
                <div className="invoiceform-summary-row" style={{ marginBottom: "15px" }}>
                  <span>Mã khuyến mãi:</span>
                  <div className="invoiceform-promo-row">
                    <select
                      id="promotion_code"
                      name="promotion_code"
                      value={formData.promotion_code || ""}
                      onChange={e => setFormData(prev => ({ ...prev, promotion_code: e.target.value }))}
                    >
                      <option value="">Chọn khuyến mãi</option>
                      {Array.isArray(availablePromotions) && availablePromotions.map((promo, idx) => {
                        const code = promo.code || promo.promotion_code || '';
                        const discountType = promo.discount_type || promo.type || '';
                        const discountValue = promo.discount_value !== undefined ? promo.discount_value : promo.discount;
                        let discountText = '';
                        if (discountType === 'percent') {
                          discountText = `(-${discountValue}%)`;
                        } else if (discountType === 'amount' || discountType === 'fixed' || typeof discountValue === 'number') {
                          discountText = `(-${Number(discountValue).toLocaleString('vi-VN')} VNĐ)`;
                        }
                        return (
                          <option key={code || idx} value={code}>
                            {code} {discountText}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      type="button"
                      className="save-button"
                      onClick={handleApplyPromotion}
                      disabled={!formData.promotion_code}
                    >
                      Áp dụng
                    </button>
                  </div>
                  {promoError && (
                    <div style={{ color: "#d32f2f", fontSize: "12px" }}>{promoError}</div>
                  )}
                </div>
                <div className="invoiceform-summary-row">
                  <span>Tổng tiền:</span>
                  <span style={{ fontWeight: 600 }}>{Number(formData.total_amount).toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="invoiceform-summary-row">
                  <span>Giảm giá:</span>
                  <span>{Number(formData.discount_amount).toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="invoiceform-summary-final">
                  <span>Thành tiền:</span>
                  <span>{Number(formData.final_amount).toLocaleString('vi-VN')} VNĐ</span>
                </div>
              </div>
            </div>
            <div className="form-actions invoiceform-actions-margin-top">
              <button
                type="button"
                className="cancel-button invoiceform-button"
                onClick={onClose}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="save-button invoiceform-button"
                disabled={hasStockError} // Disable nếu có lỗi tồn kho
              >
                {invoice ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};

export default InvoiceForm;