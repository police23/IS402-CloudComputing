const invoiceService = require("../services/InvoiceService");


const getInvoices = async (req, res) => {
  try {
    const { id: userId, role } = req.user;
    let invoices;
    if (role === "admin") {
      invoices = await invoiceService.getAllInvoices();
    } else {
      invoices = await invoiceService.getInvoicesByUser(userId);
    }
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách hóa đơn" });
  }
};


const addInvoice = async (req, res) => {
  try {
    const invoiceData = req.body;
    const result = await invoiceService.addInvoice(invoiceData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: "Lỗi server khi thêm hóa đơn" });
  }
};


const getInvoiceById = async (req, res) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn" });
    }
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server khi lấy chi tiết hóa đơn" });
  }
};


const deleteInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const result = await invoiceService.deleteInvoice(invoiceId);
    if (result) {
      res.status(204).send();
    } else {
      res.status(404).json({ success: false, message: "Không tìm thấy hóa đơn để xóa" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server khi xóa hóa đơn" });
  }
};

const getTotalRevenueByMonth = async (req, res) => {
    try {
        const year = req.query.year || req.params.year;
        const yearlyData = await invoiceService.getYearlyRevenueData(year);
        res.json(yearlyData);
    } catch (error) {
        if (error.message === "Thiếu tham số năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy doanh thu theo năm" });
    }
};

const getTop10MostSoldBooks = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        const books = await invoiceService.getTop10MostSoldBooks(month, year);
        res.json(books);
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy top 10 sách bán chạy" });
    }
};

const getDailyRevenueByMonth = async (req, res) => {
    try {
        const month = req.query.month || req.params.month;
        const year = req.query.year || req.params.year;
        const dailyData = await invoiceService.getDailyRevenueData(month, year);
        res.json(dailyData);
    } catch (error) {
        if (error.message === "Thiếu tham số tháng hoặc năm") {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi lấy doanh thu theo ngày" });
    }
};

const exportInvoicePDF = async (req, res) => {
    try {
        await invoiceService.generateInvoicePDF(req.params.id, res);
    } catch (error) {
        if (error.message === "Không tìm thấy hóa đơn") {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: "Lỗi server khi xuất PDF hóa đơn" });
    }
};


module.exports = {
    getInvoices,
    addInvoice,
    getInvoiceById,
    deleteInvoice,
    exportInvoicePDF,
    getTotalRevenueByMonth,
    getTop10MostSoldBooks,
    getDailyRevenueByMonth,
};
