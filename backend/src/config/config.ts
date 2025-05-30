import dotenv from 'dotenv';
dotenv.config();

export default {
    APP_PORT: process.env.APP_PORT,
    CLIENT_URL: process.env.FRONTEND_URL,
    DB_URL: process.env.DB_URL, 
    JWT_SECRET: process.env.JWT_SECRET,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET
}