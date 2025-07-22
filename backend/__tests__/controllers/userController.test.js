const userController = require('../../controllers/userController');
const userService = require('../../services/userService');
const { createMockRequest, createMockResponse } = require('../helpers/testHelpers');

// Mock the service
jest.mock('../../services/userService');

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com', role: 'user' },
        { id: 2, username: 'user2', email: 'user2@example.com', role: 'admin' }
      ];

      userService.getAllUsers.mockResolvedValue(mockUsers);

      await userController.getAllUsers(req, res);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors when getting users', async () => {
      userService.getAllUsers.mockRejectedValue(new Error('Database error'));

      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch users'
      });
    });
  });

  describe('getUser', () => {
    it('should get user by id successfully', async () => {
      const userId = '1';
      const mockUser = { id: 1, username: 'user1', email: 'user1@example.com' };

      req.params = { id: userId };
      userService.getUserById.mockResolvedValue(mockUser);

      await userController.getUser(req, res);

      expect(userService.getUserById).toHaveBeenCalledWith(userId);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle user not found', async () => {
      req.params = { id: '999' };
      const error = new Error('User not found');
      error.status = 404;

      userService.getUserById.mockRejectedValue(error);

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('should handle general errors', async () => {
      req.params = { id: '1' };
      userService.getUserById.mockRejectedValue(new Error('Database error'));

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('addUser', () => {
    it('should add user successfully', async () => {
      const newUserData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'user'
      };
      const createdUser = { id: 3, ...newUserData };

      req.body = newUserData;
      userService.addUser.mockResolvedValue(createdUser);

      await userController.addUser(req, res);

      expect(userService.addUser).toHaveBeenCalledWith(newUserData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdUser);
    });

    it('should handle add user errors with status', async () => {
      req.body = { username: '', email: 'test@example.com' };
      const error = new Error('Username is required');
      error.status = 400;

      userService.addUser.mockRejectedValue(error);

      await userController.addUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Username is required'
      });
    });

    it('should handle general add user errors', async () => {
      req.body = { username: 'test' };
      userService.addUser.mockRejectedValue(new Error('Database error'));

      await userController.addUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = '1';
      const updateData = { email: 'updated@example.com' };
      const updatedUser = { id: 1, username: 'user1', email: 'updated@example.com' };

      req.params = { id: userId };
      req.body = updateData;
      userService.updateUser.mockResolvedValue(updatedUser);

      await userController.updateUser(req, res);

      expect(userService.updateUser).toHaveBeenCalledWith(userId, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should handle update user errors with status', async () => {
      req.params = { id: '999' };
      req.body = { email: 'test@example.com' };
      const error = new Error('User not found');
      error.status = 404;

      userService.updateUser.mockRejectedValue(error);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('should handle general update errors', async () => {
      req.params = { id: '1' };
      req.body = { email: 'test@example.com' };
      userService.updateUser.mockRejectedValue(new Error('Database error'));

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const userId = '1';
      const deleteResult = { success: true, message: 'User deleted successfully' };

      req.params = { id: userId };
      userService.deleteUser.mockResolvedValue(deleteResult);

      await userController.deleteUser(req, res);

      expect(userService.deleteUser).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(deleteResult);
    });

    it('should handle delete user errors', async () => {
      req.params = { id: '999' };
      const error = new Error('User not found');
      error.status = 404;

      userService.deleteUser.mockRejectedValue(error);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });
  });

  describe('toggleAccountStatus', () => {
    it('should toggle account status successfully', async () => {
      const userId = '1';      const status = { is_active: false };
      const toggleResult = { success: true, message: 'Account status updated' };

      req.params = { id: userId };
      req.body = { status };
      userService.toggleAccountStatus.mockResolvedValue(toggleResult);

      await userController.toggleAccountStatus(req, res);

      expect(userService.toggleAccountStatus).toHaveBeenCalledWith(userId, status); // Sửa ở đây
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(toggleResult);
    });

    it('should handle toggle status errors', async () => {
      req.params = { id: '999' };
      req.body = { status: { is_active: false } };
      const error = new Error('User not found');
      error.status = 404;

      userService.toggleAccountStatus.mockRejectedValue(error);

      await userController.toggleAccountStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = '1';
      const passwordData = {
        currentPassword: 'oldpass',
        newPassword: 'newpass123'
      };
      const changeResult = { success: true, message: 'Password changed successfully' };

      req.params = { id: userId };
      req.body = passwordData;
      userService.changePassword.mockResolvedValue(changeResult);

      await userController.changePassword(req, res);

      expect(userService.changePassword).toHaveBeenCalledWith(
        userId, 
        passwordData.currentPassword, 
        passwordData.newPassword
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(changeResult);
    });

    it('should handle incorrect current password', async () => {
      req.params = { id: '1' };
      req.body = { currentPassword: 'wrongpass', newPassword: 'newpass' };
      const error = new Error('Current password is incorrect');
      error.status = 400;

      userService.changePassword.mockRejectedValue(error);

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Current password is incorrect'
      });
    });

    it('should handle general password change errors', async () => {
      req.params = { id: '1' };
      req.body = { currentPassword: 'oldpass', newPassword: 'newpass' };
      userService.changePassword.mockRejectedValue(new Error('Database error'));

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });

    it('should handle error without status code in password change', async () => {
      req.params = { id: '1' };
      req.body = { currentPassword: 'oldpass', newPassword: 'newpass' };
      
      // Error without status property
      const errorWithoutStatus = new Error('Some error');
      delete errorWithoutStatus.status; // Ensure no status
      userService.changePassword.mockRejectedValue(errorWithoutStatus);

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500); // Should default to 500
      expect(res.json).toHaveBeenCalledWith({
        error: 'Some error'
      });
    });

    it('should handle error without message in password change', async () => {
      req.params = { id: '1' };
      req.body = { currentPassword: 'oldpass', newPassword: 'newpass' };
      
      // Error without message property
      const errorWithoutMessage = {};
      errorWithoutMessage.status = 400;
      userService.changePassword.mockRejectedValue(errorWithoutMessage);

      await userController.changePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Server error when changing password' // Should use default message
      });
    });
  });

  // Additional test cases for missing coverage branches
  describe('Error handling edge cases', () => {
    it('should handle getUserById error without status', async () => {
      req.params = { id: '1' };
      const errorWithoutStatus = new Error('Database connection failed');
      delete errorWithoutStatus.status;
      userService.getUserById.mockRejectedValue(errorWithoutStatus);

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database connection failed'
      });
    });

    it('should handle getUserById error without message', async () => {
      req.params = { id: '1' };
      const errorWithoutMessage = {};
      errorWithoutMessage.status = 404;
      userService.getUserById.mockRejectedValue(errorWithoutMessage);

      await userController.getUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch user' // Default message
      });
    });

    it('should handle addUser error without message', async () => {
      req.body = { username: 'testuser' };
      const errorWithoutMessage = {};
      errorWithoutMessage.status = 400;
      userService.addUser.mockRejectedValue(errorWithoutMessage);

      await userController.addUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Không thể thêm tài khoản' // Default message
      });
    });

    it('should handle deleteUser error without status', async () => {
      req.params = { id: '1' };
      const errorWithoutStatus = new Error('Delete failed');
      delete errorWithoutStatus.status;
      userService.deleteUser.mockRejectedValue(errorWithoutStatus);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Delete failed'
      });
    });

    it('should handle deleteUser error without message', async () => {
      req.params = { id: '1' };
      const errorWithoutMessage = {};
      errorWithoutMessage.status = 403;
      userService.deleteUser.mockRejectedValue(errorWithoutMessage);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to delete user' // Default message
      });
    });

    it('should handle toggleAccountStatus error without status', async () => {
      req.params = { id: '1' };
      req.body = { status: true };
      const errorWithoutStatus = new Error('Toggle failed');
      delete errorWithoutStatus.status;
      userService.toggleAccountStatus.mockRejectedValue(errorWithoutStatus);

      await userController.toggleAccountStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Toggle failed'
      });
    });

    it('should handle toggleAccountStatus error without message', async () => {
      req.params = { id: '1' };
      req.body = { status: true };
      const errorWithoutMessage = {};
      errorWithoutMessage.status = 400;
      userService.toggleAccountStatus.mockRejectedValue(errorWithoutMessage);

      await userController.toggleAccountStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to toggle account status' // Default message
      });
    });
  });
});
