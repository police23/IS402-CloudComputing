const { Supplier } = require('../models');
const { Op } = require('sequelize');

const getAllSuppliers = async () => {
  return await Supplier.findAll();
};

const createSupplier = async (supplierData) => {
  const existed = await Supplier.findOne({ where: { name: supplierData.name } });
  if (existed) throw new Error('Nhà cung cấp đã tồn tại');
  const supplier = await Supplier.create(supplierData);
  return supplier;
};

const updateSupplier = async (id, supplierData) => {
  const supplier = await Supplier.findByPk(id);
  if (!supplier) throw new Error('Supplier not found');
  await supplier.update(supplierData);
  return supplier;
};

const deleteSupplier = async (id) => {
  const supplier = await Supplier.findByPk(id);
  if (!supplier) throw new Error('Supplier not found');
  await supplier.destroy();
  return { success: true };
};

module.exports = {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
