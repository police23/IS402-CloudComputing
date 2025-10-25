import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faTrash,
  faPencilAlt,
  faSearch,
  faEye,
  faCheck,
  faTrashAlt,
  faExclamationCircle,
  faFilter
} from "@fortawesome/free-solid-svg-icons";
import ImportForm from "../forms/ImportForm";
import ImportDetailsModal from "../modals/ImportDetailsModal";
import ConfirmationModal from "../modals/ConfirmationModal";
import "./ImportTable.css";
import "../../styles/SearchBar.css";

const ImportTable = () => {
  const [imports, setImports] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedImport, setSelectedImport] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const recordsPerPage = 10;
  const [suppliers, setSuppliers] = useState([]);

  // Replace single search with advanced search objects
  const [advancedSearch, setAdvancedSearch] = useState({
    importCode: "",
    supplier_id: "",
    startDate: "",
    endDate: "",
    totalRange: { min: "", max: "" }, // Add this new property for total price range
  });
  
  // Add simple search state similar to BookTable
  const [simpleSearch, setSimpleSearch] = useState({
    field: "importCode", // default search field
    value: ""
  });
  
  // Add state for advanced search panel visibility
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  // Modal xác nhận xóa
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Đưa fetchImports ra ngoài useEffect để có thể gọi lại ở confirmDelete
  const fetchImports = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/imports`);
      if (res.ok) {
        const rawData = await res.json();
        // Map dữ liệu từ model sang định dạng cần thiết (chuyển từ backend sang frontend)
        const mappedData = rawData.map(imp => {
          return {
            id: imp.id,
            importCode: imp.id,
            date: imp.import_date,
            supplier: imp.supplier,
            employee: imp.employee, // Keep as object with proper alias
            importedBy: imp.employee,
            total: imp.total_price !== undefined ? imp.total_price : 0,
            bookDetails: imp.details ? imp.details.map(d => ({
              id: d.id,
              bookId: d.book_id,
              book: d.book,
              quantity: d.quantity,
              price: d.unit_price
            })) : []
          };
        });
        
        setImports(mappedData);
      }
    } catch (err) {
      console.error("Error fetching imports:", err);
    }
  };

  // Fetch suppliers for dropdown
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

  useEffect(() => {
    fetchImports();
    fetchSuppliers();
  }, []);

  // Filter imports based on search criteria
  const filteredImports = imports.filter((importItem) => {
    if (!isAdvancedSearchOpen) {
      // Simple search logic
      if (!simpleSearch.value) return true;
      
      const searchValue = simpleSearch.value.toLowerCase();
      switch (simpleSearch.field) {
        case "importCode":
          return importItem.importCode.toString().toLowerCase().includes(searchValue);
        case "supplier":
          // For supplier, match by supplier_id if it's a number, otherwise by name
          if (!isNaN(simpleSearch.value)) {
            return importItem.supplier_id === parseInt(simpleSearch.value);
          }
          return importItem.supplier.toLowerCase().includes(searchValue);
        case "all":
          return importItem.importCode.toString().toLowerCase().includes(searchValue) ||
                 importItem.supplier.toLowerCase().includes(searchValue);
        default:
          return true;
      }
    } else {
      // Advanced search logic
      const matchesImportCode = !advancedSearch.importCode || 
        importItem.importCode.toString().toLowerCase().includes(advancedSearch.importCode.toLowerCase());
        
      const matchesSupplier = !advancedSearch.supplier_id || 
        importItem.supplier_id === parseInt(advancedSearch.supplier_id);
      
      // Date range filter
      let matchesDateRange = true;
      if (advancedSearch.startDate || advancedSearch.endDate) {
        const importDate = new Date(importItem.date);
        
        if (advancedSearch.startDate) {
          const startDate = new Date(advancedSearch.startDate);
          if (importDate < startDate) matchesDateRange = false;
        }
        
        if (advancedSearch.endDate) {
          const endDate = new Date(advancedSearch.endDate);
          // Set endDate to the end of the day for inclusive comparison
          endDate.setHours(23, 59, 59, 999);
          if (importDate > endDate) matchesDateRange = false;
        }
      }
      
      // Total price range filter
      let matchesTotalRange = true;
      const importTotal = parseFloat(importItem.total);
      const minTotal = advancedSearch.totalRange.min === "" ? 0 : parseFloat(advancedSearch.totalRange.min);
      const maxTotal = advancedSearch.totalRange.max === "" ? Infinity : parseFloat(advancedSearch.totalRange.max);
      
      if (!isNaN(importTotal) && (advancedSearch.totalRange.min !== "" || advancedSearch.totalRange.max !== "")) {
        matchesTotalRange = importTotal >= minTotal && importTotal <= maxTotal;
      }
      
      return matchesImportCode && matchesSupplier && matchesDateRange && matchesTotalRange;
    }
  });

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredImports.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredImports.length / recordsPerPage);

  // Kiểm tra xem tất cả các mục trên tất cả các trang đã được chọn chưa
  const areAllItemsSelected = filteredImports.length > 0 &&
    filteredImports.every(importItem => selectedRows.includes(importItem.id));

  // Xử lý khi chọn/bỏ chọn tất cả - hai trạng thái: chọn tất cả các trang hoặc bỏ chọn tất cả
  const handleSelectAllToggle = () => {
    if (areAllItemsSelected) {
      // Nếu đã chọn tất cả, bỏ chọn tất cả
      setSelectedRows([]);
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả trên mọi trang
      setSelectedRows(filteredImports.map(importItem => importItem.id));
    }
  };

  const handleAddImport = () => {
    setSelectedImport(null);
    setShowForm(true);
  };

  const handleEditImport = (importItem) => {
    setSelectedImport(importItem);
    setShowForm(true);
  };

  const handleDeleteImports = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      for (const id of selectedRows) {
        // Xóa phiếu nhập với id đã chọn
        const response = await fetch(`${API_BASE}/imports/${id}`, {
          method: "DELETE"
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to delete import ${id}: ${errorText}`);
        }
      }
      await fetchImports(); // reload lại danh sách phiếu nhập
      setSelectedRows([]);
      setShowDeleteConfirmation(false);
      setNotification({ message: "Xóa phiếu nhập thành công.", type: "delete" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } catch (error) {
      setNotification({ message: "Xóa phiếu nhập thất bại!", type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      console.error("Error deleting import(s):", error);
    }
  };

  const handleImportSubmit = async (formData) => {
    if (selectedImport) {
      // Edit existing import
      setImports(
        imports.map((importItem) =>
          importItem.id === selectedImport.id
            ? { ...importItem, ...formData }
            : importItem
        )
      );
      setNotification({ message: "Sửa phiếu nhập thành công.", type: "update" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } else {
      // Add new import (call API)
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE}/imports`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          // Sau khi thêm thành công, reload lại danh sách
          await fetchImports();
          setNotification({ message: "Thêm phiếu nhập thành công.", type: "add" });
          setTimeout(() => setNotification({ message: "", type: "" }), 5000);
        } else {
          setNotification({ message: "Thêm phiếu nhập thất bại!", type: "error" });
          setTimeout(() => setNotification({ message: "", type: "" }), 5000);
        }
      } catch (err) {
        setNotification({ message: "Lỗi khi thêm phiếu nhập!", type: "error" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      }
      setShowForm(false);
    }
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  const handleViewDetails = (importItem) => {
    setSelectedImport(importItem);
    setShowDetailsModal(true);
  };

  const calculateTotalBooks = (importItem) => {
    return importItem.bookDetails.reduce((total, book) => total + book.quantity, 0);
  };

  // Hàm để hiển thị danh sách sách với giới hạn ký tự
  const getBooksList = (importItem) => {
    const booksList = importItem.bookDetails.map(book => book.book).join(", ");
    return booksList.length > 30 ? booksList.substring(0, 30) + "..." : booksList;
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
        importCode: "",
        supplier_id: "",
        startDate: "",
        endDate: "",
        totalRange: { min: "", max: "" }, // Reset total price range
      });
    }
  };

  // Handle changes to advanced search fields
  const handleAdvancedSearchChange = (field, value) => {
    setAdvancedSearch(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle changes to price range
  const handleTotalRangeChange = (field, value) => {
    setAdvancedSearch(prev => ({
      ...prev,
      totalRange: {
        ...prev.totalRange,
        [field]: value
      }
    }));
  };

  // Reset all search fields
  const resetSearch = () => {
    setAdvancedSearch({
      importCode: "",
      supplier_id: "",
      startDate: "",
      endDate: "",
      totalRange: { min: "", max: "" }, // Reset total price range
    });
    setSimpleSearch({
      field: "importCode",
      value: ""
    });
  };
  // Helper function to get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "add":
        return faCheck;
      case "delete":
        return faTrashAlt;
      case "update":
        return faPencilAlt;
      case "error":
        return faExclamationCircle;
      default:
        return null;
    }
  };

  // Helper function for formatting currency values
  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return "0 VNĐ";
    }
    
    // Make sure we're working with a number
    const numberValue = typeof value === "string" ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
    
    if (isNaN(numberValue)) {
      return "0 VNĐ";
    }
    
    // Format with thousand separators
    return numberValue.toLocaleString('vi-VN') + ' VNĐ';
  };

  // Helper function for formatting dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    
    // Handle ISO date strings and other formats
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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
              
              <option value="importCode">Mã phiếu nhập</option>
              <option value="supplier">Nhà cung cấp</option>
            </select>
            
            {/* Dynamic input based on selected field */}
            {simpleSearch.field === "supplier" ? (
              <select
                value={simpleSearch.value}
                onChange={(e) => handleSimpleSearchChange("value", e.target.value)}
                className="search-input"
              >
                <option value="">-- Chọn NCC --</option>
                {Array.isArray(suppliers) && suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder={`Nhập ${
                  simpleSearch.field === "all" ? "tất cả" :
                  simpleSearch.field === "importCode" ? "mã phiếu nhập" : ""
                }...`}
                value={simpleSearch.value}
                onChange={(e) => handleSimpleSearchChange("value", e.target.value)}
                className="search-input"
              />
            )}
            
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
                  <label htmlFor="importCode-search">Mã phiếu nhập</label>
                  <input
                    id="importCode-search"
                    type="text"
                    placeholder="Nhập mã phiếu nhập"
                    value={advancedSearch.importCode}
                    onChange={(e) => handleAdvancedSearchChange("importCode", e.target.value)}
                  />
                </div>
                
                <div className="search-field">
                  <label htmlFor="supplier-search">Nhà cung cấp</label>
                  <select
                    id="supplier-search"
                    value={advancedSearch.supplier_id}
                    onChange={(e) => handleAdvancedSearchChange("supplier_id", e.target.value)}
                  >
                    <option value="">-- Chọn NCC --</option>
                    {Array.isArray(suppliers) && suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="search-row">
                <div className="search-field">
                  <label>Ngày nhập</label>
                  <div className="date-range-container">
                    <input
                      type="date"
                      value={advancedSearch.startDate}
                      onChange={(e) => handleAdvancedSearchChange("startDate", e.target.value)}
                      placeholder="Từ ngày"
                    />
                    <span className="date-range-separator">-</span>
                    <input
                      type="date"
                      value={advancedSearch.endDate}
                      onChange={(e) => handleAdvancedSearchChange("endDate", e.target.value)}
                      placeholder="Đến ngày"
                    />
                  </div>
                </div>
                
                {/* Add new Total price range filter */}
                <div className="search-field">
                  <label>Tổng tiền</label>
                  <div className="price-range-container">
                    <input
                      type="number"
                      placeholder="Từ"
                      value={advancedSearch.totalRange.min}
                      onChange={(e) => handleTotalRangeChange("min", e.target.value)}
                      min="0"
                    />
                    <span className="price-range-separator">-</span>
                    <input
                      type="number"
                      placeholder="Đến"
                      value={advancedSearch.totalRange.max}
                      onChange={(e) => handleTotalRangeChange("max", e.target.value)}
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
          <button className="btn btn-add" onClick={handleAddImport}>
            <FontAwesomeIcon icon={faPlus} /> Thêm mới
          </button>
          <button
            className="btn btn-delete"
            onClick={handleDeleteImports}
            disabled={selectedRows.length === 0}
          >
            <FontAwesomeIcon icon={faTrash} /> Xóa
          </button>
        </div>
      </div>

      <div className="import-table-container">
        <table className="import-table">
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
              <th>Mã phiếu nhập</th>
              <th>Ngày nhập</th>
              <th>Nhà cung cấp</th>
              <th>Tổng số sách</th>
              <th>Tổng tiền</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((importItem) => (
              <tr
                key={importItem.id}
                className={selectedRows.includes(importItem.id) ? "selected" : ""}
              >
                <td>                  <input
                    type="checkbox"
                    checked={selectedRows.includes(importItem.id)}
                    onChange={() => toggleRowSelection(importItem.id)}
                  />
                </td>
                <td>{importItem.importCode}</td>
                <td>{formatDate(importItem.date)}</td>
                <td>{importItem.supplier?.name || importItem.supplier}</td>
                <td>{calculateTotalBooks(importItem)}</td>
                <td>{formatCurrency(importItem.total)}</td>
                <td className="actions">
                  <button
                    className="btn btn-view"
                    onClick={() => handleViewDetails(importItem)}
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
        {areAllItemsSelected && filteredImports.length > currentRecords.length && (
          <div className="all-pages-selected-info">
            Đã chọn tất cả {filteredImports.length} mục trên {totalPages} trang
          </div>
        )}
        <div className="pagination-info">
          Hiển thị {indexOfFirstRecord + 1} đến{" "}
          {Math.min(indexOfLastRecord, filteredImports.length)} của{" "}
          {filteredImports.length} mục
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
            <ImportForm
              importData={selectedImport}
              onSubmit={handleImportSubmit}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {showDetailsModal && (
        <ImportDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          importData={selectedImport}
        />
      )}

      {/* Modal xác nhận xóa */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa phiếu nhập"
        message={`Bạn có chắc chắn muốn xóa ${selectedRows.length} phiếu nhập đã chọn? Hành động này không thể hoàn tác.`}
      />
    </>
  );
};

export default ImportTable;