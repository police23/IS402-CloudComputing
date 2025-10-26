const { DamageReport, DamageReportItem, User, Book } = require('../models');
const cacheHelper = require('../utils/cacheHelper');

const CACHE_KEYS = {
  ALL_DAMAGE_REPORTS: 'damage-reports:all',
};

const CACHE_TTL = {
  DAMAGE_REPORTS_LIST: 900, // 15 minutes
};

const getAllDamageReports = async () => {
  return await cacheHelper.getOrSet(
      CACHE_KEYS.ALL_DAMAGE_REPORTS,
      async () => {
          return await DamageReport.findAll({
              include: [
                  { model: User, as: 'creator', attributes: ['full_name'] },
                  { 
                      model: DamageReportItem, 
                      as: 'items', 
                      include: [{ model: Book, as: 'book', attributes: ['title'] }] 
                  }
              ],
              order: [['created_at', 'DESC']]
          });
      },
      CACHE_TTL.DAMAGE_REPORTS_LIST
  );
};

const createDamageReport = async (report) => {
  // Hỗ trợ cả frontend gửi createdBy hoặc created_by, items hoặc damagedBooks
  const created_by = report.created_by || report.createdBy;
  const note = report.note || '';
  const items = report.items || report.damagedBooks || [];

  if (!created_by) {
    throw new Error("Thiếu thông tin người lập phiếu (created_by)");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Danh sách sách hư hỏng không hợp lệ");
  }

  // Tạo damage report
  const damageReport = await DamageReport.create({
    created_by,
    note,
    created_at: new Date()
  });

  // Tạo damage report items
  for (const item of items) {
    const book_id = item.book_id || item.bookId;
    const quantity = item.quantity;
    const reason = item.reason || '';
    if (!book_id || !quantity) continue;
    
    await DamageReportItem.create({
      report_id: damageReport.id,
      book_id,
      quantity,
      reason
    });

    // Trừ tồn kho
    const book = await Book.findByPk(book_id);
    if (book) {
      book.quantity_in_stock = Math.max(0, book.quantity_in_stock - quantity);
      await book.save();
    }
  }

  // Invalidate cache
  await cacheHelper.del(CACHE_KEYS.ALL_DAMAGE_REPORTS);
  return damageReport;
};

const deleteDamageReport = async (id) => {
  const damageReport = await DamageReport.findByPk(id);
  if (!damageReport) {
    throw new Error("Báo cáo hư hỏng không tồn tại");
  }
  
  // Xóa items trước (cascade sẽ tự động xóa)
  await DamageReportItem.destroy({ where: { report_id: id } });
  await damageReport.destroy();
  
  // Invalidate cache
  await cacheHelper.del(CACHE_KEYS.ALL_DAMAGE_REPORTS);
  return { message: "Xóa báo cáo hư hỏng thành công" };
};

module.exports = {
    getAllDamageReports,
    createDamageReport,
    deleteDamageReport
};