const promotionModel = require('../../models/promotionModel');
const db = require('../../db');

// Mock the database
jest.mock('../../db');

describe('PromotionModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPromotions', () => {
    it('should get all promotions successfully', async () => {
      const mockPromotions = [
        {
          id: 1,
          promotion_code: 'KM01',
          name: 'Summer Sale',
          type: 'percentage',
          discount: 10,
          start_date: '2024-06-01',
          end_date: '2024-06-30',
          min_price: 100000,
          quantity: 100,
          used_quantity: 5
        },
        {
          id: 2,
          promotion_code: 'KM02',
          name: 'Fixed Discount',
          type: 'fixed',
          discount: 50000,
          start_date: '2024-07-01',
          end_date: '2024-07-31',
          min_price: 200000,
          quantity: null,
          used_quantity: 0
        }
      ];

      db.query.mockResolvedValue([mockPromotions]);

      const result = await promotionModel.getAllPromotions();

      expect(db.query).toHaveBeenCalledWith('SELECT * FROM promotions');
      expect(result).toEqual(mockPromotions);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValue(dbError);

      await expect(promotionModel.getAllPromotions()).rejects.toThrow('Database connection failed');
    });
  });

  describe('addPromotion', () => {
    it('should add promotion with generated code (first promotion)', async () => {
      const promotionData = {
        name: 'New Promotion',
        type: 'percentage',
        discount: 15,
        startDate: '2024-08-01',
        endDate: '2024-08-31',
        minPrice: 150000,
        quantity: 50
      };

      const mockResult = { insertId: 123 };

      // Mock for generating promotion code (no existing codes)
      db.query.mockResolvedValueOnce([[]]);
      // Mock for inserting promotion
      db.query.mockResolvedValueOnce([mockResult]);

      const result = await promotionModel.addPromotion(promotionData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT promotion_code FROM promotions WHERE promotion_code LIKE \'KM%\'')
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO promotions'),
        ['KM01', 'New Promotion', 'percentage', 15, '2024-08-01', '2024-08-31', 150000, 50]
      );
      expect(result).toEqual({
        insertId: 123,
        promotionCode: 'KM01'
      });
    });

    it('should add promotion with incremented code', async () => {
      const promotionData = {
        name: 'Another Promotion',
        type: 'fixed',
        discount: 30000,
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        minPrice: 100000,
        quantity: undefined // Test undefined quantity
      };

      const mockResult = { insertId: 124 };

      // Mock for generating promotion code (existing KM05)
      db.query.mockResolvedValueOnce([[{ promotion_code: 'KM05' }]]);
      // Mock for inserting promotion
      db.query.mockResolvedValueOnce([mockResult]);

      const result = await promotionModel.addPromotion(promotionData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO promotions'),
        ['KM06', 'Another Promotion', 'fixed', 30000, '2024-09-01', '2024-09-30', 100000, null]
      );
      expect(result).toEqual({
        insertId: 124,
        promotionCode: 'KM06'
      });
    });

    it('should handle empty string quantity', async () => {
      const promotionData = {
        name: 'Test Promotion',
        type: 'percentage',
        discount: 20,
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        minPrice: 50000,
        quantity: '' // Test empty string quantity
      };

      const mockResult = { insertId: 125 };

      db.query.mockResolvedValueOnce([[]]);
      db.query.mockResolvedValueOnce([mockResult]);

      await promotionModel.addPromotion(promotionData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO promotions'),
        expect.arrayContaining([null]) // quantity should be null
      );
    });
  });

  describe('updatePromotion', () => {
    it('should update promotion successfully', async () => {
      const updateData = {
        id: 1,
        name: 'Updated Promotion',
        type: 'percentage',
        discount: 25,
        startDate: '2024-08-01',
        endDate: '2024-08-31',
        minPrice: 200000,
        quantity: 75,
        usedQuantity: 10
      };

      const mockResult = { affectedRows: 1 };

      // Mock for getting promotion code
      db.query.mockResolvedValueOnce([[{ promotion_code: 'KM01' }]]);
      // Mock for updating promotion
      db.query.mockResolvedValueOnce([mockResult]);

      const result = await promotionModel.updatePromotion(updateData);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT promotion_code FROM promotions WHERE id = ?',
        [1]
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE promotions SET'),
        ['Updated Promotion', 'percentage', 25, '2024-08-01', '2024-08-31', 200000, 75, 10, 1]
      );
      expect(result).toEqual(mockResult);
    });

    it('should handle promotion not found during update', async () => {
      const updateData = {
        id: 999,
        name: 'Updated Promotion',
        type: 'percentage',
        discount: 25,
        startDate: '2024-08-01',
        endDate: '2024-08-31',
        minPrice: 200000,
        quantity: 75,
        usedQuantity: 10
      };

      const mockResult = { affectedRows: 1 };

      // Mock for getting promotion code (not found)
      db.query.mockResolvedValueOnce([[]]);
      // Mock for updating promotion
      db.query.mockResolvedValueOnce([mockResult]);

      const result = await promotionModel.updatePromotion(updateData);

      expect(result).toEqual(mockResult);
    });
  });

  describe('deletePromotion', () => {
    it('should delete promotion and update invoices', async () => {
      const mockResult = { affectedRows: 1 };

      // Mock for getting promotion code
      db.query.mockResolvedValueOnce([[{ promotion_code: 'KM01' }]]);
      // Mock for updating invoices
      db.query.mockResolvedValueOnce([{}]);
      // Mock for deleting promotion
      db.query.mockResolvedValueOnce([mockResult]);

      const result = await promotionModel.deletePromotion(1);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT promotion_code FROM promotions WHERE id = ?',
        [1]
      );
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE invoices SET promotion_code = NULL WHERE promotion_code = ?',
        ['KM01']
      );
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM promotions WHERE id = ?',
        [1]
      );
      expect(result).toEqual(mockResult);
    });

    it('should return affectedRows 0 when promotion not found', async () => {
      // Mock for getting promotion code (not found)
      db.query.mockResolvedValue([[]]);

      const result = await promotionModel.deletePromotion(999);

      expect(result).toEqual({ affectedRows: 0 });
      expect(db.query).toHaveBeenCalledTimes(1); // Only the SELECT query
    });
  });
});
