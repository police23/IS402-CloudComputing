const categoryService = require("../services/categoryService");

const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch categories" });
    }
};

module.exports = {
    getAllCategories,
};
