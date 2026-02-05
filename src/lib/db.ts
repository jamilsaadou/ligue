import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const globalForMySql = globalThis as unknown as { mysqlPool?: mysql.Pool };

export const pool =
  globalForMySql.mysqlPool ?? mysql.createPool(databaseUrl);

if (process.env.NODE_ENV !== 'production') {
  globalForMySql.mysqlPool = pool;
}
