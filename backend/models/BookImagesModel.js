const {DataTypes} = require('sequelize');
const sequelize = require('../db');

const BookImages = sequelize.define('BookImages', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  image_path: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'book_images',
  timestamps: false,
});

module.exports = BookImages;