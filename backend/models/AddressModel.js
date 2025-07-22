const db = require("../db");

const getAddressesByUserID = async (userID) => {
    const [rows] = await db.query(`
        SELECT id, user_id, address_line, ward, district, province, is_default, created_at, updated_at
        FROM addresses 
        WHERE user_id = ?
        ORDER BY is_default DESC, created_at DESC
    `, [userID]);
    return rows;
};

const addAddress = async (addressData) => {
    const { user_id, address_line, ward, district, province } = addressData;
    let is_default = 1;
    const [existingAddresses] = await db.query(
        "SELECT COUNT(*) as count FROM addresses WHERE user_id = ?",
        [user_id]
    );
    if (existingAddresses[0].count > 0) {
        is_default = 0;
    }
    
    const [result] = await db.query(
        "INSERT INTO addresses (user_id, address_line, ward, district, province, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [user_id, address_line, ward, district, province, is_default]
    );
    return result;
};

const updateAddress = async (addressId, addressData) => {
    const { address_line, ward, district, province } = addressData;
    
    const [result] = await db.query(
        "UPDATE addresses SET address_line = ?, ward = ?, district = ?, province = ?, updated_at = NOW() WHERE id = ?",
        [address_line, ward, district, province, addressId]
    );
    
    if (result.affectedRows === 0) {
        throw new Error('Address not found');
    }
    
    return result;
};

const deleteAddress = async (addressId, userId) => {
    // Xóa địa chỉ
    const [result] = await db.query(
        "DELETE FROM addresses WHERE id = ?",
        [addressId]
    );
    
    if (result.affectedRows === 0) {
        throw new Error('Failed to delete address');
    }
    
    return { success: true, message: 'Address deleted successfully' };
};

const setDefaultAddress = async (addressId, userId) => {
    // Đặt tất cả địa chỉ thành không mặc định
    await db.query(
        "UPDATE addresses SET is_default = 0"
    );
    
    // Đặt địa chỉ được chọn làm mặc định
    const [result] = await db.query(
        "UPDATE addresses SET is_default = 1 WHERE id = ?",
        [addressId]
    );
    
    if (result.affectedRows === 0) {
        throw new Error('Failed to set default address');
    }
    
    return result;
};

module.exports = {
    getAddressesByUserID,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};