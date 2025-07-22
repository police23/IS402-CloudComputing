const ruleService = require('../../services/ruleService');
const ruleModel = require('../../models/ruleModel');

// Mock dependencies
jest.mock('../../models/ruleModel');

describe('RuleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRules', () => {
    it('should get rules successfully', async () => {
      const mockRules = {
        id: 1,
        min_import_quantity: 150,
        min_stock_before_import: 300,
        min_stock_after_sale: 20,
        max_promotion_duration: 30
      };
      ruleModel.getRules.mockResolvedValue(mockRules);

      const result = await ruleService.getRules();

      expect(ruleModel.getRules).toHaveBeenCalled();
      expect(result).toEqual(mockRules);
    });

    it('should throw error when rules not found', async () => {
      ruleModel.getRules.mockResolvedValue(null);

      await expect(ruleService.getRules()).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy quy định'
      });
    });

    it('should throw error when rules is undefined', async () => {
      ruleModel.getRules.mockResolvedValue(undefined);

      await expect(ruleService.getRules()).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy quy định'
      });
    });
  });

  describe('updateRules', () => {
    it('should update rules successfully', async () => {
      const ruleData = {
        min_import_quantity: 200,
        min_stock_before_import: 400,
        min_stock_after_sale: 30,
        max_promotion_duration: 45
      };
      ruleModel.updateRules.mockResolvedValue({ affectedRows: 1 });

      const result = await ruleService.updateRules(ruleData);

      expect(ruleModel.updateRules).toHaveBeenCalledWith(ruleData);
      expect(result).toEqual({ message: 'Cập nhật quy định thành công' });
    });

    it('should throw error when min_import_quantity is negative', async () => {
      const ruleData = {
        min_import_quantity: -1,
        min_stock_before_import: 400,
        min_stock_after_sale: 30,
        max_promotion_duration: 45
      };

      await expect(ruleService.updateRules(ruleData)).rejects.toMatchObject({
        status: 400,
        message: 'Dữ liệu không hợp lệ'
      });
    });

    it('should throw error when min_stock_before_import is negative', async () => {
      const ruleData = {
        min_import_quantity: 200,
        min_stock_before_import: -1,
        min_stock_after_sale: 30,
        max_promotion_duration: 45
      };

      await expect(ruleService.updateRules(ruleData)).rejects.toMatchObject({
        status: 400,
        message: 'Dữ liệu không hợp lệ'
      });
    });

    it('should throw error when min_stock_after_sale is negative', async () => {
      const ruleData = {
        min_import_quantity: 200,
        min_stock_before_import: 400,
        min_stock_after_sale: -1,
        max_promotion_duration: 45
      };

      await expect(ruleService.updateRules(ruleData)).rejects.toMatchObject({
        status: 400,
        message: 'Dữ liệu không hợp lệ'
      });
    });

    it('should throw error when max_promotion_duration is less than 1', async () => {
      const ruleData = {
        min_import_quantity: 200,
        min_stock_before_import: 400,
        min_stock_after_sale: 30,
        max_promotion_duration: 0
      };

      await expect(ruleService.updateRules(ruleData)).rejects.toMatchObject({
        status: 400,
        message: 'Dữ liệu không hợp lệ'
      });
    });

    it('should allow zero values for import and stock quantities', async () => {
      const ruleData = {
        min_import_quantity: 0,
        min_stock_before_import: 0,
        min_stock_after_sale: 0,
        max_promotion_duration: 1
      };
      ruleModel.updateRules.mockResolvedValue({ affectedRows: 1 });

      const result = await ruleService.updateRules(ruleData);

      expect(result).toEqual({ message: 'Cập nhật quy định thành công' });
    });

    it('should throw error when no rules found to update', async () => {
      const ruleData = {
        min_import_quantity: 200,
        min_stock_before_import: 400,
        min_stock_after_sale: 30,
        max_promotion_duration: 45
      };
      ruleModel.updateRules.mockResolvedValue({ affectedRows: 0 });

      await expect(ruleService.updateRules(ruleData)).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy quy định để cập nhật'
      });
    });

    it('should handle database errors', async () => {
      const ruleData = {
        min_import_quantity: 200,
        min_stock_before_import: 400,
        min_stock_after_sale: 30,
        max_promotion_duration: 45
      };
      ruleModel.updateRules.mockRejectedValue(new Error('Database connection failed'));

      await expect(ruleService.updateRules(ruleData)).rejects.toThrow('Database connection failed');
    });
  });
});
