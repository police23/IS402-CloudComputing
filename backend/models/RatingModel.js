const db = require("../db");

const getAllRatingsByBookID = async (bookID) => {
    const [result] = await db.query(
        `SELECT r.*, u.full_name AS user_name
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.book_id = ?`,
        [bookID]
    );
    return result;
};

const hasPurchasedBook = async (userID, bookID) => {
    console.log('Check hasPurchasedBook input:', { userID, bookID });
    const [rows] = await db.query(
        `SELECT od.* FROM order_details od
         JOIN orders o ON o.id = od.order_id
         WHERE o.user_id = ? AND od.book_id = ? AND o.status = 'delivered'`,
        [userID, bookID]
    );
    console.log('SQL result:', rows);
    return rows.length > 0;
};

const rateBook = async (userID, bookID, rating, comment) => {

    const [existing] = await db.query(
        "SELECT id FROM ratings WHERE user_id = ? AND book_id = ?",
        [userID, bookID]
    );
    if (existing.length > 0) {
        await db.query(
            "UPDATE ratings SET rating = ?, comment = ?, created_at = NOW() WHERE user_id = ? AND book_id = ?",
            [rating, comment, userID, bookID]
        );
        return { message: "Rating updated" };
    } else {
        await db.query(
            "INSERT INTO ratings (user_id, book_id, rating, comment) VALUES (?, ?, ?, ?)",
            [userID, bookID, rating, comment]
        );
        return { message: "Rating created" };
    }
};

module.exports = {
    getAllRatingsByBookID,
    rateBook,
    hasPurchasedBook,
};
