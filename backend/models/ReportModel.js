const db = require("../db");

const getRevenueByYearOffline = async (year) => {
    const [monthly] = await db.query(`
        SELECT MONTH(i.created_at) AS month,
               SUM(d.quantity * d.unit_price) AS totalRevenue,
               SUM(d.quantity) AS totalSold
        FROM invoices i
        JOIN invoice_details d ON i.id = d.invoice_id
        WHERE YEAR(i.created_at) = ?
        GROUP BY MONTH(i.created_at)
        ORDER BY MONTH(i.created_at)
    `, [year]);
    return monthly;
};

const getRevenueByYearOnline = async (year) => {
    const [monthly] = await db.query(`
        SELECT MONTH(o.order_date) AS month,
               SUM(od.quantity * od.unit_price) AS totalRevenue,
               SUM(od.quantity) AS totalSold
        FROM orders o
        JOIN order_details od ON o.id = od.order_id
        WHERE YEAR(o.order_date) = ?
        GROUP BY MONTH(o.order_date)
        ORDER BY MONTH(o.order_date)
    `, [year]);
    return monthly;
};

const getRevenueByYearAll = async (year) => {
    const [monthly] = await db.query(`
        SELECT month, SUM(totalRevenue) AS totalRevenue, SUM(totalSold) AS totalSold FROM (
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
        ORDER BY month
    `, [year, year]);
    return monthly;
};


const getDailyRevenueByMonthOffline = async (month, year) => {
    const [dailyData] = await db.query(`
        SELECT
            DAY(i.created_at) AS day,
            SUM(d.quantity * d.unit_price) AS totalRevenue,
            SUM(d.quantity) AS totalSold
        FROM invoices i
        JOIN invoice_details d ON i.id = d.invoice_id
        WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
        GROUP BY DAY(i.created_at)
        ORDER BY DAY(i.created_at)
    `, [month, year]);
    return dailyData;
};


const getDailyRevenueByMonthOnline = async (month, year) => {
    const [dailyData] = await db.query(`
        SELECT
            DAY(o.order_date) AS day,
            SUM(od.quantity * od.unit_price) AS totalRevenue,
            SUM(od.quantity) AS totalSold
        FROM orders o
        JOIN order_details od ON o.id = od.order_id
        WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?
        GROUP BY DAY(o.order_date)
        ORDER BY DAY(o.order_date)
    `, [month, year]);
    return dailyData;
};

const getDailyRevenueByMonthAll = async (month, year) => {
    const [dailyData] = await db.query(`
        SELECT day, SUM(totalRevenue) AS totalRevenue, SUM(totalSold) AS totalSold FROM (
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
        ORDER BY day
    `, [month, year, month, year]);
    return dailyData;
};

const getTotalRevenueByMonth = async (month, year) => {
    const [summary] = await db.query(`
        SELECT
            SUM(d.quantity * d.unit_price) AS totalRevenue,
            SUM(d.quantity) AS totalSold
        FROM invoices i
        JOIN invoice_details d ON i.id = d.invoice_id
        WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
    `, [month, year]);
    return {
        totalRevenue: summary[0]?.totalRevenue || 0,
        totalSold: summary[0]?.totalSold || 0
    };
}

const getDailyRevenueByMonth = async (month, year) => {
    const [dailyData] = await db.query(`
        SELECT
            DAY(i.created_at) AS day,
            SUM(d.quantity * d.unit_price) AS totalRevenue,
            SUM(d.quantity) AS totalSold
        FROM invoices i
        JOIN invoice_details d ON i.id = d.invoice_id
        WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
        GROUP BY DAY(i.created_at)
        ORDER BY DAY(i.created_at)
    `, [month, year]);
    return dailyData;
}

const getTop10MostSoldBooksOffline = async (month, year) => {
    month = Number(month);
    year = Number(year);
    console.log("[ReportModel] getTop10MostSoldBooksOffline - month:", month, "year:", year);
    const [rows] = await db.query(`
        SELECT b.id, b.title, SUM(d.quantity) AS total_sold
        FROM invoice_details d
        JOIN invoices i ON d.invoice_id = i.id
        JOIN books b ON d.book_id = b.id
        WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
        GROUP BY b.id, b.title
        ORDER BY total_sold DESC
        LIMIT 10
    `, [month, year]);
    return rows;
};

const getTop10MostSoldBooksOnline = async (month, year) => {
    month = Number(month);
    year = Number(year);
    console.log("[ReportModel] getTop10MostSoldBooksOnline - month:", month, "year:", year);
    const [rows] = await db.query(`
        SELECT b.id, b.title, SUM(od.quantity) AS total_sold
        FROM order_details od
        JOIN orders o ON od.order_id = o.id
        JOIN books b ON od.book_id = b.id
        WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?
        GROUP BY b.id, b.title
        ORDER BY total_sold DESC
        LIMIT 10
    `, [month, year]);
    return rows;
};

const getTop10MostSoldBooksAll = async (month, year) => {
    month = Number(month);
    year = Number(year);
    console.log("[ReportModel] getTop10MostSoldBooksAll - month:", month, "year:", year);
    const [rows] = await db.query(`
        SELECT b.id, b.title, SUM(total_sold) AS total_sold
        FROM (
            SELECT d.book_id, b.title, SUM(d.quantity) AS total_sold
            FROM invoice_details d
            JOIN invoices i ON d.invoice_id = i.id
            JOIN books b ON d.book_id = b.id
            WHERE MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?
            GROUP BY d.book_id, b.title

            UNION ALL

            SELECT od.book_id, b.title, SUM(od.quantity) AS total_sold
            FROM order_details od
            JOIN orders o ON od.order_id = o.id
            JOIN books b ON od.book_id = b.id
            WHERE MONTH(o.order_date) = ? AND YEAR(o.order_date) = ?
            GROUP BY od.book_id, b.title
        ) AS combined
        JOIN books b ON combined.book_id = b.id
        GROUP BY b.id, b.title
        ORDER BY total_sold DESC
        LIMIT 10
    `, [month, year, month, year]);
    return rows;
};


module.exports = {
    getTop10MostSoldBooksOffline,
    getTop10MostSoldBooksOnline,
    getTop10MostSoldBooksAll,
    getTotalRevenueByMonth,
    getDailyRevenueByMonth
    ,getDailyRevenueByMonthOffline
    ,getDailyRevenueByMonthOnline
    ,getDailyRevenueByMonthAll
    ,getRevenueByYearOffline
    ,getRevenueByYearOnline
    ,getRevenueByYearAll
}; 