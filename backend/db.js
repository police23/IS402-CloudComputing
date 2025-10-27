import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true',
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(async () => {
    console.log('✅ Connected to MySQL successfully.');

    // 🔁 Health check thay vì đóng pool
    try {
      await sequelize.query('SELECT 1');
      console.log('🔁 Connection health check OK.');
    } catch (poolErr) {
      console.warn('⚠️ Connection check failed, reinitializing pool...');
      sequelize.connectionManager.initPools();
    }
  })
  .catch((err) => {
    console.error('❌ MySQL connection error:', err);
  });

export default sequelize;
