const CartModel = require('../models/CartModel');
const BookModel = require('../models/BookModel');

class CartService {
    // Lấy thông tin giỏ hàng của user
    static async getCart(userID) {
        try {
            const cartItems = await CartModel.getCartWithDetails(userID);
            return {
                success: true,
                data: cartItems,
                message: 'Lấy thông tin giỏ hàng thành công'
            };
        } catch (error) {
            console.error('Error getting cart:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi lấy thông tin giỏ hàng'
            };
        }
    }

    // Thêm sản phẩm vào giỏ hàng
    static async addToCart(userID, bookID, quantity) {
        try {
            // Kiểm tra sản phẩm có tồn tại không
            const book = await BookModel.getBookById(bookID);
            if (!book) {
                return {
                    success: false,
                    message: 'Sản phẩm không tồn tại'
                };
            }

            // Kiểm tra số lượng tồn kho
            if (book.stock < quantity) {
                return {
                    success: false,
                    message: `Chỉ còn ${book.stock} sản phẩm trong kho`
                };
            }

            // Kiểm tra số lượng hợp lệ
            if (quantity <= 0) {
                return {
                    success: false,
                    message: 'Số lượng phải lớn hơn 0'
                };
            }

            const result = await CartModel.addToCart(userID, bookID, quantity);
            
            return {
                success: true,
                data: result,
                message: 'Thêm vào giỏ hàng thành công'
            };
        } catch (error) {
            console.error('Error adding to cart:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi thêm vào giỏ hàng'
            };
        }
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    static async updateQuantity(userID, bookID, quantity) {
        try {
            // Kiểm tra số lượng hợp lệ
            if (quantity <= 0) {
                return {
                    success: false,
                    message: 'Số lượng phải lớn hơn 0'
                };
            }

            // Kiểm tra sản phẩm có tồn tại không
            const book = await BookModel.getBookById(bookID);
            if (!book) {
                return {
                    success: false,
                    message: 'Sản phẩm không tồn tại'
                };
            }

            // Kiểm tra số lượng tồn kho
            if (book.stock < quantity) {
                return {
                    success: false,
                    message: `Chỉ còn ${book.stock} sản phẩm trong kho`
                };
            }

            const result = await CartModel.updateCartItemQuantity(userID, bookID, quantity);
            
            if (result) {
                return {
                    success: true,
                    message: 'Cập nhật số lượng thành công'
                };
            } else {
                return {
                    success: false,
                    message: 'Không tìm thấy sản phẩm trong giỏ hàng'
                };
            }
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi cập nhật số lượng'
            };
        }
    }

    // Xóa sản phẩm khỏi giỏ hàng
    static async removeFromCart(userID, bookID) {
        try {
            const result = await CartModel.removeFromCart(userID, bookID);
            
            if (result) {
                return {
                    success: true,
                    message: 'Xóa sản phẩm khỏi giỏ hàng thành công'
                };
            } else {
                return {
                    success: false,
                    message: 'Không tìm thấy sản phẩm trong giỏ hàng'
                };
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng'
            };
        }
    }

    // Xóa toàn bộ giỏ hàng
    static async clearCart(userID) {
        try {
            const result = await CartModel.clearCart(userID);
            
            return {
                success: true,
                message: 'Đã xóa toàn bộ giỏ hàng'
            };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi xóa giỏ hàng'
            };
        }
    }

    // Tính tổng tiền giỏ hàng
    static async getCartTotal(userID) {
        try {
            const cartItems = await CartModel.getCartWithDetails(userID);
            const subtotal = cartItems.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            return {
                success: true,
                data: {
                    items: cartItems,
                    subtotal: subtotal,
                    itemCount: cartItems.length
                }
            };
        } catch (error) {
            console.error('Error calculating cart total:', error);
            return {
                success: false,
                message: 'Có lỗi xảy ra khi tính tổng giỏ hàng'
            };
        }
    }
}

module.exports = CartService;
