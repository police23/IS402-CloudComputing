const express = require("express");
const ruleController = require("../controllers/RuleController");
const router = express.Router();
router.get("/", ruleController.getRules);
router.put("/", ruleController.updateRules);

module.exports = router;