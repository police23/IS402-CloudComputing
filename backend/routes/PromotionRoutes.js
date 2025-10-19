const express = require("express");
const promotionController = require("../controllers/promotionController");
const router = express.Router();

// Route lấy danh sách khuyến mãi

// Route lấy danh sách khuyến mãi
router.get("/", promotionController.getPromotions);

// Route lấy khuyến mãi khả dụng theo thời gian (giữ tương thích)
router.get("/available", promotionController.getAvailablePromotions);

// Route lấy danh sách sách khả dụng theo khoảng ngày (không trùng khuyến mãi khác)
router.get("/available-books", promotionController.getAvailableBooks);

// Route thêm mới khuyến mãi
router.post("/", promotionController.addPromotion);

// Route sửa khuyến mãi
router.put("/:id", promotionController.updatePromotion);

// Route xóa khuyến mãi
router.delete("/:id", promotionController.deletePromotion);

module.exports = router;