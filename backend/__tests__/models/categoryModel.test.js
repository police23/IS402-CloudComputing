const categoryModel = require('../../models/categoryModel');
const db = require('../../db');

// Mock the database
jest.mock('../../db');

describe('CategoryModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories from database', async () => {
      const mockCategories = [
        { id: 1, name: 'Văn học', description: 'Sách văn học', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: 2, name: 'Khoa học', description: 'Sách khoa học', created_at: '2024-01-01', updated_at: '2024-01-01' }
      ];

      // Mock db.query to return [rows, fields] format
      db.query.mockResolvedValue([mockCategories, []]);

      const result = await categoryModel.getAllCategories();

      expect(db.query).toHaveBeenCalledWith('SELECT id, name, description, created_at, updated_at FROM categories');
      expect(result).toEqual(mockCategories);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      db.query.mockRejectedValue(error);

      await expect(categoryModel.getAllCategories()).rejects.toThrow('Database connection failed');
      expect(db.query).toHaveBeenCalledWith('SELECT id, name, description, created_at, updated_at FROM categories');
    });

    it('should return empty array when no categories exist', async () => {
      db.query.mockResolvedValue([[], []]);

      const result = await categoryModel.getAllCategories();

      expect(result).toEqual([]);
      expect(db.query).toHaveBeenCalledWith('SELECT id, name, description, created_at, updated_at FROM categories');
    });

    it('should handle malformed database response', async () => {
      // Test case where db.query returns unexpected format
      db.query.mockResolvedValue(null);

      await expect(categoryModel.getAllCategories()).rejects.toThrow();
    });
  });
});
