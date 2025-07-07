import { Sequelize } from 'sequelize';

// Type assertion for env variables
const {
  DB_NAME,
  DB_USER,
  DB_PASS,
  DB_HOST,
} = process.env as {
  [key: string]: string | undefined;
  DB_NAME: string;
  DB_USER: string;
  DB_PASS: string;
  DB_HOST: string;
};

// Initialize Sequelize
const sequelize = new Sequelize(
  DB_NAME,
  DB_USER,
  DB_PASS,
  {
    host: DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

export default sequelize;