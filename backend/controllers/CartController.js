
const CartService = require('../services/CartService');

const getCart = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const result = await CartService.getCart(userID);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { bookID, quantity } = req.body;
    const result = await CartService.addToCart(userID, bookID, quantity);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const updateQuantity = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const { bookID, quantity } = req.body;
    const result = await CartService.updateQuantity(userID, bookID, quantity);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const bookID = req.params.bookID;
    const result = await CartService.removeFromCart(userID, bookID);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const result = await CartService.clearCart(userID);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
