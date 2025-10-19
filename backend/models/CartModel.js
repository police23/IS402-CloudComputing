const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// carts table
const Cart = sequelize.define(
  'Cart',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'carts',
    timestamps: false,
    indexes: [
      { name: 'user_id', unique: true, fields: ['user_id'] },
    ],
  }
);

module.exports = { Cart };
