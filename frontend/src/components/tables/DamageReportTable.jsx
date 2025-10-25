import React, { useEffect, useState } from "react";
import "./DamageReportTable.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faPencilAlt, faInfo, faSearch, faEye, faFilter } from "@fortawesome/free-solid-svg-icons";
import ConfirmationModal from "../modals/ConfirmationModal";
import DamageReportForm from "../forms/DamageReportForm";
import DamageReportDetailsModal from "../modals/DamageReportDetailsModal";
import { getAllBooks } from "../../services/BookService";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const DamageReportTable = ({ onEdit, onDelete, onView }) => {
  const [damageReports, setDamageReports] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Fetch damaged books from backend (mocked for now)
  const [showForm, setShowForm] = useState(false);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);

  // Fetch damage reports
  const fetchReports = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_BASE}/damage-reports`);
      if (!res.ok) throw new Error("Lỗi khi tải dữ liệu phiếu hư hỏng");
      const response = await res.json();
      const data = response.data || response; // Handle both {data: []} and [] formats
      setDamageReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setNotification({ message: err.message || "Không thể tải dữ liệu", type: "error" });
      setDamageReports([]); // Set empty array on error
    }
  };
  useEffect(() => { fetchReports(); }, []);

  // Fetch books and users for the form
  useEffect(() => {
    getAllBooks()
      .then(data => setBooks(Array.isArray(data) ? data : []))
      .catch(() => setBooks([]));
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  // --- Advanced Search State ---
  const [advancedSearch, setAdvancedSearch] = useState({
    id: '',
    created_by: '',
    dateFrom: '',
    dateTo: ''
  });
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [simpleSearch, setSimpleSearch] = useState({ field: 'id', value: '' });

  // Search state (by note or người tạo)
  const [search, setSearch] = useState("");

  // --- Advanced Search Handlers ---
  const handleAdvancedSearchChange = (field, value) => {
    setAdvancedSearch(prev => ({ ...prev, [field]: value }));
    setSimpleSearch({ field: 'id', value: '' });
    setCurrentPage(1);
  };
  const handleSimpleSearchChange = (field, value) => {
    setSimpleSearch(prev => ({ ...prev, [field]: value }));
    if (field === 'value' && value !== '') {
      setAdvancedSearch({ id: '', created_by: '', dateFrom: '', dateTo: '' });
    }
    setCurrentPage(1);
  };
  const resetSearch = () => {
    setAdvancedSearch({ id: '', created_by: '', dateFrom: '', dateTo: '' });
    setSimpleSearch({ field: 'id', value: '' });
    setCurrentPage(1);
  };
  const handleAdvancedSearchToggle = () => {
    const newState = !isAdvancedSearchOpen;
    setIsAdvancedSearchOpen(newState);
    if (newState) setSimpleSearch({ field: 'id', value: '' });
    // KHÔNG reset advancedSearch khi đóng panel, giữ lại bộ lọc
    setCurrentPage(1);
  };

  // Filtered reports by search (simple + advanced)
  const filteredReports = (Array.isArray(damageReports) ? damageReports : []).filter((report) => {
    // Advanced search
    if (advancedSearch.id || advancedSearch.created_by || advancedSearch.dateFrom || advancedSearch.dateTo) {
      const matchesId = !advancedSearch.id || String(report.id).includes(advancedSearch.id);
      const matchesUser = !advancedSearch.created_by || (
        (report.creator?.full_name && report.creator.full_name.toLowerCase().includes(advancedSearch.created_by.toLowerCase())) ||
        (report.created_by_name && report.created_by_name.toLowerCase().includes(advancedSearch.created_by.toLowerCase()))
      );
      let matchesDate = true;
      if (advancedSearch.dateFrom) {
        matchesDate = matchesDate && new Date(report.created_at) >= new Date(advancedSearch.dateFrom);
      }
      if (advancedSearch.dateTo) {
        matchesDate = matchesDate && new Date(report.created_at) <= new Date(advancedSearch.dateTo);
      }
      return matchesId && matchesUser && matchesDate;
    }
    // Simple search
    if (!simpleSearch.value) return true;
    const searchValue = simpleSearch.value.toLowerCase();
    switch (simpleSearch.field) {
      case 'id':
        return String(report.id).includes(searchValue);
      case 'created_by':
        return (report.creator?.full_name && report.creator.full_name.toLowerCase().includes(searchValue)) ||
               (report.created_by_name && report.created_by_name.toLowerCase().includes(searchValue));
      default:
        return true;
    }
  });

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredReports.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredReports.length / recordsPerPage);

  // Select all rows
  const areAllItemsSelected =
    currentRecords.length > 0 && currentRecords.every((report) => selectedRows.includes(report.id));

  const handleSelectAllToggle = () => {
    if (areAllItemsSelected) {
      setSelectedRows(selectedRows.filter((id) => !currentRecords.some((r) => r.id === id)));
    } else {
      setSelectedRows([
        ...selectedRows,
        ...currentRecords.filter((r) => !selectedRows.includes(r.id)).map((r) => r.id),
      ]);
    }
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Notification icon helper (giống BookTable)
  const getNotificationIcon = (type) => {
    if (type === "success") return faCheckCircle;
    if (type === "error") return faExclamationCircle;
    return null;
  };

  // Pagination controls
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Modal xác nhận xóa
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Modal chi tiết phiếu sách hỏng
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Hàm xác nhận xóa
  async function confirmDelete() {
    try {
      for (const id of selectedRows) {
        await fetch(`/api/damage-reports/${id}`, { method: "DELETE" });
      }
      setNotification({ message: `Đã xóa ${selectedRows.length} phiếu sách hỏng thành công!`, type: "success" });
      setShowDeleteConfirmation(false);
      setSelectedRows([]);
      fetchReports();
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } catch (err) {
      setNotification({ message: "Lỗi khi xóa sách hỏng", type: "error" });
      setShowDeleteConfirmation(false);
    }
  }

  return (
    <>
      {notification.message && (
        <div className={`notification ${notification.type === "error" ? "error" : "success"}`}
             style={{ position: "fixed", top: 24, right: 32 }}>
          <span style={{ marginRight: 12, fontSize: 22 }}>
            <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
          </span>
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
          <div className="search-container">
            <select
              className="search-field-selector"
              value={simpleSearch.field}
              onChange={e => handleSimpleSearchChange('field', e.target.value)}
            >
              <option value="id">Mã phiếu</option>
              <option value="created_by">Người tạo</option>
            </select>
            <input
              type="text"
              className="search-input"
              placeholder={simpleSearch.field === 'id' ? 'Nhập mã phiếu...' : 'Nhập tên người tạo...'}
              value={simpleSearch.value}
              onChange={e => handleSimpleSearchChange('value', e.target.value)}
            />
            <button
              className={`filter-button${isAdvancedSearchOpen ? ' active' : ''}`}
              onClick={handleAdvancedSearchToggle}
              title="Tìm kiếm nâng cao"
              type="button"
            >
              <FontAwesomeIcon icon={faFilter} />
            </button>
          </div>
          {isAdvancedSearchOpen && (
            <div className="advanced-search-panel">
              <div className="search-row">
                <div className="search-field">
                  <label>Mã phiếu</label>
                  <input
                    type="text"
                    className="advanced-search-id"
                    value={advancedSearch.id}
                    onChange={e => handleAdvancedSearchChange('id', e.target.value)}
                    placeholder="Nhập mã phiếu"
                  />
                </div>
                <div className="search-field">
                  <label>Người tạo</label>
                  <input
                    type="text"
                    value={advancedSearch.created_by}
                    onChange={e => handleAdvancedSearchChange('created_by', e.target.value)}
                    placeholder="Nhập tên người tạo"
                  />
                </div>
                <div className="search-field">
                  <label>Từ ngày</label>
                  <input
                    type="date"
                    value={advancedSearch.dateFrom}
                    onChange={e => handleAdvancedSearchChange('dateFrom', e.target.value)}
                  />
                </div>
                <div className="search-field">
                  <label>Đến ngày</label>
                  <input
                    type="date"
                    value={advancedSearch.dateTo}
                    onChange={e => handleAdvancedSearchChange('dateTo', e.target.value)}
                  />
                </div>
              </div>
              <div className="search-actions">
                <button className="search-reset-button" onClick={resetSearch}>Xóa bộ lọc</button>
              </div>
            </div>
          )}
        </div>
        <div className="action-buttons">
          <button className="btn btn-add" onClick={() => setShowForm(true)}>
            <FontAwesomeIcon icon={faPlus} /> Thêm
          </button>
      {showForm && (
        <DamageReportForm
          onSubmit={async (formData) => {
            try {
              await fetch("/api/damage-reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
              });
              setShowForm(false);
              setNotification({ message: "Thêm phiếu hư hỏng thành công!", type: "success" });
              fetchReports();
              setTimeout(() => setNotification({ message: "", type: "" }), 5000); // Hiển thị thông báo 5 giây
            } catch (err) {
              setNotification({ message: "Lỗi khi thêm phiếu hư hỏng", type: "error" });
            }
          }}
          onClose={() => setShowForm(false)}
          books={books}
          users={users}
        />
      )}
          <button
            className="btn btn-delete"
            onClick={() => setShowDeleteConfirmation(true)}
            disabled={selectedRows.length === 0}
          >
            <FontAwesomeIcon icon={faTrash} /> Xóa
          </button>
        </div>
      </div>

      {/* Modal xác nhận xóa */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa phiếu sách hỏng"
        message={`Bạn có chắc chắn muốn xóa ${selectedRows.length} phiếu đã chọn? Hành động này không thể hoàn tác.`}
      />
      {/* Đã bỏ nút Sửa và Chi tiết */}
      <div className="damaged-book-table-container">
        <table className="damaged-book-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={areAllItemsSelected}
                  onChange={handleSelectAllToggle}
                />
              </th>
              <th style={{ width: '14%'}}>Mã phiếu</th>
              <th>Người tạo</th>
              <th style={{ width: '22%'}}>Ngày lập</th>
              {/* <th style={{ width: '27%'}}>Ghi chú</th> */}
              <th style={{ width: '8%', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#888" }}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              currentRecords.map((report) => (
                <tr
                  key={report.id}
                  className={selectedRows.includes(report.id) ? "selected" : ""}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(report.id)}
                      onChange={() => toggleRowSelection(report.id)}
                    />
                  </td>
                  <td style={{ width: '8%', minWidth: 60, maxWidth: 90 }}>{report.id}</td>
                  <td>{report.creator?.full_name || report.created_by_name || report.created_by || '---'}</td>
                  <td style={{ width: '10%', minWidth: 70, maxWidth: 110 }}>
                    {(() => {
                      if (!report.created_at) return "";
                      const d = new Date(report.created_at);
                      const pad = n => n.toString().padStart(2, '0');
                      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                    })()}
                  </td>
                  {/* <td style={{ width: '40%', minWidth: 120, maxWidth: 400 }}>{report.note}</td> */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <button
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          outline: 'none',
                          boxShadow: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: '12px',
                        }}
                        title="Xem chi tiết"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetailsModal(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faEye} style={{ fontSize: 18, color: '#095e5a' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal chi tiết phiếu sách hỏng */}
      {showDetailsModal && (
        <DamageReportDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          damageReportData={selectedReport}
        />
      )}
      {/* Pagination */}
      <div className="pagination">
        <span className="pagination-info">
          Trang {currentPage} / {totalPages || 1} ({damageReports.length} mục)
        </span>
        <div className="pagination-controls">
          <button
            className="pagination-button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`pagination-button${currentPage === i + 1 ? " active" : ""}`}
              onClick={() => goToPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="pagination-button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            &gt;
          </button>
        </div>
      </div>
    </>
  );
};

export default DamageReportTable;
