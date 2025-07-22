const db = require("../db");

const getAllInvoices = async () => {
    const [rows] = await db.query(`
        SELECT i.*, u.full_name AS created_by_name, p.name AS promotion_name
        FROM invoices i
        LEFT JOIN users u ON i.created_by = u.id
        LEFT JOIN promotions p ON i.promotion_code = p.promotion_code
        ORDER BY i.created_at DESC
    `);
    return rows;
};

const getInvoicesByUser = async (userId) => {
    const [rows] = await db.query(`
        SELECT i.*, u.full_name AS created_by_name, p.name AS promotion_name
        FROM invoices i
        LEFT JOIN users u ON i.created_by = u.id
        LEFT JOIN promotions p ON i.promotion_code = p.promotion_code
        WHERE i.created_by = ?
        ORDER BY i.created_at DESC
    `, [userId]);
    return rows;
};

const addInvoice = async (invoiceData) => {
    const { customer_name, customer_phone, total_amount, discount_amount, final_amount, promotion_code, created_by, created_at, bookDetails } = invoiceData;

    for (const detail of bookDetails) {
        const [rows] = await db.query(
            "SELECT quantity_in_stock FROM books WHERE id = ?",
            [detail.book_id]
        );
        const currentStock = rows[0]?.quantity_in_stock ?? 0;
        if (detail.quantity > currentStock) {
            throw {
                status: 400,
                message: `Sách ID ${detail.book_id} không đủ tồn kho. Hiện còn: ${currentStock}, yêu cầu: ${detail.quantity}`
            };
        }
    }

    const [result] = await db.query(
        `INSERT INTO invoices (customer_name, customer_phone, total_amount, discount_amount, final_amount, promotion_code, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [customer_name, customer_phone, total_amount, discount_amount, final_amount, promotion_code || null, created_by, created_at || new Date()]
    );
    const invoiceId = result.insertId;
    for (const detail of bookDetails) {
        await db.query(
            `INSERT INTO invoice_details (invoice_id, book_id, quantity, unit_price)
            VALUES (?, ?, ?, ?)`,
            [invoiceId, detail.book_id, detail.quantity, detail.unit_price]
        );
    }
    return result;
};


const getInvoiceById = async (invoiceId) => {
    const [invoices] = await db.query(`
        SELECT i.*, u.full_name AS created_by_name, p.name AS promotion_name
        FROM invoices i
        LEFT JOIN users u ON i.created_by = u.id
        LEFT JOIN promotions p ON i.promotion_code = p.promotion_code
        WHERE i.id = ?
    `, [invoiceId]);
    if (invoices.length === 0) return null;
    const invoice = invoices[0];
    const [details] = await db.query(`
        SELECT d.*, b.title AS book_title
        FROM invoice_details d
        LEFT JOIN books b ON d.book_id = b.id
        WHERE d.invoice_id = ?
    `, [invoiceId]);
    invoice.bookDetails = details;
    return invoice;
};

const deleteInvoice = async (invoiceId) => {
    await db.query("DELETE FROM invoice_details WHERE invoice_id = ?", [invoiceId]);
    const [result] = await db.query("DELETE FROM invoices WHERE id = ?", [invoiceId]);
    return result;
};


module.exports = {
    getAllInvoices,
    getInvoicesByUser,
    addInvoice,
    getInvoiceById,
    deleteInvoice
};
