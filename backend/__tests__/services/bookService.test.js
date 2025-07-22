const bookService = require('../../services/bookService');
const bookModel = require('../../models/bookModel');

// Mock bookModel
jest.mock('../../models/bookModel');

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    it('should return all books from model', async () => {
      const mockBooks = [
        { id: 1, title: 'Book 1', author: 'Author 1', price: 100000 },
        { id: 2, title: 'Book 2', author: 'Author 2', price: 150000 }
      ];

      bookModel.getAllBooks.mockResolvedValue(mockBooks);

      const result = await bookService.getAllBooks();

      expect(bookModel.getAllBooks).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockBooks);
    });

    it('should propagate errors from model', async () => {
      const errorMessage = 'Database error';
      bookModel.getAllBooks.mockRejectedValue(new Error(errorMessage));

      await expect(bookService.getAllBooks()).rejects.toThrow(errorMessage);
      expect(bookModel.getAllBooks).toHaveBeenCalledTimes(1);
    });
  });

  describe('getBookById', () => {
    it('should return a book by id', async () => {
      const bookId = 1;
      const mockBook = { id: 1, title: 'Book 1', author: 'Author 1' };

      bookModel.getBookById.mockResolvedValue(mockBook);

      const result = await bookService.getBookById(bookId);

      expect(bookModel.getBookById).toHaveBeenCalledWith(bookId);
      expect(result).toEqual(mockBook);
    });

    it('should return null for non-existent book', async () => {
      const bookId = 999;
      bookModel.getBookById.mockResolvedValue(null);

      const result = await bookService.getBookById(bookId);

      expect(bookModel.getBookById).toHaveBeenCalledWith(bookId);
      expect(result).toBeNull();
    });
  });

  describe('createBook', () => {
    it('should create a new book', async () => {
      const bookData = {
        title: 'New Book',
        author: 'New Author',
        price: 120000,
        stock: 30
      };
      const createdBook = { id: 1, ...bookData };

      bookModel.createBook.mockResolvedValue(createdBook);

      const result = await bookService.createBook(bookData);

      expect(bookModel.createBook).toHaveBeenCalledWith(bookData);
      expect(result).toEqual(createdBook);
    });

    it('should handle validation errors', async () => {
      const invalidBookData = { title: '' }; // Invalid data
      const errorMessage = 'Title is required';
      
      bookModel.createBook.mockRejectedValue(new Error(errorMessage));

      await expect(bookService.createBook(invalidBookData)).rejects.toThrow(errorMessage);
    });
  });

  describe('updateBook', () => {
    it('should update an existing book', async () => {
      const bookId = 1;
      const updateData = { title: 'Updated Book', price: 180000 };
      const updatedBook = { id: 1, title: 'Updated Book', price: 180000 };

      bookModel.updateBook.mockResolvedValue(updatedBook);

      const result = await bookService.updateBook(bookId, updateData);

      expect(bookModel.updateBook).toHaveBeenCalledWith(bookId, updateData);
      expect(result).toEqual(updatedBook);
    });

    it('should handle update errors', async () => {
      const bookId = 999;
      const updateData = { title: 'Updated Book' };
      const errorMessage = 'Book not found';

      bookModel.updateBook.mockRejectedValue(new Error(errorMessage));

      await expect(bookService.updateBook(bookId, updateData)).rejects.toThrow(errorMessage);
    });
  });

  describe('deleteBook', () => {
    it('should delete a book', async () => {
      const bookId = 1;
      bookModel.deleteBook.mockResolvedValue(true);

      const result = await bookService.deleteBook(bookId);

      expect(bookModel.deleteBook).toHaveBeenCalledWith(bookId);
      expect(result).toBe(true);
    });

    it('should handle delete errors', async () => {
      const bookId = 999;
      const errorMessage = 'Book not found';

      bookModel.deleteBook.mockRejectedValue(new Error(errorMessage));

      await expect(bookService.deleteBook(bookId)).rejects.toThrow(errorMessage);
    });
  });

  describe('getOldStockBooks', () => {
    it('should return old stock books with default months', async () => {
      const mockOldBooks = [
        { id: 1, title: 'Old Book 1', lastImported: '2024-01-01' }
      ];

      bookModel.getOldStockBooks.mockResolvedValue(mockOldBooks);

      const result = await bookService.getOldStockBooks();

      expect(bookModel.getOldStockBooks).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockOldBooks);
    });

    it('should return old stock books with custom months', async () => {
      const months = 6;
      const mockOldBooks = [];

      bookModel.getOldStockBooks.mockResolvedValue(mockOldBooks);

      const result = await bookService.getOldStockBooks(months);

      expect(bookModel.getOldStockBooks).toHaveBeenCalledWith(months);
      expect(result).toEqual(mockOldBooks);
    });
  });
});
