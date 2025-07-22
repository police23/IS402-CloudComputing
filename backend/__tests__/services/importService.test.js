const importService = require('../../services/importService');
const importModel = require('../../models/importModel');

// Mock the model
jest.mock('../../models/importModel');

describe('ImportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllImports', () => {
    it('should return all imports from model', async () => {
      const mockImports = [
        { id: 1, supplierId: 1, totalAmount: 500000 },
        { id: 2, supplierId: 2, totalAmount: 750000 }
      ];

      importModel.getAllImports.mockResolvedValue(mockImports);

      const result = await importService.getAllImports();

      expect(importModel.getAllImports).toHaveBeenCalled();
      expect(result).toEqual(mockImports);
    });

    it('should handle errors from model', async () => {
      const error = new Error('Database error');
      importModel.getAllImports.mockRejectedValue(error);

      await expect(importService.getAllImports()).rejects.toThrow('Database error');
      expect(importModel.getAllImports).toHaveBeenCalled();
    });
  });

  describe('createImport', () => {
    it('should create import via model', async () => {
      const importData = { supplierId: 1, items: [], totalAmount: 100000 };
      const createdImport = { id: 1, ...importData };

      importModel.createImport.mockResolvedValue(createdImport);

      const result = await importService.createImport(importData);

      expect(importModel.createImport).toHaveBeenCalledWith(importData);
      expect(result).toEqual(createdImport);
    });

    it('should handle creation errors', async () => {
      const importData = { supplierId: 1 };
      const error = new Error('Creation failed');
      importModel.createImport.mockRejectedValue(error);

      await expect(importService.createImport(importData)).rejects.toThrow('Creation failed');
      expect(importModel.createImport).toHaveBeenCalledWith(importData);
    });
  });

  describe('deleteImport', () => {
    it('should delete import via model', async () => {
      const importId = '1';
      const deleteResult = { success: true };

      importModel.deleteImport.mockResolvedValue(deleteResult);

      const result = await importService.deleteImport(importId);

      expect(importModel.deleteImport).toHaveBeenCalledWith(importId);
      expect(result).toEqual(deleteResult);
    });

    it('should handle deletion errors', async () => {
      const importId = '999';
      const error = new Error('Import not found');
      importModel.deleteImport.mockRejectedValue(error);

      await expect(importService.deleteImport(importId)).rejects.toThrow('Import not found');
      expect(importModel.deleteImport).toHaveBeenCalledWith(importId);
    });
  });

  describe('getImportsByYear', () => {
    it('should get imports by year', async () => {
      const year = '2024';
      const mockImports = [
        { id: 1, year: 2024, totalAmount: 500000 }
      ];

      importModel.getImportsByYear.mockResolvedValue(mockImports);

      const result = await importService.getImportsByYear(year);

      expect(importModel.getImportsByYear).toHaveBeenCalledWith(year);
      expect(result).toEqual(mockImports);
    });

    it('should throw error when year is not provided', async () => {
      await expect(importService.getImportsByYear(null)).rejects.toThrow('Year parameter is required');
      await expect(importService.getImportsByYear(undefined)).rejects.toThrow('Year parameter is required');
      await expect(importService.getImportsByYear('')).rejects.toThrow('Year parameter is required');
    });

    it('should handle model errors', async () => {
      const year = '2024';
      const error = new Error('Database error');
      importModel.getImportsByYear.mockRejectedValue(error);

      await expect(importService.getImportsByYear(year)).rejects.toThrow('Database error');
      expect(importModel.getImportsByYear).toHaveBeenCalledWith(year);
    });
  });

  describe('getImportDataByMonth', () => {
    it('should get import data by month', async () => {
      const year = '2024';
      const month = '01';
      const mockData = { year: 2024, month: 1, totalImports: 10 };

      importModel.getImportDataByMonth.mockResolvedValue(mockData);

      const result = await importService.getImportDataByMonth(year, month);

      expect(importModel.getImportDataByMonth).toHaveBeenCalledWith(year, month);
      expect(result).toEqual(mockData);
    });

    it('should handle errors from model', async () => {
      const year = '2024';
      const month = '01';
      const error = new Error('Data retrieval failed');
      importModel.getImportDataByMonth.mockRejectedValue(error);

      await expect(importService.getImportDataByMonth(year, month)).rejects.toThrow('Data retrieval failed');
      expect(importModel.getImportDataByMonth).toHaveBeenCalledWith(year, month);
    });
  });

  describe('getImportDataByYear', () => {
    it('should get import data by year', async () => {
      const year = '2024';
      const mockData = { year: 2024, totalImports: 120, totalAmount: 12000000 };

      importModel.getImportDataByYear.mockResolvedValue(mockData);

      const result = await importService.getImportDataByYear(year);

      expect(importModel.getImportDataByYear).toHaveBeenCalledWith(year);
      expect(result).toEqual(mockData);
    });

    it('should handle errors from model', async () => {
      const year = '2024';
      const error = new Error('Data retrieval failed');
      importModel.getImportDataByYear.mockRejectedValue(error);

      await expect(importService.getImportDataByYear(year)).rejects.toThrow('Data retrieval failed');
      expect(importModel.getImportDataByYear).toHaveBeenCalledWith(year);
    });
  });
});
