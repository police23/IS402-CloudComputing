const authMiddleware = require('../../middlewares/authMiddleware');
const authService = require('../../services/authService');
const userModel = require('../../models/userModel');

// Mock dependencies
jest.mock('../../services/authService');
jest.mock('../../models/userModel');

describe('AuthMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn()
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should successfully verify valid token and active user', async () => {
      const mockDecoded = {
        id: 1,
        username: 'testuser',
        role_id: 2
      };
      const mockUser = {
        id: 1,
        username: 'testuser',
        is_active: 1
      };

      req.header.mockReturnValue('Bearer valid-jwt-token');
      authService.verifyToken.mockReturnValue(mockDecoded);
      userModel.getUserById.mockResolvedValue(mockUser);

      await authMiddleware.verifyToken(req, res, next);

      expect(authService.verifyToken).toHaveBeenCalledWith('valid-jwt-token');
      expect(userModel.getUserById).toHaveBeenCalledWith(1);
      expect(req.user).toEqual(mockDecoded);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle missing authorization header', async () => {
      req.header.mockReturnValue(undefined);
      authService.verifyToken.mockImplementation(() => {
        throw new Error('Không tìm thấy token xác thực');
      });

      await authMiddleware.verifyToken(req, res, next);

      expect(authService.verifyToken).toHaveBeenCalledWith(undefined);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy token xác thực' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle invalid token', async () => {
      req.header.mockReturnValue('Bearer invalid-token');
      authService.verifyToken.mockImplementation(() => {
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
      });

      await authMiddleware.verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token không hợp lệ hoặc đã hết hạn' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle user not found', async () => {
      const mockDecoded = {
        id: 999,
        username: 'nonexistent',
        role_id: 2
      };

      req.header.mockReturnValue('Bearer valid-jwt-token');
      authService.verifyToken.mockReturnValue(mockDecoded);
      userModel.getUserById.mockResolvedValue(null);

      await authMiddleware.verifyToken(req, res, next);

      expect(userModel.getUserById).toHaveBeenCalledWith(999);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy thông tin người dùng' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle inactive user account', async () => {
      const mockDecoded = {
        id: 1,
        username: 'testuser',
        role_id: 2
      };
      const mockUser = {
        id: 1,
        username: 'testuser',
        is_active: 0
      };

      req.header.mockReturnValue('Bearer valid-jwt-token');
      authService.verifyToken.mockReturnValue(mockDecoded);
      userModel.getUserById.mockResolvedValue(mockUser);

      await authMiddleware.verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle token without Bearer prefix', async () => {
      req.header.mockReturnValue('just-token-without-bearer');
      authService.verifyToken.mockImplementation(() => {
        throw new Error('Token không hợp lệ hoặc đã hết hạn');
      });

      await authMiddleware.verifyToken(req, res, next);

      expect(authService.verifyToken).toHaveBeenCalledWith('just-token-without-bearer');
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should handle database errors when getting user', async () => {
      const mockDecoded = {
        id: 1,
        username: 'testuser',
        role_id: 2
      };

      req.header.mockReturnValue('Bearer valid-jwt-token');
      authService.verifyToken.mockReturnValue(mockDecoded);
      userModel.getUserById.mockRejectedValue(new Error('Database connection failed'));

      await authMiddleware.verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database connection failed' });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
