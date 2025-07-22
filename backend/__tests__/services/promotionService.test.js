const promotionService = require('../../services/promotionService');
const promotionModel = require('../../models/promotionModel');
const db = require('../../db');

// Mock dependencies
jest.mock('../../models/promotionModel');
jest.mock('../../db');

describe('PromotionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPromotions', () => {
    it('should get all promotions', async () => {
      const mockPromotions = [
        { id: 1, name: 'Test Promotion', type: 'percent', discount: 10 }
      ];
      promotionModel.getAllPromotions.mockResolvedValue(mockPromotions);

      const result = await promotionService.getAllPromotions();

      expect(promotionModel.getAllPromotions).toHaveBeenCalled();
      expect(result).toEqual(mockPromotions);
    });
  });

  describe('addPromotion', () => {
    it('should add promotion successfully', async () => {
      const promotionData = {
        name: 'Test Promotion',
        type: 'percent',
        discount: 10,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        minPrice: 100000,
        quantity: 100
      };
      const mockResult = { id: 1 };
      promotionModel.addPromotion.mockResolvedValue(mockResult);

      const result = await promotionService.addPromotion(promotionData);

      expect(promotionModel.addPromotion).toHaveBeenCalledWith(promotionData);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when missing required fields', async () => {
      const incompleteData = {
        name: 'Test Promotion',
        type: 'percent'
        // Missing required fields
      };

      await expect(promotionService.addPromotion(incompleteData)).rejects.toMatchObject({
        status: 400,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    });

    it('should throw error when name is missing', async () => {
      const promotionData = {
        type: 'percent',
        discount: 10,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        minPrice: 100000
      };

      await expect(promotionService.addPromotion(promotionData)).rejects.toMatchObject({
        status: 400,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    });
  });

  describe('updatePromotion', () => {
    it('should update promotion successfully', async () => {
      const promotionData = {
        name: 'Updated Promotion',
        type: 'fixed',
        discount: 50000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        minPrice: 200000,
        quantity: 50,
        usedQuantity: 10
      };
      promotionModel.updatePromotion.mockResolvedValue({ affectedRows: 1 });

      const result = await promotionService.updatePromotion(1, promotionData);

      expect(promotionModel.updatePromotion).toHaveBeenCalledWith({
        id: 1,
        ...promotionData
      });
      expect(result).toEqual({ message: 'Cập nhật khuyến mãi thành công' });
    });

    it('should set usedQuantity to 0 when not provided', async () => {
      const promotionData = {
        name: 'Updated Promotion',
        type: 'fixed',
        discount: 50000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        minPrice: 200000,
        quantity: 50
      };
      promotionModel.updatePromotion.mockResolvedValue({ affectedRows: 1 });

      await promotionService.updatePromotion(1, promotionData);

      expect(promotionModel.updatePromotion).toHaveBeenCalledWith({
        id: 1,
        ...promotionData,
        usedQuantity: 0
      });
    });

    it('should throw error when promotion not found', async () => {
      const promotionData = {
        name: 'Updated Promotion',
        type: 'fixed',
        discount: 50000,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        minPrice: 200000
      };
      promotionModel.updatePromotion.mockResolvedValue({ affectedRows: 0 });

      await expect(promotionService.updatePromotion(999, promotionData)).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy khuyến mãi để cập nhật'
      });
    });

    it('should throw error when missing required fields', async () => {
      const incompleteData = {
        name: 'Updated Promotion'
        // Missing required fields
      };

      await expect(promotionService.updatePromotion(1, incompleteData)).rejects.toMatchObject({
        status: 400,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    });
  });

  describe('deletePromotion', () => {
    it('should delete promotion successfully', async () => {
      promotionModel.deletePromotion.mockResolvedValue({ affectedRows: 1 });

      const result = await promotionService.deletePromotion(1);

      expect(promotionModel.deletePromotion).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Xóa khuyến mãi thành công' });
    });

    it('should throw error when promotion not found', async () => {
      promotionModel.deletePromotion.mockResolvedValue({ affectedRows: 0 });

      await expect(promotionService.deletePromotion(999)).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy khuyến mãi để xóa'
      });
    });
  });

  describe('checkPromotion', () => {
    it('should throw error when promotionCode is missing', async () => {
      await expect(promotionService.checkPromotion('', 100000)).rejects.toMatchObject({
        status: 400,
        success: false,
        message: 'Vui lòng cung cấp mã khuyến mãi và tổng tiền hóa đơn'
      });
    });

    it('should throw error when totalAmount is missing', async () => {
      await expect(promotionService.checkPromotion('PROMO123', '')).rejects.toMatchObject({
        status: 400,
        success: false,
        message: 'Vui lòng cung cấp mã khuyến mãi và tổng tiền hóa đơn'
      });
    });

    it('should throw error when promotion code not found', async () => {
      db.query.mockResolvedValue([[]]);

      await expect(promotionService.checkPromotion('INVALID', 100000)).rejects.toMatchObject({
        status: 404,
        success: false,
        message: 'Mã khuyến mãi không hợp lệ'
      });
    });

    it('should throw error when promotion not yet effective', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      
      const mockPromotion = {
        id: 1,
        promotion_code: 'FUTURE',
        name: 'Future Promotion',
        type: 'percent',
        discount: 10,
        start_date: futureDate.toISOString(),
        end_date: new Date(futureDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        min_price: 50000,
        quantity: 100,
        used_quantity: 0
      };
      db.query.mockResolvedValue([[mockPromotion]]);

      await expect(promotionService.checkPromotion('FUTURE', 100000)).rejects.toMatchObject({
        status: 400,
        success: false,
        message: 'Mã khuyến mãi chưa có hiệu lực'
      });
    });

    it('should throw error when promotion expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);
      
      const mockPromotion = {
        id: 1,
        promotion_code: 'EXPIRED',
        name: 'Expired Promotion',
        type: 'percent',
        discount: 10,
        start_date: new Date(pastDate.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: pastDate.toISOString(),
        min_price: 50000,
        quantity: 100,
        used_quantity: 0
      };
      db.query.mockResolvedValue([[mockPromotion]]);

      await expect(promotionService.checkPromotion('EXPIRED', 100000)).rejects.toMatchObject({
        status: 400,
        success: false,
        message: 'Mã khuyến mãi đã hết hạn'
      });
    });

    it('should throw error when promotion usage limit reached', async () => {
      const now = new Date();
      const mockPromotion = {
        id: 1,
        promotion_code: 'MAXED',
        name: 'Maxed Promotion',
        type: 'percent',
        discount: 10,
        start_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        min_price: 50000,
        quantity: 100,
        used_quantity: 100
      };
      db.query.mockResolvedValue([[mockPromotion]]);

      await expect(promotionService.checkPromotion('MAXED', 100000)).rejects.toMatchObject({
        status: 400,
        success: false,
        message: 'Mã khuyến mãi đã hết lượt sử dụng'
      });
    });

    it('should throw error when order value below minimum price', async () => {
      const now = new Date();
      const mockPromotion = {
        id: 1,
        promotion_code: 'MINPRICE',
        name: 'Min Price Promotion',
        type: 'percent',
        discount: 10,
        start_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        min_price: 200000,
        quantity: 100,
        used_quantity: 0
      };
      db.query.mockResolvedValue([[mockPromotion]]);

      await expect(promotionService.checkPromotion('MINPRICE', 100000)).rejects.toMatchObject({
        status: 400,
        success: false,
        message: 'Giá trị đơn hàng tối thiểu là 200.000 VNĐ'
      });
    });

    it('should successfully apply percent discount promotion', async () => {
      const now = new Date();
      const mockPromotion = {
        id: 1,
        promotion_code: 'PERCENT10',
        name: 'Percent Promotion',
        type: 'percent',
        discount: 10,
        start_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        min_price: 50000,
        quantity: 100,
        used_quantity: 0
      };
      db.query.mockResolvedValue([[mockPromotion]]);

      const result = await promotionService.checkPromotion('PERCENT10', 100000);

      expect(result).toEqual({
        success: true,
        message: 'Áp dụng mã khuyến mãi thành công',
        data: {
          promotion_id: 1,
          promotion_code: 'PERCENT10',
          name: 'Percent Promotion',
          type: 'percent',
          discount: 10,
          discountAmount: 10000,
          finalAmount: 90000
        }
      });
    });

    it('should successfully apply fixed discount promotion', async () => {
      const now = new Date();
      const mockPromotion = {
        id: 2,
        promotion_code: 'FIXED50K',
        name: 'Fixed Promotion',
        type: 'fixed',
        discount: 50000,
        start_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        min_price: 50000,
        quantity: null, // unlimited
        used_quantity: 10
      };
      db.query.mockResolvedValue([[mockPromotion]]);

      const result = await promotionService.checkPromotion('FIXED50K', 200000);

      expect(result).toEqual({
        success: true,
        message: 'Áp dụng mã khuyến mãi thành công',
        data: {
          promotion_id: 2,
          promotion_code: 'FIXED50K',
          name: 'Fixed Promotion',
          type: 'fixed',
          discount: 50000,
          discountAmount: 50000,
          finalAmount: 150000
        }
      });
    });

    it('should handle promotion with unlimited quantity (null)', async () => {
      const now = new Date();
      const mockPromotion = {
        id: 3,
        promotion_code: 'UNLIMITED',
        name: 'Unlimited Promotion',
        type: 'percent',
        discount: 5,
        start_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        min_price: 50000,
        quantity: null,
        used_quantity: 1000
      };
      db.query.mockResolvedValue([[mockPromotion]]);

      const result = await promotionService.checkPromotion('UNLIMITED', 100000);

      expect(result.success).toBe(true);
      expect(result.data.discountAmount).toBe(5000);
    });
  });
});
