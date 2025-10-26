const { ShippingMethod } = require('../models');
const cacheHelper = require('../utils/cacheHelper');

const CACHE_KEYS = {
  ALL_SHIPPING_METHODS: 'shipping-methods:all',
};

const CACHE_TTL = {
  SHIPPING_METHODS_LIST: 3600, // 1 hour
};

const getAllShippingMethods = async () => {
  return await cacheHelper.getOrSet(
      CACHE_KEYS.ALL_SHIPPING_METHODS,
      async () => {
          return await ShippingMethod.findAll({
              where: { is_active: true },
              order: [['fee', 'ASC']]
          });
      },
      CACHE_TTL.SHIPPING_METHODS_LIST
  );
};

// Invalidate shipping methods cache on create
const createShippingMethod = async (data) => {
    const method = await ShippingMethod.create(data);
    await cacheHelper.del(CACHE_KEYS.ALL_SHIPPING_METHODS);
    return method;
};

// Invalidate shipping methods cache on update
const updateShippingMethod = async (id, data) => {
    const method = await ShippingMethod.findByPk(id);
    await method.update(data);
    await cacheHelper.del(CACHE_KEYS.ALL_SHIPPING_METHODS);
    return method;
};

// Invalidate shipping methods cache on delete
const deleteShippingMethod = async (id) => {
    const method = await ShippingMethod.findByPk(id);
    await method.destroy();
    await cacheHelper.del(CACHE_KEYS.ALL_SHIPPING_METHODS);
    return { success: true };
};

module.exports = {
  getAllShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
};