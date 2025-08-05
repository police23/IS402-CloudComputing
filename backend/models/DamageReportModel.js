const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./UserModel');
const DamageReportItem = require('./DamageReportItemsModel');

const DamageReport = sequelize.define('DamageReport', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'damage_reports',
  timestamps: false,
});

module.exports = { DamageReport };


