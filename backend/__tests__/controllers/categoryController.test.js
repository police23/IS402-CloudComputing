const categoryController = require('../../controllers/categoryController');
const categoryService = require('../../services/categoryService');
const { createMockRequest, createMockResponse } = require('../helpers/testHelpers');

// Mock the service
jest.mock('../../services/categoryService');

describe('CategoryController', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should get all categories successfully', async () => {
      const mockCategories = [
        { id: 1, name: 'Văn học', description: 'Sách văn học' },
        { id: 2, name: 'Khoa học', description: 'Sách khoa học' },
        { id: 3, name: 'Giáo dục', description: 'Sách giáo dục' }
      ];

      categoryService.getAllCategories.mockResolvedValue(mockCategories);

      await categoryController.getAllCategories(req, res);

      expect(categoryService.getAllCategories).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockCategories);
    });

    it('should handle errors when getting categories', async () => {
      categoryService.getAllCategories.mockRejectedValue(new Error('Database connection failed'));

      await categoryController.getAllCategories(req, res);

      expect(categoryService.getAllCategories).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch categories'
      });
    });

    it('should handle empty categories list', async () => {
      categoryService.getAllCategories.mockResolvedValue([]);

      await categoryController.getAllCategories(req, res);

      expect(categoryService.getAllCategories).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
});
