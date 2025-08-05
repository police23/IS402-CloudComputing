const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const DamageReport = require('./DamageReportModel');
const Book = require('./BookModel');

const DamageReportItem = sequelize.define('DamageReportItem', {
  report_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'damage_report_items',
  timestamps: false,
});

module.exports = { DamageReportItem };