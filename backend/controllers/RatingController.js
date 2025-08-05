const RatingService = require('../services/RatingService');


const rateBook = async (req, res) => {
  try {
    const userID = req.user.id;
    const { bookID, rating, comment } = req.body;
    if (!bookID || !rating) {
      return res.status(400).json({ success: false, error: 'Thiếu thông tin bookID hoặc rating' });
    }
    const result = await RatingService.rateBook(userID, bookID, rating, comment);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


const getAllRatingsByBookID = async (req, res) => {
  try {
    const { bookID } = req.params;
    const ratings = await RatingService.getAllRatingsByBookID(bookID);
    return res.json({ success: true, data: ratings });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};


const hasPurchasedBook = async (req, res) => {
  try {
    const userID = req.user.id;
    const { bookID } = req.params;
    const purchased = await RatingService.hasPurchasedBook(userID, bookID);
    res.json({ success: true, purchased });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
    rateBook,
    getAllRatingsByBookID,
    hasPurchasedBook,
};
