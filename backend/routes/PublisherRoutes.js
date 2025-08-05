const express = require("express");
const router = express.Router();
const publisherController = require("../controllers/PublisherController");

router.get("/", publisherController.getAllPublishers);
module.exports = router;
