const { Book, Category, Publisher, BookImages, sequelize } = require('../models');
const { Op, QueryTypes } = require('sequelize');
const cacheHelper = require('../utils/cacheHelper');

const CACHE_KEYS = {
  ALL_BOOKS: 'books:all',
  BOOK_BY_ID: (id) => `books:${id}`,
  BOOKS_BY_CATEGORY: (catId) => `books:category:${catId}`,
};

const CACHE_TTL = {
  BOOKS_LIST: 3600,     // 1 hour
  BOOK_DETAIL: 1800,    // 30 minutes
  BOOKS_CATEGORY: 1800, // 30 minutes
};

const getAllBooks = async () => {
  return await cacheHelper.getOrSet(
    CACHE_KEYS.ALL_BOOKS,
    async () => {
      return await Book.findAll({
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name'] },
          { model: Publisher, as: 'publisher', attributes: ['id', 'name'] },
          { model: BookImages, as: 'images', attributes: ['id', 'image_path'] }
        ]
      });
    },
    CACHE_TTL.BOOKS_LIST
  );
};

const createBook = async (bookData, files = []) => {
  const existed = await Book.findOne({ where: { title: bookData.title } });
  if (existed) {
    throw new Error('Sách đã tồn tại');
  }

  // Use transaction to ensure images are saved together with book
  return await sequelize.transaction(async (t) => {
    const book = await Book.create(bookData, { transaction: t });

    if (Array.isArray(files) && files.length > 0) {
      const imageRows = files.map((f) => ({
        book_id: book.id,
        image_path: `/uploads/${f.filename}`,
      }));
      await BookImages.bulkCreate(imageRows, { transaction: t });
    }

    // Return with associations so frontend sees images immediately
    // Invalidate cache after create
    await cacheHelper.del(CACHE_KEYS.ALL_BOOKS);
    const created = await Book.findByPk(book.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Publisher, as: 'publisher', attributes: ['id', 'name'] },
        { model: BookImages, as: 'images', attributes: ['id', 'image_path'] },
      ],
      transaction: t,
    });
    return created;
  });
};

const updateBook = async (id, bookData, files = []) => {
  const book = await Book.findByPk(id);
  if (bookData.title !== book.title) {
    const existed = await Book.findOne({
      where: {
        title: bookData.title,
        id: { [Op.ne]: id }
      }
    });
    if (existed) {
      throw new Error('Sách đã tồn tại');
    }
  }
  await sequelize.transaction(async (t) => {
    await book.update(bookData, { transaction: t });
    if (Array.isArray(files) && files.length > 0) {
      const imageRows = files.map((f) => ({
        book_id: book.id,
        image_path: `/uploads/${f.filename}`,
      }));
      await BookImages.bulkCreate(imageRows, { transaction: t });
    }
  });

  // Invalidate cache after update
  await cacheHelper.del(CACHE_KEYS.ALL_BOOKS);
  // Return with associations updated
  return await Book.findByPk(id, {
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Publisher, as: 'publisher', attributes: ['id', 'name'] },
      { model: BookImages, as: 'images', attributes: ['id', 'image_path'] },
    ],
  });
};

const deleteBook = async (id) => {
  const book = await Book.findByPk(id);
  await book.destroy();
  // Invalidate cache after delete
  await cacheHelper.del(CACHE_KEYS.ALL_BOOKS);
  return { success: true };
};

const getOldStockBooks = async (months = 2) => {
  const now = new Date();
  const compareDate = new Date(now.setMonth(now.getMonth() - months));
  const books = await Book.findAll({
    where: {
      updated_at: { [Op.lte]: compareDate },
      quantity_in_stock: { [Op.gt]: 0 }
    },
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] }
    ],
    attributes: ['id', 'title', 'price', 'quantity_in_stock', 'updated_at'],
    order: [['updated_at', 'ASC']],
    raw: false
  });
  
  // Map dữ liệu: đổi quantity_in_stock thành stock
  return books.map(book => ({
    ...book.dataValues,
    stock: book.quantity_in_stock,
    category: book.category
  }));
};

const getBookById = async (id) => {
  return await Book.findByPk(id, {
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Publisher, as: 'publisher', attributes: ['id', 'name'] },
      { model: BookImages, as: 'images', attributes: ['id', 'image_path'] }
    ]
  });
};

// getLatestBooks: lấy sách nhập mới nhất trong 1 tháng gần đây (cần bổ sung nếu có bảng nhập sách)
const getLatestBooks = async () => {
  // Chỉ trả về sách tạo trong 1 tháng gần đây
  const now = new Date();
  const compareDate = new Date(now.setMonth(now.getMonth() - 1));
  return await Book.findAll({
    where: {
      created_at: { [Op.gte]: compareDate }
    },
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Publisher, as: 'publisher', attributes: ['id', 'name'] },
      { model: BookImages, as: 'images', attributes: ['id', 'image_path'] }
    ],
    order: [['created_at', 'DESC']],
    limit: 5
  });
};

// Lấy sách cùng thể loại (sách liên quan)
const getBooksByCategory = async (categoryId, excludeBookId, limit = 8) => {
  return await Book.findAll({
    where: {
      category_id: categoryId,
      id: { [Op.ne]: excludeBookId }
    },
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Publisher, as: 'publisher', attributes: ['id', 'name'] },
      { model: BookImages, as: 'images', attributes: ['id', 'image_path'] }
    ],
    limit: limit,
    order: [['created_at', 'DESC']]
  });
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getOldStockBooks,
  getLatestBooks,
  getBooksByCategory,
};

// New method: get books with pricing from DB view
module.exports.getAllBooksPricing = async () => {
  const rows = await sequelize.query(
    `SELECT v.*, c.name AS category_name, p.name AS publisher_name
     FROM v_books_pricing v
     LEFT JOIN categories c ON c.id = v.category_id
     LEFT JOIN publishers p ON p.id = v.publisher_id`,
    { type: QueryTypes.SELECT }
  );
  return rows;
};
