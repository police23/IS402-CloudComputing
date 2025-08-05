const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const ShippingMethod = sequelize.define('ShippingMethod', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  delivery_time_days: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fee: {
    type: DataTypes.DECIMAL(10, 0),
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'shipping_methods',
  timestamps: false,
});

module.exports = ShippingMethod;