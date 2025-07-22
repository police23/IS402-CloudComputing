const promotionController = require('../../controllers/promotionController');
const promotionService = require('../../services/promotionService');
const { createMockRequest, createMockResponse } = require('../helpers/testHelpers');

// Mock the service
jest.mock('../../services/promotionService');

describe('PromotionController', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getPromotions', () => {
    it('should get all promotions successfully', async () => {
      const mockPromotions = [
        { id: 1, code: 'PROMO1', discount: 10, isActive: true },
        { id: 2, code: 'PROMO2', discount: 20, isActive: true }
      ];

      promotionService.getAllPromotions.mockResolvedValue(mockPromotions);

      await promotionController.getPromotions(req, res);

      expect(promotionService.getAllPromotions).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPromotions);
    });

    it('should handle errors when getting promotions', async () => {
      promotionService.getAllPromotions.mockRejectedValue(new Error('Database error'));

      await promotionController.getPromotions(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Đã xảy ra lỗi khi lấy danh sách khuyến mãi'
      });
    });
  });

  describe('addPromotion', () => {
    it('should add promotion successfully', async () => {
      const mockPromotionData = {
        code: 'NEWPROMO',
        discount: 15,
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      req.body = mockPromotionData;
      promotionService.addPromotion.mockResolvedValue({ id: 1, ...mockPromotionData });

      await promotionController.addPromotion(req, res);

      expect(promotionService.addPromotion).toHaveBeenCalledWith(mockPromotionData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Thêm mới khuyến mãi thành công'
      });
    });

    it('should handle service errors with status', async () => {
      req.body = { code: 'INVALID' };
      const error = new Error('Invalid promotion data');
      error.status = 400;
      
      promotionService.addPromotion.mockRejectedValue(error);

      await promotionController.addPromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid promotion data'
      });
    });

    it('should handle general errors', async () => {
      req.body = { code: 'PROMO' };
      promotionService.addPromotion.mockRejectedValue(new Error('Database error'));

      await promotionController.addPromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Đã xảy ra lỗi khi thêm mới khuyến mãi'
      });
    });
  });

  describe('updatePromotion', () => {
    it('should update promotion successfully', async () => {
      const promotionId = '1';
      const updateData = { discount: 25 };
      const updatedPromotion = { id: 1, code: 'PROMO1', discount: 25 };

      req.params = { id: promotionId };
      req.body = updateData;
      promotionService.updatePromotion.mockResolvedValue(updatedPromotion);

      await promotionController.updatePromotion(req, res);

      expect(promotionService.updatePromotion).toHaveBeenCalledWith(promotionId, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedPromotion);
    });

    it('should handle update errors with status', async () => {
      req.params = { id: '999' };
      req.body = { discount: 25 };
      const error = new Error('Promotion not found');
      error.status = 404;

      promotionService.updatePromotion.mockRejectedValue(error);

      await promotionController.updatePromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Promotion not found'
      });
    });

    it('should handle general update errors', async () => {
      req.params = { id: '1' };
      req.body = { discount: 25 };
      promotionService.updatePromotion.mockRejectedValue(new Error('Database error'));

      await promotionController.updatePromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Đã xảy ra lỗi khi cập nhật khuyến mãi'
      });
    });
  });

  describe('deletePromotion', () => {
    it('should delete promotion successfully', async () => {
      const promotionId = '1';
      req.params = { id: promotionId };
      promotionService.deletePromotion.mockResolvedValue({ success: true });

      await promotionController.deletePromotion(req, res);

      expect(promotionService.deletePromotion).toHaveBeenCalledWith(promotionId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should handle delete errors with status', async () => {
      req.params = { id: '999' };
      const error = new Error('Promotion not found');
      error.status = 404;

      promotionService.deletePromotion.mockRejectedValue(error);

      await promotionController.deletePromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Promotion not found'
      });
    });

    it('should handle general delete errors', async () => {
      req.params = { id: '1' };
      promotionService.deletePromotion.mockRejectedValue(new Error('Database error'));

      await promotionController.deletePromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Đã xảy ra lỗi khi xóa khuyến mãi'
      });
    });
  });

  describe('checkPromotion', () => {
    it('should check promotion successfully', async () => {
      const promotionData = { promotionCode: 'PROMO1', totalAmount: 100000 };
      const checkResult = { 
        success: true, 
        discount: 10000, 
        message: 'Mã khuyến mãi hợp lệ' 
      };

      req.body = promotionData;
      promotionService.checkPromotion.mockResolvedValue(checkResult);

      await promotionController.checkPromotion(req, res);

      expect(promotionService.checkPromotion).toHaveBeenCalledWith(
        promotionData.promotionCode, 
        promotionData.totalAmount
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(checkResult);
    });

    it('should handle promotion check errors with status', async () => {
      req.body = { promotionCode: 'INVALID', totalAmount: 50000 };
      const error = new Error('Mã khuyến mãi không hợp lệ');
      error.status = 400;

      promotionService.checkPromotion.mockRejectedValue(error);

      await promotionController.checkPromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Mã khuyến mãi không hợp lệ'
      });
    });

    it('should handle general promotion check errors', async () => {
      req.body = { promotionCode: 'PROMO1', totalAmount: 100000 };
      promotionService.checkPromotion.mockRejectedValue(new Error('Database error'));

      await promotionController.checkPromotion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Đã xảy ra lỗi khi kiểm tra mã khuyến mãi'
      });
    });
  });
});
