import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faBook,
  faUser,
  faBuilding,
  faTags,
  faDollarSign,
  faHashtag,
  faCalendarAlt,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import "../modals/Modals.css";
import "./BookForm.css";
import { openModal, closeModal } from "../../utils/modalUtils";

const BookForm = ({ book, onSubmit, onClose }) => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = 2020; y <= currentYear; y++) {
    years.push(y);
  }

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher_id: "",
    category_id: "",
    description: "",
    publicationYear: "",
    price: "",
    stock: "", // Thêm trường tồn kho
    images: [], // Đổi từ image sang images (mảng)
  });

  const [imagePreview, setImagePreview] = useState([]); // Đổi sang mảng

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    if (book) {
      setFormData(prev => ({
        ...prev,
        title: book.title || "",
        author: book.author || "",
        publisher_id: book.publisher_id || "",
        category_id: book.category_id || "",
        description: book.description || "",
        publicationYear: book.publicationYear || "",
        price: book.price !== undefined && book.price !== null ? String(book.price) : "",
        stock: book.stock !== undefined && book.stock !== null ? String(book.stock) : "",
        images: [], // reset khi edit
      }));
      // Nếu có nhiều ảnh, set preview là mảng
      if (book.imageUrls && Array.isArray(book.imageUrls)) {
        setImagePreview(book.imageUrls.map(url => url.startsWith('http') ? url : `http://localhost:5000${url}`));
      } else if (book.imageUrl) {
        setImagePreview([book.imageUrl.startsWith('http') ? book.imageUrl : `http://localhost:5000${book.imageUrl}`]);
      } else {
        setImagePreview([]);
      }
    } else {
      setImagePreview([]);
    }
  }, [book]);

  useEffect(() => {
    openModal();
    return () => {
      closeModal();
    };
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.success ? data.data : data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPublishers = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/publishers");
        if (response.ok) {
          const data = await response.json();
          setPublishers(data.success ? data.data : data);
        }
      } catch (error) {
        console.error("Error fetching publishers:", error);
      }
    };
    fetchPublishers();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tên sách";
    if (!formData.author.trim()) newErrors.author = "Vui lòng nhập tên tác giả";
    if (!formData.publisher_id) newErrors.publisher_id = "Vui lòng chọn nhà xuất bản";
    if (!formData.category_id) newErrors.category_id = "Vui lòng chọn thể loại";
    if (!formData.description.trim()) newErrors.description = "Vui lòng nhập mô tả";
    if (!formData.price) newErrors.price = "Vui lòng nhập giá";

    // Validate price (positive number)
    const numericPrice = parseFloat(formData.price.replace(/,/g, ''));
    if (formData.price && (isNaN(numericPrice) || numericPrice < 0)) {
      newErrors.price = "Giá không được âm";
    }

    // Validate tồn kho
    if (formData.stock) {
      const numericStock = parseInt(formData.stock, 10);
      if (isNaN(numericStock) || numericStock < 0) {
        newErrors.stock = "Tồn kho không hợp lệ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image') {
      const fileList = Array.from(files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...fileList]
      }));
      setImagePreview(prev => ([
        ...prev,
        ...fileList.map(file => URL.createObjectURL(file))
      ]));
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: "" }));
      }
      return;
    }

    if (name === 'price') {
      // Remove existing commas and format with new ones
      const numericValue = value.replace(/,/g, '');
      if ((!isNaN(numericValue) && parseFloat(numericValue) >= 0) || numericValue === '') {
        const formattedValue = numericValue === '' ? '' :
          Number(numericValue).toLocaleString('en-US', {
            maximumFractionDigits: 0,
            useGrouping: true
          });
        setFormData(prev => ({
          ...prev,
          [name]: formattedValue
        }));
      }
    } else if (name === 'stock') {
      // Chỉ cho nhập số nguyên >= 0
      if (/^\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          stock: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Sử dụng FormData để gửi cả file ảnh nếu có
      const submissionData = new FormData();
      submissionData.append('title', formData.title);
      submissionData.append('author', formData.author);
      submissionData.append('publisher_id', formData.publisher_id);
      submissionData.append('category_id', formData.category_id);
      submissionData.append('description', formData.description);
      submissionData.append('publication_year', formData.publicationYear);
      submissionData.append('price', formData.price.replace(/,/g, ''));
      submissionData.append('quantity_in_stock', formData.stock ? parseInt(formData.stock, 10) : 0);
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((img) => {
          submissionData.append('images', img); // gửi nhiều file
        });
      }
      onSubmit(submissionData);
    }
  };

  const modalContent = (
    <div className="bookform-backdrop">
      <div className="bookform-modal-content">
        <div className="bookform-header">
          <h3>
            <FontAwesomeIcon
              icon={faBook}
              className="book-icon"
            />
            {book ? "Chỉnh sửa đầu sách" : "Thêm đầu sách mới"}
          </h3>
          <button className="close-button" onClick={onClose} aria-label="Đóng">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="bookform-body">
          <form onSubmit={handleSubmit} className="account-form">
            <div className="form-columns">
              {/* Ảnh sách */}
              <div className="form-group" style={{width: '100%'}}>
                <label htmlFor="image">
                  <FontAwesomeIcon icon={faBook} className="icon" />
                  Ảnh bìa sách
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  style={{marginBottom: '8px'}}
                  multiple // Cho phép chọn nhiều ảnh
                />
                {imagePreview.length > 0 ? (
                  <div style={{marginTop: 8, display: 'flex', gap: 8}}>
                    {imagePreview.map((src, idx) => (
                      <div key={idx} style={{position: 'relative', display: 'inline-block'}}>
                        <img src={src} alt={`Preview ${idx}`} style={{maxWidth: 120, maxHeight: 160, borderRadius: 4, border: '1px solid #eee'}} />
                        <button type="button" onClick={() => {
                          setImagePreview(prev => prev.filter((_, i) => i !== idx));
                          setFormData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx)
                          }));
                        }} style={{position: 'absolute', top: 2, right: 2, background: '#fff', border: '1px solid #ccc', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>&times;</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{fontSize: '12px', color: '#888', marginTop: 4}}>
                    Chưa có ảnh bìa.
                  </div>
                )}
                {errors.image && <div className="error-message">{errors.image}</div>}
              </div>
              {/* Cột bên trái */}
              <div className="form-column">

                <div className="form-group">
                  <label htmlFor="title">
                    <FontAwesomeIcon icon={faBook} className="icon" />
                    Tên sách
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={errors.title ? "error" : ""}
                    placeholder="Nhập tên sách"
                  />
                  {errors.title && <div className="error-message">{errors.title}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="author">
                    <FontAwesomeIcon icon={faUser} className="icon" />
                    Tác giả
                  </label>
                  <input
                    type="text"
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className={errors.author ? "error" : ""}
                    placeholder="Nhập tên tác giả"
                  />
                  {errors.author && <div className="error-message">{errors.author}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="category_id">
                    <FontAwesomeIcon icon={faTags} className="icon" />
                    Thể loại
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className={errors.category_id ? "error" : ""}
                  >
                    <option value="">Chọn thể loại</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <div className="error-message">{errors.category_id}</div>}
                </div>
              </div>

              {/* Cột bên phải */}
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="publisher_id">
                    <FontAwesomeIcon icon={faBuilding} className="icon" />
                    Nhà xuất bản
                  </label>
                  <select
                    id="publisher_id"
                    name="publisher_id"
                    value={formData.publisher_id}
                    onChange={handleChange}
                    className={errors.publisher_id ? "error" : ""}
                  >
                    <option value="">Chọn nhà xuất bản</option>
                    {publishers.map((pub) => (
                      <option key={pub.id} value={pub.id}>{pub.name}</option>
                    ))}
                  </select>
                  {errors.publisher_id && <div className="error-message">{errors.publisher_id}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="publicationYear">
                    <FontAwesomeIcon icon={faCalendarAlt} className="icon" />
                    Năm xuất bản
                  </label>
                  <select
                    id="publicationYear"
                    name="publicationYear"
                    value={formData.publicationYear}
                    onChange={handleChange}
                    className={errors.publicationYear ? "error" : ""}
                  >
                    <option value="">Chọn năm xuất bản</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  {errors.publicationYear && <div className="error-message">{errors.publicationYear}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="price">
                    <FontAwesomeIcon icon={faDollarSign} className="icon" />
                    Giá bán
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={errors.price ? "error" : ""}
                    placeholder="Nhập giá bán"
                    min="0"
                  />
                  {errors.price && <div className="error-message">{errors.price}</div>}
                </div>
              </div>
            </div>

            {/* Mô tả - trải dài 2 bên */}
            <div className="form-group">
              <label htmlFor="description">
                <FontAwesomeIcon icon={faInfoCircle} className="icon" />
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? "error" : ""}
                rows="4"
                placeholder="Nhập mô tả sách"
              />
              {errors.description && <div className="error-message">{errors.description}</div>}
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
                {book ? "Cập nhật" : "Thêm sách"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default BookForm;