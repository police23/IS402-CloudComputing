const categoryService = require('../../services/categoryService');
const categoryModel = require('../../models/categoryModel');

// Mock the model
jest.mock('../../models/categoryModel');

describe('CategoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories from model', async () => {
      const mockCategories = [
        { id: 1, name: 'Văn học', description: 'Sách văn học' },
        { id: 2, name: 'Khoa học', description: 'Sách khoa học' }
      ];

      categoryModel.getAllCategories.mockResolvedValue(mockCategories);

      const result = await categoryService.getAllCategories();

      expect(categoryModel.getAllCategories).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });

    it('should handle errors from model', async () => {
      const error = new Error('Database error');
      categoryModel.getAllCategories.mockRejectedValue(error);

      await expect(categoryService.getAllCategories()).rejects.toThrow('Database error');
      expect(categoryModel.getAllCategories).toHaveBeenCalled();
    });

    it('should return empty array when no categories', async () => {
      categoryModel.getAllCategories.mockResolvedValue([]);

      const result = await categoryService.getAllCategories();

      expect(result).toEqual([]);
      expect(categoryModel.getAllCategories).toHaveBeenCalled();
    });
  });
});
