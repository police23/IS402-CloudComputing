const invoiceModel = require('../../models/invoiceModel');
const db = require('../../db');

// Mock the database
jest.mock('../../db');

describe('InvoiceModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllInvoices', () => {
    it('should get all invoices with user and promotion info', async () => {
      const mockInvoices = [
        {
          id: 1,
          customer_name: 'Test Customer',
          customer_phone: '0123456789',
          total_amount: 500000,
          discount_amount: 50000,
          final_amount: 450000,
          promotion_code: 'PROMO1',
          created_by: 1,
          created_at: '2024-01-01',
          created_by_name: 'Test User',
          promotion_name: 'Test Promotion'
        }
      ];

      db.query.mockResolvedValue([mockInvoices]);

      const result = await invoiceModel.getAllInvoices();

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT i.*, u.full_name AS created_by_name')
      );
      expect(result).toEqual(mockInvoices);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValue(dbError);

      await expect(invoiceModel.getAllInvoices()).rejects.toThrow('Database connection failed');
    });
  });
  describe('addInvoice', () => {
    it('should add invoice successfully with book details', async () => {
      const invoiceData = {
        customer_name: 'Test Customer',
        customer_phone: '0123456789',
        total_amount: 500000,
        discount_amount: 50000,
        final_amount: 450000,
        promotion_code: 'PROMO1',
        created_by: 1,
        bookDetails: [
          { book_id: 1, quantity: 2, unit_price: 100000 },
          { book_id: 2, quantity: 1, unit_price: 300000 }
        ]
      };

      const mockResult = { insertId: 123 };

      // Mock stock check queries
      db.query.mockResolvedValueOnce([[{ quantity_in_stock: 10 }]]); // Book 1 stock
      db.query.mockResolvedValueOnce([[{ quantity_in_stock: 5 }]]);  // Book 2 stock
      
      // Mock invoice insertion
      db.query.mockResolvedValueOnce([mockResult]);
      
      // Mock other queries (details, stock updates, promotion update)
      db.query.mockResolvedValue([{}]);

      const result = await invoiceModel.addInvoice(invoiceData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO invoices'),
        expect.arrayContaining(['Test Customer', '0123456789'])
      );
      expect(result.id).toBe(123);
    });

    it('should throw error when insufficient stock', async () => {
      const invoiceData = {
        customer_name: 'Test Customer',
        customer_phone: '0123456789',
        bookDetails: [
          { book_id: 1, quantity: 20, unit_price: 100000 }
        ]
      };

      // Mock insufficient stock
      db.query.mockResolvedValue([[{ quantity_in_stock: 5 }]]);

      await expect(invoiceModel.addInvoice(invoiceData)).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('không đủ tồn kho')
      });
    });

    it('should handle missing stock data', async () => {
      const invoiceData = {
        customer_name: 'Test Customer',
        customer_phone: '0123456789',
        bookDetails: [
          { book_id: 1, quantity: 1, unit_price: 100000 }
        ]
      };

      // Mock empty stock result
      db.query.mockResolvedValue([[]]);

      await expect(invoiceModel.addInvoice(invoiceData)).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('không đủ tồn kho')
      });
    });

    it('should add invoice without book details', async () => {
      const invoiceData = {
        customer_name: 'Test Customer',
        customer_phone: '0123456789',
        total_amount: 500000,
        discount_amount: 50000,
        final_amount: 450000,
        created_by: 1
      };

      const mockResult = { insertId: 123 };
      db.query.mockResolvedValue([mockResult]);

      const result = await invoiceModel.addInvoice(invoiceData);

      expect(result.id).toBe(123);
    });
  });

  describe('getInvoiceById', () => {
    it('should get invoice by id with details', async () => {
      const mockInvoice = {
        id: 1,
        customer_name: 'Test Customer',
        customer_phone: '0123456789',
        total_amount: 500000,
        created_by_name: 'Test User',
        promotion_name: 'Test Promotion'
      };

      const mockDetails = [
        {
          id: 1,
          invoice_id: 1,
          book_id: 1,
          quantity: 2,
          unit_price: 100000,
          book_title: 'Test Book'
        }
      ];

      db.query.mockResolvedValueOnce([[mockInvoice]]);
      db.query.mockResolvedValueOnce([mockDetails]);

      const result = await invoiceModel.getInvoiceById(1);

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(result.bookDetails).toEqual(mockDetails);
    });

    it('should return null when invoice not found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await invoiceModel.getInvoiceById(999);

      expect(result).toBeNull();
    });
  });

  describe('deleteInvoice', () => {
    it('should delete invoice successfully', async () => {
      const mockCreatedAt = [{ created_at: '2024-01-01T00:00:00.000Z' }];
      const mockResult = { affectedRows: 1 };

      // Mock for SELECT created_at FROM invoices WHERE id = ?
      db.query.mockResolvedValueOnce([mockCreatedAt]);
      db.query.mockResolvedValueOnce([{}]); // Delete details
      db.query.mockResolvedValueOnce([mockResult]); // Delete invoice

      const result = await invoiceModel.deleteInvoice(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT created_at FROM invoices WHERE id = ?'),
        [1]
      );
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM invoice_details WHERE invoice_id = ?',
        [1]
      );
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM invoices WHERE id = ?',
        [1]
      );
      expect(result).toBe(true);
    });

    it('should return false when invoice not found', async () => {
      // Mock for SELECT created_at FROM invoices WHERE id = ? returns empty
      db.query.mockResolvedValueOnce([[]]);

      const result = await invoiceModel.deleteInvoice(999);

      expect(result).toBe(false);
    });
    it('should delete invoice successfully', async () => {
      const mockCreatedAt = [{ created_at: '2024-01-01T00:00:00.000Z' }];
      const mockResult = { affectedRows: 1 };

      // Mock SELECT created_at
      db.query.mockResolvedValueOnce([mockCreatedAt]);
      db.query.mockResolvedValueOnce([{}]); // Delete details
      db.query.mockResolvedValueOnce([mockResult]); // Delete invoice

      const result = await invoiceModel.deleteInvoice(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT created_at FROM invoices WHERE id = ?'),
        [1]
      );
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM invoice_details WHERE invoice_id = ?',
        [1]
      );
      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM invoices WHERE id = ?',
        [1]
      );
      expect(result).toBe(true);
    });

    it('should return false when invoice not found', async () => {
      // Mock SELECT created_at returns empty
      db.query.mockResolvedValueOnce([[]]);

      const result = await invoiceModel.deleteInvoice(999);

      expect(result).toBe(false);
    });
  });

  describe('getTotalRevenueByMonth', () => {
    it('should get total revenue and sold quantity by month', async () => {
      const mockSummary = [
        {
          totalRevenue: 5000000,
          totalSold: 100
        }
      ];

      db.query.mockResolvedValue([mockSummary]);

      const result = await invoiceModel.getTotalRevenueByMonth(1, 2024);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?'),
        [1, 2024]
      );
      expect(result).toEqual({
        totalRevenue: 5000000,
        totalSold: 100
      });
    });

    it('should return zeros when no data', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await invoiceModel.getTotalRevenueByMonth(1, 2024);

      expect(result).toEqual({
        totalRevenue: 0,
        totalSold: 0
      });
    });
    it('should return zeros when no data', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await invoiceModel.getTotalRevenueByMonth(1, 2024);

      expect(result).toEqual({
        totalRevenue: 0,
        totalSold: 0
      });
    });
    it('should get total revenue and sold quantity by month', async () => {
      const mockSummary = [
        {
          totalRevenue: 5000000,
          totalSold: 100
        }
      ];

      db.query.mockResolvedValue([mockSummary]);

      const result = await invoiceModel.getTotalRevenueByMonth(1, 2024);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?'),
        [1, 2024]
      );
      expect(result).toEqual({
        totalRevenue: 5000000,
        totalSold: 100
      });
    });

    it('should return zeros when no data', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await invoiceModel.getTotalRevenueByMonth(1, 2024);

      expect(result).toEqual({
        totalRevenue: 0,
        totalSold: 0
      });
    });
  });

  describe('getDailyRevenueByMonth', () => {
    it('should get daily revenue data by month', async () => {
      const mockDailyData = [
        {
          day: 1,
          totalRevenue: 1000000,
          totalSold: 20
        },
        {
          day: 2,
          totalRevenue: 2000000,
          totalSold: 40
        }
      ];

      db.query.mockResolvedValue([mockDailyData]);

      const result = await invoiceModel.getDailyRevenueByMonth(1, 2024);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('GROUP BY DAY(i.created_at)'),
        [1, 2024]
      );
      expect(result).toEqual(mockDailyData);
    });
  });

  describe('getTop10MostSoldBooks', () => {
    it('should get top 10 most sold books', async () => {
      const mockBooks = [
        {
          id: 1,
          title: 'Best Seller Book',
          total_sold: 100
        },
        {
          id: 2,
          title: 'Popular Book',
          total_sold: 80
        }
      ];

      db.query.mockResolvedValue([mockBooks]);

      const result = await invoiceModel.getTop10MostSoldBooks(1, 2024);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 10'),
        [1, 2024]
      );
      expect(result).toEqual(mockBooks);
    });
  })});

