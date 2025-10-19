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
  faFilter
} from "@fortawesome/free-solid-svg-icons";
import PromotionForm from "../forms/PromotionForm";
import ConfirmationModal from "../modals/ConfirmationModal";
import "./PromotionTable.css";
import "../../styles/SearchBar.css";

// Helper function to format dates for VN, avoiding timezone bugs
function formatDateForVN(dateStr) {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    // yyyy-mm-dd -> dd/mm/yyyy
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  }
  // Nếu là ISO string hoặc có chữ T thì parse bình thường
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}

// Helper function to determine promotion status (used as fallback if needed)
const getPromotionStatus = (start, end) => {
  if (!start || !end) return "unknown";
  
  try {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) 
      return "unknown";
      
    if (now < startDate) return "upcoming";
    if (now > endDate) return "expired";
    return "active";
  } catch (error) {
    return "unknown";
  }
};

const PromotionTable = () => {
  const [promotions, setPromotions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Modal xác nhận xóa
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [notification, setNotification] = useState({ message: "", type: "" });
  
  // Search mode: 'simple' or 'advanced'
  const [activeSearchMode, setActiveSearchMode] = useState("simple");
  // Simple search state
  const [simpleSearch, setSimpleSearch] = useState({
    field: "name",
    value: ""
  });
  // Advanced search panel open/close
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  // Advanced search state
  const [advancedSearch, setAdvancedSearch] = useState({
    name: "",
    type: "",
    dateRange: { startDate: "", endDate: "" },
    status: ""
  });
  const fetchPromotions = async () => {
    try {
  const response = await fetch("http://localhost:5000/api/promotions");
      if (response.ok) {
        const rawData = await response.json();
        // Đảm bảo chuyển đổi đúng tên trường từ backend sang frontend
        const transformedData = rawData.map(p => ({
          id: p.id,
          name: p.name || '',
          type: p.type || 'fixed',
          discount: p.discount || 0,
          startDate: p.start_date || '',
          endDate: p.end_date || '',
          status: getPromotionStatus(p.start_date, p.end_date),
          books: p.books || [],
        }));
        setPromotions(transformedData);
      } else {
        // Handle failed response silently
        console.error("Lỗi khi lấy dữ liệu khuyến mãi");
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu khuyến mãi:", error);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const filteredPromotions = promotions.filter((promotion) => {
  if (activeSearchMode === "advanced") {
      // Advanced search logic
      const matchesCode = true; // code removed
      const matchesName = !advancedSearch.name || 
        (promotion.name || "").toLowerCase().includes(advancedSearch.name.toLowerCase());
      const matchesType = !advancedSearch.type || 
        promotion.type === advancedSearch.type;
      const matchesStatus = !advancedSearch.status || 
        promotion.status === advancedSearch.status;
      // Date range filter for start date
      let matchesStartDateRange = true;
      if (advancedSearch.dateRange.startDate || advancedSearch.dateRange.endDate) {
        const promotionStartDate = new Date(promotion.startDate);
        if (advancedSearch.dateRange.startDate) {
          const filterStartDate = new Date(advancedSearch.dateRange.startDate);
          if (promotionStartDate < filterStartDate) matchesStartDateRange = false;
        }
        if (advancedSearch.dateRange.endDate) {
          const filterEndDate = new Date(advancedSearch.dateRange.endDate);
          filterEndDate.setHours(23, 59, 59, 999);
          if (promotionStartDate > filterEndDate) matchesStartDateRange = false;
        }
      }
      return matchesName && matchesType && matchesStatus && matchesStartDateRange;
    } else {
      // Simple search logic
      if (!simpleSearch.value) return true;
      const searchValue = simpleSearch.value.toLowerCase();
      switch (simpleSearch.field) {
        case "code":
          return false; // code removed
        case "name":
          return (promotion.name || "").toLowerCase().includes(searchValue);
        case "type":
          return promotion.type === searchValue;
        case "status":
          return promotion.status === searchValue;
        case "all":
          return (promotion.name || "").toLowerCase().includes(searchValue);
        default:
          return true;
      }
    }
  });

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredPromotions.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredPromotions.length / recordsPerPage);

  // Kiểm tra xem tất cả các mục trên tất cả các trang đã được chọn chưa
  const areAllItemsSelected = filteredPromotions.length > 0 &&
    filteredPromotions.every(promotion => selectedRows.includes(promotion.id));

  // Xử lý khi chọn/bỏ chọn tất cả - hai trạng thái: chọn tất cả các trang hoặc bỏ chọn tất cả
  const handleSelectAllToggle = () => {
    if (areAllItemsSelected) {
      // Nếu đã chọn tất cả, bỏ chọn tất cả
      setSelectedRows([]);
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả trên mọi trang
      setSelectedRows(filteredPromotions.map(promotion => promotion.id));
    }
  };

  const handleAddPromotion = () => {
    setSelectedPromotion(null);
    setShowForm(true);
  };

  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setShowForm(true);
  };

  const handleDeletePromotions = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      // Xóa từng khuyến mãi được chọn
      await Promise.all(selectedRows.map(async (id) => {
        await fetch(`http://localhost:5000/api/promotions/${id}`, {
          method: "DELETE"
        });
      }));
      setSelectedRows([]);
      setShowDeleteConfirmation(false);
      fetchPromotions(); // Cập nhật lại danh sách
      setNotification({ message: "Xóa khuyến mãi thành công.", type: "delete" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } catch (error) {
      setNotification({ message: "Có lỗi xảy ra khi xóa khuyến mãi!", type: "error" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    }
  };

  const handlePromotionSubmit = (formData) => {
    setShowForm(false);
    fetchPromotions(); // Gọi lại API để cập nhật danh sách mới nhất
    setNotification({ message: selectedPromotion ? "Sửa khuyến mãi thành công." : "Thêm khuyến mãi thành công.", type: selectedPromotion ? "update" : "add" });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000);
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id]
    );
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "status-badge status-active";
      case "inactive":
        return "status-badge status-inactive";
      case "upcoming":
        return "status-badge status-upcoming";
      case "expired":
        return "status-badge status-expired";
      default:
        return "status-badge";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Đang diễn ra";
      case "inactive":
        return "Đã dừng";
      case "upcoming":
        return "Sắp diễn ra";
      case "expired":
        return "Đã kết thúc";
      default:
        return status;
    }
  };

  // Handle simple search changes
  const handleSimpleSearchChange = (field, value) => {
    setActiveSearchMode("simple");
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
        name: "",
        type: "",
        dateRange: { startDate: "", endDate: "" },
        status: ""
      });
    }
  };

  // Handle changes to advanced search fields
  const handleAdvancedSearchChange = (field, value) => {
    setActiveSearchMode("advanced");
    setAdvancedSearch(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle changes to date range
  const handleDateRangeChange = (field, value) => {
    setActiveSearchMode("advanced");
    setAdvancedSearch(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  // Reset all search fields
  const resetSearch = () => {
    setAdvancedSearch({
      name: "",
      type: "",
      dateRange: { startDate: "", endDate: "" },
      status: ""
    });
    setSimpleSearch({
      field: "name",
      value: ""
    });
    setActiveSearchMode("simple");
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
              
              <option value="name">Tên KM</option>
              <option value="type">Loại KM</option>
              <option value="status">Trạng thái</option>
            </select>
            
            {/* Dynamic input based on selected field */}
            {simpleSearch.field === "type" ? (
              <select
                value={simpleSearch.value}
                onChange={(e) => handleSimpleSearchChange("value", e.target.value)}
                className="search-input"
              >
                <option value="">-- Chọn loại KM --</option>
                <option value="percent">Phần trăm</option>
                <option value="fixed">Cố định</option>
              </select>
            ) : simpleSearch.field === "status" ? (
              <select
                value={simpleSearch.value}
                onChange={(e) => handleSimpleSearchChange("value", e.target.value)}
                className="search-input"
              >
                <option value="">-- Chọn trạng thái --</option>
                <option value="active">Đang diễn ra</option>
                <option value="inactive">Đã dừng</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="expired">Đã kết thúc</option>
              </select>
            ) : (
              <input
                type="text"
                placeholder={`Nhập ${
                  simpleSearch.field === "all" ? "tất cả" :
                  simpleSearch.field === "code" ? "mã khuyến mãi" :
                  simpleSearch.field === "name" ? "tên khuyến mãi" : ""
                }...`}
                value={simpleSearch.value}
                onChange={(e) => handleSimpleSearchChange("value", e.target.value)}
                className="search-input"
              />
            )}
            
            <button 
              className={`filter-button ${isAdvancedSearchOpen ? 'active' : ''}`}
              onClick={() => {
                const newState = !isAdvancedSearchOpen;
                setIsAdvancedSearchOpen(newState);
                if (newState) {
                  setActiveSearchMode("advanced");
                  setSimpleSearch({ field: 'name', value: '' });
                }
              }}
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
                  <label htmlFor="promotion-name-search">Tên khuyến mãi</label>
                  <input
                    id="promotion-name-search"
                    type="text"
                    placeholder="Nhập tên khuyến mãi"
                    value={advancedSearch.name}
                    onChange={(e) => handleAdvancedSearchChange("name", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="search-row">
                <div className="search-field">
                  <label htmlFor="promotion-type-search">Loại khuyến mãi</label>
                  <select
                    id="promotion-type-search"
                    value={advancedSearch.type}
                    onChange={(e) => handleAdvancedSearchChange("type", e.target.value)}
                  >
                    <option value="">-- Chọn loại KM --</option>
                    <option value="percent">Phần trăm</option>
                    <option value="fixed">Cố định</option>
                  </select>
                </div>
                
                <div className="search-field">
                  <label htmlFor="promotion-status-search">Trạng thái</label>
                  <select
                    id="promotion-status-search"
                    value={advancedSearch.status}
                    onChange={(e) => handleAdvancedSearchChange("status", e.target.value)}
                  >
                    <option value="">-- Chọn trạng thái --</option>
                    <option value="active">Đang diễn ra</option>
                    <option value="expired">Đã kết thúc</option>
                  </select>
                </div>
              </div>
              
              <div className="search-row">
                <div className="search-field">
                  <label>Khoảng thời gian bắt đầu</label>
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
          <button className="btn btn-add" onClick={handleAddPromotion}>
            <FontAwesomeIcon icon={faPlus} /> Thêm mới
          </button>
          <button
            className="btn btn-delete"
            onClick={handleDeletePromotions}
            disabled={selectedRows.length === 0}
          >
            <FontAwesomeIcon icon={faTrash} /> Xóa
          </button>
          <button
            className="btn btn-edit"
            onClick={() => {
              if (selectedRows.length === 1) {
                const promotion = promotions.find((c) => c.id === selectedRows[0]);
                handleEditPromotion(promotion);
              } else if (selectedRows.length > 1) {
                setNotification({ message: "Chỉ chọn 1 khuyến mãi để sửa", type: "error" });
                setTimeout(() => setNotification({ message: "", type: "" }), 5000);
              } else {
                setNotification({ message: "Vui lòng chọn 1 khuyến mãi để sửa", type: "error" });
                setTimeout(() => setNotification({ message: "", type: "" }), 5000);
              }
            }}
          >
            <FontAwesomeIcon icon={faPencilAlt} /> Sửa
          </button>
        </div>
      </div>

      <div className="promotion-table-container">
        <table className="promotion-table">
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
              <th>Tên KM</th>
              <th>Loại KM</th>
              <th>Mức giảm</th>
              <th>Ngày bắt đầu</th>
              <th>Ngày kết thúc</th>
              <th>Trạng thái</th>
            </tr>
          </thead>          <tbody>            {currentRecords.map((promotion) => (
              <tr
                key={promotion.id}
                className={selectedRows.includes(promotion.id) ? "selected" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(promotion.id)}
                    onChange={() => toggleRowSelection(promotion.id)}
                  />
                </td>
                <td>{promotion.name || ''}</td>
                <td>{promotion.type === 'percent' ? 'Phần trăm' : 'Cố định'}</td>
                <td>{promotion.type === 'percent' ? (promotion.discount + '%') : (Number(promotion.discount || 0).toLocaleString('vi-VN') + ' VNĐ')}</td>
                <td>{formatDateForVN(promotion.startDate)}</td>
                <td>{formatDateForVN(promotion.endDate)}</td>
                <td>
                  <span className={getStatusBadgeClass(promotion.status)}>
                    {getStatusText(promotion.status)}
                  </span>
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
        {areAllItemsSelected && filteredPromotions.length > currentRecords.length && (
          <div className="all-pages-selected-info">
            Đã chọn tất cả {filteredPromotions.length} mục trên {totalPages} trang
          </div>
        )}
        <div className="pagination-info">
          Hiển thị {indexOfFirstRecord + 1} đến{" "}
          {Math.min(indexOfLastRecord, filteredPromotions.length)} của{" "}
          {filteredPromotions.length} mục
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

      {notification.message && (
        <div className={`notification ${notification.type === "error" ? "error" : ""}`}>
          {notification.type === "add" && (
            <FontAwesomeIcon icon={faCheck} style={{ marginRight: "8px" }} />
          )}
          {notification.type === "delete" && (
            <FontAwesomeIcon icon={faTrashAlt} style={{ marginRight: "8px" }} />
          )}
          {notification.type === "update" && (
            <FontAwesomeIcon icon={faPencilAlt} style={{ marginRight: "8px" }} />
          )}
          {notification.type === "error" && (
            <FontAwesomeIcon icon={faExclamationCircle} style={{ marginRight: "8px" }} />
          )}
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

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <PromotionForm
              promotion={selectedPromotion}
              onSubmit={handlePromotionSubmit}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa khuyến mãi"
        message={`Bạn có chắc chắn muốn xóa ${selectedRows.length} khuyến mãi đã chọn? Hành động này không thể hoàn tác.`}
      />
    </>
  );
};

export default PromotionTable;