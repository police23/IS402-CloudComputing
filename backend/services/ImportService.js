const importModel = require("../models/importModel");

const getAllImports = async () => {
    return await importModel.getAllImports();
};

const createImport = async (importData) => {
    return await importModel.createImport(importData);
};

const deleteImport = async (id) => {
    return await importModel.deleteImport(id);
};

const getImportsByYear = async (year) => {
    if (!year) {
        throw new Error("Year parameter is required");
    }
    return await importModel.getImportsByYear(year);
};

const getImportDataByMonth = async (year, month) => {
    return await importModel.getImportDataByMonth(year, month);
};

const getImportDataByYear = async (year) => {
    return await importModel.getImportDataByYear(year);
};

module.exports = {
    getAllImports,
    createImport,
    deleteImport,
    getImportsByYear,
    getImportDataByMonth,
    getImportDataByYear
};
