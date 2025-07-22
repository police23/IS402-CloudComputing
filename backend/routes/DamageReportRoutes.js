const express = require("express");
const router = express.Router();
const DamageReportController = require("../controllers/DamageReportController");

router.get("/", DamageReportController.getAllDamageReports);
router.post("/", DamageReportController.createDamageReport);
router.delete("/:id", DamageReportController.deleteDamageReport);

module.exports = router;