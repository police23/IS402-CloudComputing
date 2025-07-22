const db = require("../db");

const getAllImports = async () => {
    const [imports] = await db.query(`
    SELECT bi.id, bi.import_date, bi.total_price, 
           s.name AS supplier, u.full_name AS employee, bi.supplier_id, bi.imported_by
    FROM book_imports bi
    JOIN suppliers s ON bi.supplier_id = s.id
    JOIN users u ON bi.imported_by = u.id
    ORDER BY bi.import_date DESC
  `);

    for (const imp of imports) {
        const [details] = await db.query(`
      SELECT bid.book_id, b.title AS book, bid.quantity, bid.unit_price AS price
      FROM book_import_details bid
      JOIN books b ON bid.book_id = b.id
      WHERE bid.import_id = ?
    `, [imp.id]);
        imp.bookDetails = details;
    }

    return imports;
};

const createImport = async (importData) => {
    const { supplierId, importedBy, bookDetails, total } = importData;
    const importedById = Number(importedBy);
    
    const [result] = await db.query(
        "INSERT INTO book_imports (supplier_id, imported_by, total_price) VALUES (?, ?, ?)",
        [supplierId, importedById, total]
    );
    const importId = result.insertId;
    for (const detail of bookDetails) {
        await db.query(
            "INSERT INTO book_import_details (import_id, book_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
            [importId, detail.bookId, detail.quantity, detail.price]
        );
    }
    return result;
};

const deleteImport = async (id) => {
 
    await db.query("DELETE FROM book_import_details WHERE import_id = ?", [id]);
    const [result] = await db.query("DELETE FROM book_imports WHERE id = ?", [id]);

    return result;
};

const getImportsByYear = async (year) => {
    const [imports] = await db.query(`
        SELECT 
            bi.id, bi.import_date, bi.total_price,
            s.name AS supplier, u.full_name AS employee, 
            bi.supplier_id, bi.imported_by
        FROM 
            book_imports bi
            JOIN suppliers s ON bi.supplier_id = s.id
            JOIN users u ON bi.imported_by = u.id
        WHERE 
            YEAR(bi.import_date) = ?
        ORDER BY 
            bi.import_date DESC
    `, [year]);

    for (const imp of imports) {
        const [details] = await db.query(`
            SELECT 
                bid.id, bid.book_id, b.title AS book, 
                bid.quantity, bid.unit_price AS price
            FROM 
                book_import_details bid
                JOIN books b ON bid.book_id = b.id
            WHERE 
                bid.import_id = ?
        `, [imp.id]);
        imp.bookDetails = details;
    }

    return imports;
};

const getImportDataByMonth = async (year, month) => {
    const [dailyStats] = await db.query(`
        SELECT 
            DAY(bi.import_date) as day,
            COUNT(DISTINCT bi.id) as import_count,
            SUM(bid.quantity) as total_books,
            SUM(bid.quantity * bid.unit_price) as total_cost
        FROM 
            book_imports bi
            JOIN book_import_details bid ON bi.id = bid.import_id
        WHERE 
            YEAR(bi.import_date) = ? AND MONTH(bi.import_date) = ?
        GROUP BY 
            DAY(bi.import_date)
        ORDER BY 
            day
    `, [year, month]);

    const daysInMonth = new Date(year, month, 0).getDate();

    const allDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
        // Find data for this day
        const dayData = dailyStats.find(stat => stat.day === day);
          if (dayData) {
            allDays.push({
                day: day,
                importCount: parseInt(dayData.import_count) || 0,
                totalBooks: parseInt(dayData.total_books) || 0,
                totalCost: parseFloat(dayData.total_cost) || 0
            });
        } else {
            allDays.push({
                day: day,
                importCount: 0,
                totalBooks: 0,
                totalCost: 0
            });
        }
    }

    return { daily: allDays };
};

const getImportDataByYear = async (year) => {
    const [monthlyStats] = await db.query(`
        SELECT 
            MONTH(bi.import_date) as month,
            COUNT(DISTINCT bi.id) as import_count,
            SUM(bid.quantity) as total_books,
            SUM(bid.quantity * bid.unit_price) as total_cost
        FROM 
            book_imports bi
            JOIN book_import_details bid ON bi.id = bid.import_id
        WHERE 
            YEAR(bi.import_date) = ?
        GROUP BY 
            MONTH(bi.import_date)
        ORDER BY 
            month
    `, [year]);

    if (monthlyStats.length === 0) {
        return { monthly: [] };
    }

    const monthlyData = monthlyStats.map(stat => ({
        month: stat.month,
        importCount: stat.import_count,
        totalBooks: stat.total_books,
        totalCost: parseFloat(stat.total_cost)
    }));

    return { monthly: monthlyData };
};

module.exports = {
    getAllImports,
    createImport,
    deleteImport,
    getImportsByYear,
    getImportDataByMonth,
    getImportDataByYear
};
