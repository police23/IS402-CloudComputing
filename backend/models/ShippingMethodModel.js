const db = require("../db");
const getAllShippingMethods = async () => {
    const [rows] = await db.query("SELECT * FROM shipping_methods WHERE is_active = TRUE ORDER BY fee ASC");
    return rows;
}
module.exports = {
    getAllShippingMethods,
}