const supplierService = require("../services/SupplierService");

const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.getAllSuppliers();
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ error: "Không thể lấy danh sách nhà cung cấp" });
    }
};

const createSupplier = async (req, res) => {
    try {
        const result = await supplierService.createSupplier(req.body);
        res.status(201).json(result);
    } catch (error) {
        const statusCode = error.status || 500;
        const message = error.message || "Không thể thêm nhà cung cấp";
        res.status(statusCode).json({ error: message });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await supplierService.updateSupplier(id, req.body);
        res.json(result);
    } catch (error) {
        const statusCode = error.status || 500;
        const message = error.message || "Không thể cập nhật nhà cung cấp";
        res.status(statusCode).json({ error: message });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await supplierService.deleteSupplier(id);
        res.json(result);
    } catch (error) {
        const statusCode = error.status || 500;
        const message = error.message || "Không thể xóa nhà cung cấp";
        res.status(statusCode).json({ error: message });
    }
};

module.exports = {
    getAllSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
};
