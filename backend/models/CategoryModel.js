const db = require("../db");

const getAllCategories = async () => {
    const [rows] = await db.query("SELECT id, name, description, created_at, updated_at FROM categories");
    return rows;
};

module.exports = {
    getAllCategories,
};