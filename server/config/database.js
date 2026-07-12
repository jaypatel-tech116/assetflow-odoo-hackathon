const { Sequelize } = require('sequelize');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'mysql';
const storage = process.env.DB_STORAGE || './database.sqlite';

const sequelize = dialect === 'sqlite' 
  ? new Sequelize({
      dialect: 'sqlite',
      storage,
      logging: process.env.NODE_ENV === 'production' ? false : console.log,
      define: {
        timestamps: true,
        underscored: true,
      },
    })
  : new Sequelize(
      process.env.DB_NAME || 'assetflow_db',
      process.env.DB_USER || 'root',
      process.env.DB_PASSWORD || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'production' ? false : console.log,
        define: {
          timestamps: true,
          underscored: true,
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      }
    );

module.exports = sequelize;
