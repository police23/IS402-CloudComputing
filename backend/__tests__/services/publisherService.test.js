const publisherService = require('../../services/publisherService');
const publisherModel = require('../../models/publisherModel');

// Mock the model
jest.mock('../../models/publisherModel');

describe('PublisherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPublishers', () => {
    it('should return all publishers from model', async () => {
      const mockPublishers = [
        { id: 1, name: 'NXB Trẻ', address: 'TP.HCM' },
        { id: 2, name: 'NXB Kim Đồng', address: 'Hà Nội' }
      ];

      publisherModel.getAllPublishers.mockResolvedValue(mockPublishers);

      const result = await publisherService.getAllPublishers();

      expect(publisherModel.getAllPublishers).toHaveBeenCalled();
      expect(result).toEqual(mockPublishers);
    });

    it('should handle errors from model', async () => {
      const error = new Error('Database error');
      publisherModel.getAllPublishers.mockRejectedValue(error);

      await expect(publisherService.getAllPublishers()).rejects.toThrow('Database error');
      expect(publisherModel.getAllPublishers).toHaveBeenCalled();
    });

    it('should return empty array when no publishers', async () => {
      publisherModel.getAllPublishers.mockResolvedValue([]);

      const result = await publisherService.getAllPublishers();

      expect(result).toEqual([]);
      expect(publisherModel.getAllPublishers).toHaveBeenCalled();
    });
  });

  describe('searchPublishers', () => {
    it('should search publishers by keyword', async () => {
      const keyword = 'Trẻ';
      const mockSearchResults = [
        { id: 1, name: 'NXB Trẻ', address: 'TP.HCM' }
      ];

      publisherModel.searchPublishers.mockResolvedValue(mockSearchResults);

      const result = await publisherService.searchPublishers(keyword);

      expect(publisherModel.searchPublishers).toHaveBeenCalledWith(keyword);
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle search errors from model', async () => {
      const keyword = 'test';
      const error = new Error('Search error');
      publisherModel.searchPublishers.mockRejectedValue(error);

      await expect(publisherService.searchPublishers(keyword)).rejects.toThrow('Search error');
      expect(publisherModel.searchPublishers).toHaveBeenCalledWith(keyword);
    });

    it('should return empty array when no search results', async () => {
      const keyword = 'nonexistent';
      publisherModel.searchPublishers.mockResolvedValue([]);

      const result = await publisherService.searchPublishers(keyword);

      expect(result).toEqual([]);
      expect(publisherModel.searchPublishers).toHaveBeenCalledWith(keyword);
    });

    it('should handle empty keyword', async () => {
      const keyword = '';
      publisherModel.searchPublishers.mockResolvedValue([]);

      const result = await publisherService.searchPublishers(keyword);

      expect(publisherModel.searchPublishers).toHaveBeenCalledWith(keyword);
      expect(result).toEqual([]);
    });
  });
});
