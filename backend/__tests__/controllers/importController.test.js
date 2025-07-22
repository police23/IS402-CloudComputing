const importController = require('../../controllers/importController');
const importService = require('../../services/importService');
const { createMockRequest, createMockResponse } = require('../helpers/testHelpers');

// Mock the service
jest.mock('../../services/importService');

describe('ImportController', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getAllImports', () => {
    it('should get all imports successfully', async () => {
      const mockImports = [
        { id: 1, supplierId: 1, totalAmount: 500000, createdAt: '2024-01-01' },
        { id: 2, supplierId: 2, totalAmount: 750000, createdAt: '2024-01-02' }
      ];

      importService.getAllImports.mockResolvedValue(mockImports);

      await importController.getAllImports(req, res);

      expect(importService.getAllImports).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockImports);
    });

    it('should handle errors when getting imports', async () => {
      importService.getAllImports.mockRejectedValue(new Error('Database error'));

      await importController.getAllImports(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch imports'
      });
    });
  });

  describe('createImport', () => {
    it('should create import successfully', async () => {
      const importData = {
        supplierId: 1,
        items: [{ bookId: 1, quantity: 100, importPrice: 50000 }],
        totalAmount: 5000000
      };
      const createdImport = { id: 3, ...importData };

      req.body = importData;
      importService.createImport.mockResolvedValue(createdImport);

      await importController.createImport(req, res);

      expect(importService.createImport).toHaveBeenCalledWith(importData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdImport);
    });

    it('should handle create import errors', async () => {
      req.body = { supplierId: 1 };
      const error = new Error('Invalid import data');
      
      importService.createImport.mockRejectedValue(error);

      await importController.createImport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid import data',
        details: error
      });
    });
  });

  describe('deleteImport', () => {
    it('should delete import successfully', async () => {
      const importId = '1';
      const deleteResult = { success: true, message: 'Import deleted successfully' };

      req.params = { id: importId };
      importService.deleteImport.mockResolvedValue(deleteResult);

      await importController.deleteImport(req, res);

      expect(importService.deleteImport).toHaveBeenCalledWith(importId);
      expect(res.json).toHaveBeenCalledWith(deleteResult);
    });

    it('should handle delete import errors with message', async () => {
      req.params = { id: '999' };
      const error = new Error('Import not found');
      
      importService.deleteImport.mockRejectedValue(error);

      await importController.deleteImport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Import not found'
      });
    });

    it('should handle delete import errors without message', async () => {
      req.params = { id: '1' };
      const error = new Error(); // Error without message
      
      importService.deleteImport.mockRejectedValue(error);

      await importController.deleteImport(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to delete import'
      });    });
  });

  describe('getImportsByYear', () => {
    it('should get imports by year successfully', async () => {
      const year = '2024';
      const mockImports = [
        { id: 1, supplierId: 1, totalAmount: 500000, createdAt: '2024-01-01' },
        { id: 2, supplierId: 2, totalAmount: 750000, createdAt: '2024-02-01' }
      ];

      req.query = { year };
      importService.getImportsByYear.mockResolvedValue(mockImports);

      await importController.getImportsByYear(req, res);

      expect(importService.getImportsByYear).toHaveBeenCalledWith(year);
      expect(res.json).toHaveBeenCalledWith(mockImports);
    });

    it('should handle missing year parameter', async () => {
      req.query = {}; // No year parameter
      const error = new Error('Year parameter is required');
      
      importService.getImportsByYear.mockRejectedValue(error);

      await importController.getImportsByYear(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Year parameter is required'
      });
    });

    it('should handle other errors when getting imports by year', async () => {
      req.query = { year: '2024' };
      const error = new Error('Database connection failed');
      
      importService.getImportsByYear.mockRejectedValue(error);

      await importController.getImportsByYear(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch imports'
      });
    });
  });

  describe('getImportDataByMonth', () => {
    it('should get import data by month successfully', async () => {
      const year = '2024';
      const month = '01';
      const mockData = {
        totalImports: 5,
        totalAmount: 2500000,
        monthlyData: [
          { day: 1, amount: 500000 },
          { day: 15, amount: 750000 }
        ]
      };

      req.query = { year, month };
      importService.getImportDataByMonth.mockResolvedValue(mockData);

      await importController.getImportDataByMonth(req, res);

      expect(importService.getImportDataByMonth).toHaveBeenCalledWith(year, month);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle missing year parameter', async () => {
      req.query = { month: '01' }; // Missing year

      await importController.getImportDataByMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Year and month parameters are required'
      });
    });

    it('should handle missing month parameter', async () => {
      req.query = { year: '2024' }; // Missing month

      await importController.getImportDataByMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Year and month parameters are required'
      });
    });

    it('should handle missing both parameters', async () => {
      req.query = {}; // Missing both

      await importController.getImportDataByMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Year and month parameters are required'
      });
    });

    it('should handle service errors', async () => {
      req.query = { year: '2024', month: '01' };
      const error = new Error('Database error');
      
      importService.getImportDataByMonth.mockRejectedValue(error);

      await importController.getImportDataByMonth(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch import data by month'
      });
    });
  });

  describe('getImportDataByYear', () => {
    it('should get import data by year successfully', async () => {
      const year = '2024';
      const mockData = {
        totalImports: 50,
        totalAmount: 25000000,
        yearlyData: [
          { month: 1, amount: 2500000 },
          { month: 2, amount: 3000000 }
        ]
      };

      req.query = { year };
      importService.getImportDataByYear.mockResolvedValue(mockData);

      await importController.getImportDataByYear(req, res);

      expect(importService.getImportDataByYear).toHaveBeenCalledWith(year);
      expect(res.json).toHaveBeenCalledWith(mockData);
    });

    it('should handle missing year parameter', async () => {
      req.query = {}; // Missing year

      await importController.getImportDataByYear(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Year parameter is required'
      });
    });

    it('should handle service errors', async () => {
      req.query = { year: '2024' };
      const error = new Error('Database error');
      
      importService.getImportDataByYear.mockRejectedValue(error);

      await importController.getImportDataByYear(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch import data by year'
      });
    });
  });
});
