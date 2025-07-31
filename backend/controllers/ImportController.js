const importService = require("../services/ImportService");

const getAllImports = async (req, res) => {
    try {
        const result = await importService.getAllImports();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch imports" });
    }
};

const createImport = async (req, res) => {
    try {
        const result = await importService.createImport(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message, details: error });
    }
};

const deleteImport = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await importService.deleteImport(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to delete import" });
    }
};

const getImportsByYear = async (req, res) => {
    try {
        const { year } = req.query;
        const imports = await importService.getImportsByYear(year);
        res.json(imports);
    } catch (error) {
        if (error.message === "Year parameter is required") {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({ error: "Failed to fetch imports" });
    }
};

const getImportDataByMonth = async (req, res) => {
    try {
        const { year, month } = req.query;
        
        if (!year || !month) {
            return res.status(400).json({ error: "Year and month parameters are required" });
        }
        
        const data = await importService.getImportDataByMonth(year, month);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch import data by month" });
    }
};

const getImportDataByYear = async (req, res) => {
    try {
        const { year } = req.query;
        
        if (!year) {
            return res.status(400).json({ error: "Year parameter is required" });
        }
        
        const data = await importService.getImportDataByYear(year);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch import data by year" });
    }
};

module.exports = {
    getAllImports,
    createImport,
    deleteImport,
    getImportsByYear,
    getImportDataByMonth,
    getImportDataByYear
};
