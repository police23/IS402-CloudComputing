const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

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

const getTotalRevenueByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    const results = await sequelize.query(
        `SELECT SUM(od.quantity * od.unit_price) AS totalRevenue,
                SUM(od.quantity) AS totalSold
         FROM orders o
         JOIN order_details od ON o.id = od.order_id
         WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?`,
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

// Lấy chi tiết doanh thu theo từng sách theo tháng trong năm
const getBookRevenueDetailsByYear = async (year, type = 'all') => {
    if (!year) {
        throw new Error("Thiếu tham số năm");
    }
    if (type === 'offline') {
        throw new Error("Loại thống kê 'offline' không được hỗ trợ");
    }
    const query = `
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
    const results = await sequelize.query(query, {
        replacements: [year],
        type: QueryTypes.SELECT
    });
    return results;
};

// Lấy chi tiết doanh thu theo từng sách theo ngày trong tháng
const getBookRevenueDetailsByMonth = async (month, year, type = 'all') => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    if (type === 'offline') {
        throw new Error("Loại thống kê 'offline' không được hỗ trợ");
    }
    const query = `
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
    const results = await sequelize.query(query, {
        replacements: [month, year],
        type: QueryTypes.SELECT
    });
    return results;
};

module.exports = {
    getTop10MostSoldBooksOnline,
    getTotalRevenueByMonth,
    getDailyRevenueByMonth,
    getDailyRevenueByMonthOnline,
    getRevenueByYearOnline,
    getBookRevenueDetailsByYear,
    getBookRevenueDetailsByMonth
};