const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

// Doanh thu theo năm (bỏ hậu tố 'Online')
const getRevenueByYear = async (year) => {
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

// Doanh thu theo ngày trong tháng (bỏ hậu tố 'Online')
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

// (Đã gộp vào hàm cùng tên ở trên)

// Top 10 sách bán chạy (bỏ hậu tố 'Online')
const getTop10MostSoldBooks = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    
    // Lấy thêm đường dẫn ảnh đại diện của sách (ảnh đầu tiên theo id nhỏ nhất)
    const results = await sequelize.query(
        `SELECT 
            b.id,
            b.title,
            fi.image_path AS image_path,
            SUM(od.quantity) AS total_sold
         FROM order_details od
         JOIN orders o ON od.order_id = o.id
         JOIN books b ON od.book_id = b.id
         LEFT JOIN (
            SELECT bi1.book_id, bi1.image_path
            FROM book_images bi1
            INNER JOIN (
                SELECT book_id, MIN(id) AS min_id
                FROM book_images
                GROUP BY book_id
            ) first ON first.book_id = bi1.book_id AND first.min_id = bi1.id
         ) fi ON fi.book_id = b.id
         WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?
         GROUP BY b.id, b.title, fi.image_path
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
    getTop10MostSoldBooks,
    getTotalRevenueByMonth,
    getDailyRevenueByMonth,
    getRevenueByYear,
    getBookRevenueDetailsByYear,
    getBookRevenueDetailsByMonth
};