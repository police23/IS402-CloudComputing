const { Supplier } = require('../models');
const { Op } = require('sequelize');
const cacheHelper = require('../utils/cacheHelper');

const CACHE_KEYS = {
  ALL_SUPPLIERS: 'suppliers:all',
};

const CACHE_TTL = {
  SUPPLIERS_LIST: 3600, // 1 hour
};

const getAllSuppliers = async () => {
  return await cacheHelper.getOrSet(
      CACHE_KEYS.ALL_SUPPLIERS,
      async () => {
          return await Supplier.findAll();
      },
      CACHE_TTL.SUPPLIERS_LIST
  );
};

const createSupplier = async (supplierData) => {
  const existed = await Supplier.findOne({ where: { name: supplierData.name } });
  if (existed) throw new Error('Nhà cung cấp đã tồn tại');
  const supplier = await Supplier.create(supplierData);
  await cacheHelper.del(CACHE_KEYS.ALL_SUPPLIERS);
  return supplier;
};

const updateSupplier = async (id, supplierData) => {
  const supplier = await Supplier.findByPk(id);
  if (!supplier) throw new Error('Supplier not found');
  await supplier.update(supplierData);
  await cacheHelper.del(CACHE_KEYS.ALL_SUPPLIERS);
  return supplier;
};

const deleteSupplier = async (id) => {
  const supplier = await Supplier.findByPk(id);
  if (!supplier) throw new Error('Supplier not found');
  await supplier.destroy();
  await cacheHelper.del(CACHE_KEYS.ALL_SUPPLIERS);
  return { success: true };
};

module.exports = {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
