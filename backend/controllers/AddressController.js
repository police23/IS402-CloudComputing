const addressService = require('../services/AddressService');

const getAddressesByUserID = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await addressService.getAddressesByUserID(userId);
    res.json({ success: true, data: addresses, message: 'Lấy danh sách địa chỉ thành công' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Có lỗi xảy ra khi lấy danh sách địa chỉ' });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressData = { ...req.body, user_id: userId };
    const newAddress = await addressService.addAddress(addressData);
    res.status(201).json({ success: true, data: newAddress, message: 'Thêm địa chỉ thành công' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Có lỗi xảy ra khi thêm địa chỉ' });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id);
    const addressData = req.body;
    const updatedAddress = await addressService.updateAddress(addressId, addressData, userId);
    res.json({ success: true, data: updatedAddress, message: 'Cập nhật địa chỉ thành công' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Có lỗi xảy ra khi cập nhật địa chỉ' });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id);
    const result = await addressService.deleteAddress(addressId, userId);
    res.json({ success: true, message: result.message || 'Xóa địa chỉ thành công' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Có lỗi xảy ra khi xóa địa chỉ' });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = parseInt(req.params.id);
    const updatedAddress = await addressService.setDefaultAddress(addressId, userId);
    res.json({ success: true, data: updatedAddress, message: 'Đặt địa chỉ mặc định thành công' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Có lỗi xảy ra khi đặt địa chỉ mặc định' });
  }
};

module.exports = {
  getAddressesByUserID,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
