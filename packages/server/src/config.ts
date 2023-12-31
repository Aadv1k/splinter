import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const PORT = 8080;
export const NEWSAPI_KEY = process.env.NEWSAPI_KEY ?? null;
export const ABSTRACTAPI_KEY = process.env.ABSTRACTAPI_KEY ?? null;

export const NODE_ENV = process.env.NODE_ENV && process.env.NODE_ENV != "test" ? process.env.NODE_ENV : "development";
export const JWT_SECRET = process.env.JWT_SECRET ?? "kxPUFvQGVqtIUrljtTmblJNukkoTLYQS";

export const PG_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
};
