const { Rule } = require('../models');
const cacheHelper = require('../utils/cacheHelper');

const CACHE_KEYS = {
  RULES: 'rules:all',
};

const CACHE_TTL = {
  RULES: 1800, // 30 minutes
};

const getRules = async () => {
  // Always return the first rule (id=1)
  return await cacheHelper.getOrSet(
      CACHE_KEYS.RULES,
      async () => {
          return await Rule.findByPk(1);
      },
      CACHE_TTL.RULES
  );
};

const updateRules = async (ruleData) => {
  const { min_import_quantity, min_stock_before_import, max_promotion_duration } = ruleData;
  const rule = await Rule.findByPk(1);
  if (!rule) throw new Error('Rule not found');
  rule.min_import_quantity = min_import_quantity;
  rule.min_stock_before_import = min_stock_before_import;
  rule.max_promotion_duration = max_promotion_duration;
  await rule.save();
  await cacheHelper.del(CACHE_KEYS.RULES);
  return rule;
};

module.exports = {
  getRules,
  updateRules,
};
