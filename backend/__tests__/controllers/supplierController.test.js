const supplierController = require('../../controllers/supplierController');
const supplierService = require('../../services/supplierService');
const { createMockRequest, createMockResponse } = require('../helpers/testHelpers');

// Mock the service
jest.mock('../../services/supplierService');

describe('SupplierController', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getAllSuppliers', () => {
    it('should get all suppliers successfully', async () => {
      const mockSuppliers = [
        { id: 1, name: 'Công ty A', address: 'TP.HCM', phone: '0123456789', email: 'a@example.com' },
        { id: 2, name: 'Công ty B', address: 'Hà Nội', phone: '0987654321', email: 'b@example.com' }
      ];

      supplierService.getAllSuppliers.mockResolvedValue(mockSuppliers);

      await supplierController.getAllSuppliers(req, res);

      expect(supplierService.getAllSuppliers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockSuppliers);
    });

    it('should handle errors when getting suppliers', async () => {
      supplierService.getAllSuppliers.mockRejectedValue(new Error('Database error'));

      await supplierController.getAllSuppliers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Không thể lấy danh sách nhà cung cấp'
      });
    });
  });

  describe('createSupplier', () => {
    it('should create supplier successfully', async () => {
      const newSupplierData = {
        name: 'Công ty C',
        address: 'Đà Nẵng',
        phone: '0555444333',
        email: 'c@example.com'
      };
      const createdSupplier = { id: 3, ...newSupplierData };

      req.body = newSupplierData;
      supplierService.createSupplier.mockResolvedValue(createdSupplier);

      await supplierController.createSupplier(req, res);

      expect(supplierService.createSupplier).toHaveBeenCalledWith(newSupplierData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdSupplier);
    });

    it('should handle create errors with status code', async () => {
      req.body = { name: '' };
      const error = new Error('Tên nhà cung cấp không được để trống');
      error.status = 400;

      supplierService.createSupplier.mockRejectedValue(error);

      await supplierController.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Tên nhà cung cấp không được để trống'
      });
    });

    it('should handle general create errors', async () => {
      req.body = { name: 'Test' };
      supplierService.createSupplier.mockRejectedValue(new Error('Database error'));

      await supplierController.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('updateSupplier', () => {
    it('should update supplier successfully', async () => {
      const supplierId = '1';
      const updateData = { name: 'Công ty A Updated' };
      const updatedSupplier = { id: 1, name: 'Công ty A Updated', address: 'TP.HCM' };

      req.params = { id: supplierId };
      req.body = updateData;
      supplierService.updateSupplier.mockResolvedValue(updatedSupplier);

      await supplierController.updateSupplier(req, res);

      expect(supplierService.updateSupplier).toHaveBeenCalledWith(supplierId, updateData);
      expect(res.json).toHaveBeenCalledWith(updatedSupplier);
    });

    it('should handle update errors with status code', async () => {
      req.params = { id: '999' };
      req.body = { name: 'Updated' };
      const error = new Error('Nhà cung cấp không tồn tại');
      error.status = 404;

      supplierService.updateSupplier.mockRejectedValue(error);

      await supplierController.updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Nhà cung cấp không tồn tại'
      });
    });

    it('should handle general update errors', async () => {
      req.params = { id: '1' };
      req.body = { name: 'Updated' };
      supplierService.updateSupplier.mockRejectedValue(new Error('Database error'));

      await supplierController.updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  describe('deleteSupplier', () => {
    it('should delete supplier successfully', async () => {
      const supplierId = '1';
      const deleteResult = { success: true, message: 'Xóa thành công' };

      req.params = { id: supplierId };
      supplierService.deleteSupplier.mockResolvedValue(deleteResult);

      await supplierController.deleteSupplier(req, res);

      expect(supplierService.deleteSupplier).toHaveBeenCalledWith(supplierId);
      expect(res.json).toHaveBeenCalledWith(deleteResult);
    });

    it('should handle delete errors with status code', async () => {
      req.params = { id: '999' };
      const error = new Error('Nhà cung cấp không tồn tại');
      error.status = 404;

      supplierService.deleteSupplier.mockRejectedValue(error);

      await supplierController.deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Nhà cung cấp không tồn tại'
      });
    });

    it('should handle general delete errors', async () => {
      req.params = { id: '1' };
      supplierService.deleteSupplier.mockRejectedValue(new Error('Database error'));

      await supplierController.deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Database error'
      });
    });
  });

  // Test cases for missing branch coverage (|| 500 fallbacks)
  describe('Error handling edge cases', () => {
    it('should handle createSupplier error without status property', async () => {
      req.body = { name: 'Test Supplier' };
      
      // Error object without status property
      const errorWithoutStatus = new Error('Some database error');
      delete errorWithoutStatus.status; // Ensure no status property
      supplierService.createSupplier.mockRejectedValue(errorWithoutStatus);

      await supplierController.createSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500); // Should default to 500
      expect(res.json).toHaveBeenCalledWith({
        error: 'Some database error'
      });
    });

    it('should handle updateSupplier error without status property', async () => {
      req.params = { id: '1' };
      req.body = { name: 'Updated Supplier' };
      
      // Error object without status property
      const errorWithoutStatus = new Error('Connection timeout');
      delete errorWithoutStatus.status; // Ensure no status property
      supplierService.updateSupplier.mockRejectedValue(errorWithoutStatus);

      await supplierController.updateSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500); // Should default to 500
      expect(res.json).toHaveBeenCalledWith({
        error: 'Connection timeout'
      });
    });

    it('should handle deleteSupplier error without status property', async () => {
      req.params = { id: '1' };
      
      // Error object without status property
      const errorWithoutStatus = new Error('Foreign key constraint');
      delete errorWithoutStatus.status; // Ensure no status property
      supplierService.deleteSupplier.mockRejectedValue(errorWithoutStatus);

      await supplierController.deleteSupplier(req, res);

      expect(res.status).toHaveBeenCalledWith(500); // Should default to 500
      expect(res.json).toHaveBeenCalledWith({
        error: 'Foreign key constraint'
      });
    });
  });
});
