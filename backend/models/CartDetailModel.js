const { DataTypes } = require('sequelize');
const sequelize = require('../db');

// cart_details table
const CartDetail = sequelize.define(
  'CartDetail',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cart_id: {
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
      defaultValue: 1,
      validate: { min: 1 },
    },
    added_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'cart_details',
    timestamps: false,
    indexes: [
      { name: 'cart_id', fields: ['cart_id'] },
      { name: 'book_id', fields: ['book_id'] },
      { name: 'uk_cart_book', unique: true, fields: ['cart_id', 'book_id'] },
    ],
  }
);

module.exports = { CartDetail };
