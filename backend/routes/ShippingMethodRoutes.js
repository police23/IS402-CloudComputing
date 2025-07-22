const express = require("express");
const router = express.Router();
const ShippingMethodController = require("../controllers/ShippingMethodController");

router.get("/", ShippingMethodController.getAllShippingMethods);
module.exports = router;