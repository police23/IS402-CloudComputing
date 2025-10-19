const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const { verifyToken } = require('../middlewares/authMiddleware');
router.use(verifyToken);
router.get('/', CartController.getCart);
router.post('/', CartController.addToCart);
router.put('/quantity', CartController.updateQuantity);
// delete specific book from cart by bookID
router.delete('/:bookID', CartController.removeFromCart);
// clear entire cart for current user
router.delete('/', CartController.clearCart);
module.exports = router;
