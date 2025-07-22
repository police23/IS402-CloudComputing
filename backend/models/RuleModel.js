const db = require("../db");

const getRules = async () => {
    const [rules] = await db.query("SELECT * FROM rules LIMIT 1");
    return rules[0]; 
};

const updateRules = async (ruleData) => {
    const { min_import_quantity, min_stock_before_import, max_promotion_duration } = ruleData;
    const [result] = await db.query(
        `UPDATE rules 
         SET min_import_quantity = ?, 
             min_stock_before_import = ?, 
             max_promotion_duration = ? 
         WHERE id = 1`,
        [min_import_quantity, min_stock_before_import, max_promotion_duration]
    );
    return result;
};

module.exports = {
    getRules,
    updateRules,
};