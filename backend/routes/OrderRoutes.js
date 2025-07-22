const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const OrderController = require('../controllers/OrderController');

// Routes cho user
router.get("/processing", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get("/confirmed", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get("/delivered", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get("/delivering", verifyToken, OrderController.getOrdersByStatusAndUser);
router.get("/cancelled", verifyToken, OrderController.getOrdersByStatusAndUser);

// Routes cho shipper
router.get("/delivering/shipper", verifyToken, OrderController.getOrdersByShipperID);
router.get("/delivered/shipper", verifyToken, OrderController.getOrdersByShipperID);

// Routes cho admin
router.get("/all", verifyToken, OrderController.getOrdersByStatus);
router.get("/confirmed/all", verifyToken, OrderController.getOrdersByStatus);
router.get("/delivering/all", verifyToken, OrderController.getOrdersByStatus);
router.get("/delivered/all", verifyToken, OrderController.getOrdersByStatus);

// Routes chung
router.get("/", verifyToken, OrderController.getOrdersByUserID);
router.post("/", verifyToken, OrderController.createOrder);
router.patch("/:orderId/confirm", verifyToken, OrderController.updateOrderStatus);
router.patch("/:orderId/complete", verifyToken, OrderController.updateOrderStatus);
router.patch("/:orderId/cancel", verifyToken, OrderController.updateOrderStatus);
router.post('/:orderId/assign-shipper', verifyToken, OrderController.assignOrderToShipper);

module.exports = router;

