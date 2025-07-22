const categoryModel = require("../models/categoryModel");

const getAllCategories = async () => {
    return await categoryModel.getAllCategories();
};

module.exports = {
    getAllCategories,
};
