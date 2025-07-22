const authService = require('../services/AuthService');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Kiểm tra input đầu vào
        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu' });
        }
        
        const result = await authService.authenticateUser(username, password);

        res.status(200).json({
            message: 'Đăng nhập thành công',
            user: result.user,
            token: result.token
        });    } catch (error) {
        const statusCode = error.message.includes('Vui lòng cung cấp') ? 400 : 401;
        
        res.status(statusCode).json({ message: error.message });
    }
};

// Thêm endpoint để xác thực token 
exports.validateToken = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const userModel = require('../models/userModel');
        const user = await userModel.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng' });
        }
        
        // Kiểm tra tài khoản có bị khóa không
        if (user.is_active === 0) {
            return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
        }
        
        res.status(200).json({
            message: 'Token hợp lệ',
            user
        });} catch (error) {
        res.status(500).json({ message: 'Lỗi xác thực token: ' + error.message });
    }
};

// Endpoint đăng xuất
exports.logout = async (req, res) => {
    try {
        res.status(200).json({ message: 'Đăng xuất thành công' });    } catch (error) {
        res.status(500).json({ message: 'Lỗi đăng xuất: ' + error.message });
    }
};

// Forgot password endpoints
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email' });
        }

        const result = await authService.sendOTP(email);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ message: 'Vui lòng cung cấp email và mã OTP' });
        }

        const result = await authService.verifyOTP(email, otp);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword, resetToken } = req.body;
        
        if (!email || !newPassword || !resetToken) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
        }

        const result = await authService.resetPassword(email, newPassword, resetToken);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};