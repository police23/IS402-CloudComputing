const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const userModel = require('../models/UserModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const JWT_SECRET = 'yoursecretkey123';

// Tạm thời lưu OTP trong memory (trong production nên dùng Redis)
const otpStore = new Map();

/**
 * Xác thực người dùng dựa trên username và password
 * @param {string} username 
 * @param {string} password 
 * @returns {Object} 
 */
const authenticateUser = async (username, password) => {    if (!username || !password) {
        throw new Error('Vui lòng cung cấp tên đăng nhập và mật khẩu');
    }
    
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
        throw new Error('Tên đăng nhập và/hoặc mật khẩu không đúng');
    }
    const user = users[0];
    
    // Kiểm tra tài khoản có bị khóa không
    if (user.is_active === 0) {
        throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }
    
    let isMatch;
    if (user.username === 'admin') {
        isMatch = password === user.password;
    } else {
        
        try {
            isMatch = await bcrypt.compare(password, user.password);
        } catch (err) {
            throw new Error('Lỗi xác thực: Định dạng mật khẩu không hợp lệ');
        }
    }

    if (!isMatch) {
        throw new Error('Tên đăng nhập và/hoặc mật khẩu không đúng');
    }

    const token = generateToken(user);    return {
        user: {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            phone: user.phone || '', // đảm bảo luôn có trường phone
            role_id: user.role_id,
            is_active: user.is_active
        },
        token
    };
};

/**
 * @param {Object} user - Đối tượng người dùng
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role_id: user.role_id },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

/**
 * Xác thực token JWT
 * @param {string} token - JWT token cần xác thực
 * @returns {Object} - Dữ liệu đã giải mã từ token nếu hợp lệ
 */
const verifyToken = (token) => {
    if (!token) {
        throw new Error('Không tìm thấy token xác thực');
    }

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
};

/**
 * Tạo cấu hình email transporter
 */
const createEmailTransporter = () => {
    // Cấu hình cho Gmail (có thể thay đổi theo email provider khác)
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
        }
    });
};

/**
 * Gửi OTP qua email
 * @param {string} email - Email của người dùng
 * @returns {Object} - Kết quả gửi OTP
 */
const sendOTP = async (email) => {
    try {
        // Kiểm tra email có tồn tại trong hệ thống không
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            throw new Error('Email không tồn tại trong hệ thống');
        }

        // Tạo mã OTP 6 chữ số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Lưu OTP vào store với thời gian hết hạn (5 phút)
        const otpData = {
            otp,
            email,
            createdAt: Date.now(),
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 phút
        };
        otpStore.set(email, otpData);

        // Gửi email (trong môi trường development, chỉ log ra console)
        if (process.env.NODE_ENV === 'production') {
            const transporter = createEmailTransporter();
            
            const mailOptions = {
                from: process.env.EMAIL_USER || 'your-email@gmail.com',
                to: email,
                subject: 'Mã OTP đặt lại mật khẩu - Nhà sách Cánh Diều',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2>Đặt lại mật khẩu</h2>
                        <p>Xin chào,</p>
                        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại Nhà sách Cánh Diều.</p>
                        <p>Mã OTP của bạn là: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
                        <p>Mã này sẽ hết hạn sau 5 phút.</p>
                        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                        <hr>
                        <p><small>Nhà sách Cánh Diều</small></p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
        } else {
            // Development mode - log OTP to console
            console.log(`=== OTP for ${email}: ${otp} ===`);
        }

        return {
            message: 'Mã OTP đã được gửi đến email của bạn',
            email: email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Ẩn phần email
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Xác thực OTP
 * @param {string} email - Email của người dùng
 * @param {string} otp - Mã OTP cần xác thực
 * @returns {Object} - Kết quả xác thực và reset token
 */
const verifyOTP = async (email, otp) => {
    try {
        const otpData = otpStore.get(email);
        
        if (!otpData) {
            throw new Error('Không tìm thấy mã OTP hoặc mã đã hết hạn');
        }

        if (Date.now() > otpData.expiresAt) {
            otpStore.delete(email);
            throw new Error('Mã OTP đã hết hạn');
        }

        if (otpData.otp !== otp) {
            throw new Error('Mã OTP không chính xác');
        }

        // Tạo reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Lưu reset token (thay thế OTP data)
        const resetData = {
            email,
            resetToken,
            createdAt: Date.now(),
            expiresAt: Date.now() + (15 * 60 * 1000) // 15 phút cho việc đặt lại mật khẩu
        };
        otpStore.set(email, resetData);

        return {
            message: 'Xác thực OTP thành công',
            resetToken: resetToken
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Đặt lại mật khẩu
 * @param {string} email - Email của người dùng
 * @param {string} newPassword - Mật khẩu mới
 * @param {string} resetToken - Token để xác thực việc đặt lại mật khẩu
 * @returns {Object} - Kết quả đặt lại mật khẩu
 */
const resetPassword = async (email, newPassword, resetToken) => {
    try {
        const resetData = otpStore.get(email);
        
        if (!resetData || resetData.resetToken !== resetToken) {
            throw new Error('Token không hợp lệ hoặc đã hết hạn');
        }

        if (Date.now() > resetData.expiresAt) {
            otpStore.delete(email);
            throw new Error('Token đã hết hạn');
        }

        // Lấy thông tin user
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            throw new Error('Không tìm thấy người dùng');
        }

        // Hash mật khẩu mới
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Cập nhật mật khẩu trong database
        await userModel.updateUserPassword(user.id, hashedPassword);
        
        // Xóa reset token
        otpStore.delete(email);

        return {
            message: 'Đặt lại mật khẩu thành công'
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Clear OTP store (for testing purposes)
 */
const clearOTPStore = () => {
    otpStore.clear();
};

module.exports = {
    authenticateUser,
    generateToken,
    verifyToken,
    sendOTP,
    verifyOTP,
    resetPassword,
    clearOTPStore // Add this for testing
};
