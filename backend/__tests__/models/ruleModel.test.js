const ruleModel = require('../../models/ruleModel');
const db = require('../../db');

// Mock the database
jest.mock('../../db');

describe('RuleModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRules', () => {
    it('should get rules successfully', async () => {
      const mockRules = [
        {
          id: 1,
          min_import_quantity: 150,
          min_stock_before_import: 300,
          max_promotion_duration: 30
        }
      ];

      db.query.mockResolvedValue([mockRules]);

      const result = await ruleModel.getRules();

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM rules LIMIT 1');
      expect(result).toEqual(mockRules[0]);
    });

    it('should return undefined when no rules found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await ruleModel.getRules();

      expect(result).toBeUndefined();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValue(dbError);

      await expect(ruleModel.getRules()).rejects.toThrow('Database connection failed');
    });
  });

  describe('updateRules', () => {
    it('should update rules successfully', async () => {
      const ruleData = {
        min_import_quantity: 200,
        min_stock_before_import: 400,
        max_promotion_duration: 45
      };

      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await ruleModel.updateRules(ruleData);      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE rules'),
        [200, 400, 45]
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle partial rule updates', async () => {
      const ruleData = {
        min_import_quantity: 100,
        min_stock_before_import: undefined,
        max_promotion_duration: 60
      };

      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await ruleModel.updateRules(ruleData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE rules'),
        [100, undefined, 60]
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle database errors during update', async () => {
      const ruleData = {
        min_import_quantity: 150,
        min_stock_before_import: 300,
        max_promotion_duration: 30
      };

      const dbError = new Error('Database update failed');
      db.query.mockRejectedValue(dbError);

      await expect(ruleModel.updateRules(ruleData)).rejects.toThrow('Database update failed');
    });

    it('should return result when no rows affected', async () => {
      const ruleData = {
        min_import_quantity: 150,
        min_stock_before_import: 300,
        max_promotion_duration: 30
      };

      const mockResult = { affectedRows: 0 };
      db.query.mockResolvedValue([mockResult]);

      const result = await ruleModel.updateRules(ruleData);

      expect(result).toEqual(mockResult);
    });
  });
});
