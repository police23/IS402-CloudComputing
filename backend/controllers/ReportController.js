const reportService = require("../services/ReportService");

const getRevenueByYearOffline = async (req, res) => {
    try {
        const year = req.query.year || req.params.year;
        if (!year) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu tham số năm" 
            });
        }
        
        const monthly = await reportService.getRevenueByYearOffline(year);
        res.json({ 
            success: true, 
            data: { monthly } 
        });
    } catch (error) {
        console.error("Lỗi trong getRevenueByYearOffline:", error);
        if (error.message === "Thiếu tham số năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy doanh thu theo năm (offline)" 
        });
    }
};

const getRevenueByYearOnline = async (req, res) => {
    try {
        const year = req.query.year || req.params.year;
        if (!year) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu tham số năm" 
            });
        }
        
        const monthly = await reportService.getRevenueByYearOnline(year);
        res.json({ 
            success: true, 
            data: { monthly } 
        });
    } catch (error) {
        console.error("Lỗi trong getRevenueByYearOnline:", error);
        if (error.message === "Thiếu tham số năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy doanh thu theo năm (online)" 
        });
    }
};

const getRevenueByYearAll = async (req, res) => {
    try {
        const year = req.query.year || req.params.year;
        if (!year) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu tham số năm" 
            });
        }
        
        const monthly = await reportService.getRevenueByYearAll(year);
        res.json({ 
            success: true, 
            data: { monthly } 
        });
    } catch (error) {
        console.error("Lỗi trong getRevenueByYearAll:", error);
        if (error.message === "Thiếu tham số năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy doanh thu theo năm (tổng hợp)" 
        });
    }
};

const getDailyRevenueByMonthOffline = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        if (!month || !year) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu tham số tháng hoặc năm" 
            });
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
        
        res.json({ 
            success: true, 
            data: { daily: normalized } 
        });
    } catch (error) {
        console.error("Lỗi trong getDailyRevenueByMonthOffline:", error);
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy doanh thu theo ngày (offline)" 
        });
    }
};

const getDailyRevenueByMonthOnline = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        if (!month || !year) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu tham số tháng hoặc năm" 
            });
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
        
        res.json({ 
            success: true, 
            data: { daily: normalized } 
        });
    } catch (error) {
        console.error("Lỗi trong getDailyRevenueByMonthOnline:", error);
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy doanh thu theo ngày (online)" 
        });
    }
};

const getDailyRevenueByMonthAll = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        if (!month || !year) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu tham số tháng hoặc năm" 
            });
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
        
        res.json({ 
            success: true, 
            data: { daily: normalized } 
        });
    } catch (error) {
        console.error("Lỗi trong getDailyRevenueByMonthAll:", error);
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy doanh thu theo ngày (tổng hợp)" 
        });
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
            return res.json({ 
                success: true, 
                data: { monthly } 
            });
        }
        
        if (month && year) {
            const result = await reportService.getTotalRevenueByMonth(month, year);
            return res.json({ 
                success: true, 
                data: result 
            });
        }
        
        return res.status(400).json({ 
            success: false, 
            message: "Thiếu tham số tháng hoặc năm" 
        });
    } catch (error) {
        console.error("Lỗi trong getTotalRevenueByMonth:", error);
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy doanh thu theo tháng" 
        });
    }
};

const getDailyRevenueByMonth = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        if (!month || !year) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu tham số tháng hoặc năm" 
            });
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
        
        res.json({ 
            success: true, 
            data: { daily: normalized } 
        });
    } catch (error) {
        console.error("Lỗi trong getDailyRevenueByMonth:", error);
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy doanh thu theo ngày" 
        });
    }
};

const getTop10MostSoldBooksOffline = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        
        const books = await reportService.getTop10MostSoldBooksOffline(month, year);
        res.json({ 
            success: true, 
            data: books 
        });
    } catch (error) {
        console.error("Lỗi trong getTop10MostSoldBooksOffline:", error);
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy top 10 sách bán chạy offline" 
        });
    }
};

const getTop10MostSoldBooksOnline = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        
        const books = await reportService.getTop10MostSoldBooksOnline(month, year);
        res.json({ 
            success: true, 
            data: books 
        });
    } catch (error) {
        console.error("Lỗi trong getTop10MostSoldBooksOnline:", error);
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy top 10 sách bán chạy online" 
        });
    }
};

const getTop10MostSoldBooksAll = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        
        const books = await reportService.getTop10MostSoldBooksAll(month, year);
        res.json({ 
            success: true, 
            data: books 
        });
    } catch (error) {
        console.error("Lỗi trong getTop10MostSoldBooksAll:", error);
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy top 10 sách bán chạy tổng hợp" 
        });
    }
};

const getBookRevenueDetailsByYear = async (req, res) => {
    try {
        const year = req.query.year || req.params.year;
        const type = req.query.type || 'all';
        
        if (!year) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu tham số năm" 
            });
        }
        
        const detailData = await reportService.getBookRevenueDetailsByYear(year, type);
        res.json({ 
            success: true, 
            data: detailData 
        });
    } catch (error) {
        console.error("Lỗi trong getBookRevenueDetailsByYear:", error);
        if (error.message === "Thiếu tham số năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy chi tiết doanh thu theo sách theo tháng" 
        });
    }
};

const getBookRevenueDetailsByMonth = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        const type = req.query.type || 'all';
        
        if (!month || !year) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu tham số tháng hoặc năm" 
            });
        }
        
        const detailData = await reportService.getBookRevenueDetailsByMonth(month, year, type);
        res.json({ 
            success: true, 
            data: detailData 
        });
    } catch (error) {
        console.error("Lỗi trong getBookRevenueDetailsByMonth:", error);
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi lấy chi tiết doanh thu theo sách theo ngày" 
        });
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