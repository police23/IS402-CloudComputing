const db = require('../db');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const getAllUsers = async () => {
    const users = await userModel.getAllUsers();
    return users;
};
const getAllShippers = async () => {
    const shippers = await userModel.getAllShippers(); 
    return shippers;
};

const getUsersByRole = async (role_id) => {
    const users = await userModel.getUsersByRole(role_id);
    return users;
};

const getUserById = async (id) => {
    const user = await userModel.getUserById(id);
    if (!user) {
        throw { status: 404, message: 'User not found' };
    }
    
    return {
        id: user.id,
        username: user.username,
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        
        gender: (user.gender === 0 || user.gender === 1) ? Number(user.gender) : null,
        role_id: user.role_id,
        is_active: user.is_active,
        created_at: user.created_at || null, // Thêm ngày tạo
    };
};

const createUser = async (userData) => {
    const { username, fullName, email, phone, gender, password } = userData;
    if (!username || !fullName || !email || !phone || gender === undefined || gender === null || !password) {
        throw { status: 400, message: 'Vui lòng điền đầy đủ thông tin' };
    }
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    let role_id = 4;
    const is_active = 1;
    try {
        const [existingUser] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUser && existingUser.length > 0) {
            throw { status: 409, message: 'Tên đăng nhập đã tồn tại' };
        }

        const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail && existingEmail.length > 0) {
            throw { status: 409, message: 'Email đã tồn tại' };
        }

        const [existingPhone] = await db.query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingPhone && existingPhone.length > 0) {
            throw { status: 409, message: 'Số điện thoại đã tồn tại' };
        }

        const result = await userModel.createUser({
            username,
            password: hashedPassword,
            full_name: fullName,
            email,
            phone,
            gender,
            role_id,
            is_active
        });

        const [userData] = await db.query(
            'SELECT id, username, full_name, email, phone, gender, role_id, is_active, created_at, updated_at FROM users WHERE id = ?',
            [result.insertId]
        );
        return userData[0];
    } catch (err) {
        if (err.status) throw err;
        throw { status: 500, message: 'Failed to create user', details: err.message };
    }
};

const addUser = async (userData) => {
    const { username, fullName, email, phone, gender, role } = userData;    // Kiểm tra các trường bắt buộc
    if (!username || !fullName || !email || !phone || gender === undefined || gender === null || !role) {
        throw { status: 400, message: 'Vui lòng điền đầy đủ thông tin' };
    }

    const defaultPassword = "12345678";
    
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    let role_id;
    if (typeof role === 'number') {
        role_id = role;
    } else {
        switch (role) {
            case 'admin': role_id = 1; break;
            case 'sales': role_id = 2; break;
            case 'warehouse': role_id = 3; break;
            case 'order_manager': role_id = 5; break;
            case 'shipper': role_id = 6; break;
            default: role_id = 2;
        }
    }

    const is_active = 1;    
    try {
        
        const result = await userModel.createUser({
            username,
            password: hashedPassword,
            full_name: fullName,
            email,
            phone,
            gender,
            role_id,
            is_active
        });        
        const [userData] = await db.query(
            'SELECT id, username, full_name, email, phone, gender, role_id, is_active, created_at, updated_at FROM users WHERE id = ?',
            [result.insertId]
        );
        
        return userData[0];
    } catch (err) {
        
        if (err.code === 'ER_DUP_ENTRY') {
            // Phân tích message để xác định trường nào bị trùng
            if (err.message && err.message.includes('username')) {
                throw { status: 409, message: 'Tên đăng nhập đã tồn tại' };
            } else if (err.message && err.message.includes('email')) {
                throw { status: 409, message: 'Email đã tồn tại' };
            } else if (err.message && err.message.includes('phone')) {
                throw { status: 409, message: 'Số điện thoại đã tồn tại' };
            } else {
                // Fallback chung cho duplicate entry
                throw { status: 409, message: 'Thông tin đã tồn tại trong hệ thống' };
            }
        }
        throw err; 
    }
};

const updateUser = async (id, userData) => {
    const { username, fullName, email, phone, gender, role, is_active, password } = userData;

    // Validate required fields
    if (!username || !fullName || !email || !phone || gender === undefined || gender === null || !role) {
        throw { status: 400, message: "Chưa nhập đầy đủ thông tin" };
    }

    // Chuyển đổi role thành role_id
    let role_id;
    switch (role) {
        case 'admin': role_id = 1; break;
        case 'sales': role_id = 2; break;
        case 'warehouse': role_id = 3; break;
        case 'order_manager': role_id = 5; break;
        case 'shipper': role_id = 6; break;
        default: role_id = 2;
    }    
    let genderValue;
    if (gender === "male" || gender === 0 || gender === "0") genderValue = 0;
    else if (gender === "female" || gender === 1 || gender === "1") genderValue = 1;
    else {
        throw { status: 400, message: "Giới tính không hợp lệ" };
    }

    const activeStatus = typeof is_active === "undefined" ? 1 : is_active;

    try {
        const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (!users || users.length === 0) {
            throw { status: 404, message: "User not found" };
        }

        const [existingUser] = await db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
        if (existingUser && existingUser.length > 0) {
            throw { status: 409, message: "Tên đăng nhập đã tồn tại" };
        }

        const [existingEmail] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
        if (existingEmail && existingEmail.length > 0) {
            throw { status: 409, message: "Email đã tồn tại" };
        }

        const [existingPhone] = await db.query('SELECT id FROM users WHERE phone = ? AND id != ?', [phone, id]);
        if (existingPhone && existingPhone.length > 0) {
            throw { status: 409, message: "Số điện thoại đã tồn tại" };
        }
    } catch (err) {
        if (err.status) throw err;
        throw { status: 500, message: "Database error when checking user", details: err.message };
    }

    try {
        let query, params;
        
        
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            query = `UPDATE users SET username = ?, full_name = ?, email = ?, phone = ?, gender = ?, role_id = ?, is_active = ?, password = ? WHERE id = ?`;
            params = [username, fullName, email, phone, genderValue, role_id, activeStatus, hashedPassword, id];
        } else {
            query = `UPDATE users SET username = ?, full_name = ?, email = ?, phone = ?, gender = ?, role_id = ?, is_active = ? WHERE id = ?`;
            params = [username, fullName, email, phone, genderValue, role_id, activeStatus, id];
        }        const [result] = await db.query(query, params);        if (result.affectedRows === 0) {
            throw { status: 500, message: "Failed to update user (no rows affected)" };
        }

        
        const [updatedUser] = await db.query(
            'SELECT id, username, full_name, email, phone, gender, role_id, is_active, created_at, updated_at FROM users WHERE id = ?',
            [id]
        );
        
        return updatedUser[0];
    } catch (err) {
        if (err.status) throw err;
        
        // Kiểm tra lỗi duplicate entry từ database
        if (err.code === 'ER_DUP_ENTRY') {
            // Phân tích message để xác định trường nào bị trùng
            if (err.message && err.message.includes('username')) {
                throw { status: 409, message: 'Tên đăng nhập đã tồn tại' };
            } else if (err.message && err.message.includes('email')) {
                throw { status: 409, message: 'Email đã tồn tại' };
            } else if (err.message && err.message.includes('phone')) {
                throw { status: 409, message: 'Số điện thoại đã tồn tại' };
            } else {
                // Fallback chung cho duplicate entry
                throw { status: 409, message: 'Thông tin đã tồn tại trong hệ thống' };
            }
        }
        
        throw { status: 500, message: 'Failed to update user', details: err.message };
    }
};

const deleteUser = async (id) => {
    // Kiểm tra user tồn tại trước khi xóa
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (!users || users.length === 0) {
        throw { status: 404, message: "User not found" };
    }

    // Thực hiện xóa user
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
        throw { status: 500, message: "Failed to delete user (no rows affected)" };
    }

    return { message: 'User deleted successfully' };
};


const toggleAccountStatus = async (id, status) => {
    // Xác định giá trị is_active (1 = active, 0 = inactive)
    const is_active = status === 'active' ? 1 : 0;

    // Kiểm tra xem user này có phải admin không
    const [users] = await db.query('SELECT id, role_id FROM users WHERE id = ?', [id]);

    // Cập nhật trạng thái
    const [result] = await db.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, id]);

    const [updatedUser] = await db.query(
        'SELECT id, username, full_name, email, phone, gender, role_id, is_active, created_at, updated_at FROM users WHERE id = ?',
        [id]
    );

    if (!updatedUser || updatedUser.length === 0) {
        throw { status: 404, message: "Failed to retrieve updated user" };
    }   
    return updatedUser[0];
};


const changePassword = async (id, currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
        throw { status: 400, message: 'Current password and new password are required' };
    }

    const [users] = await db.query(
        'SELECT id, password FROM users WHERE id = ?',
        [id]
    );

    if (!users || users.length === 0) {
        throw { status: 404, message: 'User not found' };
    }

    const user = users[0];
    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
        throw { status: 401, message: 'Current password is incorrect' };
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const [result] = await db.query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
        throw { status: 500, message: 'Failed to update password' };
    }
    
    return { message: 'Password updated successfully' };
};

module.exports = {
    getAllUsers,
    getAllShippers,
    getUsersByRole,
    getUserById,
    addUser,
    createUser,
    updateUser,
    deleteUser,
    toggleAccountStatus,
    changePassword
};
