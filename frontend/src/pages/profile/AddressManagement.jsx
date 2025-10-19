import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPlus, faTrash, faStar, faMapMarkerAlt, faEdit, faSpinner 
} from "@fortawesome/free-solid-svg-icons";
import { getAddresses, deleteAddress, setDefaultAddress } from '../../services/AddressService';
import AddNewAddress from '../../components/forms/AddressForm';
import './AddressManagement.css';

const AddressManagement = ({ onNotification }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Load addresses from API
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await getAddresses();
      if (response.success) {
        setAddresses(response.data);
      } else {
        onNotification('Có lỗi xảy ra khi tải danh sách địa chỉ', 'error');
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      onNotification('Có lỗi xảy ra khi tải danh sách địa chỉ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      try {
        const response = await deleteAddress(addressId);
        if (response.success) {
          onNotification('Xóa địa chỉ thành công', 'success');
          loadAddresses(); // Reload addresses
        } else {
          onNotification(response.message || 'Có lỗi xảy ra khi xóa địa chỉ', 'error');
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        onNotification('Có lỗi xảy ra khi xóa địa chỉ', 'error');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const response = await setDefaultAddress(addressId);
      if (response.success) {
        onNotification('Đặt địa chỉ mặc định thành công', 'success');
        loadAddresses(); // Reload addresses
      } else {
        onNotification(response.message || 'Có lỗi xảy ra khi đặt địa chỉ mặc định', 'error');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      onNotification('Có lỗi xảy ra khi đặt địa chỉ mặc định', 'error');
    }
  };

  const handleCloseAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleAddressSuccess = () => {
    loadAddresses(); // Reload addresses after successful operation
  };

  const getCityName = (cityCode) => {
    const cities = {
      'hanoi': 'Hà Nội',
      'hcm': 'TP. Hồ Chí Minh',
      'danang': 'Đà Nẵng',
      'cantho': 'Cần Thơ'
    };
    return cities[cityCode] || cityCode;
  };

  const getDistrictName = (districtCode) => {
    const districts = {
      'district1': 'Quận 1',
      'district2': 'Quận 2',
      'district3': 'Quận 3'
    };
    return districts[districtCode] || districtCode;
  };

  if (loading) {
    return (
      <div className="address-tab-content">
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin size="lg" /> 
          <span>Đang tải danh sách địa chỉ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="address-tab-content">
      <div className="address-header">
        <h3>
          <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: "10px", color: "#4A7CAE" }} />
          Quản lý địa chỉ
        </h3>
        <button 
          className="btn btn-add"
          onClick={handleAddAddress}
        >
          <FontAwesomeIcon icon={faPlus} /> Thêm địa chỉ mới
        </button>
      </div>

      <div className="addresses-list">
        {addresses.length === 0 ? (
          <div className="no-addresses">
            <FontAwesomeIcon icon={faMapMarkerAlt} size="3x" style={{ color: '#ccc', marginBottom: '16px' }} />
            <p>Bạn chưa có địa chỉ giao hàng nào.</p>
            <p className="no-addresses-hint">Hãy thêm địa chỉ mới bằng cách nhấn nút "Thêm địa chỉ mới" ở trên.</p>
          </div>
        ) : (
          addresses.map(address => (
            <div key={address.id} className={`address-card ${address.is_default ? 'default' : ''}`}>
              <div className="address-header-info">
                <div className="address-label">
                  {address.is_default && <span className="default-badge">Mặc định</span>}
                </div>
                <div className="address-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditAddress(address)}
                    title="Chỉnh sửa"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteAddress(address.id)}
                    title="Xóa"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  {!address.is_default && (
                    <button 
                      className="action-btn default-btn"
                      onClick={() => handleSetDefaultAddress(address.id)}
                      title="Đặt làm mặc định"
                    >
                      <FontAwesomeIcon icon={faStar} />
                    </button>
                  )}
                </div>
              </div>
              <div className="address-content">
                <div className="address-info">
                  <p className="address-details">
                    {address.address_line}
                    {address.ward && `, ${address.ward}`}
                    {address.district && `, ${getDistrictName(address.district)}`}
                    {address.province && `, ${getCityName(address.province)}`}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Address Modal */}
      <AddNewAddress
        isOpen={showAddressForm}
        onClose={handleCloseAddressForm}
        onSuccess={handleAddressSuccess}
        editingAddress={editingAddress}
        onNotification={onNotification}
      />
    </div>
  );
};

export default AddressManagement; 