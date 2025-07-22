const invoiceService = require('../../services/invoiceService');
const invoiceModel = require('../../models/invoiceModel');
const PDFDocument = require('pdfkit');

// Mock dependencies
jest.mock('../../models/invoiceModel');
jest.mock('pdfkit');

describe('InvoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllInvoices', () => {
    it('should get all invoices', async () => {
      const mockInvoices = [
        { id: 1, customer_name: 'Customer 1', total_amount: 100000 },
        { id: 2, customer_name: 'Customer 2', total_amount: 200000 }
      ];
      invoiceModel.getAllInvoices.mockResolvedValue(mockInvoices);

      const result = await invoiceService.getAllInvoices();

      expect(invoiceModel.getAllInvoices).toHaveBeenCalled();
      expect(result).toEqual(mockInvoices);
    });
  });

  describe('addInvoice', () => {
    it('should add invoice successfully', async () => {
      const invoiceData = {
        customer_name: 'Test Customer',
        customer_phone: '0123456789',
        total_amount: 100000
      };
      const mockResult = { id: 1 };
      invoiceModel.addInvoice.mockResolvedValue(mockResult);

      const result = await invoiceService.addInvoice(invoiceData);

      expect(invoiceModel.addInvoice).toHaveBeenCalledWith(invoiceData);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getInvoiceById', () => {
    it('should get invoice by id', async () => {
      const mockInvoice = { id: 1, customer_name: 'Test Customer', total_amount: 100000 };
      invoiceModel.getInvoiceById.mockResolvedValue(mockInvoice);

      const result = await invoiceService.getInvoiceById(1);

      expect(invoiceModel.getInvoiceById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      const mockResult = { message: 'Invoice deleted successfully' };
      invoiceModel.deleteInvoice.mockResolvedValue(mockResult);

      const result = await invoiceService.deleteInvoice(1);

      expect(invoiceModel.deleteInvoice).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getYearlyRevenueData', () => {
    it('should get yearly revenue data successfully', async () => {
      const mockMonthData = { totalRevenue: 1000000, totalSold: 50 };
      invoiceModel.getTotalRevenueByMonth.mockResolvedValue(mockMonthData);

      const result = await invoiceService.getYearlyRevenueData(2024);

      expect(invoiceModel.getTotalRevenueByMonth).toHaveBeenCalledTimes(12);
      expect(result.monthly).toHaveLength(12);
      expect(result.monthly[0]).toEqual({
        month: 1,
        totalRevenue: 1000000,
        totalSold: 50
      });
    });

    it('should handle months with no data', async () => {
      invoiceModel.getTotalRevenueByMonth.mockResolvedValue({});

      const result = await invoiceService.getYearlyRevenueData(2024);

      expect(result.monthly[0]).toEqual({
        month: 1,
        totalRevenue: 0,
        totalSold: 0
      });
    });

    it('should throw error when year is missing', async () => {
      await expect(invoiceService.getYearlyRevenueData()).rejects.toThrow('Thiếu tham số năm');
      await expect(invoiceService.getYearlyRevenueData(null)).rejects.toThrow('Thiếu tham số năm');
      await expect(invoiceService.getYearlyRevenueData('')).rejects.toThrow('Thiếu tham số năm');
    });
  });

  describe('getDailyRevenueData', () => {
    it('should get daily revenue data for a month', async () => {
      const mockDailyData = [
        { day: 1, totalRevenue: 100000, totalSold: 5 },
        { day: 15, totalRevenue: 200000, totalSold: 10 }
      ];
      invoiceModel.getDailyRevenueByMonth.mockResolvedValue(mockDailyData);

      const result = await invoiceService.getDailyRevenueData(1, 2024);

      expect(invoiceModel.getDailyRevenueByMonth).toHaveBeenCalledWith(1, 2024);
      expect(result.daily).toHaveLength(31); // January has 31 days
      expect(result.daily[0]).toEqual({
        day: 1,
        totalRevenue: 100000,
        totalSold: 5
      });
      expect(result.daily[1]).toEqual({
        day: 2,
        totalRevenue: 0,
        totalSold: 0
      });
    });

    it('should handle February in leap year', async () => {
      invoiceModel.getDailyRevenueByMonth.mockResolvedValue([]);

      const result = await invoiceService.getDailyRevenueData(2, 2024); // 2024 is leap year

      expect(result.daily).toHaveLength(29); // February 2024 has 29 days
    });

    it('should handle February in non-leap year', async () => {
      invoiceModel.getDailyRevenueByMonth.mockResolvedValue([]);

      const result = await invoiceService.getDailyRevenueData(2, 2023); // 2023 is not leap year

      expect(result.daily).toHaveLength(28); // February 2023 has 28 days
    });

    it('should throw error when month is missing', async () => {
      await expect(invoiceService.getDailyRevenueData(null, 2024)).rejects.toThrow('Thiếu tham số tháng hoặc năm');
      await expect(invoiceService.getDailyRevenueData('', 2024)).rejects.toThrow('Thiếu tham số tháng hoặc năm');
    });

    it('should throw error when year is missing', async () => {
      await expect(invoiceService.getDailyRevenueData(1, null)).rejects.toThrow('Thiếu tham số tháng hoặc năm');
      await expect(invoiceService.getDailyRevenueData(1, '')).rejects.toThrow('Thiếu tham số tháng hoặc năm');
    });
  });

  describe('getTop10MostSoldBooks', () => {
    it('should get top 10 most sold books', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', totalSold: 100 },
        { id: 2, title: 'Book 2', totalSold: 80 }
      ];
      invoiceModel.getTop10MostSoldBooks.mockResolvedValue(mockBooks);

      const result = await invoiceService.getTop10MostSoldBooks(1, 2024);

      expect(invoiceModel.getTop10MostSoldBooks).toHaveBeenCalledWith(1, 2024);
      expect(result).toEqual(mockBooks);
    });

    it('should throw error when month is missing', async () => {
      await expect(invoiceService.getTop10MostSoldBooks(null, 2024)).rejects.toThrow('Thiếu tham số tháng hoặc năm');
    });

    it('should throw error when year is missing', async () => {
      await expect(invoiceService.getTop10MostSoldBooks(1, null)).rejects.toThrow('Thiếu tham số tháng hoặc năm');
    });
  });

  describe('generateInvoicePDF', () => {
    let mockDoc, mockRes;

    beforeEach(() => {
      mockDoc = {
        registerFont: jest.fn(),
        font: jest.fn().mockReturnThis(),
        fontSize: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        moveDown: jest.fn().mockReturnThis(),
        rect: jest.fn().mockReturnThis(),
        stroke: jest.fn().mockReturnThis(),
        moveTo: jest.fn().mockReturnThis(),
        lineTo: jest.fn().mockReturnThis(),
        pipe: jest.fn(),
        end: jest.fn(),
        y: 100
      };

      mockRes = {
        setHeader: jest.fn()
      };

      PDFDocument.mockImplementation(() => mockDoc);
    });

    it('should generate PDF successfully with complete invoice data', async () => {
      const mockInvoice = {
        id: 1,
        customer_name: 'Test Customer',
        customer_phone: '0123456789',
        created_at: '2024-01-01T00:00:00Z',
        created_by_name: 'Admin',
        total_amount: 100000,
        discount_amount: 10000,
        final_amount: 90000,
        bookDetails: [
          {
            book_title: 'Test Book 1',
            quantity: 2,
            unit_price: 30000
          },
          {
            title: 'Test Book 2', // Test alternative title field
            quantity: 1,
            unit_price: 40000
          }
        ]
      };
      invoiceModel.getInvoiceById.mockResolvedValue(mockInvoice);

      const result = await invoiceService.generateInvoicePDF(1, mockRes);

      expect(invoiceModel.getInvoiceById).toHaveBeenCalledWith(1);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=invoice_1.pdf');
      expect(mockDoc.pipe).toHaveBeenCalledWith(mockRes);
      expect(mockDoc.end).toHaveBeenCalled();
      expect(result).toBe(mockDoc);
    });    it('should handle invoice with empty bookDetails', async () => {
      const mockInvoice = {
        id: 1,
        customer_name: 'Test Customer',
        bookDetails: null // Test null bookDetails
      };
      invoiceModel.getInvoiceById.mockResolvedValue(mockInvoice);

      const result = await invoiceService.generateInvoicePDF(1, mockRes);

      expect(result).toBe(mockDoc);
    });

    it('should handle invoice with multiple book details and different formats', async () => {
      const mockInvoice = {
        id: 1,
        customer_name: 'Test Customer',
        customer_phone: '0123456789',
        created_at: '2024-01-01T00:00:00Z',
        created_by_name: 'Admin',
        bookDetails: [
          {
            book_title: 'Test Book 1',
            quantity: 2,
            unit_price: 30000
          },
          {
            book_title: 'Test Book 2', 
            quantity: 3,
            unit_price: 25000
          },
          {
            book_title: 'Test Book 3',
            quantity: 1,
            unit_price: 50000
          }
        ]
      };
      invoiceModel.getInvoiceById.mockResolvedValue(mockInvoice);      const result = await invoiceService.generateInvoicePDF(1, mockRes);

      // Verify basic PDF generation
      expect(mockDoc.text).toHaveBeenCalledWith(
        expect.stringContaining('HÓA ĐƠN BÁN SÁCH'),
        expect.any(Object)
      );
      expect(result).toBe(mockDoc);
    });

    it('should handle invoice with missing optional fields', async () => {
      const mockInvoice = {
        id: 1,
        // Missing customer_name, customer_phone, etc.
        bookDetails: [
          {
            // Missing book_title, quantity, unit_price
          }
        ]
      };
      invoiceModel.getInvoiceById.mockResolvedValue(mockInvoice);

      const result = await invoiceService.generateInvoicePDF(1, mockRes);

      expect(result).toBe(mockDoc);
    });

    it('should handle invoice without id', async () => {
      const mockInvoice = {
        // Missing id field
        customer_name: 'Test Customer'
      };
      invoiceModel.getInvoiceById.mockResolvedValue(mockInvoice);

      const result = await invoiceService.generateInvoicePDF(1, mockRes);

      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=invoice_unknown.pdf');
    });

    it('should throw error when invoice not found', async () => {
      invoiceModel.getInvoiceById.mockResolvedValue(null);

      await expect(invoiceService.generateInvoicePDF(999, mockRes)).rejects.toThrow('Không tìm thấy hóa đơn');
    });

    it('should throw error when font registration fails', async () => {
      const mockInvoice = { id: 1, customer_name: 'Test Customer' };
      invoiceModel.getInvoiceById.mockResolvedValue(mockInvoice);
      mockDoc.registerFont.mockImplementation(() => {
        throw new Error('Font not found');
      });

      await expect(invoiceService.generateInvoicePDF(1, mockRes)).rejects.toThrow('Không tìm thấy hoặc lỗi font DejaVuSans.ttf');
    });

    it('should handle database errors', async () => {
      invoiceModel.getInvoiceById.mockRejectedValue(new Error('Database connection failed'));

      await expect(invoiceService.generateInvoicePDF(1, mockRes)).rejects.toThrow('Database connection failed');
    });

    it('should handle invoice with non-array bookDetails', async () => {
      const mockInvoice = {
        id: 1,
        customer_name: 'Test Customer',
        bookDetails: 'not an array' // This should be handled as empty array
      };
      invoiceModel.getInvoiceById.mockResolvedValue(mockInvoice);

      const result = await invoiceService.generateInvoicePDF(1, mockRes);

      expect(result).toBe(mockDoc);
    });

    it('should handle invoice with complete financial data', async () => {
      const mockInvoice = {
        id: 1,
        customer_name: 'Test Customer',
        total_amount: 100000,
        discount_amount: 10000,
        final_amount: 90000,
        bookDetails: []
      };
      invoiceModel.getInvoiceById.mockResolvedValue(mockInvoice);

      const result = await invoiceService.generateInvoicePDF(1, mockRes);

      // Should process financial calculations
      expect(result).toBe(mockDoc);
    });

    it('should handle font registration failure gracefully', async () => {
      const mockInvoice = { id: 1, customer_name: 'Test Customer', bookDetails: [] };
      invoiceModel.getInvoiceById.mockResolvedValue(mockInvoice);
      
      // Mock font registration to throw specific error
      mockDoc.registerFont.mockImplementation(() => {
        const error = new Error('ENOENT: no such file or directory');
        error.code = 'ENOENT';
        throw error;
      });

      await expect(invoiceService.generateInvoicePDF(1, mockRes)).rejects.toThrow('Không tìm thấy hoặc lỗi font DejaVuSans.ttf');
    });
  });
});
