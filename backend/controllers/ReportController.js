const reportService = require("../services/ReportService");
const getRevenueByYearOffline = async (req, res) => {
    try {
        const year = req.query.year || req.params.year;
        if (!year) return res.status(400).json({ message: "Thiếu tham số năm" });
        const monthly = await reportService.getRevenueByYearOffline(year);
        res.json({ monthly });
    } catch (error) {
        if (error.message === "Thiếu tham số năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy doanh thu theo năm (offline)" });
    }
};

// Doanh thu & số lượng bán theo 12 tháng của năm (online)
const getRevenueByYearOnline = async (req, res) => {
    try {
        const year = req.query.year || req.params.year;
        if (!year) return res.status(400).json({ message: "Thiếu tham số năm" });
        const monthly = await reportService.getRevenueByYearOnline(year);
        res.json({ monthly });
    } catch (error) {
        if (error.message === "Thiếu tham số năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy doanh thu theo năm (online)" });
    }
};

// Doanh thu & số lượng bán theo 12 tháng của năm (tổng hợp)
const getRevenueByYearAll = async (req, res) => {
    try {
        const year = req.query.year || req.params.year;
        if (!year) return res.status(400).json({ message: "Thiếu tham số năm" });
        const monthly = await reportService.getRevenueByYearAll(year);
        res.json({ monthly });
    } catch (error) {
        if (error.message === "Thiếu tham số năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy doanh thu theo năm (tổng hợp)" });
    }
};
// Doanh thu & số lượng bán theo ngày (offline)
const getDailyRevenueByMonthOffline = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        if (!month || !year) {
            return res.status(400).json({ message: "Thiếu tham số tháng hoặc năm" });
        }
        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyData = await reportService.getDailyRevenueByMonthOffline(month, year);
        const normalized = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const found = dailyData.find(item => Number(item.day) === d);
            normalized.push({
                day: d,
                totalRevenue: found ? Number(found.totalRevenue) || 0 : 0,
                totalSold: found ? Number(found.totalSold) || 0 : 0
            });
        }
        res.json({ daily: normalized });
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy doanh thu theo ngày (offline)" });
    }
};

// Doanh thu & số lượng bán theo ngày (online)
const getDailyRevenueByMonthOnline = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        if (!month || !year) {
            return res.status(400).json({ message: "Thiếu tham số tháng hoặc năm" });
        }
        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyData = await reportService.getDailyRevenueByMonthOnline(month, year);
        const normalized = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const found = dailyData.find(item => Number(item.day) === d);
            normalized.push({
                day: d,
                totalRevenue: found ? Number(found.totalRevenue) || 0 : 0,
                totalSold: found ? Number(found.totalSold) || 0 : 0
            });
        }
        res.json({ daily: normalized });
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy doanh thu theo ngày (online)" });
    }
};

// Doanh thu & số lượng bán theo ngày (tổng hợp online + offline)
const getDailyRevenueByMonthAll = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        if (!month || !year) {
            return res.status(400).json({ message: "Thiếu tham số tháng hoặc năm" });
        }
        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyData = await reportService.getDailyRevenueByMonthAll(month, year);
        const normalized = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const found = dailyData.find(item => Number(item.day) === d);
            normalized.push({
                day: d,
                totalRevenue: found ? Number(found.totalRevenue) || 0 : 0,
                totalSold: found ? Number(found.totalSold) || 0 : 0
            });
        }
        res.json({ daily: normalized });
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy doanh thu theo ngày (tổng hợp)" });
    }
};


const getTotalRevenueByMonth = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        if (year && !month) {
            // Nếu chỉ có year, trả về dữ liệu cho cả 12 tháng
            const monthly = [];
            for (let m = 1; m <= 12; m++) {
                const result = await reportService.getTotalRevenueByMonth(m, year);
                monthly.push({
                    month: m,
                    totalRevenue: result.totalRevenue || 0,
                    totalSold: result.totalSold || 0
                });
            }
            return res.json({ monthly });
        }
        if (month && year) {
            const result = await reportService.getTotalRevenueByMonth(month, year);
            return res.json(result);
        }
        return res.status(400).json({ message: "Thiếu tham số tháng hoặc năm" });
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy doanh thu theo tháng" });
    }
};

const getDailyRevenueByMonth = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        if (!month || !year) {
            return res.status(400).json({ message: "Thiếu tham số tháng hoặc năm" });
        }
        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyData = await reportService.getDailyRevenueByMonth(month, year);
        // Chuẩn hóa dữ liệu: trả về đủ số ngày trong tháng
        const normalized = [];
        for (let d = 1; d <= daysInMonth; d++) {
            const found = dailyData.find(item => Number(item.day) === d);
            normalized.push({
                day: d,
                totalRevenue: found ? Number(found.totalRevenue) || 0 : 0,
                totalSold: found ? Number(found.totalSold) || 0 : 0
            });
        }
        res.json({ daily: normalized });
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy doanh thu theo ngày" });
    }
};

const getTop10MostSoldBooksOffline = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        const books = await reportService.getTop10MostSoldBooksOffline(month, year);
        res.json(books);
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy top 10 sách bán chạy offline" });
    }
};

const getTop10MostSoldBooksOnline = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        const books = await reportService.getTop10MostSoldBooksOnline(month, year);
        res.json(books);
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy top 10 sách bán chạy online" });
    }
};

const getTop10MostSoldBooksAll = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        const books = await reportService.getTop10MostSoldBooksAll(month, year);
        res.json(books);
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy top 10 sách bán chạy tổng hợp" });
    }
};

// API lấy chi tiết doanh thu theo từng sách theo tháng trong năm
const getBookRevenueDetailsByYear = async (req, res) => {
    try {
        const year = req.query.year || req.params.year;
        const type = req.query.type || 'all'; // mặc định lấy tất cả
        
        if (!year) {
            return res.status(400).json({ message: "Thiếu tham số năm" });
        }
        
        const detailData = await reportService.getBookRevenueDetailsByYear(year, type);
        res.json(detailData);
    } catch (error) {
        if (error.message === "Thiếu tham số năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy chi tiết doanh thu theo sách theo tháng" });
    }
};

// API lấy chi tiết doanh thu theo từng sách theo ngày trong tháng
const getBookRevenueDetailsByMonth = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        const type = req.query.type || 'all'; // mặc định lấy tất cả
        
        if (!month || !year) {
            return res.status(400).json({ message: "Thiếu tham số tháng hoặc năm" });
        }
        
        const detailData = await reportService.getBookRevenueDetailsByMonth(month, year, type);
        res.json(detailData);
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy chi tiết doanh thu theo sách theo ngày" });
    }
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