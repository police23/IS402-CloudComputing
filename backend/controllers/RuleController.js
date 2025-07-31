const ruleService = require("../services/RuleService");
const getRules = async (req, res) => {
    try {
        const rules = await ruleService.getRules();
        res.status(200).json(rules);
    } catch (error) {
        const statusCode = error.status || 500;
        const message = error.message || "Lỗi khi lấy quy định";
        res.status(statusCode).json({ message });
    }
};

const updateRules = async (req, res) => {
    try {
        const result = await ruleService.updateRules(req.body);
        res.status(200).json(result);
    } catch (error) {
        const statusCode = error.status || 500;
        const message = error.message || "Lỗi khi cập nhật quy định";
        res.status(statusCode).json({ message });
    }
};

module.exports = {
    getRules,
    updateRules,
};