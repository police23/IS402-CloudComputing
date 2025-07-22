const supplierModel = require("../models/SupplierModel");

/**
 * Lấy tất cả nhà cung cấp
 * @returns {Promise<Array>} Danh sách các nhà cung cấp
 */
const getAllSuppliers = async () => {
    return await supplierModel.getAllSuppliers();
};

const createSupplier = async (supplierData) => {
    const existingSuppliers = await supplierModel.getAllSuppliers();
        const existed = existingSuppliers.some(supplier => supplier.name === supplierData.name);
        if (existed) {
            throw new Error("Nhà cung cấp đã tồn tại");
        }
    
    return await supplierModel.createSupplier(supplierData);
};

const updateSupplier = async (id, supplierData) => {
    return await supplierModel.updateSupplier(id, supplierData);
}
const deleteSupplier = async (id) => {
    return await supplierModel.deleteSupplier(id);
};

module.exports = {
    getAllSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
};
