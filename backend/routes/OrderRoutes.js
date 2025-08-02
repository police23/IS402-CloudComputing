const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const OrderController = require('../controllers/OrderController');

// --- Các route cho user (MyOrdersPage) ---
router.get("/processing", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get("/confirmed", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get("/delivered", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get("/delivering", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get("/cancelled", verifyToken, OrderController.getOrdersByStatusAndUser);

// --- Các route cho shipper ---
router.get("/delivering/shipper", verifyToken, OrderController.getOrdersByShipperID);
router.get("/delivered/shipper", verifyToken, OrderController.getOrdersByShipperID);

// --- Các route cho admin/manager (OrderManagementPage) ---
router.get("/processing/all", verifyToken, OrderController.getAllOrdersByStatus);
router.get("/confirmed/all", verifyToken, OrderController.getAllOrdersByStatus);
router.get("/delivering/all", verifyToken, OrderController.getAllOrdersByStatus);
router.get("/delivered/all", verifyToken, OrderController.getAllOrdersByStatus);

// --- Routes chung ---
router.get("/", verifyToken, OrderController.getOrdersByUserID);
router.post("/", verifyToken, OrderController.createOrder);
router.patch("/:orderId/confirm", verifyToken, OrderController.confirmOrder);
router.patch("/:orderId/complete", verifyToken, OrderController.completeOrder);
router.patch("/:orderId/cancel", verifyToken, OrderController.cancelOrder);
router.post('/:orderId/assign-shipper', verifyToken, OrderController.assignOrderToShipper);

module.exports = router;

