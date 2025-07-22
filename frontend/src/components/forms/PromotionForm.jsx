import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faTag, faCalendar, faPercent, faInfoCircle, faMoneyBill } from "@fortawesome/free-solid-svg-icons";
// Chỉ sử dụng Modals.css để tránh xung đột CSS
import "../modals/Modals.css";
import "./PromotionForm.css";
import { openModal, closeModal } from "../../utils/modalUtils";

const PromotionForm = ({ promotion, onSubmit, onClose }) => {
  // Lấy ngày hiện tại theo định dạng yyyy-mm-dd
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    name: "",
    type: "percent", 
    discount: "",
    startDate: todayStr, 
    endDate: "",
    minPrice: "",
    quantity: "",
    usedQuantity: 0,
  });

  const [errors, setErrors] = useState({});
  const [rules, setRules] = useState({});
  const [books, setBooks] = useState([]); // Danh sách tất cả sách
  const [selectedBooks, setSelectedBooks] = useState([]); // Danh sách id sách được chọn

  // Xử lý định dạng giá tối thiểu
  const formatMinPrice = (value) => {
    if (!value) return "";
    // Chỉ format khi hiển thị, không format khi setFormData
    return Number(value).toLocaleString("vi-VN");
  };

  // Helper to safely get date string for input type="date"
  // Helper: Trả về đúng chuỗi yyyy-mm-dd từ database, không động chạm gì!
  const getDateForInput = (dateStr) => {
    if (!dateStr) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr; // giữ nguyên
    if (dateStr.includes('T')) return dateStr.slice(0, 10); // ISO string
    return dateStr;
  };

  useEffect(() => {
    if (promotion) {
      // Lấy ngày từ backend, KHÔNG parse Date để tránh lệch timezone, chỉ lấy 10 ký tự đầu (yyyy-mm-dd)
      const getDateStr = (dateStr) => {
        if (!dateStr) return "";
        if (typeof dateStr === 'string' && dateStr.length >= 10) return dateStr.slice(0, 10);
        return "";
      };
      setFormData({
        name: promotion.name || "",
        type: promotion.type || "percent",
        discount: promotion.discount || "",
        startDate: getDateStr(promotion.startDate || promotion.start_date),
        endDate: getDateStr(promotion.endDate || promotion.end_date),
        minPrice: promotion.minPrice || promotion.min_price || "",
        quantity: promotion.quantity !== undefined && promotion.quantity !== null ? promotion.quantity : "",
        usedQuantity: promotion.usedQuantity || promotion.used_quantity || 0,
      });
      if (promotion.bookIds || promotion.books) {
        setSelectedBooks(promotion.bookIds || (promotion.books ? promotion.books.map(b => b.id) : []));
      }
    } else {
      setSelectedBooks([]);
    }
  }, [promotion]);

  useEffect(() => {
    // Khi form được mở, thêm class 'modal-open' vào body
    openModal();

    // Cleanup effect - khi component bị unmount
    return () => {
      closeModal();
    };
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/rules")
      .then(res => res.json())
      .then(data => setRules(data));
  }, []);

  // Fetch danh sách sách
  useEffect(() => {
    fetch("http://localhost:5000/api/books")
      .then(res => res.json())
      .then(data => setBooks(data || []));
  }, []);

  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || "",
        type: promotion.type || "percent",
        discount: promotion.discount || "",
        startDate: (promotion.startDate || promotion.start_date || "").slice(0, 10),
        endDate: (promotion.endDate || promotion.end_date || "").slice(0, 10),
        // Đảm bảo minPrice là số, không phải chuỗi đã format
        minPrice: promotion.minPrice || promotion.min_price || "",
        quantity: promotion.quantity !== undefined && promotion.quantity !== null ? promotion.quantity : "",
        usedQuantity: promotion.usedQuantity || promotion.used_quantity || 0,
      });
      if (promotion.bookIds || promotion.books) {
        setSelectedBooks(promotion.bookIds || (promotion.books ? promotion.books.map(b => b.id) : []));
      }
    } else {
      setSelectedBooks([]);
    }
  }, [promotion]);

  // Parse yyyy-mm-dd thành local date để không bị lệch múi giờ
  function parseDateLocal(dateStr) {
    if (!dateStr) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    return new Date(dateStr);
  }

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên chương trình";
    if (!formData.discount) newErrors.discount = "Vui lòng nhập mức giảm giá";
    if (!formData.startDate) newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!formData.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc";
    if (!formData.minPrice) newErrors.minPrice = "Vui lòng nhập giá tối thiểu";
    if (!formData.type) newErrors.type = "Vui lòng chọn loại khuyến mãi";
    // Validate quantity: nếu nhập thì phải là số nguyên dương
    if (formData.quantity !== "" && (isNaN(formData.quantity) || Number(formData.quantity) < 1 || !Number.isInteger(Number(formData.quantity)))) {
      newErrors.quantity = "Số lượng áp dụng tối đa phải là số nguyên dương hoặc để trống";
    }
    // Validate discount
    if (formData.type === "percent") {
      if (formData.discount && (isNaN(formData.discount) || formData.discount < 0 || formData.discount > 100)) {
        newErrors.discount = "Mức giảm giá phần trăm phải từ 0 đến 100";
      }
    } else {
      if (formData.discount && (isNaN(formData.discount) || formData.discount < 0)) {
        newErrors.discount = "Số tiền giảm phải lớn hơn hoặc bằng 0";
      }
    }
    // Validate dates (KHÔNG kiểm tra ngày bắt đầu so với ngày hiện tại)
    const startDate = parseDateLocal(formData.startDate);
    const endDate = parseDateLocal(formData.endDate);
    if (formData.endDate && endDate < startDate) {
      newErrors.endDate = "Ngày kết thúc phải lớn hơn ngày bắt đầu";
    }
    if (rules.max_promotion_duration && formData.startDate && formData.endDate) {
      const start = parseDateLocal(formData.startDate);
      const end = parseDateLocal(formData.endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > rules.max_promotion_duration) {
        newErrors.endDate = `Thời gian áp dụng khuyến mãi tối đa là ${rules.max_promotion_duration} ngày.`;
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
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBookCheckbox = (id) => {
    setSelectedBooks((prev) =>
      prev.includes(id) ? prev.filter((bookId) => bookId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        let response, data;
        // Log để debug trước khi gửi
        console.log("Form data trước khi gửi:", formData);

        const payload = {
          name: formData.name,
          type: formData.type,
          discount: formData.discount,
          startDate: formData.startDate,
          endDate: formData.endDate,
          minPrice: formData.minPrice,
          quantity: formData.quantity === "" ? null : Number(formData.quantity),
          usedQuantity: formData.usedQuantity,
          bookIds: selectedBooks,
        };
        
        // Log để kiểm tra payload
        console.log("Payload sẽ gửi đi:", payload);

        if (promotion && promotion.id) {
          response = await fetch(`http://localhost:5000/api/promotions/${promotion.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          response = await fetch("http://localhost:5000/api/promotions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }
        data = await response.json();
        if (response.ok) {
          onSubmit(data);
        } else {
          console.error("API trả về lỗi:", data);
        }
      } catch (error) {
        console.error("Lỗi khi gọi API:", error);
      }
    }
  };

  const modalContent = (    <div className="promotion-modal-backdrop">
      <div className="promotion-modal-content">
        <div className="promotion-modal-header">
          <h3>
            <FontAwesomeIcon
              icon={faTag}
              className="promotion-icon"
            />
            {promotion ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
          </h3>
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="promotion-modal-body">
          <form onSubmit={handleSubmit} className="account-form">            <div className="form-columns">
              {/* Cột bên trái */}
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="name">
                    <FontAwesomeIcon icon={faTag} className="form-icon" />
                    Tên chương trình
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? "error" : ""}
                    placeholder="Nhập tên chương trình"
                  />
                  {errors.name && <div className="error-message">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="type">
                    <FontAwesomeIcon icon={faPercent} className="form-icon" />
                    Loại khuyến mãi
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className={errors.type ? "error" : ""}
                  >
                    <option value="percent">Giảm theo phần trăm (%)</option>
                    <option value="fixed">Giảm số tiền cố định (VNĐ)</option>
                  </select>
                  {errors.type && <div className="error-message">{errors.type}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="discount">
                    <FontAwesomeIcon icon={formData.type === "percent" ? faPercent : faMoneyBill} className="form-icon" />
                    {formData.type === "percent" ? "Mức giảm giá (%)" : "Số tiền giảm (VNĐ)"}
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className={errors.discount ? "error" : ""}
                    placeholder={formData.type === "percent" ? "Nhập mức giảm giá (%)" : "Nhập số tiền giảm (VNĐ)"}
                    min="0"
                    max={formData.type === "percent" ? "100" : undefined}
                    step="1"
                  />
                  {errors.discount && <div className="error-message">{errors.discount}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="quantity">
                    <FontAwesomeIcon icon={faInfoCircle} className="form-icon" />
                    Số lượng áp dụng tối đa
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={errors.quantity ? "error" : ""}
                    placeholder="Không giới hạn nếu để trống"
                    min="1"
                  />
                  {errors.quantity && <div className="error-message">{errors.quantity}</div>}
                </div>
              </div>

              {/* Cột bên phải */}
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="startDate">
                    <FontAwesomeIcon icon={faCalendar} className="form-icon" />
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={errors.startDate ? "error" : ""}
                  />
                  {errors.startDate && <div className="error-message">{errors.startDate}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">
                    <FontAwesomeIcon icon={faCalendar} className="form-icon" />
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={errors.endDate ? "error" : ""}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                  {errors.endDate && <div className="error-message">{errors.endDate}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="minPrice">
                    <FontAwesomeIcon icon={faInfoCircle} className="form-icon" />
                    Giá tối thiểu
                  </label>
                  <input
                    type="text"
                    id="minPrice"
                    name="minPrice"
                    value={formatMinPrice(formData.minPrice)}
                    onChange={e => {
                      // Chỉ lấy số, loại bỏ dấu chấm/phẩy, giới hạn tối đa 9 ký tự số
                      const raw = e.target.value.replace(/[^0-9]/g, "").slice(0, 9);
                      setFormData(prev => ({ ...prev, minPrice: raw }));
                      if (errors.minPrice) setErrors(prev => ({ ...prev, minPrice: "" }));
                    }}
                    className={errors.minPrice ? "error" : ""}
                    placeholder="Nhập giá tối thiểu"
                    min="0"
                    autoComplete="off"
                  />
                  {errors.minPrice && <div className="error-message">{errors.minPrice}</div>}
                </div>              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="save-button"
              >
                {promotion ? "Cập nhật" : "Thêm mới"}
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

export default PromotionForm;