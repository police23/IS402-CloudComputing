import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faMapMarkerAlt, faTimes, faCheck, faSpinner 
} from "@fortawesome/free-solid-svg-icons";
import { addAddress, updateAddress } from '../../services/AddressService';
import './AddressForm.css';

const AddNewAddress = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingAddress = null, 
  onNotification 
}) => {
  const [saving, setSaving] = useState(false);
  const [addressForm, setAddressForm] = useState({
    address: "",
    city: "",
    district: "",
    ward: ""
  });

  // Initialize form when editing or opening
  React.useEffect(() => {
    if (isOpen) {
      if (editingAddress) {
        setAddressForm({
          address: editingAddress.address_line || "",
          city: editingAddress.province || "",
          district: editingAddress.district || "",
          ward: editingAddress.ward || ""
        });
      } else {
        setAddressForm({
          address: "",
          city: "",
          district: "",
          ward: ""
        });
      }
    }
  }, [isOpen, editingAddress]);

  const handleAddressFormChange = (field, value) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAddress = async () => {
    if (!addressForm.address) {
      onNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
      return;
    }

    setSaving(true);
    try {
      const addressData = {
        address_line: addressForm.address,
        province: addressForm.city,
        district: addressForm.district,
        ward: addressForm.ward
      };

      let response;
      if (editingAddress) {
        // Update existing address
        response = await updateAddress(editingAddress.id, addressData);
      } else {
        // Add new address
        response = await addAddress(addressData);
      }

      if (response.success) {
        onNotification(
          editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công', 
          'success'
        );
        onSuccess(); // Callback to refresh parent component
        onClose(); // Close the modal
      } else {
        onNotification(response.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      onNotification('Có lỗi xảy ra khi lưu địa chỉ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="address-form-overlay">
      <div className="address-form-modal">
        <div className="address-form-header">
          <h3>
            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ marginRight: "10px", color: "#4A7CAE" }} />
            {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h3>
          <button 
            className="close-btn"
            onClick={handleCancel}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        
        <div className="address-form-content">
          <div className="form-group">
            <label>Địa chỉ chi tiết *:</label>
            <textarea
              value={addressForm.address}
              onChange={(e) => handleAddressFormChange('address', e.target.value)}
              placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã)"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>Phường/Xã:</label>
            <input
              type="text"
              value={addressForm.ward}
              onChange={(e) => handleAddressFormChange('ward', e.target.value)}
              placeholder="Nhập phường/xã"
            />
          </div>

          <div className="form-group">
            <label>Quận/Huyện:</label>
            <select
              value={addressForm.district}
              onChange={(e) => handleAddressFormChange('district', e.target.value)}
            >
              <option value="">Chọn quận/huyện</option>
              <option value="district1">Quận 1</option>
              <option value="district2">Quận 2</option>
              <option value="district3">Quận 3</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tỉnh/Thành phố:</label>
            <select
              value={addressForm.city}
              onChange={(e) => handleAddressFormChange('city', e.target.value)}
            >
              <option value="">Chọn tỉnh/thành phố</option>
              <option value="hanoi">Hà Nội</option>
              <option value="hcm">TP. Hồ Chí Minh</option>
              <option value="danang">Đà Nẵng</option>
              <option value="cantho">Cần Thơ</option>
            </select>
          </div>
        </div>

        <div className="address-form-actions">
          <button 
            type="button" 
            className="btn"
            onClick={handleCancel}
          >
            <FontAwesomeIcon icon={faTimes} /> Hủy
          </button>
          <button 
            type="button" 
            className="btn btn-add"
            onClick={handleSaveAddress}
            disabled={saving}
          >
            {saving ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Đang lưu...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} /> 
                {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewAddress;
