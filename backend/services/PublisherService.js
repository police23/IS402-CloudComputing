const { Publisher } = require("../models");
const cacheHelper = require('../utils/cacheHelper');

const CACHE_KEYS = {
  ALL_PUBLISHERS: 'publishers:all',
};

const CACHE_TTL = {
  PUBLISHERS_LIST: 3600, // 1 hour
};

const getAllPublishers = async () => {
    return await cacheHelper.getOrSet(
        CACHE_KEYS.ALL_PUBLISHERS,
        async () => {
            return await Publisher.findAll();
        },
        CACHE_TTL.PUBLISHERS_LIST
    );
};

module.exports = {
    getAllPublishers,
};
