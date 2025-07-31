const express = require("express");
const ruleController = require("../controllers/RuleController");
const router = express.Router();

// Route lấy quy định
router.get("/", ruleController.getRules);

// Route cập nhật quy định
router.put("/", ruleController.updateRules);

module.exports = router;