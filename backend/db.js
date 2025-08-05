const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('cnpm', 'root', '123456', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Tắt log SQL, có thể bật nếu muốn debug
});

module.exports = sequelize;