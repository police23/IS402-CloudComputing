const promotionService = require("../services/promotionService");

const getPromotions = async (req, res) => {
    try {
        const promotions = await promotionService.getAllPromotions();
        res.status(200).json(promotions);
    } catch (error) {
        res.status(500).json({ error: "Đã xảy ra lỗi khi lấy danh sách khuyến mãi" });
    }
};

const addPromotion = async (req, res) => {
    try {
        const result = await promotionService.addPromotion(req.body);
        res.status(201).json({ 
            message: "Thêm mới khuyến mãi thành công", 
        });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Đã xảy ra lỗi khi thêm mới khuyến mãi" });
    }
};

const getAvailablePromotions = async (req, res) => {
    try {
        const total_price = req.query.total_price ? parseFloat(req.query.total_price) : 0;
        const promotions = await promotionService.getAvailablePromotions(total_price);
        res.status(200).json(promotions);
    } catch (error) {
        res.status(500).json({ error: "Đã xảy ra lỗi khi lấy khuyến mãi khả dụng" });
    }
}
const updatePromotion = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await promotionService.updatePromotion(id, req.body);
        res.status(200).json(result);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Đã xảy ra lỗi khi cập nhật khuyến mãi" });
    }
};

const deletePromotion = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await promotionService.deletePromotion(id);
        res.status(200).json(result);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        res.status(500).json({ error: "Đã xảy ra lỗi khi xóa khuyến mãi" });
    }
};

module.exports = {
    getPromotions,
    getAvailablePromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
};
