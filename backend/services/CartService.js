

const { Cart, CartDetail, Book, BookImages } = require('../models');

const getCart = async (userID) => {
  try {
    // Find cart for user
    const cart = await Cart.findOne({ where: { user_id: userID } });
    if (!cart) {
      return { success: true, data: [], message: 'Giỏ hàng trống' };
    }
    // Get cart details with book info and images
    const items = await CartDetail.findAll({
      where: { cart_id: cart.id },
      include: [{ 
        model: Book,
        as: 'Book',
        include: [{ model: BookImages, as: 'images' }]
      }],
    });
    // Format response
    const data = items.map(item => ({
      id: item.id,
      cart_id: item.cart_id,
      book_id: item.book_id,
      quantity: item.quantity,
      title: item.Book?.title,
      author: item.Book?.author,
      price: item.Book?.price,
      original_price: item.Book?.original_price || item.Book?.price,
      image_path: item.Book?.image_path || null,
      images: item.Book?.images || [],
      stock: item.Book?.quantity_in_stock,
    }));
    return { success: true, data, message: 'Lấy thông tin giỏ hàng thành công' };
  } catch (error) {
    console.error('Error getting cart:', error);
    return { success: false, message: 'Có lỗi xảy ra khi lấy thông tin giỏ hàng' };
  }
};

const addToCart = async (userID, bookID, quantity) => {
  try {
    const book = await Book.findByPk(bookID);
    if (!book) {
      return { success: false, message: 'Sản phẩm không tồn tại' };
    }
    if (book.quantity_in_stock < quantity) {
      return { success: false, message: `Chỉ còn ${book.quantity_in_stock} sản phẩm trong kho` };
    }
    if (quantity <= 0) {
      return { success: false, message: 'Số lượng phải lớn hơn 0' };
    }

    let cart = await Cart.findOne({ where: { user_id: userID } });
    if (!cart) {
      cart = await Cart.create({ user_id: userID });
    }
    let item = await CartDetail.findOne({ where: { cart_id: cart.id, book_id: bookID } });
    if (item) {
      const newQuantity = item.quantity + quantity;
      if (newQuantity > book.quantity_in_stock) {
        return { success: false, message: `Chỉ còn ${book.quantity_in_stock} sản phẩm trong kho` };
      }
      item.quantity = newQuantity;
      await item.save();
    } else {
      item = await CartDetail.create({ cart_id: cart.id, book_id: bookID, quantity });
    }
    return { success: true, data: { cartID: cart.id, bookID, quantity: item.quantity }, message: 'Thêm vào giỏ hàng thành công' };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, message: 'Có lỗi xảy ra khi thêm vào giỏ hàng' };
  }
};

const updateQuantity = async (userID, bookID, quantity) => {
  try {
    if (quantity <= 0) {
      return { success: false, message: 'Số lượng phải lớn hơn 0' };
    }
    const book = await Book.findByPk(bookID);
    if (!book) {
      return { success: false, message: 'Sản phẩm không tồn tại' };
    }
    if (book.quantity_in_stock < quantity) {
      return { success: false, message: `Chỉ còn ${book.quantity_in_stock} sản phẩm trong kho` };
    }
    const cart = await Cart.findOne({ where: { user_id: userID } });
    if (!cart) {
      return { success: false, message: 'Không tìm thấy giỏ hàng' };
    }
    const item = await CartDetail.findOne({ where: { cart_id: cart.id, book_id: bookID } });
    if (!item) {
      return { success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng' };
    }
    item.quantity = quantity;
    await item.save();
    return { success: true, message: 'Cập nhật số lượng thành công' };
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    return { success: false, message: 'Có lỗi xảy ra khi cập nhật số lượng' };
  }
};

const removeFromCart = async (userID, bookID) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: userID } });
    if (!cart) {
      return { success: false, message: 'Không tìm thấy giỏ hàng' };
    }
    const item = await CartDetail.findOne({ where: { cart_id: cart.id, book_id: bookID } });
    if (!item) {
      return { success: false, message: 'Không tìm thấy sản phẩm trong giỏ hàng' };
    }
    await item.destroy();
    return { success: true, message: 'Xóa sản phẩm khỏi giỏ hàng thành công' };
  } catch (error) {
    console.error('Error removing from cart:', error);
    return { success: false, message: 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng' };
  }
};

const clearCart = async (userID) => {
  try {
    const cart = await Cart.findOne({ where: { user_id: userID } });
    if (!cart) {
      return { success: false, message: 'Không tìm thấy giỏ hàng' };
    }
    await CartDetail.destroy({ where: { cart_id: cart.id } });
    return { success: true, message: 'Đã xóa toàn bộ giỏ hàng' };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, message: 'Có lỗi xảy ra khi xóa giỏ hàng' };
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
