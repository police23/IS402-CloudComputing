const userService = require('../services/UserService');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.getAllShippers = async (req, res) => {
    try {
        const shippers = await userService.getAllShippers();
        res.json(shippers);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to fetch shippers' });
    }
}

exports.getUsersByRole = async (req, res) => {
    try {
        const { role_id } = req.params;
        const users = await userService.getUsersByRole(parseInt(role_id));
        res.json(users);
    } catch (err) {
        const statusCode = err.status || 500;
        const message = err.message || 'Failed to fetch users by role';
        res.status(statusCode).json({ error: message });
    }
};

exports.getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = await userService.getUserById(id);
        res.json(userData);
    } catch (err) {
        const statusCode = err.status || 500;
        const message = err.message || 'Failed to fetch user';
        res.status(statusCode).json({ error: message });
    }
};

const createUser = async (req, res) => {
    try {
        console.log('Received body:', req.body); // Log dữ liệu nhận được
        const result = await userService.createUser(req.body);
        console.log('Create result:', result); // Log kết quả trả vền
        res.status(201).json(result);
    } catch (err) {
        console.error('Create user error:', err); // Log lỗi chi tiết
        const statusCode = err.status || 500;   
        const message = err.message || 'Failed to create user';
        res.status(statusCode).json({ error: message });
    }
};

exports.addUser = async (req, res) => {
    try {
        console.log('[DEBUG] Dữ liệu nhận được từ frontend (addUser):', req.body);
        const result = await userService.addUser(req.body);
        res.status(201).json(result);
    } catch (err) {
        const statusCode = err.status || 500;
        const message = err.message || 'Không thể thêm tài khoản';
        res.status(statusCode).json({ error: message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.updateUser(id, req.body);
        res.status(200).json(result);
    } catch (err) {
        const statusCode = err.status || 500;
        const message = err.message;
        res.status(statusCode).json({ error: message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await userService.deleteUser(id);
        res.status(200).json(result);
    } catch (err) {
        const statusCode = err.status || 500;
        const message = err.message || 'Failed to delete user';
        res.status(statusCode).json({ error: message });
    }
};

exports.toggleAccountStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await userService.toggleAccountStatus(id, status);
        res.status(200).json(result);
    } catch (err) {
        const statusCode = err.status || 500;
        const message = err.message || 'Failed to toggle account status';
        res.status(statusCode).json({ error: message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { currentPassword, newPassword } = req.body;
        
        const result = await userService.changePassword(id, currentPassword, newPassword);
        res.status(200).json(result);
    } catch (err) {
        const statusCode = err.status || 500;
        const message = err.message || 'Server error when changing password';
        res.status(statusCode).json({ error: message });
    }
};
