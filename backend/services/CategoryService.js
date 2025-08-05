const { Category } = require('../models');

const getAllCategories = async () => {
    return await Category.findAll({
        order: [['name', 'ASC']]
    });
};

module.exports = {
    getAllCategories,
};
