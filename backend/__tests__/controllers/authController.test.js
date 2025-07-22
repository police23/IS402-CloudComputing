const authController = require('../../controllers/authController');
const authService = require('../../services/authService');

// Mock authService
jest.mock('../../services/authService');

describe('AuthController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      user: {}
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockCredentials = {
        username: 'testuser',
        password: 'testpassword'
      };
      
      const mockResult = {
        user: {
          id: 1,
          username: 'testuser',
          role: 'admin'
        },
        token: 'mock-jwt-token'
      };

      req.body = mockCredentials;
      authService.authenticateUser.mockResolvedValue(mockResult);

      await authController.login(req, res);

      expect(authService.authenticateUser).toHaveBeenCalledWith(
        mockCredentials.username,
        mockCredentials.password
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Đăng nhập thành công',
        user: mockResult.user,
        token: mockResult.token
      });
    });

    it('should return 400 when username is missing', async () => {
      req.body = {
        password: 'testpassword'
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu'
      });
      expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      req.body = {
        username: 'testuser'
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu'
      });
      expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 400 when both username and password are missing', async () => {
      req.body = {};

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu'
      });
      expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      const mockCredentials = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      req.body = mockCredentials;
      const errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng';
      authService.authenticateUser.mockRejectedValue(new Error(errorMessage));

      await authController.login(req, res);

      expect(authService.authenticateUser).toHaveBeenCalledWith(
        mockCredentials.username,
        mockCredentials.password
      );
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it('should handle validation errors with 400 status', async () => {
      const mockCredentials = {
        username: 'testuser',
        password: 'testpassword'
      };

      req.body = mockCredentials;
      const errorMessage = 'Vui lòng cung cấp email hợp lệ';
      authService.authenticateUser.mockRejectedValue(new Error(errorMessage));

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it('should handle empty strings as missing values', async () => {
      req.body = {
        username: '',
        password: ''
      };

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu'
      });
    });    it('should handle whitespace-only values as missing', async () => {
      req.body = {
        username: '   ',
        password: '   '
      };

      // Mock authService để throw error như thực tế
      authService.authenticateUser.mockRejectedValue(
        new Error('Vui lòng cung cấp tên đăng nhập và mật khẩu')
      );

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu'
      });
    });
  });
  describe('validateToken', () => {    it('should validate token successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'admin',
        is_active: 1  // Thêm trường này
      };

      req.user = { id: 1 };
      
      // Mock userModel.getUserById trực tiếp
      const userModel = require('../../models/userModel');
      userModel.getUserById = jest.fn().mockResolvedValue(mockUser);

      await authController.validateToken(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Token hợp lệ',
        user: mockUser
      });
    });

    it('should return 404 when user not found', async () => {
      req.user = { id: 999 };
      
      const userModel = require('../../models/userModel');
      userModel.getUserById = jest.fn().mockResolvedValue(null);

      await authController.validateToken(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Không tìm thấy thông tin người dùng'
      });
    });

    it('should return 403 when account is locked', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'admin',
        is_active: 0  // Tài khoản bị khóa
      };

      req.user = { id: 1 };
      
      const userModel = require('../../models/userModel');
      userModel.getUserById = jest.fn().mockResolvedValue(mockUser);

      await authController.validateToken(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
      });
    });

    it('should handle errors in validateToken', async () => {
      req.user = { id: 1 };
      
      const userModel = require('../../models/userModel');
      userModel.getUserById = jest.fn().mockRejectedValue(new Error('Database error'));

      await authController.validateToken(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi xác thực token: Database error'
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Đăng xuất thành công'
      });    });
  });

  describe('sendOTP', () => {
    it('should send OTP successfully', async () => {
      const mockEmail = 'test@example.com';
      const mockResult = {
        message: 'Mã OTP đã được gửi đến email của bạn',
        email: 'te***@example.com'
      };

      req.body = { email: mockEmail };
      authService.sendOTP.mockResolvedValue(mockResult);

      await authController.sendOTP(req, res);

      expect(authService.sendOTP).toHaveBeenCalledWith(mockEmail);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when email is missing', async () => {
      req.body = {};

      await authController.sendOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp email'
      });
      expect(authService.sendOTP).not.toHaveBeenCalled();
    });

    it('should return 400 when email is empty string', async () => {
      req.body = { email: '' };

      await authController.sendOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp email'
      });
      expect(authService.sendOTP).not.toHaveBeenCalled();
    });

    it('should handle sendOTP service errors', async () => {
      const mockEmail = 'nonexistent@example.com';
      const errorMessage = 'Email không tồn tại trong hệ thống';

      req.body = { email: mockEmail };
      authService.sendOTP.mockRejectedValue(new Error(errorMessage));

      await authController.sendOTP(req, res);

      expect(authService.sendOTP).toHaveBeenCalledWith(mockEmail);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it('should handle null email', async () => {
      req.body = { email: null };

      await authController.sendOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp email'
      });
    });

    it('should handle undefined email', async () => {
      req.body = { email: undefined };

      await authController.sendOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp email'
      });
    });
  });

  describe('verifyOTP', () => {
    it('should verify OTP successfully', async () => {
      const mockData = {
        email: 'test@example.com',
        otp: '123456'
      };
      const mockResult = {
        message: 'Xác thực OTP thành công',
        resetToken: 'mock-reset-token'
      };

      req.body = mockData;
      authService.verifyOTP.mockResolvedValue(mockResult);

      await authController.verifyOTP(req, res);

      expect(authService.verifyOTP).toHaveBeenCalledWith(mockData.email, mockData.otp);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when email is missing', async () => {
      req.body = { otp: '123456' };

      await authController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp email và mã OTP'
      });
      expect(authService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should return 400 when OTP is missing', async () => {
      req.body = { email: 'test@example.com' };

      await authController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp email và mã OTP'
      });
      expect(authService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should return 400 when both email and OTP are missing', async () => {
      req.body = {};

      await authController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp email và mã OTP'
      });
      expect(authService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should handle verifyOTP service errors', async () => {
      const mockData = {
        email: 'test@example.com',
        otp: '000000'
      };
      const errorMessage = 'Mã OTP không chính xác';

      req.body = mockData;
      authService.verifyOTP.mockRejectedValue(new Error(errorMessage));

      await authController.verifyOTP(req, res);

      expect(authService.verifyOTP).toHaveBeenCalledWith(mockData.email, mockData.otp);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it('should handle empty string values', async () => {
      req.body = { email: '', otp: '' };

      await authController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp email và mã OTP'
      });
      expect(authService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should handle null values', async () => {
      req.body = { email: null, otp: null };

      await authController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp email và mã OTP'
      });
      expect(authService.verifyOTP).not.toHaveBeenCalled();
    });

    it('should handle expired OTP error', async () => {
      const mockData = {
        email: 'test@example.com',
        otp: '123456'
      };
      const errorMessage = 'Mã OTP đã hết hạn';

      req.body = mockData;
      authService.verifyOTP.mockRejectedValue(new Error(errorMessage));

      await authController.verifyOTP(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockData = {
        email: 'test@example.com',
        newPassword: 'newPassword123',
        resetToken: 'valid-reset-token'
      };
      const mockResult = {
        message: 'Đặt lại mật khẩu thành công'
      };

      req.body = mockData;
      authService.resetPassword.mockResolvedValue(mockResult);

      await authController.resetPassword(req, res);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        mockData.email,
        mockData.newPassword,
        mockData.resetToken
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 when email is missing', async () => {
      req.body = {
        newPassword: 'newPassword123',
        resetToken: 'valid-reset-token'
      };

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should return 400 when newPassword is missing', async () => {
      req.body = {
        email: 'test@example.com',
        resetToken: 'valid-reset-token'
      };

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should return 400 when resetToken is missing', async () => {
      req.body = {
        email: 'test@example.com',
        newPassword: 'newPassword123'
      };

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should return 400 when all fields are missing', async () => {
      req.body = {};

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should handle resetPassword service errors', async () => {
      const mockData = {
        email: 'test@example.com',
        newPassword: 'newPassword123',
        resetToken: 'invalid-reset-token'
      };
      const errorMessage = 'Token không hợp lệ hoặc đã hết hạn';

      req.body = mockData;
      authService.resetPassword.mockRejectedValue(new Error(errorMessage));

      await authController.resetPassword(req, res);

      expect(authService.resetPassword).toHaveBeenCalledWith(
        mockData.email,
        mockData.newPassword,
        mockData.resetToken
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it('should handle empty string values', async () => {
      req.body = {
        email: '',
        newPassword: '',
        resetToken: ''
      };

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should handle null values', async () => {
      req.body = {
        email: null,
        newPassword: null,
        resetToken: null
      };

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
      expect(authService.resetPassword).not.toHaveBeenCalled();
    });

    it('should handle expired token error', async () => {
      const mockData = {
        email: 'test@example.com',
        newPassword: 'newPassword123',
        resetToken: 'expired-token'
      };
      const errorMessage = 'Token đã hết hạn';

      req.body = mockData;
      authService.resetPassword.mockRejectedValue(new Error(errorMessage));

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it('should handle user not found error', async () => {
      const mockData = {
        email: 'nonexistent@example.com',
        newPassword: 'newPassword123',
        resetToken: 'valid-token'
      };
      const errorMessage = 'Không tìm thấy người dùng';

      req.body = mockData;
      authService.resetPassword.mockRejectedValue(new Error(errorMessage));

      await authController.resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
  });

  describe('logout edge cases', () => {
    it('should handle logout successfully in basic case', async () => {
      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Đăng xuất thành công'
      });
    });

    it('should handle logout with empty request', async () => {
      req = {};

      await authController.logout(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Đăng xuất thành công'
      });
    });

    // Note: The logout method's catch block (line 54) is difficult to test 
    // because it's a simple method with no async operations that could fail.
    // The catch block exists for defensive programming but is unlikely to be reached.
  });
});
