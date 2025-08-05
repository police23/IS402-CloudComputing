const importService = require('../services/ImportService');

const getAllImports = async (req, res) => {
  try {
    const result = await importService.getAllImports();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch imports' });
  }
};


const createImport = async (req, res) => {
  try {
    // req.body should include details: [{ bookId, quantity, unitPrice }, ...]
    const result = await importService.createImport(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteImport = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await importService.deleteImport(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete import' });
  }
};

const getImportsByYear = async (req, res) => {
  try {
    const { year } = req.query;
    const imports = await importService.getImportsByYear(year);
    res.json(imports);
  } catch (error) {
    if (error.message === 'Year parameter is required') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to fetch imports' });
  }
};

const getImportDataByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Year and month parameters are required' });
    }
    const data = await importService.getImportDataByMonth(year, month);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch import data by month' });
  }
};

const getImportDataByYear = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ error: 'Year parameter is required' });
    }
    const data = await importService.getImportDataByYear(year);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch import data by year' });
  }
};

// Thêm controller cho biểu đồ nhập kho theo năm
const getImportChartDataByYear = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu tham số năm' 
      });
    }
    
    const monthly = await importService.getImportChartDataByYear(year);
    res.json({ 
      success: true, 
      data: { monthly } 
    });
  } catch (error) {
    console.error("Lỗi trong getImportChartDataByYear:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi lấy dữ liệu biểu đồ nhập kho theo năm" 
    });
  }
};

// Thêm controller cho biểu đồ nhập kho theo tháng
const getImportChartDataByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu tham số năm hoặc tháng' 
      });
    }
    
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyData = await importService.getImportChartDataByMonth(year, month);
    
    // Chuẩn hóa dữ liệu: trả về đủ số ngày trong tháng
    const normalized = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const found = dailyData.find(item => Number(item.day) === d);
      normalized.push({
        day: d,
        totalBooks: found ? Number(found.totalBooks) || 0 : 0,
        totalCost: found ? Number(found.totalCost) || 0 : 0
      });
    }
    
    res.json({ 
      success: true, 
      data: { daily: normalized } 
    });
  } catch (error) {
    console.error("Lỗi trong getImportChartDataByMonth:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi lấy dữ liệu biểu đồ nhập kho theo tháng" 
    });
  }
};

// Thêm controller cho biểu đồ tồn kho
const getStockChartData = async (req, res) => {
  try {
    const data = await importService.getStockChartData();
    res.json({ 
      success: true, 
      data: data 
    });
  } catch (error) {
    console.error("Lỗi trong getStockChartData:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server khi lấy dữ liệu biểu đồ tồn kho" 
    });
  }
};

module.exports = {
  getAllImports,
  createImport,
  deleteImport,
  getImportsByYear,
  getImportDataByMonth,
  getImportDataByYear,
  getImportChartDataByYear,
  getImportChartDataByMonth,
  getStockChartData
};
