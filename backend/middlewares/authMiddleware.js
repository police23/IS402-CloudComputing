const authService = require('../services/AuthService');
const userModel = require('../models/userModel');

exports.verifyToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    try {
        const decoded = authService.verifyToken(token);
        const user = await userModel.getUserById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
        }
        
        if (user.is_active === 0) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};
