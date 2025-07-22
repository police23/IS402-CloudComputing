const db = require("../db");

const getAllSuppliers = async () => {
    const [rows] = await db.query("SELECT id, name, address, phone, email, created_at, updated_at FROM suppliers");
    return rows;
};

const createSupplier = async (supplier) => {
    const { name, address, phone, email } = supplier;
    const [result] = await db.query(
        "INSERT INTO suppliers (name, address, phone, email, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
        [name, address, phone, email]
    );
    return result;
};

const updateSupplier = async (id, supplier) => {
    const { name, address, phone, email } = supplier;
    const [result] = await db.query(
        "UPDATE suppliers SET name = ?, address = ?, phone = ?, email = ?, updated_at = NOW() WHERE id = ?",
        [name, address, phone, email, id]
    );
    if (result.affectedRows === 0) {
        throw new Error("Supplier not found");
    }
    return result;
};

const deleteSupplier = async (id) => {
    const [result] = await db.query("DELETE FROM suppliers WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
        throw new Error("Supplier not found");
    }
    return result;
};

module.exports = {
    getAllSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
};
