const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { verifyToken } = require("../middlewares/authMiddleware");
router.get("/", verifyToken, invoiceController.getInvoices);
router.post("/", invoiceController.addInvoice);

router.get("/:id", invoiceController.getInvoiceById);

router.get("/:id/pdf", invoiceController.exportInvoicePDF);

router.delete("/:id", verifyToken, invoiceController.deleteInvoice);

module.exports = router;
