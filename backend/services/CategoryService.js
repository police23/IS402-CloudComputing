const categoryModel = require("../models/CategoryModel");

const getAllCategories = async () => {
    return await categoryModel.getAllCategories();
};

module.exports = {
    getAllCategories,
};
