const CartService = require('../services/CartService');

const getCart = async (req, res) => {
    try {
        const userID = req.user.id;
        const result = await CartService.getCart(userID);
        
        if (result.success) {
            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('CartController getCart error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thông tin giỏ hàng'
        });
    }
};

const addToCart = async (req, res) => {
    try {
        console.log('CartController addToCart - req.body:', req.body);
        console.log('CartController addToCart - req.user:', req.user);
        
        const userID = req.user.id;
        const { bookID, quantity } = req.body;

        console.log('CartController addToCart - userID:', userID, 'bookID:', bookID, 'quantity:', quantity);

        if (!bookID || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bookID hoặc quantity'
            });
        }

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng phải là số dương'
            });
        }

        const result = await CartService.addToCart(userID, bookID, quantity);
        
        if (result.success) {
            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('CartController addToCart error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi thêm vào giỏ hàng'
        });
    }
};

const updateQuantity = async (req, res) => {
    try {
        const userID = req.user.id;
        const { bookID, quantity } = req.body;

        if (!bookID || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bookID hoặc quantity'
            });
        }

        if (isNaN(quantity) || quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng phải là số dương'
            });
        }

        const result = await CartService.updateQuantity(userID, bookID, quantity);
        
        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('CartController updateQuantity error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi cập nhật số lượng'
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const userID = req.user.id;
        const { bookID } = req.params;

        // Validation
        if (!bookID) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin bookID'
            });
        }

        const result = await CartService.removeFromCart(userID, bookID);
        
        if (result.success) {
            res.status(200).json({
                success: true,
                message: result.message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('CartController removeFromCart error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng'
        });
    }
};

const getCartTotal = async (req, res) => {
    try {
        const userID = req.user.id;
        const result = await CartService.getCartTotal(userID);
        
        if (result.success) {
            res.status(200).json({
                success: true,
                data: result.data,
                message: 'Lấy tổng tiền giỏ hàng thành công'
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('CartController getCartTotal error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tính tổng giỏ hàng'
        });
    }
};



module.exports = {
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    getCartTotal
};
