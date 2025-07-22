const db = require("../db");

const generatePromotionCode = async () => {
    const [result] = await db.query(
        "SELECT promotion_code FROM promotions WHERE promotion_code LIKE 'KM%' ORDER BY promotion_code DESC LIMIT 1"
    );
    
    let nextNumber = 1;
    if (result.length > 0) {
        const lastCode = result[0].promotion_code;
        const numericPart = lastCode.substring(2); 
        nextNumber = parseInt(numericPart, 10) + 1;
    }
    
    return `KM${String(nextNumber).padStart(2, '0')}`;
};


const getAllPromotions = async () => {
    const [rows] = await db.query("SELECT * FROM promotions");
    return rows;
};

const getAvailablePromotions = async (total_price) => {
    const [rows] = await db.query(
        `SELECT * FROM promotions 
         WHERE start_date <= NOW() 
         AND end_date >= NOW() 
         AND used_quantity < quantity
         AND min_price <= ?`,
        [total_price]
    );
    return rows;
}

const addPromotion = async (promotionData) => {    
    const { name, type, discount, startDate, endDate, minPrice, quantity } = promotionData;
    const promotionCode = await generatePromotionCode();
    const [result] = await db.query(
        `INSERT INTO promotions (promotion_code, name, type, discount, start_date, end_date, min_price, quantity, used_quantity)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)` ,
        [promotionCode, name, type, discount, startDate, endDate, minPrice, quantity]
    );
    return result;
};

const updatePromotion = async (promotionData) => {
    const { id, name, type, discount, startDate, endDate, minPrice, quantity, usedQuantity } = promotionData;
    const safeQuantity = quantity === undefined || quantity === "" ? null : quantity;
    const [result] = await db.query(
        `UPDATE promotions SET name = ?, type = ?, discount = ?, start_date = ?, end_date = ?, min_price = ?, quantity = ?, used_quantity = ?
         WHERE id = ?`,
        [name, type, discount, startDate, endDate, minPrice, safeQuantity, usedQuantity, id]
    );

    return result;
};

const deletePromotion = async (id) => {
    const [result] = await db.query(
        "DELETE FROM promotions WHERE id = ?",
        [id]
    );
    
    return result;
};

module.exports = {
    getAllPromotions,
    getAvailablePromotions,
    generatePromotionCode,
    addPromotion,
    updatePromotion,
    deletePromotion,
};