const importModel = require('../../models/importModel');
const db = require('../../db');

// Mock the database
jest.mock('../../db');

describe('ImportModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllImports', () => {
    it('should get all imports with book details', async () => {
      const mockImports = [
        {
          id: 1,
          import_date: '2024-01-01',
          total_price: 500000,
          supplier: 'Test Supplier',
          employee: 'Test Employee',
          supplier_id: 1,
          imported_by: 1
        }
      ];

      const mockDetails = [
        {
          id: 1,
          book_id: 1,
          book: 'Test Book',
          quantity: 10,
          price: 50000
        }
      ];

      // Mock first query for imports
      db.query.mockResolvedValueOnce([mockImports]);
      // Mock second query for details
      db.query.mockResolvedValueOnce([mockDetails]);

      const result = await importModel.getAllImports();

      expect(db.query).toHaveBeenCalledTimes(2);
      expect(result[0].bookDetails).toEqual(mockDetails);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValue(dbError);

      await expect(importModel.getAllImports()).rejects.toThrow('Database connection failed');
    });
  });

  describe('createImport', () => {
    it('should create import successfully', async () => {
      const importData = {
        supplierId: 1,
        importedBy: '1',
        bookDetails: [
          { bookId: 1, quantity: 10, price: 50000 },
          { bookId: 2, quantity: 5, price: 30000 }
        ],
        total: 650000
      };

      const mockResult = { insertId: 123 };
      
      // Mock INSERT import query
      db.query.mockResolvedValueOnce([mockResult]);
      // Mock INSERT details queries (2 times)
      db.query.mockResolvedValue([{}]);

      const result = await importModel.createImport(importData);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO book_imports (supplier_id, imported_by, total_price) VALUES (?, ?, ?)',
        [1, 1, 650000]
      );
      expect(result).toEqual({ id: 123 });
    });

    it('should throw error for invalid importedBy', async () => {
      const importData = {
        supplierId: 1,
        importedBy: '',
        bookDetails: [],
        total: 0
      };

      await expect(importModel.createImport(importData)).rejects.toThrow('Người nhập không hợp lệ!');
    });

    it('should handle database errors during creation', async () => {
      const importData = {
        supplierId: 1,
        importedBy: '1',
        bookDetails: [{ bookId: 1, quantity: 10, price: 50000 }],
        total: 500000
      };

      const dbError = new Error('Database error');
      db.query.mockRejectedValue(dbError);

      await expect(importModel.createImport(importData)).rejects.toThrow('Database error');
    });
  });

  describe('deleteImport', () => {
    it('should delete import successfully', async () => {
      const mockDetails = [
        { book_id: 1, quantity: 10 },
        { book_id: 2, quantity: 5 }
      ];
      const mockResult = { affectedRows: 1 };

      // Mock queries in order
      db.query.mockResolvedValueOnce([mockDetails]); // Get details
      db.query.mockResolvedValue([{}]); // Update books stock (multiple calls)
      db.query.mockResolvedValueOnce([{}]); // Delete details
      db.query.mockResolvedValueOnce([mockResult]); // Delete import

      const result = await importModel.deleteImport(1);

      expect(result).toEqual({ message: 'Xóa phiếu nhập thành công' });
    });

    it('should throw error when import not found', async () => {
      const mockDetails = [];
      const mockResult = { affectedRows: 0 };

      db.query.mockResolvedValueOnce([mockDetails]);
      db.query.mockResolvedValueOnce([{}]); // Delete details
      db.query.mockResolvedValueOnce([mockResult]); // Delete import (not found)

      await expect(importModel.deleteImport(999)).rejects.toThrow('Phiếu nhập không tồn tại');
    });
  });

  describe('getImportsByYear', () => {
    it('should get imports by year with details', async () => {
      const mockImports = [
        {
          id: 1,
          import_date: '2024-01-01',
          total_price: 500000,
          supplier: 'Test Supplier',
          employee: 'Test Employee',
          supplier_id: 1,
          imported_by: 1
        }
      ];

      const mockDetails = [
        {
          id: 1,
          book_id: 1,
          book: 'Test Book',
          quantity: 10,
          price: 50000
        }
      ];

      db.query.mockResolvedValueOnce([mockImports]);
      db.query.mockResolvedValueOnce([mockDetails]);      const result = await importModel.getImportsByYear(2024);      expect(db.query).toHaveBeenCalledTimes(2);
      // Check that first call has parameter [2024]
      expect(db.query.mock.calls[0][1]).toEqual([2024]);
      expect(result[0].bookDetails).toEqual(mockDetails);
    });
  });

  describe('getImportDataByMonth', () => {
    it('should get import data by month with all days', async () => {
      const mockStats = [
        {
          day: 1,
          import_count: 2,
          total_books: 20,
          total_cost: 1000000
        },
        {
          day: 15,
          import_count: 1,
          total_books: 10,
          total_cost: 500000
        }
      ];

      db.query.mockResolvedValue([mockStats]);

      const result = await importModel.getImportDataByMonth(2024, 1);

      expect(result.daily).toHaveLength(31); // January has 31 days
      expect(result.daily[0]).toEqual({
        day: 1,
        importCount: 2,
        totalBooks: 20,
        totalCost: 1000000
      });
      expect(result.daily[1]).toEqual({
        day: 2,
        importCount: 0,
        totalBooks: 0,
        totalCost: 0
      });
    });
  });

  describe('getImportDataByYear', () => {
    it('should get import data by year', async () => {
      const mockStats = [
        {
          month: 1,
          import_count: 5,
          total_books: 100,
          total_cost: 5000000
        },
        {
          month: 2,
          import_count: 3,
          total_books: 60,
          total_cost: 3000000
        }
      ];

      db.query.mockResolvedValue([mockStats]);

      const result = await importModel.getImportDataByYear(2024);

      expect(result.monthly).toHaveLength(2);
      expect(result.monthly[0]).toEqual({
        month: 1,
        importCount: 5,
        totalBooks: 100,
        totalCost: 5000000
      });
    });

    it('should return empty array when no data', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await importModel.getImportDataByYear(2025);

      expect(result.monthly).toEqual([]);
    });
  });
});
