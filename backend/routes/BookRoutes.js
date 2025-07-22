const express = require("express");
const router = express.Router();
const bookController = require("../controllers/BookController");
const upload = require("../middlewares/uploadImage");

router.get("/", bookController.getAllBooks);
router.get("/old-stock", bookController.getOldStockBooks);
router.get("/latest-books", bookController.getLatestBooks);
router.get("/:id", bookController.getBookById);
router.post("/", upload.array('images', 5), bookController.createBook);
router.put("/:id", upload.array('images', 5), bookController.updateBook);
router.delete("/:id", bookController.deleteBook);

module.exports = router;