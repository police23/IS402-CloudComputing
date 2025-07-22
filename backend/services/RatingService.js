const RatingModel = require('../models/RatingModel');

const rateBook = async (userID, bookID, rating, comment) => {
    return await RatingModel.rateBook(userID, bookID, rating, comment);
};

const getAllRatingsByBookID = async (bookID) => {
    return await RatingModel.getAllRatingsByBookID(bookID);
};

const hasPurchasedBook = async (userID, bookID) => {
    return await RatingModel.hasPurchasedBook(userID, bookID);
};

module.exports = {
    rateBook,
    getAllRatingsByBookID,
    hasPurchasedBook,
};
