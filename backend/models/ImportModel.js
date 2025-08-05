
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Supplier = require('./SupplierModel');
const User = require('./UserModel');
const ImportDetail = require('./ImportDetailModel');

const BookImport = sequelize.define('BookImport', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Supplier,
      key: 'id',
    },
  },
  imported_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  import_date: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 0),
    allowNull: false,
  },
}, {
  tableName: 'book_imports',
  timestamps: false,
});

module.exports = { BookImport };
