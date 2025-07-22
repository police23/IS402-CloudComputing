import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash, faUserPlus,
  faLock, faLockOpen, faSearch,
  faExclamationCircle, faCheckCircle, faEye, faUser, faCheck
} from "@fortawesome/free-solid-svg-icons";
import AccountForm from "../forms/AccountForm";
import ConfirmationModal from "../modals/ConfirmationModal";
import { getAllUsers, getUsersByRole } from "../../services/UserService";
import "./AccountTable.css";

const AccountTable = ({ initialFilterRole = 'all' }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ type: '', id: null });
  const [resetPasswordResult, setResetPasswordResult] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState(initialFilterRole);
  const [notification, setNotification] = useState({ message: "", type: "" });
  // Hàm tiện ích để map dữ liệu từ backend sang format frontend
  const mapUserData = (userData) => {
    if (!userData) return null;
    
    // Log raw data to understand the structure
    console.log('Raw user data:', userData);
    
    return {
      id: userData.id,
      username: userData.username,
      // Sửa lỗi không hiển thị họ và tên
      fullName: userData.full_name || userData.fullName || "",
      email: userData.email || "",
      phone: userData.phone || "",
      gender: userData.gender,
      // Sửa lỗi không hiển thị vai trò
      role: getUserRole(userData),
      // Sửa lỗi không hiển thị trạng thái
      status: getUserStatus(userData),
      createdAt: userData.created_at || userData.createdAt,
      lastLogin: userData.updated_at || userData.lastLogin
    };
  };
  
  // Hàm xác định vai trò từ dữ liệu người dùng
  const getUserRole = (userData) => {
    // Kiểm tra nếu đã có giá trị role trực tiếp
    if (userData.role && typeof userData.role === 'string') {
      return userData.role;
    }
    // Nếu không, chuyển đổi từ role_id
    if (userData.role_id !== undefined) {
      return userData.role_id === 1 ? 'admin' : 
             userData.role_id === 2 ? 'sales' : 
             userData.role_id === 3 ? 'warehouse' :
             userData.role_id === 4 ? 'end_user' :
             userData.role_id === 5 ? 'order_manager' :
             userData.role_id === 6 ? 'shipper' : 'unknown';
    }
    return 'unknown';
  };
  
  // Hàm xác định trạng thái tài khoản từ dữ liệu người dùng
  const getUserStatus = (userData) => {
    // Kiểm tra nếu đã có giá trị status trực tiếp
    if (userData.status && typeof userData.status === 'string') {
      return userData.status;
    }
    // Nếu không, chuyển đổi từ is_active
    if (userData.is_active !== undefined) {
      return userData.is_active === 1 ? 'active' : 'inactive';
    }
    return 'unknown';
  };

  // Cập nhật filterRole khi có thay đổi từ tab trên đầu trang và gọi API
  useEffect(() => {
    setFilterRole(initialFilterRole);
    setCurrentPage(1); // Reset về trang đầu khi thay đổi filter
    // fetchAccounts sẽ được gọi tự động qua useEffect khác khi filterRole thay đổi
  }, [initialFilterRole]);

  // Gọi API khi filterRole thay đổi
  useEffect(() => {
    fetchAccounts();
  }, [filterRole]);

  // Lấy danh sách tài khoản khi component được mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Phân trang
  const recordsPerPage = 10;
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  // Lọc tài khoản chỉ theo từ khóa tìm kiếm (vì đã lọc theo role ở backend)
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = searchTerm === '' ? true :
      account.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const currentAccounts = filteredAccounts.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredAccounts.length / recordsPerPage);

  // Lấy danh sách tài khoản khi component được mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Lấy danh sách tài khoản từ API
  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data;
      
      // Nếu có filter role cụ thể, gọi API theo role
      if (filterRole !== 'all') {
        const roleIdMap = {
          'admin': 1,
          'sales': 2, 
          'warehouse': 3,
          'end_user': 4,
          'order_manager': 5,
          'shipper': 6
        };
        
        const roleId = roleIdMap[filterRole];
        if (roleId) {
          data = await getUsersByRole(roleId);
        } else {
          // Fallback nếu không tìm thấy role
          data = await getAllUsers();
        }
      } else {
        // Lấy tất cả users
        data = await getAllUsers();
      }

      console.log('Fetched accounts:', data);
      
      if (!Array.isArray(data)) {
        console.error('Expected array but got:', typeof data);
        setError('Dữ liệu không đúng định dạng');
        return;
      }
      
      // Map dữ liệu từ backend sang format frontend cần
      const formattedData = data.map(user => mapUserData(user));
      console.log('Formatted accounts data:', formattedData);
      
      setAccounts(formattedData);
    } catch (err) {
      setError('Không thể tải danh sách tài khoản');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if all items across all pages are selected
  const areAllItemsSelected = filteredAccounts.length > 0 &&
    filteredAccounts.every(account => selectedRows.includes(account.id));

  // Xử lý khi chọn/bỏ chọn tất cả - hai trạng thái: chọn tất cả các trang hoặc bỏ chọn tất cả
  const handleSelectAllToggle = () => {
    if (areAllItemsSelected) {
      // Nếu đã chọn tất cả, bỏ chọn tất cả
      setSelectedRows([]);
    } else {
      // Nếu chưa chọn tất cả, chọn tất cả trên mọi trang
      setSelectedRows(filteredAccounts.map(account => account.id));
    }
  };

  // Xử lý chọn/bỏ chọn một hàng
  const toggleRowSelection = (id) => {
    setSelectedRows((prev) => {
      return prev.includes(id)
        ? prev.filter((rowId) => rowId !== id)
        : [...prev, id];
    });
  };

  // Xử lý phân trang
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Xử lý mở form thêm tài khoản mới
  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsAccountFormOpen(true);
  };

  // Xử lý hiển thị modal xác nhận xóa tài khoản
  const handleDeleteAccount = (id) => {
    setConfirmAction({ type: 'delete', id });
    setIsConfirmModalOpen(true);
  };

  // Xử lý hiển thị modal xác nhận thay đổi trạng thái tài khoản
  const handleToggleStatus = (id, currentStatus) => {
    setConfirmAction({
      type: 'toggleStatus',
      id,
      additionalInfo: currentStatus === 'active' ? 'inactive' : 'active'
    });
    setIsConfirmModalOpen(true);
  };

  // Xử lý xác nhận hành động
  const handleConfirmAction = async () => {
    setIsConfirmModalOpen(false);

    switch (confirmAction.type) {
      case 'delete':
        try {
          // Gọi API xóa tài khoản
          const response = await fetch(`http://localhost:5000/api/users/${confirmAction.id}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete user');
          }

          // Cập nhật state sau khi xóa thành công
          setAccounts(accounts.filter(acc => acc.id !== confirmAction.id));
          setSelectedRows(selectedRows.filter(id => id !== confirmAction.id));

          // Hiển thị thông báo xóa thành công
          setNotification({ message: "Xóa tài khoản thành công.", type: "delete" });
          setTimeout(() => setNotification({ message: "", type: "" }), 5000);
        } catch (error) {
          console.error("Error deleting user:", error);
          setError('Không thể xóa tài khoản');
        }
        break;

      case 'toggleStatus':
        try {
          // Gọi API để thay đổi trạng thái tài khoản (active/inactive)
          const response = await fetch(`http://localhost:5000/api/users/${confirmAction.id}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              status: confirmAction.additionalInfo // 'active' hoặc 'inactive'
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to change account status');
          }          // Cập nhật account trong state sau khi thay đổi thành công
          const rawUserData = await response.json();
          console.log('Response from toggle status:', rawUserData); // Thêm log để debug
          
          // Map dữ liệu từ backend và cập nhật state
          const mappedUserData = mapUserData(rawUserData);
          setAccounts(accounts.map(acc =>
            acc.id === confirmAction.id ? mappedUserData : acc
          ));

          // Hiển thị thông báo thành công
          const actionText = confirmAction.additionalInfo === 'active' ? 'kích hoạt' : 'khóa';
          setNotification({ message: `${actionText} tài khoản thành công.`, type: "update" });
          setTimeout(() => setNotification({ message: "", type: "" }), 5000);
        } catch (error) {
          console.error("Error toggling account status:", error);
          setError(`Không thể thay đổi trạng thái tài khoản: ${error.message}`);
        }
        break;

      default:
        break;
    }
  };

  // Xử lý sự kiện lưu form tài khoản
  const handleAccountFormSave = async (account) => {
    try {
      let result;
      console.log("Saving account:", account);

      if (selectedAccount) {
        // Chỉnh sửa tài khoản: gọi trực tiếp API
        const res = await fetch(`http://localhost:5000/api/users/${selectedAccount.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: account.username,
            fullName: account.fullName,
            email: account.email,
            phone: account.phone,
            gender: account.gender, // Thêm dòng này để cập nhật giới tính
            role: account.role,
            is_active: typeof account.is_active !== "undefined" ? account.is_active : undefined,
            ...(account.password ? { password: account.password } : {})
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Không thể cập nhật tài khoản');
        }
        result = await res.json();
        setNotification({ message: "Cập nhật tài khoản thành công.", type: "update" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      } else {
        // Thêm tài khoản mới: gọi trực tiếp API
        const res = await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...account,
            is_active: 1 // Mặc định kích hoạt
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Không thể tạo tài khoản');
        }
        result = await res.json();
        // Thông báo thành công
        setNotification({ message: "Thêm tài khoản thành công.", type: "add" });
        setTimeout(() => setNotification({ message: "", type: "" }), 5000);
      }      console.log("API response:", result);
      
      // Nếu có kết quả trả về và không cần tải lại toàn bộ danh sách
      if (result && selectedAccount) {
        // Map và cập nhật tài khoản trong state
        const mappedUserData = mapUserData(result);
        console.log("Mapped user data after update:", mappedUserData);
        
        setAccounts(accounts.map(acc =>
          acc.id === mappedUserData.id ? mappedUserData : acc
        ));
      } else {
        // Nếu là thêm mới hoặc không có kết quả, tải lại toàn bộ danh sách
        fetchAccounts(); 
      }
      
      setIsAccountFormOpen(false);
    } catch (error) {
      setError(`Không thể lưu thông tin tài khoản: ${error.message}`);
      console.error("Error saving account:", error);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = async () => {
    // Reset to first page when searching
    setCurrentPage(1);
  };

  // Xử lý khi nhấn Enter trong ô tìm kiếm
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  // Lấy tên hiển thị của vai trò
  const getRoleName = (role) => {
    // Log role để debug
    console.log('Getting role name for:', role);
    
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'sales': return 'Nhân viên bán hàng';
      case 'warehouse': return 'Nhân viên thủ kho';
      case 'order_manager': return 'Nhân viên QL đơn hàng';
      case 'shipper': return 'Shipper';
      case 'end_user': return 'Người dùng cuối';
      default: return role || 'Không xác định';
    }
  };

  // Lấy icon cho vai trò
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return faUser;
      case 'sales': return faUser;
      case 'warehouse': return faUser;
      case 'order_manager': return faUser;
      case 'shipper': return faUser;
      case 'end_user': return faUser;
      default: return faUser;
    }
  };

  // Hàm định dạng ngày tháng (chỉ hiển thị ngày)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  };

  // Helper function to get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return faCheck;
      case "error":
        return faExclamationCircle;
      default:
        return null;
    }
  };

  return (
    <>
      {notification.message && (
        <div className={`notification ${notification.type}`}>
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

      {resetPasswordResult && (
        <div className="notification success">
          <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: "8px" }} />
          <div className="notification-message">
            <strong>Đặt lại mật khẩu thành công</strong><br />
            Mật khẩu mặc định: {resetPasswordResult.defaultPassword}
          </div>
          <button
            className="notification-close"
            onClick={() => setResetPasswordResult(null)}
            aria-label="Đóng thông báo"
          >
            &times;
          </button>
          <div className="progress-bar"></div>
        </div>
      )}

      {/* Table search and actions */}
      <div className="data-tools">
        <div className="search-container">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên đăng nhập..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>

        <button onClick={handleAddAccount} className="add-button">
          <FontAwesomeIcon icon={faUserPlus} />
          Thêm tài khoản
        </button>
      </div>

      {/* Account table */}
      <div className="account-table-container">
        <table className="account-table">
          <thead>
            <tr>
              
              <th>Tên đăng nhập</th>
              <th>Họ và tên</th>
              <th>Liên hệ</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  <div className="loading-spinner"></div>
                  <p>Đang tải dữ liệu...</p>
                </td>
              </tr>
            ) : currentAccounts.length > 0 ? (
              currentAccounts.map((account) => (                <tr key={account.id} className={selectedRows.includes(account.id) ? "selected" : ""}>
                  
                  <td>{account.username || "N/A"}</td>
                  <td>{account.fullName || "N/A"}</td>
                  <td>
                    <div>{account.email || "N/A"}</div>
                    <div style={{ color: "#666", fontSize: "13px" }}>{account.phone || "N/A"}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <FontAwesomeIcon
                        icon={getRoleIcon(account.role)}
                        style={{
                          color: account.role === 'admin' ? "#095e5a" :
                            account.role === 'sales' ? "#fd7e14" : "#0d6efd"
                        }}
                      />
                      <span>{getRoleName(account.role)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${account.status || "unknown"}`}>
                      {account.status === "active" ? "Kích hoạt" : account.status === "inactive" ? "Khóa" : "Không xác định"}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className={`action-button ${account.status === 'active' ? 'lock-button' : 'unlock-button'}`}
                      title={account.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      onClick={() => handleToggleStatus(account.id, account.status)}
                      disabled={account.role === 'admin' && accounts.filter(acc => acc.role === 'admin').length === 1}
                    >
                      <FontAwesomeIcon icon={account.status === 'active' ? faLock : faLockOpen} />
                    </button>

                    <button
                      className="action-button delete-button"
                      title="Xóa"
                      onClick={() => handleDeleteAccount(account.id)}
                      disabled={account.role === 'admin' && accounts.filter(acc => acc.role === 'admin').length === 1}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {!isLoading && filteredAccounts.length > 0 && (
        <div className="pagination">
          {areAllItemsSelected && filteredAccounts.length > currentAccounts.length && (
            <div className="all-pages-selected-info">
              Đã chọn tất cả {filteredAccounts.length} mục trên {totalPages} trang
            </div>
          )}
          <div className="pagination-info">
            Hiển thị {indexOfFirstRecord + 1} đến{" "}
            {Math.min(indexOfLastRecord, filteredAccounts.length)} của{" "}
            {filteredAccounts.length} mục
          </div>

          <div className="pagination-controls">
            <button
              className="pagination-button"
              disabled={currentPage === 1}
              onClick={() => paginate(currentPage - 1)}
            >
              &lt;
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`pagination-button ${currentPage === index + 1 ? "active" : ""
                  }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              className="pagination-button"
              disabled={currentPage === totalPages}
              onClick={() => paginate(currentPage + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* Form thêm/sửa tài khoản */}
      {isAccountFormOpen && (
        <AccountForm
          account={selectedAccount}
          onSave={handleAccountFormSave}
          onCancel={() => setIsAccountFormOpen(false)}
        />
      )}

      {/* Modal xác nhận */}
      {isConfirmModalOpen && (
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmAction}
          title={
            confirmAction.type === 'delete'
              ? 'Xác nhận xóa tài khoản'
              : 'Xác nhận thay đổi trạng thái'
          }
          message={
            confirmAction.type === 'delete'
              ? 'Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.'
              : confirmAction.additionalInfo === 'active'
                ? 'Bạn có chắc chắn muốn kích hoạt tài khoản này?'
                : 'Bạn có chắc chắn muốn khóa tài khoản này?'
          }
        />
      )}
    </>
  );
};

export default AccountTable;