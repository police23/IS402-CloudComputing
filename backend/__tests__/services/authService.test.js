const authService = require('../../services/authService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../db');
const userModel = require('../../models/userModel');

// Mock dependencies
jest.mock('../../db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../models/userModel');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear OTP store to prevent test interference
    authService.clearOTPStore();
  });

  describe('authenticateUser', () => {
    it('should throw error when username is missing', async () => {
      await expect(authService.authenticateUser('', 'password123')).rejects.toThrow('Vui lòng cung cấp tên đăng nhập và mật khẩu');
    });

    it('should throw error when password is missing', async () => {
      await expect(authService.authenticateUser('user1', '')).rejects.toThrow('Vui lòng cung cấp tên đăng nhập và mật khẩu');
    });

    it('should throw error when both username and password are missing', async () => {
      await expect(authService.authenticateUser('', '')).rejects.toThrow('Vui lòng cung cấp tên đăng nhập và mật khẩu');
    });

    it('should throw error when user not found', async () => {
      db.query.mockResolvedValue([[]]);

      await expect(authService.authenticateUser('nonexistent', 'password123')).rejects.toThrow('Tên đăng nhập và/hoặc mật khẩu không đúng');
    });

    it('should throw error when user account is inactive', async () => {
      const mockUser = {
        id: 1,
        username: 'user1',
        password: 'hashedpassword',
        full_name: 'Test User',
        role_id: 2,
        is_active: 0
      };
      db.query.mockResolvedValue([[mockUser]]);

      await expect(authService.authenticateUser('user1', 'password123')).rejects.toThrow('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    });

    it('should authenticate admin user with plain text password', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        password: 'admin',
        full_name: 'Admin User',
        role_id: 1,
        is_active: 1
      };
      db.query.mockResolvedValue([[mockUser]]);
      jwt.sign.mockReturnValue('mocked.jwt.token');

      const result = await authService.authenticateUser('admin', 'admin');

      expect(result.user.username).toBe('admin');
      expect(result.token).toBe('mocked.jwt.token');
    });

    it('should authenticate regular user with hashed password', async () => {
      const mockUser = {
        id: 2,
        username: 'user1',
        password: 'hashedpassword',
        full_name: 'Test User',
        role_id: 2,
        is_active: 1
      };
      db.query.mockResolvedValue([[mockUser]]);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocked.jwt.token');

      const result = await authService.authenticateUser('user1', 'password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(result.user.username).toBe('user1');
      expect(result.token).toBe('mocked.jwt.token');
    });

    it('should throw error when password is incorrect for regular user', async () => {
      const mockUser = {
        id: 2,
        username: 'user1',
        password: 'hashedpassword',
        full_name: 'Test User',
        role_id: 2,
        is_active: 1
      };
      db.query.mockResolvedValue([[mockUser]]);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.authenticateUser('user1', 'wrongpassword')).rejects.toThrow('Tên đăng nhập và/hoặc mật khẩu không đúng');
    });

    it('should handle bcrypt error gracefully', async () => {
      const mockUser = {
        id: 2,
        username: 'user1',
        password: 'invalidhash',
        full_name: 'Test User',
        role_id: 2,
        is_active: 1
      };
      db.query.mockResolvedValue([[mockUser]]);
      bcrypt.compare.mockRejectedValue(new Error('Invalid hash'));

      await expect(authService.authenticateUser('user1', 'password123')).rejects.toThrow('Lỗi xác thực: Định dạng mật khẩu không hợp lệ');
    });

    it('should handle database errors', async () => {
      db.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(authService.authenticateUser('user1', 'password123')).rejects.toThrow('Database connection failed');
    });

    it('should handle admin user with wrong password', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        password: 'admin',
        full_name: 'Admin User',
        role_id: 1,
        is_active: 1
      };
      db.query.mockResolvedValue([[mockUser]]);

      await expect(authService.authenticateUser('admin', 'wrongpassword')).rejects.toThrow('Tên đăng nhập và/hoặc mật khẩu không đúng');
    });

    it('should handle null username', async () => {
      await expect(authService.authenticateUser(null, 'password')).rejects.toThrow('Vui lòng cung cấp tên đăng nhập và mật khẩu');
    });

    it('should handle null password', async () => {
      await expect(authService.authenticateUser('username', null)).rejects.toThrow('Vui lòng cung cấp tên đăng nhập và mật khẩu');
    });

    it('should handle undefined values', async () => {
      await expect(authService.authenticateUser(undefined, undefined)).rejects.toThrow('Vui lòng cung cấp tên đăng nhập và mật khẩu');
    });
  });

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        role_id: 2
      };
      jwt.sign.mockReturnValue('mocked.jwt.token');

      const token = authService.generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, username: 'testuser', role_id: 2 },
        'yoursecretkey123',
        { expiresIn: '24h' }
      );
      expect(token).toBe('mocked.jwt.token');
    });

    it('should handle user with minimal data', () => {
      const mockUser = {
        id: 123,
        username: 'minimaluser',
        role_id: 3
      };
      jwt.sign.mockReturnValue('minimal.jwt.token');

      const token = authService.generateToken(mockUser);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 123, username: 'minimaluser', role_id: 3 },
        'yoursecretkey123',
        { expiresIn: '24h' }
      );
      expect(token).toBe('minimal.jwt.token');
    });
  });

  describe('verifyToken', () => {
    it('should throw error when token is missing', () => {
      expect(() => authService.verifyToken()).toThrow('Không tìm thấy token xác thực');
    });

    it('should throw error when token is null', () => {
      expect(() => authService.verifyToken(null)).toThrow('Không tìm thấy token xác thực');
    });

    it('should throw error when token is empty string', () => {
      expect(() => authService.verifyToken('')).toThrow('Không tìm thấy token xác thực');
    });

    it('should verify valid token successfully', () => {
      const mockDecodedToken = { id: 1, username: 'user1', role_id: 2 };
      jwt.verify.mockReturnValue(mockDecodedToken);

      const result = authService.verifyToken('valid.jwt.token');

      expect(jwt.verify).toHaveBeenCalledWith('valid.jwt.token', 'yoursecretkey123');
      expect(result).toEqual(mockDecodedToken);
    });

    it('should throw error when token is invalid', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('invalid signature');
      });

      expect(() => authService.verifyToken('invalid.token')).toThrow('Token không hợp lệ hoặc đã hết hạn');
    });

    it('should throw error when token is expired', () => {
      jwt.verify.mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      expect(() => authService.verifyToken('expired.token')).toThrow('Token không hợp lệ hoặc đã hết hạn');
    });

    it('should handle malformed JWT token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('jwt malformed');
      });

      expect(() => authService.verifyToken('malformed.token')).toThrow('Token không hợp lệ hoặc đã hết hạn');
    });

    it('should handle various JWT errors', () => {
      const jwtErrors = [
        'invalid token',
        'jwt not active',
        'invalid audience',
        'invalid issuer'
      ];

      jwtErrors.forEach(errorMessage => {
        jwt.verify.mockImplementation(() => {
          throw new Error(errorMessage);
        });

        expect(() => authService.verifyToken('test.token')).toThrow('Token không hợp lệ hoặc đã hết hạn');
      });
    });
  });

  describe('sendOTP', () => {
    beforeEach(() => {
      // Mock console.log to avoid spam in test output
      jest.spyOn(console, 'log').mockImplementation(() => {});
      // Set NODE_ENV to development for testing
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    it('should throw error when email does not exist', async () => {
      userModel.getUserByEmail.mockResolvedValue(null);

      await expect(authService.sendOTP('nonexistent@example.com'))
        .rejects.toThrow('Email không tồn tại trong hệ thống');
    });

    it('should send OTP successfully in development mode', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      const result = await authService.sendOTP('test@example.com');

      expect(result.message).toBe('Mã OTP đã được gửi đến email của bạn');
      expect(result.email).toBe('te***@example.com');
      expect(console.log).toHaveBeenCalled();
    });

    it('should handle errors when user lookup fails', async () => {
      userModel.getUserByEmail.mockRejectedValue(new Error('Database error'));

      await expect(authService.sendOTP('test@example.com')).rejects.toThrow('Database error');
    });

    it('should handle email masking correctly', async () => {
      const mockUser = {
        id: 1,
        email: 'verylongemail@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      const result = await authService.sendOTP('verylongemail@example.com');

      expect(result.email).toBe('ve***@example.com');
    });

    it('should handle short email masking', async () => {
      const mockUser = {
        id: 1,
        email: 'ab@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      const result = await authService.sendOTP('ab@example.com');

      expect(result.email).toBe('ab***@example.com');
    });

    it('should handle email with no local part', async () => {
      const mockUser = {
        id: 1,
        email: 'a@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      const result = await authService.sendOTP('a@example.com');

      // Email with single character won't be masked by the regex pattern
      expect(result.email).toBe('a@example.com');
    });
  });

  describe('verifyOTP', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    it('should throw error when OTP not found', async () => {
      // Use a different email that hasn't been used in sendOTP tests
      await expect(authService.verifyOTP('fresh@example.com', '123456'))
        .rejects.toThrow('Không tìm thấy mã OTP hoặc mã đã hết hạn');
    });

    it('should throw error when OTP is incorrect for non-existing email', async () => {
      await expect(authService.verifyOTP('another@example.com', '000000'))
        .rejects.toThrow('Không tìm thấy mã OTP hoặc mã đã hết hạn');
    });
  });

  describe('resetPassword', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    it('should throw error when reset token is invalid', async () => {
      await expect(authService.resetPassword('test@example.com', 'newpassword', 'invalidtoken'))
        .rejects.toThrow('Token không hợp lệ hoặc đã hết hạn');
    });

    it('should throw error when email is invalid', async () => {
      await expect(authService.resetPassword('', 'newpassword', 'sometoken'))
        .rejects.toThrow('Token không hợp lệ hoặc đã hết hạn');
    });

    it('should throw error when password is empty', async () => {
      await expect(authService.resetPassword('test@example.com', '', 'sometoken'))
        .rejects.toThrow('Token không hợp lệ hoặc đã hết hạn');
    });

    it('should throw error when token is empty', async () => {
      await expect(authService.resetPassword('test@example.com', 'newpassword', ''))
        .rejects.toThrow('Token không hợp lệ hoặc đã hết hạn');
    });
  });

  describe('Integration tests with error handling', () => {
    it('should handle complex authentication flow errors', async () => {
      // Test sequence of operations that might fail
      db.query.mockRejectedValue(new Error('Connection timeout'));

      await expect(authService.authenticateUser('user', 'pass')).rejects.toThrow('Connection timeout');
    });

    it('should handle JWT generation errors', () => {
      const mockUser = { id: 1, username: 'test', role_id: 2 };
      jwt.sign.mockImplementation(() => {
        throw new Error('JWT generation failed');
      });

      expect(() => authService.generateToken(mockUser)).toThrow('JWT generation failed');
    });

    it('should handle bcrypt errors in different scenarios', async () => {
      const mockUser = {
        id: 1,
        username: 'user1',
        password: 'hashedpassword',
        full_name: 'Test User',
        role_id: 2,
        is_active: 1
      };
      db.query.mockResolvedValue([[mockUser]]);
      
      // Test different bcrypt error scenarios
      const bcryptErrors = [
        'Invalid salt rounds',
        'Invalid hash format',
        'Memory allocation error'
      ];

      for (const errorMessage of bcryptErrors) {
        bcrypt.compare.mockRejectedValue(new Error(errorMessage));
        
        await expect(authService.authenticateUser('user1', 'password'))
          .rejects.toThrow('Lỗi xác thực: Định dạng mật khẩu không hợp lệ');
      }
    });

    it('should handle edge cases in token verification', () => {
      // Test with very long token
      const longToken = 'a'.repeat(1000);
      jwt.verify.mockImplementation(() => {
        throw new Error('token too long');
      });

      expect(() => authService.verifyToken(longToken)).toThrow('Token không hợp lệ hoặc đã hết hạn');
    });

    it('should handle special characters in credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'user@#$%',
        password: 'hashedpassword',
        full_name: 'Test User',
        role_id: 2,
        is_active: 1
      };
      db.query.mockResolvedValue([[mockUser]]);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('test.token');

      const result = await authService.authenticateUser('user@#$%', 'pass!@#$');

      expect(result.user.username).toBe('user@#$%');
    });
  });

  describe('Production email sending', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      process.env.NODE_ENV = 'production';
      process.env.EMAIL_USER = 'test@gmail.com';
      process.env.EMAIL_PASS = 'testpassword';
    });

    afterEach(() => {
      console.log.mockRestore();
      process.env.NODE_ENV = 'development';
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;
    });

    it('should send OTP via email in production mode', async () => {
      const nodemailer = require('nodemailer');
      
      // Mock nodemailer
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test123' });
      const mockTransporter = {
        sendMail: mockSendMail
      };
      
      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter);

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      const result = await authService.sendOTP('test@example.com');

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'test@gmail.com',
          pass: 'testpassword'
        }
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@gmail.com',
        to: 'test@example.com',
        subject: 'Mã OTP đặt lại mật khẩu - Nhà sách Cánh Diều',
        html: expect.stringContaining('Đặt lại mật khẩu')
      });

      expect(result.message).toBe('Mã OTP đã được gửi đến email của bạn');
    });

    it('should handle email sending errors in production', async () => {
      const nodemailer = require('nodemailer');
      
      const mockSendMail = jest.fn().mockRejectedValue(new Error('Email sending failed'));
      const mockTransporter = {
        sendMail: mockSendMail
      };
      
      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter);

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      await expect(authService.sendOTP('test@example.com')).rejects.toThrow('Email sending failed');
    });

    it('should use default email credentials when env vars not set', async () => {
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;

      const nodemailer = require('nodemailer');
      
      const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test123' });
      const mockTransporter = {
        sendMail: mockSendMail
      };
      
      jest.spyOn(nodemailer, 'createTransport').mockReturnValue(mockTransporter);

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      await authService.sendOTP('test@example.com');

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        service: 'gmail',
        auth: {
          user: 'your-email@gmail.com',
          pass: 'your-app-password'
        }
      });
    });
  });

  describe('Advanced OTP scenarios', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    it('should handle OTP expiration correctly', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      // Send OTP first
      await authService.sendOTP('test@example.com');

      // Mock Date.now to simulate time passing beyond expiration
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + (6 * 60 * 1000)); // 6 minutes later (expired)

      try {
        await authService.verifyOTP('test@example.com', '123456');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe('Mã OTP đã hết hạn');
      }

      // Restore
      Date.now = originalDateNow;
    });

    it('should successfully verify valid OTP within time limit', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      // Mock OTP generation for predictable result
      const originalMathRandom = Math.random;
      Math.random = jest.fn(() => 0.123456); // This generates OTP "211110"

      await authService.sendOTP('test@example.com');

      const result = await authService.verifyOTP('test@example.com', '211110');

      expect(result.message).toBe('Xác thực OTP thành công');
      expect(result.resetToken).toBeTruthy();
      expect(typeof result.resetToken).toBe('string');

      // Restore
      Math.random = originalMathRandom;
    });

    it('should handle crypto.randomBytes for reset token generation', async () => {
      const crypto = require('crypto');
      const originalRandomBytes = crypto.randomBytes;
      
      crypto.randomBytes = jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue('mockedResetToken123')
      });

      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      // Setup OTP
      const originalMathRandom = Math.random;
      Math.random = jest.fn(() => 0.123456);
      await authService.sendOTP('test@example.com');

      const result = await authService.verifyOTP('test@example.com', '211110');

      expect(crypto.randomBytes).toHaveBeenCalledWith(32);
      expect(result.resetToken).toBe('mockedResetToken123');

      // Restore
      crypto.randomBytes = originalRandomBytes;
      Math.random = originalMathRandom;
    });
  });

  describe('Advanced resetPassword scenarios', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    it('should handle reset token expiration', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);
      userModel.updateUserPassword.mockResolvedValue({ affectedRows: 1 });

      // Setup OTP and get reset token
      const originalMathRandom = Math.random;
      Math.random = jest.fn(() => 0.123456);
      await authService.sendOTP('test@example.com');
      const verifyResult = await authService.verifyOTP('test@example.com', '211110');

      // Mock Date.now to simulate time passing beyond reset token expiration
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => originalDateNow() + (16 * 60 * 1000)); // 16 minutes later (expired)

      try {
        await authService.resetPassword('test@example.com', 'newPassword123', verifyResult.resetToken);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error.message).toBe('Token đã hết hạn');
      }

      // Restore
      Date.now = originalDateNow;
      Math.random = originalMathRandom;
    });

    it('should successfully reset password with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);
      userModel.updateUserPassword.mockResolvedValue({ affectedRows: 1 });
      bcrypt.hash.mockResolvedValue('hashedNewPassword123');

      // Setup OTP and get reset token
      const originalMathRandom = Math.random;
      Math.random = jest.fn(() => 0.123456);
      await authService.sendOTP('test@example.com');
      const verifyResult = await authService.verifyOTP('test@example.com', '211110');

      const result = await authService.resetPassword('test@example.com', 'newPassword123', verifyResult.resetToken);

      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
      expect(userModel.updateUserPassword).toHaveBeenCalledWith(1, 'hashedNewPassword123');
      expect(result.message).toBe('Đặt lại mật khẩu thành công');

      // Restore
      Math.random = originalMathRandom;
    });

    it('should clean up reset token after successful password reset', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);
      userModel.updateUserPassword.mockResolvedValue({ affectedRows: 1 });
      bcrypt.hash.mockResolvedValue('hashedNewPassword123');

      // Setup complete flow
      const originalMathRandom = Math.random;
      Math.random = jest.fn(() => 0.123456);
      await authService.sendOTP('test@example.com');
      const verifyResult = await authService.verifyOTP('test@example.com', '211110');
      
      await authService.resetPassword('test@example.com', 'newPassword123', verifyResult.resetToken);

      // Try to use the same token again - should fail
      try {
        await authService.resetPassword('test@example.com', 'anotherPassword', verifyResult.resetToken);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe('Token không hợp lệ hoặc đã hết hạn');
      }

      // Restore
      Math.random = originalMathRandom;
    });

    it('should handle bcrypt error during password hashing', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);
      bcrypt.hash.mockRejectedValue(new Error('Bcrypt hashing failed'));

      // Setup OTP and get reset token
      const originalMathRandom = Math.random;
      Math.random = jest.fn(() => 0.123456);
      await authService.sendOTP('test@example.com');
      const verifyResult = await authService.verifyOTP('test@example.com', '211110');

      await expect(authService.resetPassword('test@example.com', 'newPassword123', verifyResult.resetToken))
        .rejects.toThrow('Bcrypt hashing failed');

      // Restore
      Math.random = originalMathRandom;
    });

    it('should handle database update error', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);
      userModel.updateUserPassword.mockRejectedValue(new Error('Database update failed'));
      bcrypt.hash.mockResolvedValue('hashedNewPassword123');

      // Setup OTP and get reset token
      const originalMathRandom = Math.random;
      Math.random = jest.fn(() => 0.123456);
      await authService.sendOTP('test@example.com');
      const verifyResult = await authService.verifyOTP('test@example.com', '211110');

      await expect(authService.resetPassword('test@example.com', 'newPassword123', verifyResult.resetToken))
        .rejects.toThrow('Database update failed');

      // Restore
      Math.random = originalMathRandom;
    });
  });

  describe('Email masking edge cases', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      console.log.mockRestore();
    });

    it('should handle emails with different formats for masking', async () => {
      const testCases = [
        { input: 'ab@example.com', expected: 'ab***@example.com' },
        { input: 'abc@example.com', expected: 'ab***@example.com' },
        { input: 'verylongemail@example.com', expected: 've***@example.com' },
        { input: 'user123@domain.co.uk', expected: 'us***@domain.co.uk' }
      ];

      const mockUser = {
        id: 1,
        username: 'testuser'
      };

      for (const testCase of testCases) {
        mockUser.email = testCase.input;
        userModel.getUserByEmail.mockResolvedValue(mockUser);

        const result = await authService.sendOTP(testCase.input);
        
        expect(result.email).toBe(testCase.expected);
      }
    });

    it('should handle single character email local part', async () => {
      const mockUser = {
        id: 1,
        email: 'a@example.com',
        username: 'testuser'
      };
      userModel.getUserByEmail.mockResolvedValue(mockUser);

      const result = await authService.sendOTP('a@example.com');

      // Single character won't match the regex pattern (.{2})(.*)(@.*)
      expect(result.email).toBe('a@example.com');
    });
  });
});
