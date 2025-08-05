const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./UserModel');
const Promotion = require('./PromotionModel');
const InvoiceDetail = require('./InvoiceDetailModel');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  final_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  promotion_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'invoices',
  timestamps: false,
});

module.exports = { Invoice };
