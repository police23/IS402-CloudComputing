const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Promotion = require('./PromotionModel');
const Book = require('./BookModel');

const PromotionDetail = sequelize.define('PromotionDetail', {
  promotion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Promotion,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Book,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'promotion_details',
  timestamps: false,
});

module.exports = { PromotionDetail };
