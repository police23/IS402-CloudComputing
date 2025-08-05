
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const InvoiceDetail = sequelize.define('InvoiceDetail', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  invoice_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
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
  tableName: 'invoice_details',
  timestamps: false,
});

module.exports = { InvoiceDetail };
