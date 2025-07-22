const supplierService = require('../../services/supplierService');
const supplierModel = require('../../models/supplierModel');

// Mock dependencies
jest.mock('../../models/supplierModel');

describe('SupplierService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSuppliers', () => {
    it('should get all suppliers', async () => {
      const mockSuppliers = [
        { id: 1, name: 'Supplier 1', address: 'Address 1', phone: '0123456789' },
        { id: 2, name: 'Supplier 2', address: 'Address 2', phone: '0987654321' }
      ];
      supplierModel.getAllSuppliers.mockResolvedValue(mockSuppliers);

      const result = await supplierService.getAllSuppliers();

      expect(supplierModel.getAllSuppliers).toHaveBeenCalled();
      expect(result).toEqual(mockSuppliers);
    });
  });

  describe('getSupplierById', () => {
    it('should get supplier by id successfully', async () => {
      const mockSupplier = { id: 1, name: 'Test Supplier', address: 'Test Address', phone: '0123456789' };
      supplierModel.getSupplierById.mockResolvedValue(mockSupplier);

      const result = await supplierService.getSupplierById(1);

      expect(supplierModel.getSupplierById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSupplier);
    });

    it('should throw error when supplier not found', async () => {
      supplierModel.getSupplierById.mockResolvedValue(null);

      await expect(supplierService.getSupplierById(999)).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nhà cung cấp'
      });
    });
  });

  describe('createSupplier', () => {
    it('should create supplier successfully', async () => {
      const supplierData = {
        name: 'New Supplier',
        address: 'New Address',
        phone: '0123456789',
        email: 'supplier@email.com'
      };
      const mockResult = { id: 1, ...supplierData };
      supplierModel.createSupplier.mockResolvedValue(mockResult);

      const result = await supplierService.createSupplier(supplierData);

      expect(supplierModel.createSupplier).toHaveBeenCalledWith(supplierData);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when name is missing', async () => {
      const supplierData = {
        address: 'Test Address',
        phone: '0123456789'
      };

      await expect(supplierService.createSupplier(supplierData)).rejects.toMatchObject({
        status: 400,
        message: 'Tên, địa chỉ và số điện thoại là bắt buộc'
      });
    });

    it('should throw error when address is missing', async () => {
      const supplierData = {
        name: 'Test Supplier',
        phone: '0123456789'
      };

      await expect(supplierService.createSupplier(supplierData)).rejects.toMatchObject({
        status: 400,
        message: 'Tên, địa chỉ và số điện thoại là bắt buộc'
      });
    });

    it('should throw error when phone is missing', async () => {
      const supplierData = {
        name: 'Test Supplier',
        address: 'Test Address'
      };

      await expect(supplierService.createSupplier(supplierData)).rejects.toMatchObject({
        status: 400,
        message: 'Tên, địa chỉ và số điện thoại là bắt buộc'
      });
    });

    it('should create supplier without email', async () => {
      const supplierData = {
        name: 'New Supplier',
        address: 'New Address',
        phone: '0123456789'
      };
      const mockResult = { id: 1, ...supplierData };
      supplierModel.createSupplier.mockResolvedValue(mockResult);

      const result = await supplierService.createSupplier(supplierData);

      expect(result).toEqual(mockResult);
    });
  });

  describe('updateSupplier', () => {
    it('should update supplier successfully', async () => {
      const supplierData = {
        name: 'Updated Supplier',
        address: 'Updated Address',
        phone: '0987654321',
        email: 'updated@email.com'
      };
      const mockResult = { message: 'Supplier updated successfully' };
      supplierModel.updateSupplier.mockResolvedValue(mockResult);

      const result = await supplierService.updateSupplier(1, supplierData);

      expect(supplierModel.updateSupplier).toHaveBeenCalledWith(1, supplierData);
      expect(result).toEqual(mockResult);
    });

    it('should throw error when name is missing', async () => {
      const supplierData = {
        address: 'Updated Address',
        phone: '0987654321'
      };

      await expect(supplierService.updateSupplier(1, supplierData)).rejects.toMatchObject({
        status: 400,
        message: 'Tên, địa chỉ và số điện thoại là bắt buộc'
      });
    });

    it('should throw error when address is missing', async () => {
      const supplierData = {
        name: 'Updated Supplier',
        phone: '0987654321'
      };

      await expect(supplierService.updateSupplier(1, supplierData)).rejects.toMatchObject({
        status: 400,
        message: 'Tên, địa chỉ và số điện thoại là bắt buộc'
      });
    });

    it('should throw error when phone is missing', async () => {
      const supplierData = {
        name: 'Updated Supplier',
        address: 'Updated Address'
      };

      await expect(supplierService.updateSupplier(1, supplierData)).rejects.toMatchObject({
        status: 400,
        message: 'Tên, địa chỉ và số điện thoại là bắt buộc'
      });
    });

    it('should handle supplier not found error', async () => {
      const supplierData = {
        name: 'Updated Supplier',
        address: 'Updated Address',
        phone: '0987654321'
      };
      supplierModel.updateSupplier.mockRejectedValue(new Error('Supplier not found'));

      await expect(supplierService.updateSupplier(999, supplierData)).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nhà cung cấp'
      });
    });

    it('should rethrow other errors', async () => {
      const supplierData = {
        name: 'Updated Supplier',
        address: 'Updated Address',
        phone: '0987654321'
      };
      const otherError = new Error('Database connection failed');
      supplierModel.updateSupplier.mockRejectedValue(otherError);

      await expect(supplierService.updateSupplier(1, supplierData)).rejects.toThrow('Database connection failed');
    });
  });

  describe('deleteSupplier', () => {
    it('should delete supplier successfully', async () => {
      const mockResult = { message: 'Supplier deleted successfully' };
      supplierModel.deleteSupplier.mockResolvedValue(mockResult);

      const result = await supplierService.deleteSupplier(1);

      expect(supplierModel.deleteSupplier).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockResult);
    });

    it('should handle supplier not found error', async () => {
      supplierModel.deleteSupplier.mockRejectedValue(new Error('Supplier not found'));

      await expect(supplierService.deleteSupplier(999)).rejects.toMatchObject({
        status: 404,
        message: 'Không tìm thấy nhà cung cấp'
      });
    });

    it('should rethrow other errors', async () => {
      const otherError = new Error('Database connection failed');
      supplierModel.deleteSupplier.mockRejectedValue(otherError);

      await expect(supplierService.deleteSupplier(1)).rejects.toThrow('Database connection failed');
    });
  });
});
