// Nếu controller export là object, destructure các hàm cần test
const invoiceController = require('../../controllers/invoiceController');
// const { getAllInvoices, createTestDataForJune2025 } = require('../../controllers/invoiceController');
const invoiceService = require('../../services/invoiceService');
const { createMockRequest, createMockResponse } = require('../helpers/testHelpers');

// Mock the service
jest.mock('../../services/invoiceService');

describe('InvoiceController', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getAllInvoices', () => {
    it('should get all invoices successfully', async () => {
      const mockInvoices = [
        { id: 1, customerName: 'Nguyễn Văn A', totalAmount: 100000, createdAt: '2024-01-01' },
        { id: 2, customerName: 'Trần Thị B', totalAmount: 200000, createdAt: '2024-01-02' }
      ];
      req.user = { id: 1, role: 'admin' };
      invoiceService.getAllInvoices.mockResolvedValue(mockInvoices);
      await invoiceController.getInvoices(req, res);
      expect(invoiceService.getAllInvoices).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockInvoices);
    });

    it('should handle errors when getting invoices', async () => {
      req.user = { id: 1, role: 'admin' };
      invoiceService.getAllInvoices.mockRejectedValue(new Error('Database error'));
      await invoiceController.getInvoices(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi server khi lấy danh sách hóa đơn'
      });
    });
  });

  describe('addInvoice', () => {
    it('should add invoice successfully', async () => {
      const invoiceData = {
        customerName: 'Nguyễn Văn C',
        items: [{ bookId: 1, quantity: 2, price: 50000 }],
        totalAmount: 100000
      };
      const createdInvoice = { id: 3, ...invoiceData };

      req.body = invoiceData;
      invoiceService.addInvoice.mockResolvedValue(createdInvoice);

      await invoiceController.addInvoice(req, res);

      expect(invoiceService.addInvoice).toHaveBeenCalledWith(invoiceData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdInvoice);
    });

    it('should handle validation errors (400)', async () => {
      req.body = { customerName: '' };
      const error = new Error('Tên khách hàng không được để trống');
      error.status = 400;

      invoiceService.addInvoice.mockRejectedValue(error);

      await invoiceController.addInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Tên khách hàng không được để trống'
      });
    });

    it('should handle general errors (500)', async () => {
      req.body = { customerName: 'Test' };
      invoiceService.addInvoice.mockRejectedValue(new Error('Database error'));

      await invoiceController.addInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi server khi thêm hóa đơn'
      });
    });
  });

  describe('getInvoiceById', () => {
    it('should get invoice by id successfully', async () => {
      const invoiceId = '1';
      const mockInvoice = { 
        id: 1, 
        customerName: 'Nguyễn Văn A', 
        totalAmount: 100000 
      };

      req.params = { id: invoiceId };
      invoiceService.getInvoiceById.mockResolvedValue(mockInvoice);

      await invoiceController.getInvoiceById(req, res);

      expect(invoiceService.getInvoiceById).toHaveBeenCalledWith(invoiceId);
      expect(res.json).toHaveBeenCalledWith(mockInvoice);
    });

    it('should handle invoice not found', async () => {
      req.params = { id: '999' };
      invoiceService.getInvoiceById.mockResolvedValue(null);

      await invoiceController.getInvoiceById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Không tìm thấy hóa đơn'
      });
    });

    it('should handle errors when getting invoice by id', async () => {
      req.params = { id: '1' };
      invoiceService.getInvoiceById.mockRejectedValue(new Error('Database error'));

      await invoiceController.getInvoiceById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi server khi lấy chi tiết hóa đơn'
      });
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      const invoiceId = '1';
      req.params = { id: invoiceId };
      invoiceService.deleteInvoice.mockResolvedValue(true);

      await invoiceController.deleteInvoice(req, res);

      expect(invoiceService.deleteInvoice).toHaveBeenCalledWith(invoiceId);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle invoice not found for deletion', async () => {
      req.params = { id: '999' };
      invoiceService.deleteInvoice.mockResolvedValue(false);

      await invoiceController.deleteInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Không tìm thấy hóa đơn để xóa'
      });
    });

    it('should handle errors when deleting invoice', async () => {
      req.params = { id: '1' };
      invoiceService.deleteInvoice.mockRejectedValue(new Error('Database error'));

      await invoiceController.deleteInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi server khi xóa hóa đơn'
      });
    });
  });

  describe('getTotalRevenueByMonth', () => {
    it('should get yearly revenue data from query parameter', async () => {
      const year = '2024';
      const mockRevenueData = [
        { month: 1, revenue: 1000000 },
        { month: 2, revenue: 1500000 }
      ];

      req.query = { year };
      invoiceService.getYearlyRevenueData.mockResolvedValue(mockRevenueData);

      await invoiceController.getTotalRevenueByMonth(req, res);

      expect(invoiceService.getYearlyRevenueData).toHaveBeenCalledWith(year);
      expect(res.json).toHaveBeenCalledWith(mockRevenueData);
    });

    it('should get yearly revenue data from params', async () => {
      const year = '2024';
      const mockRevenueData = [
        { month: 1, revenue: 1000000 }
      ];

      req.params = { year };
      req.query = {};
      invoiceService.getYearlyRevenueData.mockResolvedValue(mockRevenueData);

      await invoiceController.getTotalRevenueByMonth(req, res);

      expect(invoiceService.getYearlyRevenueData).toHaveBeenCalledWith(year);
      expect(res.json).toHaveBeenCalledWith(mockRevenueData);
    });

    it('should handle missing year parameter', async () => {
      req.query = {};
      req.params = {};
      invoiceService.getYearlyRevenueData.mockRejectedValue(new Error('Thiếu tham số năm'));

      await invoiceController.getTotalRevenueByMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Thiếu tham số năm'
      });
    });

    it('should handle general errors when getting revenue data', async () => {
      req.query = { year: '2024' };
      invoiceService.getYearlyRevenueData.mockRejectedValue(new Error('Database error'));

      await invoiceController.getTotalRevenueByMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi server khi lấy doanh thu theo năm'
      });    });
  });

  describe('getTop10MostSoldBooks', () => {
    it('should get top 10 most sold books from query parameters', async () => {
      const month = '6';
      const year = '2024';
      const mockBooks = [
        { book_id: 1, title: 'Sách 1', total_sold: 50 },
        { book_id: 2, title: 'Sách 2', total_sold: 40 }
      ];

      req.query = { month, year };
      invoiceService.getTop10MostSoldBooks.mockResolvedValue(mockBooks);

      await invoiceController.getTop10MostSoldBooks(req, res);

      expect(invoiceService.getTop10MostSoldBooks).toHaveBeenCalledWith(month, year);
      expect(res.json).toHaveBeenCalledWith(mockBooks);
    });

    it('should get top 10 most sold books from params', async () => {
      const month = '6';
      const year = '2024';
      const mockBooks = [
        { book_id: 1, title: 'Sách 1', total_sold: 50 }
      ];

      req.params = { month, year };
      req.query = {};
      invoiceService.getTop10MostSoldBooks.mockResolvedValue(mockBooks);

      await invoiceController.getTop10MostSoldBooks(req, res);

      expect(invoiceService.getTop10MostSoldBooks).toHaveBeenCalledWith(month, year);
      expect(res.json).toHaveBeenCalledWith(mockBooks);
    });

    it('should handle missing month or year parameter', async () => {
      req.query = {};
      req.params = {};
      invoiceService.getTop10MostSoldBooks.mockRejectedValue(new Error('Thiếu tham số tháng hoặc năm'));

      await invoiceController.getTop10MostSoldBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Thiếu tham số tháng hoặc năm'
      });
    });

    it('should handle general errors when getting top 10 books', async () => {
      req.query = { month: '6', year: '2024' };
      invoiceService.getTop10MostSoldBooks.mockRejectedValue(new Error('Database error'));

      await invoiceController.getTop10MostSoldBooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi server khi lấy top 10 sách bán chạy'
      });
    });
  });

  describe('getDailyRevenueByMonth', () => {
    it('should get daily revenue data from query parameters', async () => {
      const month = '6';
      const year = '2024';
      const mockDailyData = [
        { day: 1, revenue: 100000 },
        { day: 2, revenue: 150000 }
      ];

      req.query = { month, year };
      invoiceService.getDailyRevenueData.mockResolvedValue(mockDailyData);

      await invoiceController.getDailyRevenueByMonth(req, res);

      expect(invoiceService.getDailyRevenueData).toHaveBeenCalledWith(month, year);
      expect(res.json).toHaveBeenCalledWith(mockDailyData);
    });

    it('should get daily revenue data from params', async () => {
      const month = '6';
      const year = '2024';
      const mockDailyData = [
        { day: 1, revenue: 100000 }
      ];

      req.params = { month, year };
      req.query = {};
      invoiceService.getDailyRevenueData.mockResolvedValue(mockDailyData);

      await invoiceController.getDailyRevenueByMonth(req, res);

      expect(invoiceService.getDailyRevenueData).toHaveBeenCalledWith(month, year);
      expect(res.json).toHaveBeenCalledWith(mockDailyData);
    });

    it('should handle missing month or year parameter', async () => {
      req.query = {};
      req.params = {};
      invoiceService.getDailyRevenueData.mockRejectedValue(new Error('Thiếu tham số tháng hoặc năm'));

      await invoiceController.getDailyRevenueByMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Thiếu tham số tháng hoặc năm'
      });
    });

    it('should handle general errors when getting daily revenue', async () => {
      req.query = { month: '6', year: '2024' };
      invoiceService.getDailyRevenueData.mockRejectedValue(new Error('Database error'));

      await invoiceController.getDailyRevenueByMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi server khi lấy doanh thu theo ngày'
      });
    });
  });

  describe('exportInvoicePDF', () => {
    it('should export invoice PDF successfully', async () => {
      const invoiceId = '1';
      req.params = { id: invoiceId };
      
      // Mock res object for PDF generation
      const mockPDFResponse = { /* PDF response mock */ };
      invoiceService.generateInvoicePDF.mockResolvedValue(mockPDFResponse);

      await invoiceController.exportInvoicePDF(req, res);

      expect(invoiceService.generateInvoicePDF).toHaveBeenCalledWith(invoiceId, res);
    });

    it('should handle invoice not found for PDF export', async () => {
      req.params = { id: '999' };
      invoiceService.generateInvoicePDF.mockRejectedValue(new Error('Không tìm thấy hóa đơn'));

      await invoiceController.exportInvoicePDF(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Không tìm thấy hóa đơn'
      });
    });

    it('should handle general errors when exporting PDF', async () => {
      req.params = { id: '1' };
      invoiceService.generateInvoicePDF.mockRejectedValue(new Error('PDF generation error'));

      await invoiceController.exportInvoicePDF(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Lỗi server khi xuất PDF hóa đơn'
      });
    });
  });

    const mockDb = {
      query: jest.fn()
    };

    beforeEach(() => {
      // Mock require('../db') to return our mock
      jest.doMock('../../db', () => mockDb);
      jest.clearAllMocks();
    });

    afterEach(() => {
      jest.dontMock('../../db');
    });

    // Các test createTestDataForJune2025 đã được skip vì không có function thực tế
});
