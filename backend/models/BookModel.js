const db = require("../db");

const getAllBooks = async () => {
    const [rows] = await db.query(`
    SELECT b.id, b.title, b.author, b.category_id, b.publisher_id,
    c.name AS category, p.name AS publisher,
    b.publication_year AS publicationYear, b.price, b.quantity_in_stock AS stock, b.description, b.created_at, b.updated_at
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    `);
    
    const bookIds = rows.map(b => b.id);
    let images = [];
    
    if (bookIds.length > 0) {
        const [imgRows] = await db.query('SELECT book_id, image_path FROM book_images WHERE book_id IN (?)', [bookIds]);
        images = imgRows;
    }
    
    return rows.map(book => ({
        ...book,
        imageUrls: images.filter(img => img.book_id === book.id).map(img => img.image_path)
    }));
};

const getBookById = async (id) => {
    const [rows] = await db.query(`
        SELECT b.id, b.title, b.author, b.category_id, b.publisher_id,
        c.name AS category, p.name AS publisher,
        b.publication_year AS publicationYear, b.price, b.quantity_in_stock AS stock, b.description, b.created_at, b.updated_at
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN publishers p ON b.publisher_id = p.id
        WHERE b.id = ?
    `, [id]);
    if (rows.length === 0) return null;
    const book = rows[0];
    // Lấy ảnh
    const [imgRows] = await db.query('SELECT image_path FROM book_images WHERE book_id = ?', [id]);
    book.imageUrls = imgRows.map(img => img.image_path);
    return book;
};

const getLatestBooks = async () => {
    const [rows] = await db.query(`
        SELECT 
            b.id, b.title, b.author, b.category_id, b.publisher_id,
            c.name AS category, p.name AS publisher,
            b.publication_year AS publicationYear, b.price, b.quantity_in_stock AS stock, b.description, b.created_at, b.updated_at,
            MIN(bi.import_date) AS first_import_date
        FROM books b
        JOIN book_import_details bid ON b.id = bid.book_id
        JOIN book_imports bi ON bid.import_id = bi.id
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN publishers p ON b.publisher_id = p.id
        GROUP BY b.id
        HAVING first_import_date >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        ORDER BY first_import_date DESC
        LIMIT 5
    `);

    const bookIds = rows.map(b => b.id);
    let images = [];
    if (bookIds.length > 0) {
        const [imgRows] = await db.query('SELECT book_id, image_path FROM book_images WHERE book_id IN (?)', [bookIds]);
        images = imgRows;
    }

    return rows.map(book => ({
        ...book,
        imageUrls: images.filter(img => img.book_id === book.id).map(img => img.image_path)
    }));
};


const createBook = async (book) => {
    const { title, author, category_id, publisher_id, publication_year, price, quantity_in_stock, description, imageUrls = [] } = book;
    
    const [result] = await db.query(
        "INSERT INTO books (title, author, category_id, publisher_id, publication_year, price, quantity_in_stock, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [title, author, category_id, publisher_id, publication_year, price, quantity_in_stock, description]
    );
    const bookId = result.insertId;
    if (imageUrls.length > 0) {
      const values = imageUrls.map(url => [bookId, url]);
      await db.query('INSERT INTO book_images (book_id, image_path) VALUES ?', [values]);
    }
    return result;
};

const updateBook = async (id, book) => {
    const { title, author, category_id, publisher_id, publication_year, price, quantity_in_stock, description, imageUrls } = book;
        
    let query = "UPDATE books SET title = ?, author = ?, category_id = ?, publisher_id = ?, publication_year = ?, price = ?, quantity_in_stock = ?, description = ?, updated_at = NOW()";
    let params = [title, author, category_id, publisher_id, publication_year, price, quantity_in_stock, description];
    query += " WHERE id = ?";
    params.push(id);
    const [result] = await db.query(query, params);
    if (result.affectedRows === 0) {
        throw new Error("Sách không tồn tại");
    }
    
    if (imageUrls !== undefined) {
        await db.query('DELETE FROM book_images WHERE book_id = ?', [id]);
        
        if (Array.isArray(imageUrls) && imageUrls.length > 0) {
            const values = imageUrls.map(url => [id, url]);
            await db.query('INSERT INTO book_images (book_id, image_path) VALUES ?', [values]);
        }
    }
    
    return result;
};

const deleteBook = async (id) => {
    
    await db.query('DELETE FROM book_images WHERE book_id = ?', [id]);
    
    const [result] = await db.query("DELETE FROM books WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
        throw new Error("Sách không tồn tại");
    }
    return result;
};

const getOldStockBooks = async (months = 2) => {
    const [rows] = await db.query(`
    SELECT b.id, b.title, b.author, b.category_id, b.publisher_id,
        c.name AS category, p.name AS publisher,
        b.publication_year AS publicationYear, b.price, 
        b.quantity_in_stock AS stock, b.description, b.created_at, b.updated_at
    FROM books b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    WHERE TIMESTAMPDIFF(MONTH, b.updated_at, NOW()) >= ?
    AND b.quantity_in_stock > 0
    ORDER BY b.updated_at ASC
    `, [months]);
    return rows;
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