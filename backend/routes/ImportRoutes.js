const express = require("express");
const router = express.Router();
const importController = require("../controllers/importController");

router.get("/", importController.getAllImports);
router.post("/", importController.createImport);
router.delete('/:id', importController.deleteImport);
router.get('/by-year', importController.getImportsByYear);
router.get('/data/month', importController.getImportDataByMonth);
router.get('/data/year', importController.getImportDataByYear);

module.exports = router;
