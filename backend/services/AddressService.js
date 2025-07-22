const addressModel = require('../models/AddressModel');

const getAddressesByUserID = async (userID) => {
    try {
        if (!userID) {
            throw { status: 400, message: 'User ID is required' };
        }
        
        const addresses = await addressModel.getAddressesByUserID(userID);
        return addresses;
    } catch (error) {
        if (error.status) throw error;
        throw { status: 500, message: 'Failed to get addresses', details: error.message };
    }
};

const addAddress = async (addressData) => {
    try {
        const { user_id, address_line, ward, district, province } = addressData;
        
        if (!user_id || !address_line) {
            throw { status: 400, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' };
        }
        if (address_line.length < 5 || address_line.length > 500) {
            throw { status: 400, message: 'Địa chỉ phải có từ 5-500 ký tự' };
        }
        const newAddress = await addressModel.addAddress(addressData);
        return newAddress;
    } catch (error) {
        if (error.status) throw error;
        throw { status: 500, message: 'Failed to add address', details: error.message };
    }
};

const updateAddress = async (addressId, addressData, userId) => {
    try {
        if (!addressId) {
            throw { status: 400, message: 'Address ID is required' };
        }
        
        const { address_line, ward, district, province } = addressData;
        
        if (!address_line) {
            throw { status: 400, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' };
        }
        if (address_line.length < 5 || address_line.length > 500) {
            throw { status: 400, message: 'Địa chỉ phải có từ 5-500 ký tự' };
        }
        const updatedAddress = await addressModel.updateAddress(addressId, addressData);
        return updatedAddress;
    } catch (error) {
        if (error.status) throw error;
        throw { status: 500, message: 'Failed to update address', details: error.message };
    }
};

const deleteAddress = async (addressId, userId) => {
    try {
        if (!addressId) {
            throw { status: 400, message: 'Address ID is required' };
        }
        
        const result = await addressModel.deleteAddress(addressId, userId);
        return result;
    } catch (error) {
        if (error.status) throw error;
        throw { status: 500, message: 'Failed to delete address', details: error.message };
    }
};

const setDefaultAddress = async (addressId, userId) => {
    try {
        if (!addressId) {
            throw { status: 400, message: 'Address ID is required' };
        }
        
        const updatedAddress = await addressModel.setDefaultAddress(addressId, userId);
        return updatedAddress;
    } catch (error) {
        if (error.status) throw error;
        throw { status: 500, message: 'Failed to set default address', details: error.message };
    }
};

module.exports = {
    getAddressesByUserID,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
