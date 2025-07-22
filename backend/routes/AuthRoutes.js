const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/validate-token', authMiddleware.verifyToken, authController.validateToken);
router.get('/validate-token', authMiddleware.verifyToken, authController.validateToken);
router.post('/logout', authMiddleware.verifyToken, authController.logout);
router.post('/forgot-password', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
