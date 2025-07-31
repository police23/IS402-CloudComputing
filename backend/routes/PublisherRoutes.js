const express = require("express");
const router = express.Router();
const publisherController = require("../controllers/PublisherController");

router.get("/", publisherController.getAllPublishers);

// If you want to support POST, make sure createPublisher exists and is exported:
// router.post('/', publisherController.createPublisher);

module.exports = router;
