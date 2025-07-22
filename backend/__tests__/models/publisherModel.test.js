const publisherModel = require('../../models/publisherModel');
const db = require('../../db');

// Mock the database
jest.mock('../../db');

describe('PublisherModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllPublishers', () => {
    it('should return all publishers from database', async () => {
      const mockPublishers = [
        { id: 1, name: 'NXB Trẻ' },
        { id: 2, name: 'NXB Kim Đồng' },
        { id: 3, name: 'NXB Giáo dục' }
      ];

      db.query.mockResolvedValue([mockPublishers, []]);

      const result = await publisherModel.getAllPublishers();

      expect(db.query).toHaveBeenCalledWith('SELECT id, name FROM publishers');
      expect(result).toEqual(mockPublishers);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      db.query.mockRejectedValue(error);

      await expect(publisherModel.getAllPublishers()).rejects.toThrow('Database connection failed');
      expect(db.query).toHaveBeenCalledWith('SELECT id, name FROM publishers');
    });

    it('should return empty array when no publishers exist', async () => {
      db.query.mockResolvedValue([[], []]);

      const result = await publisherModel.getAllPublishers();

      expect(result).toEqual([]);
      expect(db.query).toHaveBeenCalledWith('SELECT id, name FROM publishers');
    });
  });

  describe('searchPublishers', () => {
    it('should search publishers by keyword', async () => {
      const keyword = 'Trẻ';
      const mockSearchResults = [
        { id: 1, name: 'NXB Trẻ' }
      ];

      db.query.mockResolvedValue([mockSearchResults, []]);

      const result = await publisherModel.searchPublishers(keyword);

      expect(db.query).toHaveBeenCalledWith(
        `SELECT id, name
         FROM publishers
         WHERE name LIKE ?
         ORDER BY name ASC`,
        [`${keyword}%`]
      );
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle search with empty keyword', async () => {
      const keyword = '';
      const mockAllPublishers = [
        { id: 1, name: 'NXB Trẻ' },
        { id: 2, name: 'NXB Kim Đồng' }
      ];

      db.query.mockResolvedValue([mockAllPublishers, []]);

      const result = await publisherModel.searchPublishers(keyword);

      expect(db.query).toHaveBeenCalledWith(
        `SELECT id, name
         FROM publishers
         WHERE name LIKE ?
         ORDER BY name ASC`,
        ['%'] // Empty keyword becomes '%'
      );
      expect(result).toEqual(mockAllPublishers);
    });

    it('should return empty array when no matches found', async () => {
      const keyword = 'NonExistent';
      db.query.mockResolvedValue([[], []]);

      const result = await publisherModel.searchPublishers(keyword);

      expect(result).toEqual([]);
      expect(db.query).toHaveBeenCalledWith(
        `SELECT id, name
         FROM publishers
         WHERE name LIKE ?
         ORDER BY name ASC`,
        [`${keyword}%`]
      );
    });

    it('should handle database errors during search', async () => {
      const keyword = 'test';
      const error = new Error('Search query failed');
      db.query.mockRejectedValue(error);

      await expect(publisherModel.searchPublishers(keyword)).rejects.toThrow('Search query failed');
      expect(db.query).toHaveBeenCalledWith(
        `SELECT id, name
         FROM publishers
         WHERE name LIKE ?
         ORDER BY name ASC`,
        [`${keyword}%`]
      );
    });

    it('should handle special characters in keyword', async () => {
      const keyword = 'NXB%_';
      const mockResults = [];
      db.query.mockResolvedValue([mockResults, []]);

      const result = await publisherModel.searchPublishers(keyword);

      expect(db.query).toHaveBeenCalledWith(
        `SELECT id, name
         FROM publishers
         WHERE name LIKE ?
         ORDER BY name ASC`,
        [`${keyword}%`]
      );
      expect(result).toEqual(mockResults);
    });
  });
});
