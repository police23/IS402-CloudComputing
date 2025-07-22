const db = require("../db");

const getAllPublishers = async () => {
    const [rows] = await db.query(
        "SELECT id, name FROM publishers"
    );
    return rows;
};

module.exports = {
    getAllPublishers,
};
