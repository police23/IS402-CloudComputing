const { Promotion } = require('../models');
const { Op } = require('sequelize');

const getAllPromotions = async () => {
  return await Promotion.findAll();
};

const getAvailablePromotions = async (total_price) => {
  return await Promotion.findAll({
    where: {
      start_date: { [Op.lte]: new Date() },
      end_date: { [Op.gte]: new Date() },
      used_quantity: { [Op.lt]: { [Op.col]: 'quantity' } },
      min_price: { [Op.lte]: total_price }
    }
  });
};

const generatePromotionCode = async () => {
  // Tìm mã KM lớn nhất, tạo mã mới
  const lastPromo = await Promotion.findOne({
    where: { promotion_code: { [Op.like]: 'KM%' } },
    order: [['promotion_code', 'DESC']]
  });
  let nextNumber = 1;
  if (lastPromo) {
    const numericPart = lastPromo.promotion_code.substring(2);
    nextNumber = parseInt(numericPart, 10) + 1;
  }
  return `KM${String(nextNumber).padStart(2, '0')}`;
};

const addPromotion = async (promotionData) => {
  const { name, type, discount, startDate, endDate, minPrice, quantity } = promotionData;
  const promotionCode = await generatePromotionCode();
  const promo = await Promotion.create({
    promotion_code: promotionCode,
    name,
    type,
    discount,
    start_date: startDate,
    end_date: endDate,
    min_price: minPrice,
    quantity,
    used_quantity: 0
  });
  return promo;
};

const updatePromotion = async (id, promotionData) => {
  const promo = await Promotion.findByPk(id);
  if (!promo) throw new Error('Promotion not found');
  await promo.update({ ...promotionData });
  return promo;
};

const deletePromotion = async (id) => {
  const promo = await Promotion.findByPk(id);
  if (!promo) throw new Error('Promotion not found');
  await promo.destroy();
  return { success: true };
};

module.exports = {
  getAllPromotions,
  getAvailablePromotions,
  addPromotion,
  updatePromotion,
  deletePromotion
};
