const express = require('express');
const router = express.Router();


const { createZaloPayPayment } = require('../controllers/PaymentController');
router.post('/zalopay', createZaloPayPayment);

module.exports = router;