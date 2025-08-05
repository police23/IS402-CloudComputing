const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Order = require('./OrderModel');
const Book = require('./BookModel');

const OrderDetail = sequelize.define('OrderDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 0),
    allowNull: false,
  },
}, {
  tableName: 'order_details',
  timestamps: false,
});

module.exports = { OrderDetail };
