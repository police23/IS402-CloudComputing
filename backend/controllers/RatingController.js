const RatingService = require('../services/RatingService');

const rateBook = async (req, res) => {
    try {
        const userID = req.user.id; // Giả định đã có middleware xác thực, gán user vào req
        const { bookID, rating, comment } = req.body;
        if (!bookID || !rating) {
            return res.status(400).json({ error: 'Thiếu thông tin bookID hoặc rating' });
        }
        const result = await RatingService.rateBook(userID, bookID, rating, comment);
        if (result.error) {
            return res.status(403).json(result);
        }
        return res.json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getAllRatingsByBookID = async (req, res) => {
    try {
        const { bookID } = req.params;
        const ratings = await RatingService.getAllRatingsByBookID(bookID);
        return res.json(ratings);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const hasPurchasedBook = async (req, res) => {
    try {
        const userID = req.user.id;
        const { bookID } = req.params;
        const purchased = await RatingService.hasPurchasedBook(userID, bookID);
        res.json({ purchased });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    rateBook,
    getAllRatingsByBookID,
    hasPurchasedBook,
};
