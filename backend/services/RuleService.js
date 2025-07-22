const ruleModel = require("../models/ruleModel");

const getRules = async () => {
    return await ruleModel.getRules();
};

const updateRules = async (ruleData) => {
    return await ruleModel.updateRules(ruleData);
}

module.exports = {
    getRules,
    updateRules,
};
