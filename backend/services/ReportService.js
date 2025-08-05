const { Invoice, InvoiceDetail, Order, OrderDetail, Book, sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

const getRevenueByYearOffline = async (year) => {
    if (!year) throw new Error("Thiếu tham số năm");
    
    const results = await sequelize.query(
        `SELECT MONTH(i.created_at) AS month,
                SUM(d.quantity * d.unit_price) AS totalRevenue,
                SUM(d.quantity) AS totalSold
         FROM invoices i
         JOIN invoice_details d ON i.id = d.invoice_id
         WHERE YEAR(i.created_at) = ?
         GROUP BY MONTH(i.created_at)
         ORDER BY MONTH(i.created_at)`,
        {
            replacements: [year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getRevenueByYearOnline = async (year) => {
    if (!year) throw new Error("Thiếu tham số năm");
    
    const results = await sequelize.query(
        `SELECT MONTH(o.order_date) AS month,
                SUM(od.quantity * od.unit_price) AS totalRevenue,
                SUM(od.quantity) AS totalSold
         FROM orders o
         JOIN order_details od ON o.id = od.order_id
         WHERE YEAR(o.order_date) = ?
         GROUP BY MONTH(o.order_date)
         ORDER BY MONTH(o.order_date)`,
        {
            replacements: [year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getRevenueByYearAll = async (year) => {
    if (!year) throw new Error("Thiếu tham số năm");
    
    const results = await sequelize.query(
        `SELECT month, SUM(totalRevenue) AS totalRevenue, SUM(totalSold) AS totalSold FROM (
            SELECT MONTH(i.created_at) AS month, SUM(d.quantity * d.unit_price) AS totalRevenue, SUM(d.quantity) AS totalSold
            FROM invoices i
            JOIN invoice_details d ON i.id = d.invoice_id
            WHERE YEAR(i.created_at) = ?
            GROUP BY MONTH(i.created_at)
            UNION ALL
            SELECT MONTH(o.order_date) AS month, SUM(od.quantity * od.unit_price) AS totalRevenue, SUM(od.quantity) AS totalSold
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            WHERE YEAR(o.order_date) = ?
            GROUP BY MONTH(o.order_date)
        ) AS combined
        GROUP BY month
        ORDER BY month`,
        {
            replacements: [year, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getDailyRevenueByMonthOffline = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT DAY(i.created_at) AS day,
                SUM(d.quantity * d.unit_price) AS totalRevenue,
                SUM(d.quantity) AS totalSold
         FROM invoices i
         JOIN invoice_details d ON i.id = d.invoice_id
         WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
         GROUP BY DAY(i.created_at)
         ORDER BY DAY(i.created_at)`,
        {
            replacements: [month, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getDailyRevenueByMonthOnline = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT DAY(o.order_date) AS day,
                SUM(od.quantity * od.unit_price) AS totalRevenue,
                SUM(od.quantity) AS totalSold
         FROM orders o
         JOIN order_details od ON o.id = od.order_id
         WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?
         GROUP BY DAY(o.order_date)
         ORDER BY DAY(o.order_date)`,
        {
            replacements: [month, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getDailyRevenueByMonthAll = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT day, SUM(totalRevenue) AS totalRevenue, SUM(totalSold) AS totalSold FROM (
            SELECT DAY(i.created_at) AS day, SUM(d.quantity * d.unit_price) AS totalRevenue, SUM(d.quantity) AS totalSold
            FROM invoices i
            JOIN invoice_details d ON i.id = d.invoice_id
            WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
            GROUP BY DAY(i.created_at)
            UNION ALL
            SELECT DAY(o.order_date) AS day, SUM(od.quantity * od.unit_price) AS totalRevenue, SUM(od.quantity) AS totalSold
            FROM orders o
            JOIN order_details od ON o.id = od.order_id
            WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?
            GROUP BY DAY(o.order_date)
        ) AS combined
        GROUP BY day
        ORDER BY day`,
        {
            replacements: [month, year, month, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getTotalRevenueByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT SUM(d.quantity * d.unit_price) AS totalRevenue,
                SUM(d.quantity) AS totalSold
         FROM invoices i
         JOIN invoice_details d ON i.id = d.invoice_id
         WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?`,
        {
            replacements: [month, year],
            type: QueryTypes.SELECT
        }
    );
    
    return {
        totalRevenue: results[0]?.totalRevenue || 0,
        totalSold: results[0]?.totalSold || 0
    };
};

const getDailyRevenueByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT DAY(i.created_at) AS day,
                SUM(d.quantity * d.unit_price) AS totalRevenue,
                SUM(d.quantity) AS totalSold
         FROM invoices i
         JOIN invoice_details d ON i.id = d.invoice_id
         WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
         GROUP BY DAY(i.created_at)
         ORDER BY DAY(i.created_at)`,
        {
            replacements: [month, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getTop10MostSoldBooksOffline = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT b.id, b.title, SUM(d.quantity) AS total_sold
         FROM invoice_details d
         JOIN invoices i ON d.invoice_id = i.id
         JOIN books b ON d.book_id = b.id
         WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
         GROUP BY b.id, b.title
         ORDER BY total_sold DESC
         LIMIT 10`,
        {
            replacements: [month, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getTop10MostSoldBooksOnline = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT b.id, b.title, SUM(od.quantity) AS total_sold
         FROM order_details od
         JOIN orders o ON od.order_id = o.id
         JOIN books b ON od.book_id = b.id
         WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?
         GROUP BY b.id, b.title
         ORDER BY total_sold DESC
         LIMIT 10`,
        {
            replacements: [month, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

const getTop10MostSoldBooksAll = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT b.id, b.title, b.price, img.image_path, SUM(combined.total_sold) AS total_sold
         FROM (
            SELECT d.book_id, SUM(d.quantity) AS total_sold
            FROM invoice_details d
            JOIN invoices i ON d.invoice_id = i.id
            WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
            GROUP BY d.book_id
            UNION ALL
            SELECT od.book_id, SUM(od.quantity) AS total_sold
            FROM order_details od
            JOIN orders o ON od.order_id = o.id
            WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?
            GROUP BY od.book_id
         ) AS combined
         JOIN books b ON combined.book_id = b.id
         LEFT JOIN (
            SELECT book_id, MIN(image_path) AS image_path FROM book_images GROUP BY book_id
         ) img ON b.id = img.book_id
         GROUP BY b.id, b.title, b.price, img.image_path
         ORDER BY total_sold DESC
         LIMIT 10`,
        {
            replacements: [month, year, month, year],
            type: QueryTypes.SELECT
        }
    );
    return results;
};

// Lấy chi tiết doanh thu theo từng sách theo tháng trong năm
const getBookRevenueDetailsByYear = async (year, type = 'all') => {
    if (!year) {
        throw new Error("Thiếu tham số năm");
    }
    
    let query = '';
    let params = [];

    if (type === 'offline') {
        query = `
            SELECT 
                b.id, 
                b.title, 
                b.price,
                MONTH(i.created_at) AS month,
                SUM(d.quantity) AS quantity_sold,
                SUM(d.quantity * d.unit_price) AS revenue
            FROM books b
            JOIN invoice_details d ON b.id = d.book_id
            JOIN invoices i ON d.invoice_id = i.id
            WHERE YEAR(i.created_at) = ?
            GROUP BY b.id, b.title, b.price, MONTH(i.created_at)
            ORDER BY MONTH(i.created_at), b.title
        `;
        params = [year];
    } else if (type === 'online') {
        query = `
            SELECT 
                b.id, 
                b.title, 
                b.price,
                MONTH(o.order_date) AS month,
                SUM(od.quantity) AS quantity_sold,
                SUM(od.quantity * od.unit_price) AS revenue
            FROM books b
            JOIN order_details od ON b.id = od.book_id
            JOIN orders o ON od.order_id = o.id
            WHERE YEAR(o.order_date) = ?
            GROUP BY b.id, b.title, b.price, MONTH(o.order_date)
            ORDER BY MONTH(o.order_date), b.title
        `;
        params = [year];
    } else {
        // type = 'all' (mặc định)
        query = `
            SELECT 
                combined.id, 
                combined.title, 
                combined.price,
                combined.month,
                SUM(combined.quantity_sold) AS quantity_sold,
                SUM(combined.revenue) AS revenue
            FROM (
                SELECT 
                    b.id, 
                    b.title, 
                    b.price,
                    MONTH(i.created_at) AS month,
                    SUM(d.quantity) AS quantity_sold,
                    SUM(d.quantity * d.unit_price) AS revenue
                FROM books b
                JOIN invoice_details d ON b.id = d.book_id
                JOIN invoices i ON d.invoice_id = i.id
                WHERE YEAR(i.created_at) = ?
                GROUP BY b.id, b.title, b.price, MONTH(i.created_at)
                
                UNION ALL
                
                SELECT 
                    b.id, 
                    b.title, 
                    b.price,
                    MONTH(o.order_date) AS month,
                    SUM(od.quantity) AS quantity_sold,
                    SUM(od.quantity * od.unit_price) AS revenue
                FROM books b
                JOIN order_details od ON b.id = od.book_id
                JOIN orders o ON od.order_id = o.id
                WHERE YEAR(o.order_date) = ?
                GROUP BY b.id, b.title, b.price, MONTH(o.order_date)
            ) AS combined
            GROUP BY combined.id, combined.title, combined.price, combined.month
            ORDER BY combined.month, combined.title
        `;
        params = [year, year];
    }
    
    const results = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
    });
    return results;
};

// Lấy chi tiết doanh thu theo từng sách theo ngày trong tháng
const getBookRevenueDetailsByMonth = async (month, year, type = 'all') => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    let query = '';
    let params = [];

    if (type === 'offline') {
        query = `
            SELECT 
                b.id, 
                b.title, 
                b.price,
                DAY(i.created_at) AS day,
                SUM(d.quantity) AS quantity_sold,
                SUM(d.quantity * d.unit_price) AS revenue
            FROM books b
            JOIN invoice_details d ON b.id = d.book_id
            JOIN invoices i ON d.invoice_id = i.id
            WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
            GROUP BY b.id, b.title, b.price, DAY(i.created_at)
            ORDER BY DAY(i.created_at), b.title
        `;
        params = [month, year];
    } else if (type === 'online') {
        query = `
            SELECT 
                b.id, 
                b.title, 
                b.price,
                DAY(o.order_date) AS day,
                SUM(od.quantity) AS quantity_sold,
                SUM(od.quantity * od.unit_price) AS revenue
            FROM books b
            JOIN order_details od ON b.id = od.book_id
            JOIN orders o ON od.order_id = o.id
            WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?
            GROUP BY b.id, b.title, b.price, DAY(o.order_date)
            ORDER BY DAY(o.order_date), b.title
        `;
        params = [month, year];
    } else {
        // type = 'all' (mặc định)
        query = `
            SELECT 
                combined.id, 
                combined.title, 
                combined.price,
                combined.day,
                SUM(combined.quantity_sold) AS quantity_sold,
                SUM(combined.revenue) AS revenue
            FROM (
                SELECT 
                    b.id, 
                    b.title, 
                    b.price,
                    DAY(i.created_at) AS day,
                    SUM(d.quantity) AS quantity_sold,
                    SUM(d.quantity * d.unit_price) AS revenue
                FROM books b
                JOIN invoice_details d ON b.id = d.book_id
                JOIN invoices i ON d.invoice_id = i.id
                WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
                GROUP BY b.id, b.title, b.price, DAY(i.created_at)
                
                UNION ALL
                
                SELECT 
                    b.id, 
                    b.title, 
                    b.price,
                    DAY(o.order_date) AS day,
                    SUM(od.quantity) AS quantity_sold,
                    SUM(od.quantity * od.unit_price) AS revenue
                FROM books b
                JOIN order_details od ON b.id = od.book_id
                JOIN orders o ON od.order_id = o.id
                WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?
                GROUP BY b.id, b.title, b.price, DAY(o.order_date)
            ) AS combined
            GROUP BY combined.id, combined.title, combined.price, combined.day
            ORDER BY combined.day, combined.title
        `;
        params = [month, year, month, year];
    }
    
    const results = await sequelize.query(query, {
        replacements: params,
        type: QueryTypes.SELECT
    });
    return results;
};

module.exports = {
    getTop10MostSoldBooksOffline,
    getTop10MostSoldBooksOnline,
    getTop10MostSoldBooksAll,
    getTotalRevenueByMonth,
    getDailyRevenueByMonth,
    getDailyRevenueByMonthOffline,
    getDailyRevenueByMonthOnline,
    getDailyRevenueByMonthAll,
    getRevenueByYearOffline,
    getRevenueByYearOnline,
    getRevenueByYearAll,
    getBookRevenueDetailsByYear,
    getBookRevenueDetailsByMonth
};