const { Promotion, Book, sequelize } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const cacheHelper = require('../utils/cacheHelper');

const CACHE_KEYS = {
  ALL_PROMOTIONS: 'promotions:all',
  AVAILABLE_PROMOTIONS: 'promotions:available',
};

const CACHE_TTL = {
  PROMOTIONS_LIST: 3600,    // 1 hour
  AVAILABLE_PROMOTIONS: 1800, // 30 minutes
};

const getAllPromotions = async () => {
  return await cacheHelper.getOrSet(
      CACHE_KEYS.ALL_PROMOTIONS,
      async () => {
          return await Promotion.findAll({
              include: [{ model: Book, as: 'books', through: { attributes: [] } }],
          });
      },
      CACHE_TTL.PROMOTIONS_LIST
  );
};

// Deprecated in new schema; retained as no-op returning currently active promotions for compatibility
const getAvailablePromotions = async () => {
  return await cacheHelper.getOrSet(
      CACHE_KEYS.AVAILABLE_PROMOTIONS,
      async () => {
          return await Promotion.findAll({
              where: {
                  start_date: { [Op.lte]: new Date() },
                  end_date: { [Op.gte]: new Date() },
              },
              include: [{ model: Book, as: 'books', through: { attributes: [] } }],
          });
      },
      CACHE_TTL.AVAILABLE_PROMOTIONS
  );
};

// Helper: find conflicting book IDs for a date range (overlap rule)
const findConflictingBookIds = async ({ bookIds, startDate, endDate, excludePromotionId = null }) => {
  if (!Array.isArray(bookIds) || bookIds.length === 0) return [];
  const rows = await sequelize.query(
    `SELECT DISTINCT pd.book_id AS book_id
     FROM promotion_details pd
     JOIN promotions p ON p.id = pd.promotion_id
     WHERE pd.book_id IN (:bookIds)
       AND p.start_date <= :endDate
       AND p.end_date >= :startDate
       ${excludePromotionId ? 'AND p.id <> :excludeId' : ''}`,
    {
      type: QueryTypes.SELECT,
      replacements: {
        bookIds,
        startDate,
        endDate,
        excludeId: excludePromotionId || null,
      },
    }
  );
  return rows.map(r => r.book_id);
};

// Public API: get books available for a given date range (exclude conflicts)
const getAvailableBooksForRange = async ({ startDate, endDate, excludePromotionId = null }) => {
  // If dates are missing, return all books
  if (!startDate || !endDate) {
    return await Book.findAll();
  }
  const conflictRows = await sequelize.query(
    `SELECT DISTINCT pd.book_id AS book_id
     FROM promotion_details pd
     JOIN promotions p ON p.id = pd.promotion_id
     WHERE p.start_date <= :endDate
       AND p.end_date >= :startDate
       ${excludePromotionId ? 'AND p.id <> :excludeId' : ''}`,
    {
      type: QueryTypes.SELECT,
      replacements: {
        startDate,
        endDate,
        excludeId: excludePromotionId || null,
      },
    }
  );
  const conflictIds = conflictRows.map(r => r.book_id);
  const where = conflictIds.length
    ? { id: { [Op.notIn]: conflictIds } }
    : {};
  return await Book.findAll({ where });
};

// No promotion codes in new schema

const addPromotion = async (promotionData) => {
  const { name, type, discount, startDate, endDate, bookIds = [] } = promotionData;
  // Validate overlap for provided books
  if (Array.isArray(bookIds) && bookIds.length > 0) {
    const conflicts = await findConflictingBookIds({ bookIds, startDate, endDate });
    if (conflicts.length > 0) {
      const conflictBooks = await Book.findAll({ where: { id: conflicts } });
      const titles = conflictBooks.map(b => b.title).join(', ');
      const err = new Error(`Những sách sau đã nằm trong khuyến mãi khác trùng ngày: ${titles}`);
      err.status = 400;
      throw err;
    }
  }
  const promo = await Promotion.create({
    name,
    type,
    discount,
    start_date: startDate,
    end_date: endDate,
  });
  if (Array.isArray(bookIds) && bookIds.length > 0) {
    await promo.setBooks(bookIds);
  }
  // Invalidate promotion caches
  await cacheHelper.delMany([CACHE_KEYS.ALL_PROMOTIONS, CACHE_KEYS.AVAILABLE_PROMOTIONS]);
  return await Promotion.findByPk(promo.id, {
    include: [{ model: Book, as: 'books', through: { attributes: [] } }],
  });
};

const updatePromotion = async (id, promotionData) => {
  const promo = await Promotion.findByPk(id);
  if (!promo) throw new Error('Promotion not found');
  const { name, type, discount, startDate, endDate, bookIds } = promotionData;
  if (Array.isArray(bookIds) && bookIds.length > 0) {
    const conflicts = await findConflictingBookIds({ bookIds, startDate, endDate, excludePromotionId: id });
    if (conflicts.length > 0) {
      const conflictBooks = await Book.findAll({ where: { id: conflicts } });
      const titles = conflictBooks.map(b => b.title).join(', ');
      const err = new Error(`Những sách sau đã nằm trong khuyến mãi khác trùng ngày: ${titles}`);
      err.status = 400;
      throw err;
    }
  }
  await promo.update({
    name,
    type,
    discount,
    start_date: startDate,
    end_date: endDate,
  });
  if (Array.isArray(bookIds)) {
    await promo.setBooks(bookIds);
  }
  // Invalidate promotion caches
  await cacheHelper.delMany([CACHE_KEYS.ALL_PROMOTIONS, CACHE_KEYS.AVAILABLE_PROMOTIONS]);
  return await Promotion.findByPk(id, {
    include: [{ model: Book, as: 'books', through: { attributes: [] } }],
  });
};

const deletePromotion = async (id) => {
  const promo = await Promotion.findByPk(id);
  if (!promo) throw new Error('Promotion not found');
  await promo.destroy();
  // Invalidate promotion caches
  await cacheHelper.delMany([CACHE_KEYS.ALL_PROMOTIONS, CACHE_KEYS.AVAILABLE_PROMOTIONS]);
  return { success: true };
};

module.exports = {
  getAllPromotions,
  getAvailablePromotions,
  getAvailableBooksForRange,
  addPromotion,
  updatePromotion,
  deletePromotion
};
