const getRevenueByYearOffline = async (year) => {
    if (!year) throw new Error("Thiếu tham số năm");
    return await reportModel.getRevenueByYearOffline(year);
};

const getRevenueByYearOnline = async (year) => {
    if (!year) throw new Error("Thiếu tham số năm");
    return await reportModel.getRevenueByYearOnline(year);
};

const getRevenueByYearAll = async (year) => {
    if (!year) throw new Error("Thiếu tham số năm");
    return await reportModel.getRevenueByYearAll(year);
};
const getDailyRevenueByMonthOffline = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    return await reportModel.getDailyRevenueByMonthOffline(month, year);
};

const getDailyRevenueByMonthOnline = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    return await reportModel.getDailyRevenueByMonthOnline(month, year);
};

const getDailyRevenueByMonthAll = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    return await reportModel.getDailyRevenueByMonthAll(month, year);
};
const getTotalRevenueByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    return await reportModel.getTotalRevenueByMonth(month, year);
};

const getDailyRevenueByMonth = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    return await reportModel.getDailyRevenueByMonth(month, year);
};
const reportModel = require("../models/ReportModel");

const getTop10MostSoldBooksOffline = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    return await reportModel.getTop10MostSoldBooksOffline(month, year);
};

const getTop10MostSoldBooksOnline = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    return await reportModel.getTop10MostSoldBooksOnline(month, year);
};

const getTop10MostSoldBooksAll = async (month, year) => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    return await reportModel.getTop10MostSoldBooksAll(month, year);
};

// Lấy chi tiết doanh thu theo từng sách theo tháng trong năm
const getBookRevenueDetailsByYear = async (year, type = 'all') => {
    if (!year) {
        throw new Error("Thiếu tham số năm");
    }
    return await reportModel.getBookRevenueDetailsByYear(year, type);
};

// Lấy chi tiết doanh thu theo từng sách theo ngày trong tháng
const getBookRevenueDetailsByMonth = async (month, year, type = 'all') => {
    if (!month || !year) {
        throw new Error("Thiếu tham số tháng hoặc năm");
    }
    return await reportModel.getBookRevenueDetailsByMonth(month, year, type);
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