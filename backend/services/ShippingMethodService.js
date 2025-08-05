const { ShippingMethod } = require('../models');

const getAllShippingMethods = async () => {
  return await ShippingMethod.findAll({
    where: { is_active: true },
    order: [['fee', 'ASC']]
  });
};

module.exports = {
  getAllShippingMethods,
};