const userModel = require('../../models/userModel');
const db = require('../../db');

// Mock the database
jest.mock('../../db');

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'user1',
          full_name: 'User One',
          email: 'user1@example.com',
          phone: '0123456789',
          gender: 1,
          role_id: 2,
          is_active: 1,
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          username: 'user2',
          full_name: 'User Two',
          email: 'user2@example.com',
          phone: '0987654321',
          gender: 0,
          role_id: 1,
          is_active: 1,
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      db.query.mockResolvedValue([mockUsers]);

      const result = await userModel.getAllUsers();

      expect(db.query).toHaveBeenCalledWith(
        "SELECT id, username, full_name, email, phone, gender, role_id, is_active, created_at, updated_at FROM users"
      );
      expect(result).toEqual(mockUsers);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValue(dbError);

      await expect(userModel.getAllUsers()).rejects.toThrow('Database connection failed');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = {
        username: 'newuser',
        password: 'hashedpassword',
        full_name: 'New User',
        email: 'new@example.com',
        phone: '0123456789',
        gender: 1,
        role_id: 2,
        is_active: 1
      };

      const mockResult = { insertId: 123, affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await userModel.createUser(userData);

      expect(db.query).toHaveBeenCalledWith(
        `INSERT INTO users (username, password, full_name, email, phone, gender, role_id, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['newuser', 'hashedpassword', 'New User', 'new@example.com', '0123456789', 1, 2, 1]
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle database errors during creation', async () => {
      const userData = {
        username: 'newuser',
        password: 'hashedpassword',
        full_name: 'New User',
        email: 'new@example.com',
        phone: '0123456789',
        gender: 1,
        role_id: 2,
        is_active: 1
      };

      const dbError = new Error('Duplicate entry');
      db.query.mockRejectedValue(dbError);

      await expect(userModel.createUser(userData)).rejects.toThrow('Duplicate entry');
    });
  });

  describe('getUserById', () => {
    it('should get user by id successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '0123456789',
        gender: 1,
        role_id: 2,
        is_active: 1,
        created_at: '2024-01-01'
      };

      db.query.mockResolvedValue([[mockUser]]);

      const result = await userModel.getUserById(1);

      expect(db.query).toHaveBeenCalledWith(
        "SELECT id, username, full_name, email, phone, gender, role_id, is_active, created_at FROM users WHERE id = ?",
        [1]
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await userModel.getUserById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database error');
      db.query.mockRejectedValue(dbError);

      await expect(userModel.getUserById(1)).rejects.toThrow('Database error');
    });
  });

  describe('getUserByEmail', () => {
    it('should get user by email successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '0123456789',
        gender: 1,
        role_id: 2,
        is_active: 1,
        created_at: '2024-01-01'
      };

      db.query.mockResolvedValue([[mockUser]]);

      const result = await userModel.getUserByEmail('test@example.com');

      expect(db.query).toHaveBeenCalledWith(
        "SELECT id, username, full_name, email, phone, gender, role_id, is_active, created_at FROM users WHERE email = ?",
        ['test@example.com']
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await userModel.getUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should handle database errors when getting user by email', async () => {
      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValue(dbError);

      await expect(userModel.getUserByEmail('test@example.com')).rejects.toThrow('Database connection failed');
    });
  });

  describe('updateUserPassword', () => {
    it('should update user password successfully', async () => {
      const mockResult = { affectedRows: 1, changedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await userModel.updateUserPassword(1, 'newhashed123');

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        ['newhashed123', 1]
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle no rows affected when updating password', async () => {
      const mockResult = { affectedRows: 0, changedRows: 0 };
      db.query.mockResolvedValue([mockResult]);

      const result = await userModel.updateUserPassword(999, 'newhashed123');

      expect(result).toEqual(mockResult);
    });

    it('should handle database errors when updating password', async () => {
      const dbError = new Error('Database constraint violation');
      db.query.mockRejectedValue(dbError);

      await expect(userModel.updateUserPassword(1, 'newhashed123')).rejects.toThrow('Database constraint violation');
    });

    it('should handle empty password parameter', async () => {
      const mockResult = {
        affectedRows: 1,
        changedRows: 1
      };

      db.query.mockResolvedValue([mockResult]);

      await userModel.updateUserPassword(1, '');

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        ['', 1]
      );
    });

    it('should handle null password parameter', async () => {
      const mockResult = {
        affectedRows: 1,
        changedRows: 1
      };

      db.query.mockResolvedValue([mockResult]);

      await userModel.updateUserPassword(1, null);

      expect(db.query).toHaveBeenCalledWith(
        "UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [null, 1]
      );
    });

    it('should handle concurrent update scenarios', async () => {
      const mockResult = {
        affectedRows: 1,
        changedRows: 0 // Password was the same
      };

      db.query.mockResolvedValue([mockResult]);

      const result = await userModel.updateUserPassword(1, 'samehashpassword');

      expect(result.affectedRows).toBe(1);
      expect(result.changedRows).toBe(0);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle database connection timeout in getAllUsers', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.code = 'ETIMEDOUT';
      db.query.mockRejectedValue(timeoutError);

      await expect(userModel.getAllUsers()).rejects.toThrow('Connection timeout');
    });

    it('should handle database connection timeout in getUserById', async () => {
      const timeoutError = new Error('Connection timeout');
      timeoutError.code = 'ETIMEDOUT';
      db.query.mockRejectedValue(timeoutError);

      await expect(userModel.getUserById(1)).rejects.toThrow('Connection timeout');
    });

    it('should handle malformed SQL query error in createUser', async () => {
      const userData = {
        username: 'testuser',
        password: 'hashedpassword',
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '0123456789',
        gender: 1,
        role_id: 2,
        is_active: 1
      };

      const sqlError = new Error('You have an error in your SQL syntax');
      sqlError.code = 'ER_PARSE_ERROR';
      db.query.mockRejectedValue(sqlError);

      await expect(userModel.createUser(userData)).rejects.toThrow('You have an error in your SQL syntax');
    });

    it('should handle constraint violation in createUser', async () => {
      const userData = {
        username: 'testuser',
        password: 'hashedpassword',
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '0123456789',
        gender: 1,
        role_id: 999, // Invalid role_id
        is_active: 1
      };

      const constraintError = new Error('Cannot add or update a child row: a foreign key constraint fails');
      constraintError.code = 'ER_NO_REFERENCED_ROW_2';
      db.query.mockRejectedValue(constraintError);

      await expect(userModel.createUser(userData)).rejects.toThrow('Cannot add or update a child row: a foreign key constraint fails');
    });

    it('should handle very large dataset in getAllUsers', async () => {
      // Mock a large dataset
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i + 1,
        username: `user${i + 1}`,
        full_name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        phone: `012345678${i % 10}`,
        gender: i % 2,
        role_id: (i % 3) + 1,
        is_active: 1,
        created_at: '2023-01-01 00:00:00',
        updated_at: '2023-01-01 00:00:00'
      }));

      db.query.mockResolvedValue([largeDataset]);

      const result = await userModel.getAllUsers();

      expect(result).toHaveLength(10000);
      expect(result[0].username).toBe('user1');
      expect(result[9999].username).toBe('user10000');
    });

    it('should handle special characters in user data', async () => {
      const userDataWithSpecialChars = {
        username: 'user@#$%',
        password: 'pass!@#$%^&*()',
        full_name: 'Nguyễn Văn Á',
        email: 'test+tag@example.com',
        phone: '+84-123-456-789',
        gender: 1,
        role_id: 2,
        is_active: 1
      };

      const mockResult = { insertId: 1, affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await userModel.createUser(userDataWithSpecialChars);

      expect(result).toEqual(mockResult);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([
          'user@#$%',
          'pass!@#$%^&*()',
          'Nguyễn Văn Á',
          'test+tag@example.com',
          '+84-123-456-789',
          1,
          2,
          1
        ])
      );
    });
  });
});
