const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/RatingController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/book/:bookID', RatingController.getAllRatingsByBookID);
router.get('/has-purchased/:bookID', verifyToken, RatingController.hasPurchasedBook);
router.post('/rate', verifyToken, RatingController.rateBook);

module.exports = router;