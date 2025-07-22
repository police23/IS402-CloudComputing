const bookModel = require("../models/BookModel");

const getAllBooks = async () => {
    return await bookModel.getAllBooks();
};

const createBook = async (bookData) => {
    // Kiểm tra dữ liệu đầu vào
    if (!bookData.title || !bookData.author || !bookData.category_id || !bookData.publisher_id) {
        throw new Error("Thiếu thông tin bắt buộc");
    }
    
    const existingBooks = await bookModel.getAllBooks();
    const existed = existingBooks.some(book => book.title === bookData.title);
    if (existed) {
        throw new Error("Sách đã tồn tại");
    }
    
    return await bookModel.createBook(bookData);
};

const updateBook = async (id, bookData) => {
    // Kiểm tra dữ liệu đầu vào
    if (!bookData.title || !bookData.author || !bookData.category_id || !bookData.publisher_id) {
        throw new Error("Thiếu thông tin bắt buộc");
    }
    
    // Kiểm tra xem sách có tồn tại không
    const existingBooks = await bookModel.getAllBooks();
    const existingBook = existingBooks.find(book => book.id === parseInt(id));
    if (!existingBook) {
        throw new Error("Sách không tồn tại");
    }
    
    // Chỉ kiểm tra trùng tên nếu tên sách thay đổi
    if (bookData.title !== existingBook.title) {
        const duplicateTitle = existingBooks.some(book => 
            book.title === bookData.title && book.id !== parseInt(id)
        );
        if (duplicateTitle) {
            throw new Error("Sách đã tồn tại");
        }
    }
    
    return await bookModel.updateBook(id, bookData);
};

const deleteBook = async (id) => {
    // Kiểm tra xem sách có tồn tại không
    const existingBooks = await bookModel.getAllBooks();
    const existingBook = existingBooks.find(book => book.id === parseInt(id));
    if (!existingBook) {
        throw new Error("Sách không tồn tại");
    }
    
    return await bookModel.deleteBook(id);
};

const getOldStockBooks = async (months = 2) => {
    return await bookModel.getOldStockBooks(months);
};

const getBookById = async (id) => {
    return await bookModel.getBookById(id);
};

const getLatestBooks = async () => {
    return await bookModel.getLatestBooks();
};

module.exports = {
    getAllBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    getOldStockBooks,
    getLatestBooks,
};
