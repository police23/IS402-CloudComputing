const { Rating, User, Book, sequelize } = require('../models');
const { Op } = require('sequelize');

const getAllRatingsByBookID = async (bookID) => {
  return await Rating.findAll({
    where: { book_id: bookID },
    include: [{ model: User, attributes: ['full_name'] }],
    order: [['created_at', 'DESC']]
  });
};

const hasPurchasedBook = async (userID, bookID) => {
  const [results] = await sequelize.query(
    `SELECT od.* FROM order_details od
     JOIN orders o ON o.id = od.order_id
     WHERE o.user_id = ? AND od.book_id = ? AND o.status = 'delivered'`,
    { replacements: [userID, bookID] }
  );
  return results.length > 0;
};

const rateBook = async (userID, bookID, ratingValue, comment) => {
  const existing = await Rating.findOne({ where: { user_id: userID, book_id: bookID } });
  if (existing) {
    existing.rating = ratingValue;
    existing.comment = comment;
    existing.created_at = new Date();
    await existing.save();
    return { message: 'Rating updated' };
  } else {
    await Rating.create({
      user_id: userID,
      book_id: bookID,
      rating: ratingValue,
      comment,
      created_at: new Date(),
    });
    return { message: 'Rating created' };
  }
};

module.exports = {
  getAllRatingsByBookID,
  rateBook,
  hasPurchasedBook,
};
