const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Book = require('./BookModel');
const Cart = require('./CartModel');

const CartDetail = sequelize.define('CartDetail', {
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
}, {
  tableName: 'cart_details',
  timestamps: false,
});

module.exports = { CartDetail };
