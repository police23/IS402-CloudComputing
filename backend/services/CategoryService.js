const { Category } = require('../models');
const cacheHelper = require('../utils/cacheHelper');

const CACHE_KEYS = {
  ALL_CATEGORIES: 'categories:all',
};

const CACHE_TTL = {
  CATEGORIES_LIST: 3600, // 1 hour
};

const getAllCategories = async () => {
    return await cacheHelper.getOrSet(
        CACHE_KEYS.ALL_CATEGORIES,
        async () => {
            return await Category.findAll({
                order: [['name', 'ASC']]
            });
        },
        CACHE_TTL.CATEGORIES_LIST
    );
};

module.exports = {
    getAllCategories,
};
