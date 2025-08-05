const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./UserModel');
const Book = require('./BookModel');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rating: {
    type: DataTypes.TINYINT,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ratings',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'book_id'],
      name: 'unique_rating',
    },
    {
      fields: ['book_id'],
    },
  ],
});

module.exports = { Rating };
