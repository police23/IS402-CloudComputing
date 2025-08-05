const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./UserModel');
const ShippingMethod = require('./ShippingMethodModel');
const Promotion = require('./PromotionModel');
const OrderDetail = require('./OrderDetailModel');
const OrderAssignment = require('./OrderAssignmentModel');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  shipping_method_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  shipping_address: {
    type: DataTypes.STRING(250),
    allowNull: true,
  },
  promotion_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 0),
    allowNull: false,
  },
  shipping_fee: {
    type: DataTypes.DECIMAL(10, 0),
    allowNull: false,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 0),
    defaultValue: 0,
  },
  final_amount: {
    type: DataTypes.DECIMAL(10, 0),
    allowNull: false,
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'online'),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'delivering', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
  },
}, {
  tableName: 'orders',
  timestamps: false,
});

module.exports = { Order };
