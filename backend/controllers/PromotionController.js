const promotionService = require('../services/PromotionService');

const getPromotions = async (req, res) => {
  try {
    const promotions = await promotionService.getAllPromotions();
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách khuyến mãi' });
  }
};

const addPromotion = async (req, res) => {
  try {
    const result = await promotionService.addPromotion(req.body);
    res.status(201).json({ message: 'Thêm mới khuyến mãi thành công', data: result });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Đã xảy ra lỗi khi thêm mới khuyến mãi' });
  }
};

const getAvailablePromotions = async (req, res) => {
  try {
    const promotions = await promotionService.getAvailablePromotions();
    res.status(200).json(promotions);
  } catch (error) {
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy khuyến mãi khả dụng' });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await promotionService.updatePromotion(id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || 'Đã xảy ra lỗi khi cập nhật khuyến mãi' });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await promotionService.deletePromotion(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Đã xảy ra lỗi khi xóa khuyến mãi' });
  }
};

const getAvailableBooks = async (req, res) => {
  try {
    const { start_date, end_date, exclude_id } = req.query;
    const books = await promotionService.getAvailableBooksForRange({
      startDate: start_date,
      endDate: end_date,
      excludePromotionId: exclude_id ? Number(exclude_id) : null,
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách sách khả dụng' });
  }
};

module.exports = {
  getPromotions,
  getAvailablePromotions,
  addPromotion,
  updatePromotion,
  deletePromotion,
  getAvailableBooks,
};
