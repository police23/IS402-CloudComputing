const bookService = require('../services/BookService');

const getAllBooks = async (req, res) => {
  try {
    const books = await bookService.getAllBooks();
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

const createBook = async (req, res) => {
  try {
    let bookData = req.body;
    bookData.category_id = bookData.category_id ? Number(bookData.category_id) : null;
    bookData.publisher_id = bookData.publisher_id ? Number(bookData.publisher_id) : null;
    bookData.publication_year = bookData.publication_year ? Number(bookData.publication_year) : null;
    bookData.price = bookData.price ? Number(bookData.price) : null;
    bookData.quantity_in_stock = bookData.quantity_in_stock ? Number(bookData.quantity_in_stock) : null;
    
    const book = await bookService.createBook(bookData);
    res.status(201).json(book);
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book', detail: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    let bookData = req.body;
    bookData.category_id = bookData.category_id ? Number(bookData.category_id) : null;
    bookData.publisher_id = bookData.publisher_id ? Number(bookData.publisher_id) : null;
    bookData.publication_year = bookData.publication_year ? Number(bookData.publication_year) : null;
    bookData.price = bookData.price ? Number(bookData.price) : null;
    bookData.quantity_in_stock = bookData.quantity_in_stock ? Number(bookData.quantity_in_stock) : null;
    // bookData.imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const book = await bookService.updateBook(id, bookData);
    res.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: error.message || 'Failed to update book' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await bookService.deleteBook(id);
    res.json(result);
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: error.message || 'Failed to delete book' });
  }
};

const getOldStockBooks = async (req, res) => {
  try {
    const months = req.query.months ? parseInt(req.query.months) : 2;
    const books = await bookService.getOldStockBooks(months);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch old stock books' });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await bookService.getBookById(id);
    
    if (!book) {
      return res.status(404).json({ 
        success: false,
        error: 'Book not found' 
      });
    }
    
    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch book' 
    });
  }
};

const getLatestBooks = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const books = await bookService.getLatestBooks(limit);
    res.json(books);
  } catch (error) {
    console.error('Error fetching latest books:', error);
    res.status(500).json({ error: 'Failed to fetch latest books' });
  }
};

module.exports = {
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getOldStockBooks,
  getBookById,
  getLatestBooks,
};