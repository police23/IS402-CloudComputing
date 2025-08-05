const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const BookImport = require('./ImportModel');
const Book = require('./BookModel');

const ImportDetail = sequelize.define('ImportDetail', {
  import_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: BookImport,
      key: 'id',
    },
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: Book,
      key: 'id',
    },
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
  tableName: 'book_import_details',
  timestamps: false,
});

module.exports = { ImportDetail };
