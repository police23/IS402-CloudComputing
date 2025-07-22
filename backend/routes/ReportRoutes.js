const express = require("express");
const router = express.Router();
const reportController = require("../controllers/ReportController");
// Doanh thu & số lượng bán theo 12 tháng của năm
router.get("/revenue-offline", reportController.getRevenueByYearOffline);
router.get("/revenue-online", reportController.getRevenueByYearOnline);
router.get("/revenue-all", reportController.getRevenueByYearAll);


// Doanh thu & số lượng bán theo ngày (offline)
router.get("/daily-revenue-offline", reportController.getDailyRevenueByMonthOffline);
// Doanh thu & số lượng bán theo ngày (online)
router.get("/daily-revenue-online", reportController.getDailyRevenueByMonthOnline);
// Doanh thu & số lượng bán theo ngày (tổng hợp online + offline)
router.get("/daily-revenue-all", reportController.getDailyRevenueByMonthAll);
router.get("/revenue", reportController.getTotalRevenueByMonth);
router.get("/daily-revenue", reportController.getDailyRevenueByMonth);
router.get("/top10-offline", reportController.getTop10MostSoldBooksOffline);
router.get("/top10-online", reportController.getTop10MostSoldBooksOnline);
router.get("/top10-all", reportController.getTop10MostSoldBooksAll);

module.exports = router;