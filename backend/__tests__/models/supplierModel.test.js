const supplierModel = require('../../models/supplierModel');
const db = require('../../db');

// Mock the database
jest.mock('../../db');

describe('SupplierModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllSuppliers', () => {
    it('should get all suppliers successfully', async () => {
      const mockSuppliers = [
        {
          id: 1,
          name: 'Supplier 1',
          address: '123 Test Street',
          phone: '0123456789',
          email: 'supplier1@example.com',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Supplier 2',
          address: '456 Test Avenue',
          phone: '0987654321',
          email: 'supplier2@example.com',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      db.query.mockResolvedValue([mockSuppliers]);

      const result = await supplierModel.getAllSuppliers();

      expect(db.query).toHaveBeenCalledWith(
        'SELECT id, name, address, phone, email, created_at, updated_at FROM suppliers'
      );
      expect(result).toEqual(mockSuppliers);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValue(dbError);

      await expect(supplierModel.getAllSuppliers()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getSupplierById', () => {
    it('should get supplier by id successfully', async () => {
      const mockSupplier = {
        id: 1,
        name: 'Test Supplier',
        address: '123 Test Street',
        phone: '0123456789',
        email: 'test@example.com',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      db.query.mockResolvedValue([[mockSupplier]]);

      const result = await supplierModel.getSupplierById(1);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT id, name, address, phone, email, created_at, updated_at FROM suppliers WHERE id = ?',
        [1]
      );
      expect(result).toEqual(mockSupplier);
    });

    it('should return undefined when supplier not found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await supplierModel.getSupplierById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('createSupplier', () => {
    it('should create supplier successfully', async () => {
      const supplierData = {
        name: 'New Supplier',
        address: '789 New Street',
        phone: '0111222333',
        email: 'new@example.com'
      };

      const mockResult = { insertId: 123 };
      const mockCreatedSupplier = {
        id: 123,
        ...supplierData,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      // Mock INSERT query
      db.query.mockResolvedValueOnce([mockResult]);
      // Mock getSupplierById query
      db.query.mockResolvedValueOnce([[mockCreatedSupplier]]);

      const result = await supplierModel.createSupplier(supplierData);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO suppliers (name, address, phone, email, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        ['New Supplier', '789 New Street', '0111222333', 'new@example.com']
      );
      expect(result).toEqual(mockCreatedSupplier);
    });

    it('should handle database errors during creation', async () => {
      const supplierData = {
        name: 'New Supplier',
        address: '789 New Street',
        phone: '0111222333',
        email: 'new@example.com'
      };

      const dbError = new Error('Database error');
      db.query.mockRejectedValue(dbError);

      await expect(supplierModel.createSupplier(supplierData)).rejects.toThrow('Database error');
    });
  });

  describe('updateSupplier', () => {
    it('should update supplier successfully', async () => {
      const supplierData = {
        name: 'Updated Supplier',
        address: 'Updated Address',
        phone: '0999888777',
        email: 'updated@example.com'
      };

      const mockResult = { affectedRows: 1 };
      const mockUpdatedSupplier = {
        id: 1,
        ...supplierData,
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      };

      // Mock UPDATE query
      db.query.mockResolvedValueOnce([mockResult]);
      // Mock getSupplierById query
      db.query.mockResolvedValueOnce([[mockUpdatedSupplier]]);

      const result = await supplierModel.updateSupplier(1, supplierData);

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE suppliers SET name = ?, address = ?, phone = ?, email = ?, updated_at = NOW() WHERE id = ?',
        ['Updated Supplier', 'Updated Address', '0999888777', 'updated@example.com', 1]
      );
      expect(result).toEqual(mockUpdatedSupplier);
    });

    it('should throw error when supplier not found', async () => {
      const supplierData = {
        name: 'Updated Supplier',
        address: 'Updated Address',
        phone: '0999888777',
        email: 'updated@example.com'
      };

      const mockResult = { affectedRows: 0 };
      db.query.mockResolvedValue([mockResult]);

      await expect(supplierModel.updateSupplier(999, supplierData)).rejects.toThrow('Supplier not found');
    });
  });

  describe('deleteSupplier', () => {
    it('should delete supplier successfully', async () => {
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await supplierModel.deleteSupplier(1);

      expect(db.query).toHaveBeenCalledWith('DELETE FROM suppliers WHERE id = ?', [1]);
      expect(result).toEqual({ message: 'Supplier deleted successfully' });
    });

    it('should throw error when supplier not found', async () => {
      const mockResult = { affectedRows: 0 };
      db.query.mockResolvedValue([mockResult]);

      await expect(supplierModel.deleteSupplier(999)).rejects.toThrow('Supplier not found');
    });
  });
});
