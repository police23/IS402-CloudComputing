const express = require("express");
const router = express.Router();
const reportController = require("../controllers/ReportController");
router.get("/revenue-offline", reportController.getRevenueByYearOffline);
router.get("/revenue-online", reportController.getRevenueByYear);
router.get("/revenue-all", reportController.getRevenueByYearAll);
router.get("/daily-revenue-offline", reportController.getDailyRevenueByMonthOffline);
router.get("/daily-revenue-online", reportController.getDailyRevenueByMonth);
router.get("/daily-revenue-all", reportController.getDailyRevenueByMonthAll);
router.get("/revenue", reportController.getTotalRevenueByMonth);
router.get("/daily-revenue", reportController.getDailyRevenueByMonth);
router.get("/top10-offline", reportController.getTop10MostSoldBooksOffline);
router.get("/top10-online", reportController.getTop10MostSoldBooks);
router.get("/top10-all", reportController.getTop10MostSoldBooksAll);
router.get("/book-revenue-by-year", reportController.getBookRevenueDetailsByYear);
router.get("/book-revenue-by-month", reportController.getBookRevenueDetailsByMonth);

module.exports = router;