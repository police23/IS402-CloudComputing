const db = require("../db");
const getAllDamageReports = async () => {
    const [reports] = await db.query(`
        SELECT dr.id, dr.created_at, dr.note, u.full_name AS created_by_name, dr.created_by
        FROM damage_reports dr
        JOIN users u ON dr.created_by = u.id
        ORDER BY dr.created_at DESC
    `);

    for (const report of reports) {
        const [items] = await db.query(`
            SELECT dri.book_id, b.title AS book_title, dri.quantity, dri.reason
            FROM damage_report_items dri
            JOIN books b ON dri.book_id = b.id
            WHERE dri.report_id = ?
        `, [report.id]);
        report.items = items;
    }
    return reports;
};

const createDamageReport = async (report) => {
    // Hỗ trợ cả frontend gửi createdBy hoặc created_by, items hoặc damagedBooks
    const created_by = report.created_by || report.createdBy;
    const note = report.note || '';
    const items = report.items || report.damagedBooks || [];

    if (!created_by) {
        throw new Error("Thiếu thông tin người lập phiếu (created_by)");
    }
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Danh sách sách hư hỏng không hợp lệ");
    }

    const [result] = await db.query(
        "INSERT INTO damage_reports (created_by, note, created_at) VALUES (?, ?, NOW())",
        [created_by, note]
    );
    const reportId = result.insertId;

    for (const item of items) {
       
        const book_id = item.book_id || item.bookId;
        const quantity = item.quantity;
        const reason = item.reason || '';
        if (!book_id || !quantity) continue;
        await db.query(
            "INSERT INTO damage_report_items (report_id, book_id, quantity, reason) VALUES (?, ?, ?, ?)",
            [reportId, book_id, quantity, reason]
        );
        await db.query(
            "UPDATE books SET quantity_in_stock = quantity_in_stock - ? WHERE id = ?",
            [quantity, book_id]
        );
    }
    return items;
};
const deleteDamageReport = async (id) => {
    const [result] = await db.query("DELETE FROM damage_reports WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
        throw new Error("Báo cáo hư hỏng không tồn tại");
    }
    return { message: "Xóa báo cáo hư hỏng thành công" };
};

module.exports = {
    getAllDamageReports,
    createDamageReport,
    deleteDamageReport
};


