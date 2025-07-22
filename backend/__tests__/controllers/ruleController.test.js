const ruleController = require('../../controllers/ruleController');
const ruleService = require('../../services/ruleService');
const { createMockRequest, createMockResponse } = require('../helpers/testHelpers');

// Mock the service
jest.mock('../../services/ruleService');

describe('RuleController', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getRules', () => {
    it('should get rules successfully', async () => {
      const mockRules = [
        { id: 1, name: 'Số lượng tồn kho tối thiểu', value: 10 },
        { id: 2, name: 'Số lượng nhập tối thiểu', value: 150 },
        { id: 3, name: 'Thời gian tồn kho tối đa', value: 24 }
      ];

      ruleService.getRules.mockResolvedValue(mockRules);

      await ruleController.getRules(req, res);

      expect(ruleService.getRules).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockRules);
    });

    it('should handle errors with status code', async () => {
      const error = new Error('Rules not found');
      error.status = 404;
      
      ruleService.getRules.mockRejectedValue(error);

      await ruleController.getRules(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Rules not found'
      });
    });

    it('should handle general errors', async () => {
      ruleService.getRules.mockRejectedValue(new Error('Database error'));

      await ruleController.getRules(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Database error'
      });
    });

    it('should handle errors without message', async () => {
      const error = new Error();
      ruleService.getRules.mockRejectedValue(error);

      await ruleController.getRules(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi khi lấy quy định'
      });
    });
  });

  describe('updateRules', () => {
    it('should update rules successfully', async () => {
      const rulesData = [
        { id: 1, value: 15 },
        { id: 2, value: 200 }
      ];
      const updateResult = { 
        success: true, 
        message: 'Cập nhật quy định thành công',
        updatedRules: rulesData
      };

      req.body = rulesData;
      ruleService.updateRules.mockResolvedValue(updateResult);

      await ruleController.updateRules(req, res);

      expect(ruleService.updateRules).toHaveBeenCalledWith(rulesData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updateResult);
    });

    it('should handle update errors with status code', async () => {
      req.body = [{ id: 1, value: -5 }]; // Invalid value
      const error = new Error('Giá trị quy định không hợp lệ');
      error.status = 400;

      ruleService.updateRules.mockRejectedValue(error);

      await ruleController.updateRules(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Giá trị quy định không hợp lệ'
      });
    });

    it('should handle general update errors', async () => {
      req.body = [{ id: 1, value: 20 }];
      ruleService.updateRules.mockRejectedValue(new Error('Database connection failed'));

      await ruleController.updateRules(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Database connection failed'
      });
    });

    it('should handle errors without message', async () => {
      req.body = [{ id: 1, value: 20 }];
      const error = new Error();
      ruleService.updateRules.mockRejectedValue(error);

      await ruleController.updateRules(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi khi cập nhật quy định'
      });
    });

    it('should handle empty rules data', async () => {
      req.body = [];
      const updateResult = { 
        success: true, 
        message: 'Không có quy định nào để cập nhật'
      };

      ruleService.updateRules.mockResolvedValue(updateResult);

      await ruleController.updateRules(req, res);

      expect(ruleService.updateRules).toHaveBeenCalledWith([]);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updateResult);
    });
  });
});
