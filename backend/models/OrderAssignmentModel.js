const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Order = require('./OrderModel');
const User = require('./UserModel');

const OrderAssignment = sequelize.define('OrderAssignment', {
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  assigned_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  shipper_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  assigned_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  completion_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'order_assignments',
  timestamps: false,
});

module.exports = { OrderAssignment };