const { Book, Category, Publisher, BookImages } = require('../models');
const { Op } = require('sequelize');

const getAllBooks = async () => {
  return await Book.findAll({
    include: [
      { model: Category, as: 'category', attributes: ['id', 'name'] },
      { model: Publisher, as: 'publisher', attributes: ['id', 'name'] },
      { model: BookImages, as: 'images', attributes: ['id', 'image_path'] }
    ]
  });
};

const createBook = async (bookData) => {
  const existed = await Book.findOne({ where: { title: bookData.title } });
  if (existed) {
    throw new Error('Sách đã tồn tại');
  }
  const book = await Book.create(bookData);
  return book;
};

const updateBook = async (id, bookData) => {
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
  await book.update(bookData);
  return book;
};

const deleteBook = async (id) => {
  const book = await Book.findByPk(id);
  await book.destroy();
  return { success: true };
};

const getOldStockBooks = async (months = 2) => {
  const now = new Date();
  const compareDate = new Date(now.setMonth(now.getMonth() - months));
  return await Book.findAll({
    where: {
      updated_at: { [Op.lte]: compareDate },
      quantity_in_stock: { [Op.gt]: 0 }
    },
    order: [['updated_at', 'ASC']]
  });
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

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getOldStockBooks,
  getLatestBooks,
};
