require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

sequelize
  .authenticate()
  .then(async () => {
    console.log('✅ Connected to MySQL successfully.');
    // ===============================
    // 🧹 Reset connection pool Azure
    // ===============================
    try {
      await sequelize.connectionManager.close();
      await sequelize.connectionManager.initPools();

      console.log('🔁 Sequelize connection pool refreshed successfully.');
    } catch (poolErr) {
      console.warn('⚠️ Warning: Could not refresh pool:', poolErr.message);
    }
  })
  .catch((err) => {
    console.error('❌ MySQL connection error:', err);
  });

module.exports = sequelize;
