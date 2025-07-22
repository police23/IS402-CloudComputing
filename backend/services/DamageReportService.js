const DamageReportModel = require('../models/DamageReportModel');
const getAllDamageReports = async () => {
    return await DamageReportModel.getAllDamageReports();
};
const createDamageReport = async (report) => {
    return await DamageReportModel.createDamageReport(report);
};
const deleteDamageReport = async (id) => {
    return await DamageReportModel.deleteDamageReport(id);
};

module.exports = {
    getAllDamageReports,
    createDamageReport,
    deleteDamageReport
};