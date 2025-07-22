const publisherController = require('../../controllers/publisherController');
const publisherService = require('../../services/publisherService');
const { createMockRequest, createMockResponse } = require('../helpers/testHelpers');

// Mock the service
jest.mock('../../services/publisherService');

describe('PublisherController', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  describe('getAllPublishers', () => {
    it('should get all publishers successfully', async () => {
      const mockPublishers = [
        { id: 1, name: 'NXB Trẻ', address: 'TP.HCM', phone: '0123456789' },
        { id: 2, name: 'NXB Kim Đồng', address: 'Hà Nội', phone: '0987654321' },
        { id: 3, name: 'NXB Giáo dục', address: 'Hà Nội', phone: '0555444333' }
      ];

      publisherService.getAllPublishers.mockResolvedValue(mockPublishers);

      await publisherController.getAllPublishers(req, res);

      expect(publisherService.getAllPublishers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockPublishers);
    });

    it('should handle errors when getting publishers', async () => {
      publisherService.getAllPublishers.mockRejectedValue(new Error('Database connection failed'));

      await publisherController.getAllPublishers(req, res);

      expect(publisherService.getAllPublishers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch publishers'
      });
    });

    it('should handle empty publishers list', async () => {
      publisherService.getAllPublishers.mockResolvedValue([]);

      await publisherController.getAllPublishers(req, res);

      expect(publisherService.getAllPublishers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should handle service throwing different error types', async () => {
      publisherService.getAllPublishers.mockRejectedValue(new TypeError('Invalid query'));

      await publisherController.getAllPublishers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch publishers'
      });
    });
  });
});
