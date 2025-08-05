const { Address } = require('../models');
const { Op } = require('sequelize');

const getAddressesByUserID = async (userID) => {
  if (!userID) throw { status: 400, message: 'User ID is required' };
  return await Address.findAll({
    where: { user_id: userID },
    order: [['is_default', 'DESC'], ['created_at', 'DESC']]
  });
};

const addAddress = async (addressData) => {
  const { user_id, address_line, ward, district, province } = addressData;
  if (!user_id || !address_line) throw { status: 400, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' };
  if (address_line.length < 5 || address_line.length > 500) throw { status: 400, message: 'Địa chỉ phải có từ 5-500 ký tự' };
  // Nếu user chưa có địa chỉ thì set mặc định, ngược lại là 0
  const count = await Address.count({ where: { user_id } });
  const is_default = count === 0 ? 1 : 0;
  const newAddress = await Address.create({
    user_id,
    address_line,
    ward,
    district,
    province,
    is_default
  });
  return newAddress;
};

const updateAddress = async (addressId, addressData, userId) => {
  if (!addressId) throw { status: 400, message: 'Address ID is required' };
  const { address_line, ward, district, province } = addressData;
  if (!address_line) throw { status: 400, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' };
  if (address_line.length < 5 || address_line.length > 500) throw { status: 400, message: 'Địa chỉ phải có từ 5-500 ký tự' };
  const address = await Address.findByPk(addressId);
  if (!address) throw { status: 404, message: 'Address not found' };
  await address.update({ address_line, ward, district, province });
  return address;
};

const deleteAddress = async (addressId, userId) => {
  if (!addressId) throw { status: 400, message: 'Address ID is required' };
  const address = await Address.findByPk(addressId);
  if (!address) throw { status: 404, message: 'Failed to delete address' };
  await address.destroy();
  return { success: true, message: 'Address deleted successfully' };
};

const setDefaultAddress = async (addressId, userId) => {
  // Đặt tất cả địa chỉ của user về 0, địa chỉ được chọn về 1
  await Address.update({ is_default: 0 }, { where: { user_id: userId } });
  const address = await Address.findByPk(addressId);
  if (!address) throw { status: 404, message: 'Failed to set default address' };
  await address.update({ is_default: 1 });
  return address;
};

module.exports = {
  getAddressesByUserID,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
