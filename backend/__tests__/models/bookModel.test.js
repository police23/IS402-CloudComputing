const bookModel = require('../../models/bookModel');
const db = require('../../db');

// Mock the database
jest.mock('../../db');

describe('BookModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    it('should get all books with categories and publishers', async () => {
      const mockBooks = [
        {
          id: 1,
          title: 'Test Book 1',
          author: 'Test Author 1',
          category_id: 1,
          publisher_id: 1,
          category: 'Fiction',
          publisher: 'Test Publisher',
          publicationYear: 2023,
          price: 100000,
          stock: 50,
          description: 'Test description',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          title: 'Test Book 2',
          author: 'Test Author 2',
          category_id: 2,
          publisher_id: 2,
          category: 'Non-Fiction',
          publisher: 'Another Publisher',
          publicationYear: 2024,
          price: 150000,
          stock: 30,
          description: 'Another description',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      db.query.mockResolvedValue([mockBooks]);

      const result = await bookModel.getAllBooks();

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT b.id, b.title'));
      expect(result).toEqual(mockBooks);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      db.query.mockRejectedValue(dbError);

      await expect(bookModel.getAllBooks()).rejects.toThrow('Database connection failed');
    });
  });

  describe('getBookById', () => {
    it('should get book by id with category and publisher info', async () => {
      const mockBook = {
        id: 1,
        title: 'Test Book',
        author: 'Test Author',
        category_id: 1,
        publisher_id: 1,
        category: 'Fiction',
        publisher: 'Test Publisher',
        publicationYear: 2023,
        price: 100000,
        stock: 50,
        description: 'Test description',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      db.query.mockResolvedValue([[mockBook]]);

      const result = await bookModel.getBookById(1);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE b.id = ?'),
        [1]
      );
      expect(result).toEqual(mockBook);
    });

    it('should return undefined when book not found', async () => {
      db.query.mockResolvedValue([[]]);

      const result = await bookModel.getBookById(999);

      expect(result).toBeUndefined();
    });
  });

  describe('createBook', () => {
    it('should create book successfully', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        category_id: 1,
        publisher_id: 1,
        publication_year: 2024,
        price: 120000,
        quantity_in_stock: 40,
        description: 'New book description'
      };

      const mockResult = { insertId: 123 };
      const mockCreatedBook = {
        id: 123,
        ...bookData,
        category: 'Fiction',
        publisher: 'Test Publisher',
        stock: 40,
        publicationYear: 2024
      };

      // Mock for INSERT query
      db.query.mockResolvedValueOnce([mockResult]);
      // Mock for getBookById query
      db.query.mockResolvedValueOnce([[mockCreatedBook]]);

      const result = await bookModel.createBook(bookData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO books'),
        ['New Book', 'New Author', 1, 1, 2024, 120000, 40, 'New book description']
      );
      expect(result).toEqual(mockCreatedBook);
    });
  });

  describe('updateBook', () => {
    it('should update book successfully', async () => {
      const bookData = {
        title: 'Updated Book',
        author: 'Updated Author',
        category_id: 1,
        publisher_id: 1,
        publication_year: 2024,
        price: 130000,
        quantity_in_stock: 35,
        description: 'Updated description'
      };

      const mockResult = { affectedRows: 1 };
      const mockUpdatedBook = {
        id: 1,
        ...bookData,
        category: 'Fiction',
        publisher: 'Test Publisher',
        stock: 35,
        publicationYear: 2024
      };

      // Mock for UPDATE query
      db.query.mockResolvedValueOnce([mockResult]);
      // Mock for getBookById query
      db.query.mockResolvedValueOnce([[mockUpdatedBook]]);

      const result = await bookModel.updateBook(1, bookData);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE books SET'),
        ['Updated Book', 'Updated Author', 1, 1, 2024, 130000, 35, 'Updated description', 1]
      );
      expect(result).toEqual(mockUpdatedBook);
    });

    it('should throw error when book not found', async () => {
      const bookData = {
        title: 'Updated Book',
        author: 'Updated Author',
        category_id: 1,
        publisher_id: 1,
        publication_year: 2024,
        price: 130000,
        quantity_in_stock: 35,
        description: 'Updated description'
      };

      const mockResult = { affectedRows: 0 };
      db.query.mockResolvedValue([mockResult]);

      await expect(bookModel.updateBook(999, bookData)).rejects.toThrow('Book not found');
    });
  });

  describe('deleteBook', () => {
    it('should delete book successfully', async () => {
      const mockResult = { affectedRows: 1 };
      db.query.mockResolvedValue([mockResult]);

      const result = await bookModel.deleteBook(1);

      expect(db.query).toHaveBeenCalledWith('DELETE FROM books WHERE id = ?', [1]);
      expect(result).toEqual({ message: 'Book deleted successfully' });
    });

    it('should throw error when book not found', async () => {
      const mockResult = { affectedRows: 0 };
      db.query.mockResolvedValue([mockResult]);

      await expect(bookModel.deleteBook(999)).rejects.toThrow('Book not found');
    });
  });

  describe('getOldStockBooks', () => {
    it('should get old stock books with default 2 months', async () => {
      const mockOldBooks = [
        {
          id: 1,
          title: 'Old Book',
          author: 'Old Author',
          category_id: 1,
          publisher_id: 1,
          category: 'Fiction',
          publisher: 'Test Publisher',
          publicationYear: 2023,
          price: 100000,
          stock: 10,
          description: 'Old book',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      db.query.mockResolvedValue([mockOldBooks]);

      const result = await bookModel.getOldStockBooks();

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('TIMESTAMPDIFF(MONTH, b.updated_at, NOW()) >= ?'),
        [2]
      );
      expect(result).toEqual(mockOldBooks);
    });

    it('should get old stock books with custom months', async () => {
      const mockOldBooks = [];
      db.query.mockResolvedValue([mockOldBooks]);

      const result = await bookModel.getOldStockBooks(6);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('TIMESTAMPDIFF(MONTH, b.updated_at, NOW()) >= ?'),
        [6]
      );
      expect(result).toEqual(mockOldBooks);
    });
  });
});
