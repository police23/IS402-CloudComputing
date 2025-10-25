import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash, faPencilAlt, faEye, faSearch, faCheck, faTrashAlt, faExclamationCircle, faFilter } from "@fortawesome/free-solid-svg-icons";
import SupplierForm from "../forms/SupplierForm";
import ConfirmationModal from "../modals/ConfirmationModal";
import "./SupplierTable.css";
import "../../styles/SearchBar.css";

const SupplierTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Modal xác nhận xóa
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Add notification state
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Replace single search state with simple search object
  const [simpleSearch, setSimpleSearch] = useState({
    field: "name", // default search field
    value: ""
  });


  // Toggle advanced search panel (UI only)
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);

  // State for advanced search fields
  const [advancedSearch, setAdvancedSearch] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  });

  // Track which search mode is active: 'simple' or 'advanced'
  const [activeSearchMode, setActiveSearchMode] = useState("simple");

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE}/suppliers`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("API error response:", errorText);
          throw new Error(`Failed to fetch suppliers: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched suppliers data:", data);
        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };
    fetchSuppliers();
  }, []);

  // Filter suppliers based on search criteria
  const filteredSuppliers = suppliers.filter((supplier) => {
    if (activeSearchMode === "advanced") {
      // Advanced search logic
      const matchesName =
        !advancedSearch.name ||
        supplier.name.toLowerCase().includes(advancedSearch.name.toLowerCase());
      const matchesAddress =
        !advancedSearch.address ||
        supplier.address.toLowerCase().includes(advancedSearch.address.toLowerCase());
      const matchesPhone =
        !advancedSearch.phone ||
        supplier.phone.toLowerCase().includes(advancedSearch.phone.toLowerCase());
      const matchesEmail =
        !advancedSearch.email ||
        supplier.email.toLowerCase().includes(advancedSearch.email.toLowerCase());

      return matchesName && matchesAddress && matchesPhone && matchesEmail;
    } else {
      // Simple search logic
      if (!simpleSearch.value) return true;

      const searchValue = simpleSearch.value.toLowerCase();
      switch (simpleSearch.field) {
        case "name":
          return supplier.name.toLowerCase().includes(searchValue);
        case "address":
          return supplier.address.toLowerCase().includes(searchValue);
        case "phone":
          return supplier.phone.toLowerCase().includes(searchValue);
        case "email":
          return supplier.email.toLowerCase().includes(searchValue);
        case "all":
          return (
            supplier.name.toLowerCase().includes(searchValue) ||
            supplier.address.toLowerCase().includes(searchValue) ||
            supplier.phone.toLowerCase().includes(searchValue) ||
            supplier.email.toLowerCase().includes(searchValue)
          );
        default:
          return true;
      }
    }
  });

  // Calculate pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredSuppliers.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredSuppliers.length / recordsPerPage);

  // Kiểm tra xem tất cả các mục trên tất cả các trang đã được chọn chưa
  const areAllItemsSelected = filteredSuppliers.length > 0 &&
    filteredSuppliers.every(supplier => selectedRows.includes(supplier.id));

  // Xử lý khi chọn/bỏ chọn tất cả - hai trạng thái: chọn tất cả các trang hoặc bỏ chọn tất cả
  const handleSelectAllToggle = () => {
    if (areAllItemsSelected) {
      // Nếu đã chọn tất cả, bỏ chọn tất cả
      setSelectedRows([]);
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả trên mọi trang
      setSelectedRows(filteredSuppliers.map(supplier => supplier.id));
    }
  };

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setShowForm(true);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
  };

  const handleDeleteSuppliers = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      for (const id of selectedRows) {
        const response = await fetch(`http://localhost:5000/api/suppliers/${id}`, {
          method: "DELETE"
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to delete supplier ${id}: ${response.status} ${errorText}`);
        }
      }
      setSuppliers(suppliers.filter(supplier => !selectedRows.includes(supplier.id)));
      setSelectedRows([]);
      setShowDeleteConfirmation(false);
      setNotification({ message: "Xóa nhà cung cấp thành công.", type: "delete" });
      setTimeout(() => setNotification({ message: "", type: "" }), 5000);
    } catch (error) {
      console.error("Error deleting supplier(s):", error);
    }
  };

  const handleSupplierSubmit = async (formData) => {
    if (selectedSupplier) {
      try {
        const response = await fetch(`http://localhost:5000/api/suppliers/${selectedSupplier.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to update supplier");
        const updatedSupplier = await response.json();
        setSuppliers(
          suppliers.map((supplier) =>
            supplier.id === selectedSupplier.id ? updatedSupplier : supplier
          )
        );
        setShowForm(false);
        setNotification({ message: "Sửa nhà cung cấp thành công.", type: "update" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      } catch (error) {
        console.error("Error updating supplier:", error);
      }
    } else {
      try {
        const response = await fetch("http://localhost:5000/api/suppliers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to add supplier");
        const newSupplier = await response.json();
        setSuppliers([...suppliers, newSupplier]);
        setShowForm(false);
        setNotification({ message: "Thêm nhà cung cấp thành công.", type: "add" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      } catch (error) {
        console.error("Error adding supplier:", error);
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


  // Handle simple search changes
  const handleSimpleSearchChange = (field, value) => {
    setSimpleSearch(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset to empty value when field changes
    if (field === "field") {
      setSimpleSearch(prev => ({
        ...prev,
        value: ""
      }));
    }

    // Switch to simple search mode when user types in simple search
    if (field === "value") {
      setActiveSearchMode("simple");
    }
  };


  // Handle changes in advanced search fields
  const handleAdvancedSearchChange = (field, value) => {
    setAdvancedSearch(prev => ({
      ...prev,
      [field]: value
    }));
    setActiveSearchMode("advanced");
  };


  // Reset all search fields
  const resetSearch = () => {
    setAdvancedSearch({
      name: "",
      address: "",
      phone: "",
      email: ""
    });
    setSimpleSearch({
      field: "name",
      value: ""
    });
    setActiveSearchMode("simple");
  };


  // Toggle advanced search panel (UI only, does not affect filter mode)
  const handleAdvancedSearchToggle = () => {
    const newState = !isAdvancedSearchOpen;
    setIsAdvancedSearchOpen(newState);
    if (newState) {
      setSimpleSearch({ field: 'name', value: '' });
      // Do not change activeSearchMode here
    }
    setCurrentPage(1);
  };

  return (
    <>
      {notification.message && (
        <div className={`notification ${notification.type === "error" ? "error" : ""}`}>
          <FontAwesomeIcon icon={getNotificationIcon(notification.type)} style={{ marginRight: "8px" }} />
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
              
              <option value="name">Tên NCC</option>
              <option value="address">Địa chỉ</option>
              <option value="phone">Số điện thoại</option>
              <option value="email">Email</option>
            </select>
            
            <input
              type="text"
              placeholder={`Nhập ${
                simpleSearch.field === "all" ? "tất cả" :
                simpleSearch.field === "name" ? "tên nhà cung cấp" :
                simpleSearch.field === "address" ? "địa chỉ" :
                simpleSearch.field === "phone" ? "số điện thoại" :
                simpleSearch.field === "email" ? "email" : ""
              }...`}
              value={simpleSearch.value}
              onChange={(e) => handleSimpleSearchChange("value", e.target.value)}
              className="search-input"
            />

            <button
              className={`filter-button ${isAdvancedSearchOpen ? 'active' : ''}`}
              onClick={handleAdvancedSearchToggle}
              title="Tìm kiếm nâng cao"
            >
              <FontAwesomeIcon icon={faFilter} />
            </button>
          </div>

          {isAdvancedSearchOpen && (
            <div className="advanced-search-panel">
              <div className="search-row">
                <div className="search-field">
                  <label htmlFor="name-search">Tên nhà cung cấp</label>
                  <input
                    id="name-search"
                    type="text"
                    placeholder="Nhập tên nhà cung cấp"
                    value={advancedSearch.name}
                    onChange={(e) => handleAdvancedSearchChange('name', e.target.value)}
                  />
                </div>

                <div className="search-field">
                  <label htmlFor="address-search">Địa chỉ</label>
                  <input
                    id="address-search"
                    type="text"
                    placeholder="Nhập địa chỉ"
                    value={advancedSearch.address}
                    onChange={(e) => handleAdvancedSearchChange('address', e.target.value)}
                  />
                </div>
              </div>

              <div className="search-row">
                <div className="search-field">
                  <label htmlFor="phone-search">Số điện thoại</label>
                  <input
                    id="phone-search"
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={advancedSearch.phone}
                    onChange={(e) => handleAdvancedSearchChange('phone', e.target.value)}
                  />
                </div>

                <div className="search-field">
                  <label htmlFor="email-search">Email</label>
                  <input
                    id="email-search"
                    type="text"
                    placeholder="Nhập email"
                    value={advancedSearch.email}
                    onChange={(e) => handleAdvancedSearchChange('email', e.target.value)}
                  />
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
          <button className="btn btn-add" onClick={handleAddSupplier}>
            <FontAwesomeIcon icon={faPlus} /> Thêm mới
          </button>
          <button
            className="btn btn-delete"
            onClick={handleDeleteSuppliers}
            disabled={selectedRows.length === 0}
          >
            <FontAwesomeIcon icon={faTrash} /> Xóa
          </button>
          <button
            className="btn btn-edit"
            onClick={() => {
              if (selectedRows.length === 1) {
                const supplier = suppliers.find((c) => c.id === selectedRows[0]);
                handleEditSupplier(supplier);
              } else {
                setNotification({ message: "Chỉ chọn 1 nhà cung cấp để sửa", type: "error" });
                setTimeout(() => setNotification({ message: "", type: "" }), 5000);
              }
            }}
          >
            <FontAwesomeIcon icon={faPencilAlt} /> Sửa
          </button>
        </div>
      </div>

      <div className="supplier-table-container">
        <table className="supplier-table">
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
              <th>Tên nhà cung cấp</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((supplier) => (
              <tr
                key={supplier.id}
                className={selectedRows.includes(supplier.id) ? "selected" : ""}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(supplier.id)}
                    onChange={() => toggleRowSelection(supplier.id)}
                  />
                </td>
                <td>{supplier.name}</td>
                <td>{supplier.address}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.email}</td>
              </tr>
            ))}

            {currentRecords.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        {areAllItemsSelected && filteredSuppliers.length > currentRecords.length && (
          <div className="all-pages-selected-info">
            Đã chọn tất cả {filteredSuppliers.length} mục trên {totalPages} trang
          </div>
        )}
        <div className="pagination-info">
          Hiển thị {indexOfFirstRecord + 1} đến{" "}
          {Math.min(indexOfLastRecord, filteredSuppliers.length)} của{" "}
          {filteredSuppliers.length} mục
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
            <SupplierForm
              supplier={selectedSupplier}
              onSubmit={handleSupplierSubmit}
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
        title="Xác nhận xóa nhà cung cấp"
        message={`Bạn có chắc chắn muốn xóa ${selectedRows.length} nhà cung cấp đã chọn? Hành động này không thể hoàn tác.`}
      />
    </>
  );
};

export default SupplierTable;