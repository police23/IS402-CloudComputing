
const { BookImport, ImportDetail } = require('../models');
const { Op } = require('sequelize');


const getAllImports = async () => {
  return await BookImport.findAll({
    include: [
      'supplier', 
      'employee', 
      {
        association: 'details',
        include: ['book']
      }
    ],
    order: [['import_date', 'DESC']]
  });
};


const createImport = async (importData) => {
  const { supplierId, importedBy, total, details } = importData;
  // Create import
  const bookImport = await BookImport.create({
    supplier_id: supplierId,
    imported_by: importedBy,
    total_price: total
  });
  // Create import details if provided
  if (Array.isArray(details) && details.length > 0) {
    for (const item of details) {
      await ImportDetail.create({
        import_id: bookImport.id,
        book_id: item.bookId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      });
    }
  }
  // Return import with details
  return await BookImport.findByPk(bookImport.id, { 
    include: [
      'supplier', 
      'employee', 
      {
        association: 'details',
        include: ['book']
      }
    ] 
  });
};


const deleteImport = async (id) => {
  const bookImport = await BookImport.findByPk(id);
  if (!bookImport) throw new Error('Import not found');
  await ImportDetail.destroy({ where: { import_id: id } });
  await bookImport.destroy();
  return { success: true };
};


const getImportsByYear = async (year) => {
  if (!year) throw new Error('Year parameter is required');
  return await BookImport.findAll({
    where: {
      import_date: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lte]: new Date(`${year}-12-31`)
      }
    },
    include: [
      'supplier', 
      'employee', 
      {
        association: 'details',
        include: ['book']
      }
    ],
    order: [['import_date', 'DESC']]
  });
};


const getImportDataByMonth = async (year, month) => {
  const start = new Date(`${year}-${month}-01`);
  const end = new Date(`${year}-${month}-31`);
  return await BookImport.findAll({
    where: {
      import_date: {
        [Op.gte]: start,
        [Op.lte]: end
      }
    },
    include: ['details'],
    order: [['import_date', 'ASC']]
  });
};

const getImportDataByYear = async (year) => {
  const start = new Date(`${year}-01-01`);
  const end = new Date(`${year}-12-31`);
  return await BookImport.findAll({
    where: {
      import_date: {
        [Op.gte]: start,
        [Op.lte]: end
      }
    },
    include: ['details'],
    order: [['import_date', 'ASC']]
  });
};

// Thêm hàm để lấy dữ liệu biểu đồ nhập kho theo tháng
const getImportChartDataByYear = async (year) => {
  const { sequelize } = require('../models');
  const { QueryTypes } = require('sequelize');
  
  const results = await sequelize.query(
    `SELECT MONTH(bi.import_date) AS month,
            SUM(id.quantity) AS totalBooks,
            SUM(id.quantity * id.unit_price) AS totalCost
     FROM book_imports bi
     JOIN import_details id ON bi.id = id.import_id
     WHERE YEAR(bi.import_date) = ?
     GROUP BY MONTH(bi.import_date)
     ORDER BY MONTH(bi.import_date)`,
    {
      replacements: [year],
      type: QueryTypes.SELECT
    }
  );
  return results;
};

// Thêm hàm để lấy dữ liệu biểu đồ nhập kho theo ngày trong tháng
const getImportChartDataByMonth = async (year, month) => {
  const { sequelize } = require('../models');
  const { QueryTypes } = require('sequelize');
  
  const results = await sequelize.query(
    `SELECT DAY(bi.import_date) AS day,
            SUM(id.quantity) AS totalBooks,
            SUM(id.quantity * id.unit_price) AS totalCost
     FROM book_imports bi
     JOIN import_details id ON bi.id = id.import_id
     WHERE YEAR(bi.import_date) = ? AND MONTH(bi.import_date) = ?
     GROUP BY DAY(bi.import_date)
     ORDER BY DAY(bi.import_date)`,
    {
      replacements: [year, month],
      type: QueryTypes.SELECT
    }
  );
  return results;
};

// Thêm hàm để lấy dữ liệu biểu đồ tồn kho
const getStockChartData = async () => {
  const { Book, Category } = require('../models');
  
  const books = await Book.findAll({
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }
    ],
    attributes: ['id', 'title', 'stock', 'category_id'],
    order: [['stock', 'DESC']]
  });
  
  return books;
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
