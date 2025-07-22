const bookService = require("../services/BookService");

const getAllBooks = async (req, res) => {
    try {
        const books = await bookService.getAllBooks();
        res.json({ success: true, data: books });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ success: false, error: "Failed to fetch books" });
    }
};


const createBook = async (req, res) => {
    try {
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);
        let bookData = req.body;
        // Ép kiểu các trường số
        bookData.category_id = bookData.category_id ? Number(bookData.category_id) : null;
        bookData.publisher_id = bookData.publisher_id ? Number(bookData.publisher_id) : null;
        bookData.publication_year = bookData.publication_year ? Number(bookData.publication_year) : null;
        bookData.price = bookData.price ? Number(bookData.price) : null;
        bookData.quantity_in_stock = bookData.quantity_in_stock ? Number(bookData.quantity_in_stock) : null;
        // Nếu có nhiều file ảnh, thêm mảng đường dẫn vào bookData
        if (req.files && req.files.length > 0) {
            bookData.imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        }
        const book = await bookService.createBook(bookData);
        res.status(201).json({ success: true, ...book });
    } catch (error) {
        console.error("Error adding book:", error);
        res.status(400).json({ success: false, error: "Failed to add book", detail: error.message });
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
        
        // Xử lý ảnh giống như createBook
        if (req.files && req.files.length > 0) {
            bookData.imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        }
        
        const book = await bookService.updateBook(id, bookData);
        res.json({ success: true, ...book });
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(400).json({ success: false, error: error.message || "Failed to update book" });
    }
};

const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await bookService.deleteBook(id);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(400).json({ success: false, error: error.message || "Failed to delete book" });
    }
};

const getOldStockBooks = async (req, res) => {
    try {
        const months = req.query.months ? parseInt(req.query.months) : 2;
        const books = await bookService.getOldStockBooks(months);
        res.json({ success: true, data: books });
    } catch (error) {
        console.error("Error fetching old stock books:", error);
        res.status(500).json({ success: false, error: "Failed to fetch old stock books" });
    }
};

const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await bookService.getBookById(id);
        if (!book) {
            return res.status(404).json({ success: false, error: "Book not found" });
        }
        // Đảm bảo các trường luôn có giá trị mặc định
        res.json({ success: true, data: {
            ...book,
            title: book.title || "Không rõ",
            author: book.author || "Không rõ",
            category: book.category || "Không rõ",
            publisher: book.publisher || "Không rõ",
            price: typeof book.price === 'number' ? book.price : 0,
            stock: typeof book.stock === 'number' ? book.stock : 0,
            publicationYear: book.publicationYear || "Không rõ",
            imageUrls: Array.isArray(book.imageUrls) ? book.imageUrls : [],
        } });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch book" });
    }
};

const getLatestBooks = async (req, res) => {
    try {
        const books = await bookService.getLatestBooks();
        res.json({ success: true, data: books });
    } catch (error) {
        console.error("Error fetching latest books:", error);
        res.status(500).json({ success: false, error: "Failed to fetch latest books" });
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