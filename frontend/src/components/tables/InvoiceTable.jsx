import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faEye,
  faSearch,
  faCheck,
  faTimes as faTimesIcon,
  faFilter
} from "@fortawesome/free-solid-svg-icons";
import InvoiceForm from "../forms/InvoiceForm";
import InvoiceDetailsModal from "../modals/InvoiceDetailsModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import { getAllInvoices, addInvoice, getInvoiceById, deleteInvoice } from "../../services/invoiceService";
import "../../styles/SearchBar.css";
import "./InvoiceTable.css";

const InvoiceTable = ({ onEdit, onDelete, onView, onPrint }) => {
  const [invoices, setInvoices] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [showProgress, setShowProgress] = useState(false);
  const progressRef = useRef();

  // Replace single search state with simple search object
  const [simpleSearch, setSimpleSearch] = useState({
    field: "id", // default search field
    value: ""
  });

  // Add state for advanced search panel visibility
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  
  // Add advanced search state
  const [advancedSearch, setAdvancedSearch] = useState({
    customer_name: "",
    created_by: "",
    dateRange: { startDate: "", endDate: "" },
    amountRange: { min: "", max: "" }
  });

  const recordsPerPage = 10;
  
  // Modal xác nhận xóa
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Lưu thành tiền đã tính lại cho từng hoá đơn
  const [invoiceTotals, setInvoiceTotals] = useState({});

  useEffect(() => {
    getAllInvoices()
      .then((data) => setInvoices(Array.isArray(data) ? data : []))
      .catch((err) => {
        setInvoices([]);
        // Có thể hiển thị thông báo lỗi ở đây nếu muốn
      });
  }, []);

  // Sau khi lấy danh sách hoá đơn, tải chi tiết từng hoá đơn để tính lại thành tiền
  useEffect(() => {
    if (invoices.length === 0) return;

    const fetchDetails = async () => {
      try {
        const results = await Promise.all(
          invoices.map(async (inv) => {
            try {
              const detail = await getInvoiceById(inv.id);
              // details có thể nằm ở detail.details hoặc detail.bookDetails
              const bookDetails = Array.isArray(detail.details)
                ? detail.details
                : (Array.isArray(detail.bookDetails) ? detail.bookDetails : []);
              const total = bookDetails.reduce((sum, b) => {
                const qty = Number(b.quantity) || 0;
                // Giá có thể nằm ở b.unit_price, b.price hoặc b.book?.price
                const price = Number(b.unit_price || b.price || (b.book && b.book.price) || 0);
                return sum + qty * price;
              }, 0);
              const discount = Number(detail.discount_amount) || 0;
              const final = total - discount;
              return { id: inv.id, final };
            } catch (err) {
              // Fallback nếu lỗi: dùng final tính từ total/discount của bản ghi gốc
              const fallback = (Number(inv.total_amount) || 0) - (Number(inv.discount_amount) || 0);
              return { id: inv.id, final: fallback };
            }
          })
        );

        const map = {};
        results.forEach(({ id, final }) => {
          map[id] = final;
        });
        setInvoiceTotals(map);
      } catch (e) {
        // Bỏ qua lỗi, giữ nguyên state cũ
      }
    };

    fetchDetails();
  }, [invoices]);

  // Filter invoices based on search criteria
  const filteredInvoices = (Array.isArray(invoices) ? invoices : []).filter((invoice) => {
    if (!isAdvancedSearchOpen) {
      // Simple search logic
      if (!simpleSearch.value) return true;
      
      const searchValue = simpleSearch.value.toLowerCase();
      switch (simpleSearch.field) {
        case "id":
          return invoice.id.toString().toLowerCase().includes(searchValue);
        case "customer_name":
          return (invoice.customer_name || "").toLowerCase().includes(searchValue);
        case "customer_phone":
          return (invoice.customer_phone || "").toLowerCase().includes(searchValue);
        case "created_by":
          return (invoice.created_by_name || invoice.created_by || "").toLowerCase().includes(searchValue);
        case "all":
          return invoice.id.toString().toLowerCase().includes(searchValue) ||
                 (invoice.customer_name || "").toLowerCase().includes(searchValue) ||
                 (invoice.customer_phone || "").toLowerCase().includes(searchValue) ||
                 (invoice.created_by_name || invoice.created_by || "").toLowerCase().includes(searchValue);
        default:
          return true;
      }
    } else {
      // Advanced search logic
      const matchesCustomerName = !advancedSearch.customer_name || 
        (invoice.customer_name || "").toLowerCase().includes(advancedSearch.customer_name.toLowerCase());
        
      const matchesCreatedBy = !advancedSearch.created_by || 
        (invoice.created_by_name || invoice.created_by || "").toLowerCase().includes(advancedSearch.created_by.toLowerCase());
      
      // Date range filter
      let matchesDateRange = true;
      if (advancedSearch.dateRange.startDate || advancedSearch.dateRange.endDate) {
        const invoiceDate = new Date(invoice.created_at);
        
        if (advancedSearch.dateRange.startDate) {
          const startDate = new Date(advancedSearch.dateRange.startDate);
          if (invoiceDate < startDate) matchesDateRange = false;
        }
        
        if (advancedSearch.dateRange.endDate) {
          const endDate = new Date(advancedSearch.dateRange.endDate);
          // Set endDate to the end of the day for inclusive comparison
          endDate.setHours(23, 59, 59, 999);
          if (invoiceDate > endDate) matchesDateRange = false;
        }
      }
      
      // Amount range filter với giá trị đã tính lại (nếu có)
      let matchesAmountRange = true;
      const invoiceAmount = invoiceTotals[invoice.id] !== undefined
        ? invoiceTotals[invoice.id]
        : (parseFloat(invoice.total_amount || 0) - parseFloat(invoice.discount_amount || 0));
      const minAmount = advancedSearch.amountRange.min === "" ? 0 : parseFloat(advancedSearch.amountRange.min);
      const maxAmount = advancedSearch.amountRange.max === "" ? Infinity : parseFloat(advancedSearch.amountRange.max);
      
      if (!isNaN(invoiceAmount) && (advancedSearch.amountRange.min !== "" || advancedSearch.amountRange.max !== "")) {
        matchesAmountRange = invoiceAmount >= minAmount && invoiceAmount <= maxAmount;
      }
      
      return matchesCustomerName && matchesCreatedBy && matchesDateRange && matchesAmountRange;
    }
  });

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredInvoices.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredInvoices.length / recordsPerPage);

  // Kiểm tra xem tất cả các mục trên tất cả các trang đã được chọn chưa
  const areAllItemsSelected = filteredInvoices.length > 0 && 
    filteredInvoices.every(invoice => selectedRows.includes(invoice.id));

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setShowForm(true);
  };

  const handleEditInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowForm(true);
  };

  const handleDeleteInvoices = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      // Xóa từng hóa đơn đã chọn
      for (const id of selectedRows) {
        await deleteInvoice(id);
      }
      // Reload lại danh sách hóa đơn
      const data = await getAllInvoices();
      setInvoices(Array.isArray(data) ? data : []);
      setSelectedRows([]);
      setShowDeleteConfirmation(false);
      setNotification({ message: "Xóa hóa đơn thành công!", type: "success" });
      setShowProgress(true);
    } catch (err) {
      setNotification({ message: "Xóa hóa đơn thất bại!", type: "error" });
      setShowProgress(true);
    }
  };

  // Hiệu ứng tự động tắt thông báo sau 5s và reset progress bar
  useEffect(() => {
    if (notification.message) {
      setShowProgress(true);
      progressRef.current = setTimeout(() => {
        setNotification({ message: "", type: "" });
        setShowProgress(false);
      }, 5000);
    }
    return () => {
      if (progressRef.current) clearTimeout(progressRef.current);
    };
  }, [notification.message]);

  const handleInvoiceSubmit = async (formData) => {
    if (selectedInvoice) {
      // Edit existing invoice
      setInvoices(
        invoices.map((invoice) =>
          invoice.id === selectedInvoice.id
            ? { ...invoice, ...formData }
            : invoice
        )
      );
      return null; // Không có ID trả về khi edit
    } else {
      // Add new invoice to backend
      try {
        const result = await addInvoice(formData);
        console.log("Backend trả về khi tạo hóa đơn:", result);
        
        // Reload invoices from backend
        const data = await getAllInvoices();
        setInvoices(Array.isArray(data) ? data : []);
        setNotification({ message: "Tạo hóa đơn thành công!", type: "success" });
        setShowProgress(true);
        
        // Nếu backend không trả về ID, thử tìm ID từ danh sách hóa đơn vừa reload
        if (!result || !result.id) {
          console.log("Không nhận được ID từ API trực tiếp, tìm kiếm trong danh sách mới nhất");
          // Tìm hóa đơn mới nhất dựa vào thông tin khách hàng và ngày tạo
          const latestInvoice = data
            .filter(inv => 
              inv.customer_name === formData.customer_name && 
              inv.customer_phone === formData.customer_phone)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            
          if (latestInvoice) {
            console.log("Đã tìm thấy hóa đơn mới tạo:", latestInvoice);
            return latestInvoice;
          }
        }
        
        // Đảm bảo result chứa id và trả về cho form
        return result;
      } catch (err) {
        setNotification({ message: "Tạo hóa đơn thất bại!", type: "error" });
        setShowProgress(true);
        throw err; // Ném lỗi để InvoiceForm có thể bắt và xử lý
      }
    }
    // Không đóng form ở đây - để InvoiceForm tự xử lý việc đóng form
  };

  // Xử lý khi chọn/bỏ chọn tất cả - hai trạng thái: chọn tất cả các trang hoặc bỏ chọn tất cả
  const handleSelectAllToggle = () => {
    if (areAllItemsSelected) {
      // Nếu đã chọn tất cả, bỏ chọn tất cả
      setSelectedRows([]);
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả trên mọi trang
      setSelectedRows(filteredInvoices.map(invoice => invoice.id));
    }
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  const handleViewDetails = async (invoice) => {
    try {
      const detail = await getInvoiceById(invoice.id);
      setSelectedInvoice(detail);
      setShowDetailsModal(true);
    } catch (err) {
      alert("Không thể tải chi tiết hóa đơn!");
    }
  };

  const handlePrintInvoice = (invoice) => {
    if (onPrint) {
      onPrint(invoice);
    }
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
  };

  // Handle changes to advanced search fields
  const handleAdvancedSearchChange = (field, value) => {
    setAdvancedSearch(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle changes to date range
  const handleDateRangeChange = (field, value) => {
    setAdvancedSearch(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  // Handle changes to amount range
  const handleAmountRangeChange = (field, value) => {
    setAdvancedSearch(prev => ({
      ...prev,
      amountRange: {
        ...prev.amountRange,
        [field]: value
      }
    }));
  };

  // Reset all search fields
  const resetSearch = () => {
    setAdvancedSearch({
      customer_name: "",
      created_by: "",
      dateRange: { startDate: "", endDate: "" },
      amountRange: { min: "", max: "" }
    });
    setSimpleSearch({
      field: "id",
      value: ""
    });
  };

  return (
    <>
      <div className="table-actions">
        <div className="search-filter-container">
          {/* Simple search with field selector and dynamic input */}
          <div className="search-container">
            <select
              className="search-field-selector"
              value={simpleSearch.field}
              onChange={(e) => handleSimpleSearchChange("field", e.target.value)}
            >
              
              <option value="id">Mã hóa đơn</option>
              <option value="customer_name">Tên khách hàng</option>
              <option value="customer_phone">Số điện thoại</option>
              <option value="created_by">Người lập</option>
            </select>
            
            <input
              type="text"
              placeholder={`Nhập ${
                simpleSearch.field === "all" ? "tất cả" :
                simpleSearch.field === "id" ? "mã hóa đơn" :
                simpleSearch.field === "customer_name" ? "tên khách hàng" :
                simpleSearch.field === "customer_phone" ? "số điện thoại" :
                simpleSearch.field === "created_by" ? "người lập" : ""
              }...`}
              value={simpleSearch.value}
              onChange={(e) => handleSimpleSearchChange("value", e.target.value)}
              className="search-input"
            />
            
            <button 
              className={`filter-button ${isAdvancedSearchOpen ? 'active' : ''}`}
              onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
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
                  <label htmlFor="customer-name-search">Tên khách hàng</label>
                  <input
                    id="customer-name-search"
                    type="text"
                    placeholder="Nhập tên khách hàng"
                    value={advancedSearch.customer_name}
                    onChange={(e) => handleAdvancedSearchChange("customer_name", e.target.value)}
                  />
                </div>
                
                <div className="search-field">
                  <label htmlFor="created-by-search">Người lập</label>
                  <input
                    id="created-by-search"
                    type="text"
                    placeholder="Nhập tên người lập"
                    value={advancedSearch.created_by}
                    onChange={(e) => handleAdvancedSearchChange("created_by", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="search-row">
                <div className="search-field">
                  <label>Ngày lập hóa đơn</label>
                  <div className="date-range-container">
                    <input
                      type="date"
                      value={advancedSearch.dateRange.startDate}
                      onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
                      placeholder="Từ ngày"
                    />
                    <span className="date-range-separator">-</span>
                    <input
                      type="date"
                      value={advancedSearch.dateRange.endDate}
                      onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
                      placeholder="Đến ngày"
                    />
                  </div>
                </div>
                
                <div className="search-field">
                  <label>Thành tiền</label>
                  <div className="price-range-container">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={advancedSearch.amountRange.min}
                      onChange={(e) => handleAmountRangeChange("min", e.target.value)}
                      min="0"
                    />
                    <span className="price-range-separator">-</span>
                    <input
                      type="number"
                      placeholder="Đến"
                      value={advancedSearch.amountRange.max}
                      onChange={(e) => handleAmountRangeChange("max", e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="search-actions">
                <button className="search-reset-button" onClick={resetSearch}>
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="action-buttons">
          <button className="btn btn-add" onClick={handleAddInvoice}>
            <FontAwesomeIcon icon={faPlus} /> Thêm mới
          </button>
          <button
            className="btn btn-delete"
            onClick={handleDeleteInvoices}
            disabled={selectedRows.length === 0}
          >
            <FontAwesomeIcon icon={faTrash} /> Xóa
          </button>
        </div>
      </div>

      <div className="invoice-table-container">
        <table className="invoice-table">
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
              <th>Mã hóa đơn</th>
              <th>Tên khách hàng</th>
              <th>Người lập</th>
              <th>Ngày lập</th>
              <th>Thành tiền</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((invoice) => (
              <tr
                key={invoice.id}
                className={selectedRows.includes(invoice.id) ? "selected" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(invoice.id)}
                    onChange={() => toggleRowSelection(invoice.id)}
                  />
                </td>
                <td>{invoice.id}</td>
                <td>{invoice.customer_name}</td>
                <td>{invoice.creator?.full_name || invoice.created_by_name || invoice.created_by || "---"}</td>
                <td>
                  {
                    invoice.created_at
                      ? new Date(invoice.created_at).toLocaleDateString("vi-VN")
                      : ""
                  }
                </td>
                <td>{(invoiceTotals[invoice.id] !== undefined
                  ? invoiceTotals[invoice.id]
                  : ((Number(invoice.total_amount) || 0) - (Number(invoice.discount_amount) || 0))
                ).toLocaleString("vi-VN")} VNĐ</td>
                <td className="actions">
                  <button
                    className="btn btn-view"
                    onClick={() => handleViewDetails(invoice)}
                    title="Xem chi tiết"
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                  
                </td>
              </tr>
            ))}

            {currentRecords.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {areAllItemsSelected && filteredInvoices.length > currentRecords.length && (
          <div className="all-pages-selected-info">
            Đã chọn tất cả {filteredInvoices.length} mục trên {totalPages} trang
          </div>
        )}
        <div className="pagination-info">
          Hiển thị {indexOfFirstRecord + 1} đến{" "}
          {Math.min(indexOfLastRecord, filteredInvoices.length)} của{" "}
          {filteredInvoices.length} mục
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
              className={`pagination-button ${
                currentPage === index + 1 ? "active" : ""
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
            <InvoiceForm
              invoice={selectedInvoice}
              onSubmit={handleInvoiceSubmit}
              onClose={() => setShowForm(false)}
              setShowForm={setShowForm}
            />
          </div>
        </div>
      )}

      {showDetailsModal && (
        <InvoiceDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          invoice={selectedInvoice}
        />
      )}
      
      {/* Modal xác nhận xóa */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa hóa đơn"
        message={`Bạn có chắc chắn muốn xóa ${selectedRows.length} hóa đơn đã chọn? Hành động này không thể hoàn tác.`}
      />

      {/* Thông báo giống BookForm */}
      {notification.message && (
        <div
          className={`notification ${notification.type === "error" ? "error" : notification.type === "success" ? "success" : ""}`}
        >
          <FontAwesomeIcon
            icon={
              notification.type === "success"
                ? faCheck
                : notification.type === "error"
                ? faTimesIcon
                : faTrash
            }
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
          {showProgress && <div className="progress-bar"></div>}
        </div>
      )}
    </>
  );
};

export default InvoiceTable;