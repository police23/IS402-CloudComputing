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

// ✅ Chỉ kiểm tra kết nối, KHÔNG đóng pool
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL successfully.');

    // Health check (kiểm tra kết nối)
    await sequelize.query('SELECT 1');
    console.log('🔁 Connection health check OK.');
  } catch (err) {
    console.error('❌ MySQL connection error:', err.message);
  }
};

initializeDatabase();

export default sequelize;
