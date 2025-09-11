import dotenv from 'dotenv';

dotenv.config();

export const TYPE = process.env.TYPE as 'postgres';
export const HOST = process.env.HOST as string;
export const DB_USERNAME = process.env.DB_USERNAME as string;
export const DB_PASSWORD = process.env.DB_PASSWORD as string;
export const PORT = parseInt(process.env.PORT || '5432', 10);
export const DB_DATABASE = process.env.DB_NAME as string;