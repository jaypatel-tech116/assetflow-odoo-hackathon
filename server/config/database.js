const { Sequelize } = require('sequelize');

<<<<<<< HEAD
const sequelize = new Sequelize(
  process.env.DB_NAME || 'assetflow_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
=======
let sequelize;

if (process.env.DB_DIALECT === 'sqlite' || (!process.env.DB_NAME && !process.env.DB_USER && !process.env.DB_HOST)) {
  // Use SQLite for local development when DB_DIALECT is sqlite or MySQL config is missing
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || 'database.sqlite',
>>>>>>> origin/kashyap
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
    define: {
      timestamps: true,
      underscored: true, // use snake_case column names (created_at, updated_at)
    },
<<<<<<< HEAD
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);
=======
  });
} else {
  sequelize = new Sequelize(
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
        underscored: true, // use snake_case column names (created_at, updated_at)
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
}
>>>>>>> origin/kashyap

module.exports = sequelize;
